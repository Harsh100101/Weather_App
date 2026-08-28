import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { fetchReverseGeocoding } from "../../api/weather";

const GEOJSON_URL =
	"https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

// three-globe radius in Three.js units
const GLOBE_RADIUS = 100;

/**
 * Convert a world-space point on the globe surface → { lat, lng }
 * three-globe orientation: y = north pole, lat=0/lng=0 faces -Z axis
 */
function vectorToLatLng(point) {
	const r = point.length() || GLOBE_RADIUS;
	const x = point.x / r;
	const y = point.y / r;
	const z = point.z / r;
	// phi from +Y axis → latitude
	const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
	// theta from -Z axis → longitude (three-globe convention)
	const lng = (Math.atan2(x, -z) * 180) / Math.PI;
	return { lat, lng };
}

// ─────────────────────────────────────────────────────────────
const GlobeBackground = ({
	focus,
	onCitySelect,
	fullScreen = false,
	onExitFullScreen,
}) => {
	const containerRef  = useRef(null);
	const globeRef      = useRef(null);
	const rendererRef   = useRef(null);
	const cameraRef     = useRef(null);
	const controlsRef   = useRef(null);
	const frameRef      = useRef(null);
	const hitSphereRef  = useRef(null);  // invisible mesh for raycasting
	const geojsonRef    = useRef(null);
	const isDraggingRef = useRef(false);
	const mouseDownRef  = useRef({ x: 0, y: 0 });

	const [drillLevel,       setDrillLevel]       = useState("world");
	const [selectedCountry,  setSelectedCountry]  = useState(null);
	const [selectedCity,     setSelectedCity]     = useState(null);
	const [loadingPlace,     setLoadingPlace]     = useState(false);
	const [drillError,       setDrillError]       = useState("");
	const [ripple,           setRipple]           = useState(null); // { x, y } screen px for click feedback

	const tooltipRef = useRef(null);

	const showTooltip = useCallback((text, x, y) => {
		if (!tooltipRef.current) return;
		tooltipRef.current.textContent = text;
		tooltipRef.current.style.left      = `${x + 16}px`;
		tooltipRef.current.style.top       = `${y - 12}px`;
		tooltipRef.current.style.opacity   = "1";
		tooltipRef.current.style.transform = "translateY(0)";
	}, []);

	const hideTooltip = useCallback(() => {
		if (!tooltipRef.current) return;
		tooltipRef.current.style.opacity   = "0";
		tooltipRef.current.style.transform = "translateY(5px)";
	}, []);

	// ── Scene setup ────────────────────────────────────────────
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const scene  = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(45, el.clientWidth / (el.clientHeight || 1), 0.1, 2000);
		camera.position.set(0, 0, 300);
		cameraRef.current = camera;

		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.domElement.style.pointerEvents = "auto";
		renderer.domElement.style.touchAction   = "none";
		rendererRef.current = renderer;
		el.appendChild(renderer.domElement);

		// Stars
		const starPos = new Float32Array(2400 * 3);
		for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 2400;
		const starGeo = new THREE.BufferGeometry();
		starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
		scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.65, transparent: true, opacity: 0.5 })));

		// Globe
		const globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
			.globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
			.bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
			.showAtmosphere(true)
			.atmosphereAltitude(0.22)
			.atmosphereColor("#6eb4ff");
		globeRef.current = globe;
		scene.add(globe);

		// ── Invisible hit-sphere (reliable raycasting target) ──
		// three-globe renders the globe as a sphere of radius GLOBE_RADIUS at origin.
		// We add a matching transparent sphere so Three.js raycaster can hit-test it.
		const hitMesh = new THREE.Mesh(
			new THREE.SphereGeometry(GLOBE_RADIUS, 64, 32),
			new THREE.MeshBasicMaterial({ visible: false, side: THREE.FrontSide, depthWrite: false })
		);
		hitSphereRef.current = hitMesh;
		scene.add(hitMesh);

		// Lights
		scene.add(new THREE.AmbientLight(0x8ab8ff, 0.65));
		const sun = new THREE.DirectionalLight(0xfff8e7, 1.1);
		sun.position.set(300, 180, 240);
		scene.add(sun);
		const rim = new THREE.DirectionalLight(0x2255aa, 0.35);
		rim.position.set(-200, -100, -200);
		scene.add(rim);

		// Controls
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enablePan     = false;
		controls.enableZoom    = true;
		controls.enableDamping = true;
		controls.dampingFactor = 0.07;
		controls.autoRotate    = true;
		controls.autoRotateSpeed = 0.45;
		controls.minDistance   = 110;
		controls.maxDistance   = 450;
		controls.rotateSpeed   = 0.55;
		controlsRef.current    = controls;
		controls.addEventListener("start", () => { controls.autoRotate = false; });
		controls.addEventListener("end",   () => { setTimeout(() => { controls.autoRotate = true; }, 3500); });

		// Resize
		const onResize = () => {
			const w = el.clientWidth, h = el.clientHeight || window.innerHeight;
			renderer.setSize(w, h);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		};
		onResize();
		window.addEventListener("resize", onResize);

		// Render loop
		frameRef.current = requestAnimationFrame(function loop() {
			controls.update();
			renderer.render(scene, camera);
			frameRef.current = requestAnimationFrame(loop);
		});

		// Pre-fetch world GeoJSON
		fetch(GEOJSON_URL)
			.then(r => r.json())
			.then(d => { geojsonRef.current = d; })
			.catch(() => {});

		return () => {
			window.removeEventListener("resize", onResize);
			cancelAnimationFrame(frameRef.current);
			controls.dispose();
			renderer.dispose();
			if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Raycasting ─────────────────────────────────────────────
	const getHit = useCallback((e) => {
		const canvas    = rendererRef.current?.domElement;
		const camera    = cameraRef.current;
		const hitSphere = hitSphereRef.current;
		if (!canvas || !camera || !hitSphere) return null;

		const rect = canvas.getBoundingClientRect();
		const src  = e.touches ? e.touches[0] : e;
		const cx   = src.clientX;
		const cy   = src.clientY;

		// Normalised device coords
		const nx = ((cx - rect.left) / rect.width)  *  2 - 1;
		const ny = ((cy - rect.top)  / rect.height) * -2 + 1;
		const px = cx - rect.left;
		const py = cy - rect.top;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
		const hits = raycaster.intersectObject(hitSphere, false);
		if (!hits.length) return null;

		const { lat, lng } = vectorToLatLng(hits[0].point);
		return { lat, lng, px, py };
	}, []);

	// ── Polygon highlight ──────────────────────────────────────
	const applyPolygons = useCallback((highlightCountry = null) => {
		const globe = globeRef.current;
		const world = geojsonRef.current;
		if (!globe || !world) return;

		const hl = (highlightCountry || "").toLowerCase();
		globe
			.polygonsData(world.features || [])
			.polygonGeoJsonGeometry(d => d.geometry)
			.polygonCapColor(d => {
				const name = (d?.properties?.name || "").toLowerCase();
				if (hl && name === hl) return "rgba(255, 209, 102, 0.72)";
				return "rgba(55, 95, 165, 0.12)";
			})
			.polygonSideColor(() => "rgba(50, 80, 140, 0.07)")
			.polygonStrokeColor(() => "rgba(160, 200, 255, 0.2)")
			.polygonAltitude(d => {
				const name = (d?.properties?.name || "").toLowerCase();
				return hl && name === hl ? 0.05 : 0.003;
			})
			.polygonsTransitionDuration(350);
	}, []);

	// ── flyTo ──────────────────────────────────────────────────
	const flyTo = useCallback((lat, lng, distance = 220) => {
		const globe    = globeRef.current;
		const camera   = cameraRef.current;
		const controls = controlsRef.current;
		if (!globe?.getCoords || !camera || !controls) return;

		const pt  = globe.getCoords(lat, lng, 0);
		const mag = Math.sqrt(pt.x ** 2 + pt.y ** 2 + pt.z ** 2);
		if (!mag) return;

		const s = distance / mag;
		camera.position.set(pt.x * s, pt.y * s, pt.z * s);
		controls.target.set(0, 0, 0);
		controls.autoRotate = false;
		controls.update();
	}, []);

	// ── fullScreen pointer events ──────────────────────────────
	useEffect(() => {
		const el = rendererRef.current?.domElement;
		if (!el || !fullScreen) return;

		const onDown = (e) => {
			const c = e.touches ? e.touches[0] : e;
			mouseDownRef.current  = { x: c.clientX, y: c.clientY };
			isDraggingRef.current = false;
		};

		const onMove = (e) => {
			const c = e.touches ? e.touches[0] : e;
			const dx = c.clientX - mouseDownRef.current.x;
			const dy = c.clientY - mouseDownRef.current.y;
			if (Math.sqrt(dx * dx + dy * dy) > 6) isDraggingRef.current = true;
		};

		const onUp = async (e) => {
			if (isDraggingRef.current) return;
			const hit = getHit(e);
			if (!hit) return;

			const { lat, lng, px, py } = hit;

			// Show ripple click feedback
			setRipple({ x: px, y: py });
			setTimeout(() => setRipple(null), 700);

			showTooltip("🔍 Locating…", px, py);
			setLoadingPlace(true);
			setDrillError("");

			try {
				const rev   = await fetchReverseGeocoding(lat, lng);
				const place = rev?.results?.[0];

				if (!place) {
					setDrillError("No city found here — try clicking on a landmass.");
					hideTooltip();
					return;
				}

				if (drillLevel === "world") {
					// Step 1 — select country
					setSelectedCountry({
						name: place.country,
						code: place.countryCode,
						lat:  place.latitude,
						lng:  place.longitude,
					});
					setDrillLevel("country");
					applyPolygons(place.country);
					flyTo(place.latitude, place.longitude, 185);
					showTooltip(`🌍 ${place.country} — click to pick a city`, px, py);
					setTimeout(hideTooltip, 3000);

				} else if (drillLevel === "country") {
					// Step 2 — select city
					setSelectedCity({
						name:        place.name,
						country:     place.country,
						state:       place.state || "",
						lat:         place.latitude,
						lng:         place.longitude,
						displayName: place.displayName,
					});
					setDrillLevel("city");
					flyTo(place.latitude, place.longitude, 145);

					globeRef.current
						?.pointsData([{ lat: place.latitude, lng: place.longitude, color: "#ffd166" }])
						.pointLat("lat").pointLng("lng").pointColor("color")
						.pointAltitude(0.15).pointRadius(0.45).pointsMerge(true)
						.ringsData([{ lat: place.latitude, lng: place.longitude }])
						.ringLat("lat").ringLng("lng")
						.ringColor(() => "#ffd16680")
						.ringMaxRadius(3.5).ringPropagationSpeed(1.5).ringRepeatPeriod(1100)
						.labelsData([{ lat: place.latitude, lng: place.longitude, text: place.name }])
						.labelText("text").labelLat("lat").labelLng("lng")
						.labelAltitude(0.22).labelSize(0.6)
						.labelColor(() => "#e8f4ff").labelDotRadius(0.3)
						.labelIncludeDot(true).labelsTransitionDuration(400);

					showTooltip(`📍 ${place.name}`, px, py);
					setTimeout(hideTooltip, 2500);
				}
			} catch {
				setDrillError("Could not resolve location — please try again.");
				hideTooltip();
			} finally {
				setLoadingPlace(false);
			}
		};

		el.addEventListener("mousedown",  onDown);
		el.addEventListener("mousemove",  onMove);
		el.addEventListener("mouseup",    onUp);
		el.addEventListener("touchstart", onDown, { passive: true });
		el.addEventListener("touchmove",  onMove, { passive: true });
		el.addEventListener("touchend",   onUp);

		return () => {
			el.removeEventListener("mousedown",  onDown);
			el.removeEventListener("mousemove",  onMove);
			el.removeEventListener("mouseup",    onUp);
			el.removeEventListener("touchstart", onDown);
			el.removeEventListener("touchmove",  onMove);
			el.removeEventListener("touchend",   onUp);
		};
	}, [fullScreen, drillLevel, getHit, showTooltip, hideTooltip, applyPolygons, flyTo]);

	// ── Background mode: update focus pin ─────────────────────
	useEffect(() => {
		if (fullScreen) return;
		const globe = globeRef.current;
		if (!globe) return;

		const lat = Number(focus?.lat);
		const lng = Number(focus?.lng);
		if (!isFinite(lat) || !isFinite(lng)) {
			globe.pointsData([]).labelsData([]).ringsData([]);
			return;
		}

		globe
			.pointsData([{ lat, lng, color: "#ffd166" }])
			.pointLat("lat").pointLng("lng").pointColor("color")
			.pointAltitude(0.13).pointRadius(0.5).pointsMerge(true)
			.ringsData([{ lat, lng }])
			.ringLat("lat").ringLng("lng")
			.ringColor(() => "#ffd16670")
			.ringMaxRadius(3.5).ringPropagationSpeed(1.4).ringRepeatPeriod(1100)
			.labelsData(focus?.city ? [{ lat, lng, text: `${focus.city}${focus.country ? ", " + focus.country : ""}` }] : [])
			.labelText("text").labelLat("lat").labelLng("lng")
			.labelAltitude(0.22).labelSize(0.55)
			.labelColor(() => "#e8f4ff").labelDotRadius(0.3)
			.labelIncludeDot(true).labelsTransitionDuration(500);

		if (geojsonRef.current) applyPolygons(focus?.country);
		flyTo(lat, lng, 260);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [focus?.lat, focus?.lng, focus?.city, focus?.country, fullScreen]);

	// ── Reset when entering fullscreen ────────────────────────
	useEffect(() => {
		if (!fullScreen) return;
		setDrillLevel("world");
		setSelectedCountry(null);
		setSelectedCity(null);
		setDrillError("");
		setRipple(null);
		hideTooltip();
		const globe = globeRef.current;
		if (globe) globe.pointsData([]).labelsData([]).ringsData([]).polygonsData([]);
		if (controlsRef.current) controlsRef.current.autoRotate = true;
		if (cameraRef.current) {
			cameraRef.current.position.set(0, 0, 300);
			controlsRef.current?.target.set(0, 0, 0);
		}
	}, [fullScreen, hideTooltip]);

	// ── Drill back one level ───────────────────────────────────
	const handleBack = useCallback(() => {
		if (drillLevel === "city") {
			setDrillLevel("country");
			setSelectedCity(null);
			globeRef.current?.pointsData([]).labelsData([]).ringsData([]);
			if (selectedCountry) flyTo(selectedCountry.lat, selectedCountry.lng, 185);
		} else if (drillLevel === "country") {
			setDrillLevel("world");
			setSelectedCountry(null);
			globeRef.current?.polygonsData([]);
			if (cameraRef.current) cameraRef.current.position.set(0, 0, 300);
			if (controlsRef.current) controlsRef.current.autoRotate = true;
		} else {
			onExitFullScreen?.();
		}
	}, [drillLevel, selectedCountry, flyTo, onExitFullScreen]);

	// ── Confirm city ───────────────────────────────────────────
	const handleConfirm = useCallback(() => {
		if (!selectedCity || !onCitySelect) return;
		onCitySelect({
			lat:         selectedCity.lat,
			lng:         selectedCity.lng,
			cityName:    selectedCity.name,
			country:     selectedCity.country,
			displayName: selectedCity.displayName,
		});
		onExitFullScreen?.();
	}, [selectedCity, onCitySelect, onExitFullScreen]);

	const drillHint = {
		world:   "Click anywhere on the globe to select a country",
		country: `${selectedCountry?.name || "Country"} selected — now click a city`,
		city:    `${selectedCity?.name || "City"} ready`,
	}[drillLevel];

	return (
		<>
			{/* Globe canvas */}
			<div
				className={`globe-background${fullScreen ? " globe-fullscreen" : ""}`}
				ref={containerRef}
				aria-hidden="true"
				style={{ pointerEvents: "auto" }}
			/>

			{/* Floating hover/action tooltip */}
			<div ref={tooltipRef} className="globe-click-tooltip" aria-hidden="true" />

			{/* Click ripple feedback */}
			{ripple && (
				<div
					className="globe-ripple"
					style={{ left: ripple.x, top: ripple.y }}
					aria-hidden="true"
				/>
			)}

			{/* ── Full-screen overlay UI ── */}
			{fullScreen && (
				<div className="globe-fs-overlay" role="dialog" aria-label="Select city from globe">

					{/* Top bar */}
					<div className="globe-fs-topbar">
						<button className="globe-fs-back" onClick={handleBack}>
							← {drillLevel === "world" ? "Exit" : "Back"}
						</button>
						<div className="globe-fs-breadcrumb">
							<span className={drillLevel === "world" ? "bc-active" : "bc-done"}>🌍 World</span>
							{selectedCountry && (
								<><span className="bc-sep">›</span>
								<span className={drillLevel === "country" ? "bc-active" : "bc-done"}>{selectedCountry.name}</span></>
							)}
							{selectedCity && (
								<><span className="bc-sep">›</span>
								<span className="bc-active">{selectedCity.name}</span></>
							)}
						</div>
					</div>

					{/* Bottom panel */}
					<div className="globe-fs-bottom">
						{drillError && (
							<div className="globe-fs-error">⚠️ {drillError}</div>
						)}

						{loadingPlace ? (
							<div className="globe-fs-hint">
								<span className="city-spinner" /> Resolving location…
							</div>
						) : selectedCity ? (
							<div className="globe-fs-confirm-card">
								<div className="globe-fs-place">
									<span className="globe-fs-place-icon">📍</span>
									<div>
										<div className="globe-fs-place-city">{selectedCity.name}</div>
										<div className="globe-fs-place-meta">
											{[selectedCity.state, selectedCity.country].filter(Boolean).join(", ")}
										</div>
									</div>
								</div>
								<div className="globe-fs-actions">
									<button className="globe-fs-confirm-btn" onClick={handleConfirm}>
										Use this city ✓
									</button>
									<button className="globe-fs-reselect-btn" onClick={() => {
										setSelectedCity(null);
										setDrillLevel("country");
										globeRef.current?.pointsData([]).labelsData([]).ringsData([]);
										if (selectedCountry) flyTo(selectedCountry.lat, selectedCountry.lng, 185);
									}}>
										Pick another
									</button>
								</div>
							</div>
						) : (
							<div className="globe-fs-hint">
								{drillLevel === "world" ? "🌍" : "🗺️"} {drillHint}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default GlobeBackground;
