import useGeolocation from "../hooks/useGeolocation";
import useWeatherData from "../hooks/useWeatherData";
import { fetchAirQuality, fetchReverseGeocoding, fetchWeather } from "../api/weather";

import StatCard from "../components/cards/StatCard";
import SkeletonCard from "../components/cards/SkeletonCard";
import HourlyChart from "../components/charts/HourlyChart";
import AirQualityChart from "../components/charts/AirQualityChart";
import PrecipitationChart from "../components/charts/PrecipitationChart";
import CitySearchInput from "../components/CitySearchInput";
import GlobeBackground from "../components/layout/GlobeBackground";
import DatePicker from "../components/DatePicker";

import { useEffect, useMemo, useState } from "react";
import {
	getAQISeverity, getWeatherConditionLabel, getWeatherVisual,
	getUVSeverity, getWeatherGradient, toFahrenheit,
} from "../utils/weatherUtils";

const COMPARE_KEY = "weather.compareCities.v1";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ForecastStrip = ({ daily, unit }) => {
	if (!daily?.time) return null;
	return (
		<div className="forecast-strip">
			{daily.time.slice(0, 7).map((dateStr, i) => {
				const d = new Date(dateStr);
				const label = i === 0 ? "Today" : DAYS[d.getDay()];
				const maxC = daily.temperature_2m_max?.[i];
				const minC = daily.temperature_2m_min?.[i];
				const max  = unit === "C" ? maxC : toFahrenheit(maxC ?? 0);
				const min  = unit === "C" ? minC : toFahrenheit(minC ?? 0);
				const visual = getWeatherVisual(daily.weather_code?.[i]);
				return (
					<div key={dateStr} className={`forecast-day-card${i === 0 ? " today" : ""}`}>
						<span className="fdc-day">{label}</span>
						<span className="fdc-icon">{visual.icon}</span>
						<span className="fdc-max">{max != null ? Math.round(max) : "--"}°</span>
						<span className="fdc-min">{min != null ? Math.round(min) : "--"}°</span>
					</div>
				);
			})}
		</div>
	);
};

const CurrentWeather = () => {
	const { location, loading, denied, error, setManualLocation, requestLocation } = useGeolocation();
	const [date, setDate] = useState(new Date());
	const [city, setCity] = useState("");
	const [cityError, setCityError] = useState("");
	const [unit, setUnit] = useState(localStorage.getItem("unit") || "C");
	const [cityPanelMode, setCityPanelMode] = useState(null);  // null | "change" | "add"
	const [panelCity, setPanelCity] = useState("");
	const [panelCityError, setPanelCityError] = useState("");
	const [compareCities, setCompareCities] = useState([]);
	const [hasLoadedCompare, setHasLoadedCompare] = useState(false);
	const [isAddingCity, setIsAddingCity] = useState(false);
	const [locationMeta, setLocationMeta] = useState({ name: "", country: "", source: "" });
	const [globeFullScreen, setGlobeFullScreen] = useState(false);

	const selectedDate = date.toISOString().split("T")[0];

	// Load saved compare cities
	useEffect(() => {
		try {
			const raw = localStorage.getItem(COMPARE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) setCompareCities(parsed.filter(c => c?.key && c?.name));
			}
		} catch { /* ignore */ } finally { setHasLoadedCompare(true); }
	}, []);

	useEffect(() => {
		if (hasLoadedCompare) localStorage.setItem(COMPARE_KEY, JSON.stringify(compareCities));
	}, [compareCities, hasLoadedCompare]);

	const { data, isLoading } = useWeatherData(location?.lat, location?.lng, selectedDate);

	const handleUnitChange = (u) => { setUnit(u); localStorage.setItem("unit", u); };

	const handleManualLocationSelection = (sel) => {
		setManualLocation({ lat: sel.lat, lng: sel.lng });
		setLocationMeta({ name: sel.cityName || sel.displayName || "", country: sel.country || "", source: "manual" });
		setCityPanelMode(null);
		setPanelCity("");
		setPanelCityError("");
		setGlobeFullScreen(false);
	};

	const handleAddCompareCity = async (sel) => {
		const cityName = sel.cityName || sel.displayName || "City";
		const country  = sel.country || "";
		const key      = `${sel.lat.toFixed(3)},${sel.lng.toFixed(3)}`;
		if (compareCities.some(c => c.key === key)) { setPanelCityError("Already in compare list."); return; }
		try {
			setIsAddingCity(true); setPanelCityError("");
			const [cw, ca] = await Promise.all([
				fetchWeather(sel.lat, sel.lng, selectedDate),
				fetchAirQuality(sel.lat, sel.lng, selectedDate, selectedDate),
			]);
			const temperatureC  = cw?.hourly?.temperature_2m?.[0] ?? cw?.daily?.temperature_2m_max?.[0] ?? null;
			const weatherCode   = cw?.current?.weather_code;
			const condition     = getWeatherConditionLabel(weatherCode);
			const aqi           = ca?.hourly?.us_aqi?.[0] ?? null;
			setCompareCities(prev => [...prev, { key, name: cityName, country, lat: sel.lat, lng: sel.lng, temperatureC, condition, weatherCode, aqi, savedAt: Date.now() }]);
			setCityPanelMode(null); setPanelCity("");
		} catch (err) {
			setPanelCityError(err?.message || "Unable to add this city.");
		} finally { setIsAddingCity(false); }
	};

	// Sync GPS → location name
	useEffect(() => {
		if (!location?.lat || !location?.lng || locationMeta.source === "manual") return;
		fetchReverseGeocoding(location.lat, location.lng).then(rev => {
			const p = rev?.results?.[0];
			if (p) setLocationMeta({ name: p.name || "", country: p.country || "", source: "gps" });
		}).catch(() => {});
	}, [location?.lat, location?.lng, locationMeta.source]);

	const globeFocus = useMemo(() => ({
		lat: location?.lat, lng: location?.lng,
		city: locationMeta.name || city,
		country: locationMeta.country,
	}), [location?.lat, location?.lng, locationMeta.name, locationMeta.country, city]);

	// Loading / denied skeleton
	if (loading || isLoading || !data) return (
		<div className="container">
			<GlobeBackground
				focus={globeFocus}
				onCitySelect={handleManualLocationSelection}
				fullScreen={globeFullScreen}
				onExitFullScreen={() => setGlobeFullScreen(false)}
			/>
			{denied && !location && (
				<div className="search-box">
					<div className="search-box-header">
						<h3>Location access denied</h3>
					</div>
					<p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>{error}</p>
					<button type="button" className="soft-btn" style={{ marginTop: 12 }} onClick={requestLocation}>Allow location</button>
					<CitySearchInput city={city} setCity={setCity} error={cityError} setError={setCityError}
						onSelectCoordinates={handleManualLocationSelection} placeholder="Search city…" />
				</div>
			)}
			<div className="section-block" style={{ marginTop: 16 }}>
				<div className="section-header">
					<h2 className="section-title"><span className="section-title-icon">🌡️</span>Conditions</h2>
				</div>
				<div className="grid">{Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
			</div>
		</div>
	);

	const weather  = data?.weather;
	const air      = data?.air;
	const hourly   = weather?.hourly;
	const daily    = weather?.daily;

	const chartData = hourly?.time?.map((t, i) => ({
		time:          t.slice(11, 16),
		temperature:   unit === "C" ? Number((hourly.temperature_2m[i] ?? 0).toFixed(1)) : Number(toFahrenheit(hourly.temperature_2m[i] ?? 0).toFixed(1)),
		humidity:      hourly.relative_humidity_2m[i],
		visibility:    hourly.visibility[i],
		wind:          hourly.wind_speed_10m[i],
		precipitation: hourly.precipitation[i],
		pm25:          air?.hourly?.pm2_5[i],
		pm10:          air?.hourly?.pm10[i],
	})) || [];

	const currentAqi   = air?.hourly?.us_aqi?.[0] ?? 0;
	const uvIndex      = hourly?.uv_index?.[0] ?? 0;
	const uvSeverity   = getUVSeverity(uvIndex);
	const aqiSeverity  = getAQISeverity(currentAqi);
	const precipMax    = Math.max(...(hourly?.precipitation_probability || [0]));
	const condVisual   = getWeatherVisual(weather?.current?.weather_code);
	const condLabel    = getWeatherConditionLabel(weather?.current?.weather_code);
	const locationHead = locationMeta.source === "manual"
		? locationMeta.name ? `${locationMeta.name}${locationMeta.country ? `, ${locationMeta.country}` : ""}` : "Selected city"
		: `Your location${locationMeta.name ? ` · ${locationMeta.name}` : ""}`;

	return (
		<div className="container">
			<GlobeBackground
				focus={globeFocus}
				onCitySelect={handleManualLocationSelection}
				fullScreen={globeFullScreen}
				onExitFullScreen={() => setGlobeFullScreen(false)}
			/>

			{/* ── Hero ── */}
			<section className="hero" style={{ background: getWeatherGradient(weather?.current?.weather_code) }}>
				<div className="hero-main">
					<div className="hero-left">
						<p className="hero-location">
							<span aria-hidden="true">📍</span> {locationHead} · {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
						</p>
						<div className="hero-condition-pill" style={{ background: "rgba(0,0,0,0.25)", borderColor: "rgba(255,255,255,0.18)" }}>
							<span>{condVisual.icon}</span><span>{condLabel}</span>
						</div>
						<h1 className="hero-temp">
							{chartData[0]?.temperature ?? "--"}<span className="hero-unit">°{unit}</span>
						</h1>
						<p className="hero-summary">
							High {daily?.temperature_2m_max?.[0] ?? "--"}° · Low {daily?.temperature_2m_min?.[0] ?? "--"}° · {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
						</p>
					</div>

					<div className="hero-meta">
						<div className="hero-meta-grid">
							<div className="hero-meta-card"><span>🌅 Sunrise</span><strong>{daily?.sunrise?.[0]?.slice(11,16) || "--"}</strong></div>
							<div className="hero-meta-card"><span>🌇 Sunset</span><strong>{daily?.sunset?.[0]?.slice(11,16) || "--"}</strong></div>
							<div className="hero-meta-card"><span>🌫️ AQI</span><strong style={{ color: aqiSeverity?.color }}>{currentAqi} <span style={{ fontSize:11, opacity:0.8 }}>{aqiSeverity.label}</span></strong></div>
						</div>
						<div className="city-actions-hero">
							<button type="button" className="soft-btn" onClick={() => { setPanelCity(locationMeta.name || ""); setPanelCityError(""); setCityPanelMode("change"); }}>
								✏️ Change city
							</button>
							<button type="button" className="soft-btn" onClick={() => setGlobeFullScreen(true)}>
								🌍 Pick from globe
							</button>
							<button type="button" className="soft-btn" onClick={() => { setPanelCity(""); setPanelCityError(""); setCityPanelMode("add"); }}>
								＋ Compare
							</button>
						</div>
					</div>
				</div>
				<ForecastStrip daily={daily} unit={unit} />
			</section>

			{/* ── Controls ── */}
			<div className="controls-row">
				<div className="date-panel">
					<div className="unit-switch" role="group">
						<button type="button" className={unit === "C" ? "active" : ""} onClick={() => handleUnitChange("C")}>°C</button>
						<button type="button" className={unit === "F" ? "active" : ""} onClick={() => handleUnitChange("F")}>°F</button>
					</div>
					<DatePicker selected={date} setSelected={setDate} />
				</div>
			</div>

			{/* ── City search panel ── */}
			{cityPanelMode && (
				<div className="search-box">
					<div className="search-box-header">
						<h3>{cityPanelMode === "change" ? "Change city" : "Add city to compare"}</h3>
						<button type="button" className="close-btn" onClick={() => setCityPanelMode(null)} aria-label="Close">✕</button>
					</div>
					<p>{cityPanelMode === "change" ? "Search and select a city to update the dashboard." : "Add cities to compare weather side-by-side."}</p>
					<CitySearchInput
						city={panelCity} setCity={setPanelCity}
						error={panelCityError} setError={setPanelCityError}
						onSelectCoordinates={cityPanelMode === "change" ? handleManualLocationSelection : handleAddCompareCity}
						placeholder={cityPanelMode === "change" ? "Search city…" : "Search city to add…"}
						autoFocus
					/>
					{isAddingCity && <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}><span className="city-spinner" /> Fetching city data…</p>}
				</div>
			)}

			{/* ── Compare cities ── */}
			{compareCities.length > 0 && (
				<section className="section-block">
					<div className="section-header">
						<h2 className="section-title"><span className="section-title-icon">🗺️</span>City comparison</h2>
						<span className="section-subtitle">{compareCities.length} cities</span>
					</div>
					<div className="compare-cities-grid">
						{compareCities.map(c => {
							const cityTemp  = unit === "C" ? c.temperatureC : c.temperatureC != null ? Number(toFahrenheit(c.temperatureC).toFixed(1)) : null;
							const aqiSev    = getAQISeverity(c.aqi ?? 0);
							const visual    = getWeatherVisual(c.weatherCode);
							return (
								<div key={c.key} className="compare-city-card">
									<button type="button" className="compare-city-remove" onClick={() => setCompareCities(p => p.filter(x => x.key !== c.key))} aria-label={`Remove ${c.name}`}>✕</button>
									<p className="compare-city-name">{c.name}{c.country ? `, ${c.country}` : ""}</p>
									<p className="compare-city-temp">{cityTemp ?? "--"}°{unit}</p>
									<p className="compare-city-line"><span>{visual.icon}</span> {c.condition}</p>
									<p className="compare-city-line">AQI: <strong style={{ color: aqiSev.color }}>{c.aqi ?? "--"} {aqiSev.label}</strong></p>
								</div>
							);
						})}
					</div>
				</section>
			)}

			{/* ── Stat cards ── */}
			<section className="section-block">
				<div className="section-header">
					<h2 className="section-title"><span className="section-title-icon">🌡️</span>Conditions</h2>
				</div>
				<div className="grid">
					<StatCard label="Temperature"        value={chartData[0]?.temperature} unit={`°${unit}`} />
					<StatCard label="Feels Like Min"     value={unit === "C" ? daily?.temperature_2m_min?.[0] : Number(toFahrenheit(daily?.temperature_2m_min?.[0]||0).toFixed(1))} unit={`°${unit}`} />
					<StatCard label="Feels Like Max"     value={unit === "C" ? daily?.temperature_2m_max?.[0] : Number(toFahrenheit(daily?.temperature_2m_max?.[0]||0).toFixed(1))} unit={`°${unit}`} />
					<StatCard label="Humidity"           value={hourly?.relative_humidity_2m?.[0]} unit="%" />
					<StatCard label="Wind Speed"         value={hourly?.wind_speed_10m?.[0]} unit="km/h" />
					<StatCard label="Precipitation"      value={hourly?.precipitation?.[0]} unit="mm" />
					<StatCard label="Precip. Probability" value={precipMax} unit="%" />
					<StatCard label="UV Index"           value={uvIndex} unit="" color={uvSeverity.color} subtitle={uvSeverity.label} />
					<StatCard label="Sunrise"            value={daily?.sunrise?.[0]?.slice(11,16) || "--"} unit="" />
					<StatCard label="Sunset"             value={daily?.sunset?.[0]?.slice(11,16) || "--"} unit="" />
					<StatCard label="AQI"                value={currentAqi} unit="" color={aqiSeverity.color} subtitle={aqiSeverity.label} />
					<StatCard label="PM2.5"              value={air?.hourly?.pm2_5?.[0] ?? "--"} unit="µg/m³" color="#f97316" />
					<StatCard label="PM10"               value={air?.hourly?.pm10?.[0] ?? "--"} unit="µg/m³" color="#ef4444" />
					<StatCard label="CO"                 value={air?.hourly?.carbon_monoxide?.[0] ?? "--"} unit="µg/m³" />
					<StatCard label="NO2"                value={air?.hourly?.nitrogen_dioxide?.[0] ?? "--"} unit="µg/m³" />
					<StatCard label="SO2"                value={air?.hourly?.sulphur_dioxide?.[0] ?? "--"} unit="µg/m³" />
				</div>
			</section>

			{/* ── Charts ── */}
			<section className="section-block">
				<div className="section-header">
					<h2 className="section-title"><span className="section-title-icon">📈</span>Hourly charts</h2>
				</div>
				<div className="charts-grid">
					<HourlyChart data={chartData} dataKey="temperature" label="Temperature" color="#ef4444" unit={`°${unit}`} />
					<HourlyChart data={chartData} dataKey="humidity"    label="Humidity"    color="#3b82f6" unit="%" showArea />
					<HourlyChart data={chartData} dataKey="visibility"  label="Visibility"  color="#8b5cf6" unit="m" showArea />
					<HourlyChart data={chartData} dataKey="wind"        label="Wind Speed"  color="#10b981" unit="km/h" showArea />
					<AirQualityChart    data={chartData} />
					<PrecipitationChart data={chartData} />
				</div>
			</section>
		</div>
	);
};

export default CurrentWeather;
