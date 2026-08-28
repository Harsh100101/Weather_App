import { useEffect, useState } from "react";

const useGeolocation = () => {
	const geolocationAvailable =
		typeof navigator !== "undefined" && "geolocation" in navigator;
	const secureContextAvailable =
		typeof window === "undefined" ? true : window.isSecureContext;
	const canRequestGeolocation = geolocationAvailable && secureContextAvailable;

	const [location, setLocation] = useState(null);
	const [loading, setLoading] = useState(canRequestGeolocation);
	const [denied, setDenied] = useState(!canRequestGeolocation);
	const [error, setError] = useState(
		canRequestGeolocation
			? ""
			: geolocationAvailable
				? "Location access requires HTTPS (or localhost)."
				: "Geolocation is not supported by this browser.",
	);

	const setManualLocation = ({ lat, lng }) => {
		setLocation({ lat, lng });
		setDenied(false);
		setError("");
	};

	const requestLocation = async () => {
		if (!secureContextAvailable) {
			setDenied(true);
			setLoading(false);
			setError(
				"Location permission only works on HTTPS or localhost. Open this app on a secure origin.",
			);
			return;
		}

		if (!navigator.geolocation) {
			setDenied(true);
			setLoading(false);
			setError("Geolocation is not supported by this browser.");
			return;
		}

		if (navigator.permissions?.query) {
			try {
				const permission = await navigator.permissions.query({
					name: "geolocation",
				});

				if (permission.state === "denied") {
					setDenied(true);
					setLoading(false);
					setError(
						"Location permission is blocked in browser settings. Enable location for this site, then try again.",
					);
					return;
				}
			} catch {
				// Continue with getCurrentPosition if permissions API check fails.
			}
		}

		setLoading(true);
		setError("");

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setLocation({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});

				setDenied(false);
				setError("");
				setLoading(false);
			},
			(error) => {
				console.error("Location error:", error);
				setDenied(error.code === 1);
				setError(
					error.code === 1
						? "Location access denied. Search by city to continue."
						: "Could not access your location right now.",
				);
				setLoading(false);
			},
		);
	};

	useEffect(() => {
		if (!canRequestGeolocation) {
			return;
		}

		requestLocation();
	}, []);

	return {
		location,
		loading,
		denied,
		error,
		setManualLocation,
		requestLocation,
	};
};

export default useGeolocation;
