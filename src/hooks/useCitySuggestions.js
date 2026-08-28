import { useEffect, useRef, useState } from "react";
import { fetchGeocoding } from "../api/weather";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

const normalizeResult = (result) => ({
	id: `${result.id || ""}-${result.latitude}-${result.longitude}`,
	name: result.name,
	region: result.admin1 || result.admin2 || "",
	country: result.country || "",
	latitude: result.latitude,
	longitude: result.longitude,
});

const useCitySuggestions = (query) => {
	const [suggestions, setSuggestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const cacheRef = useRef(new Map());

	useEffect(() => {
		const searchQuery = query.trim().toLowerCase();

		if (searchQuery.length < MIN_QUERY_LENGTH) {
			setSuggestions([]);
			setLoading(false);
			setError("");
			return;
		}

		if (cacheRef.current.has(searchQuery)) {
			setSuggestions(cacheRef.current.get(searchQuery));
			setLoading(false);
			setError("");
			return;
		}

		let active = true;
		setLoading(true);
		setError("");

		const timer = setTimeout(async () => {
			try {
				const geocoding = await fetchGeocoding(searchQuery);
				const results = (geocoding?.results || [])
					.slice(0, 5)
					.map(normalizeResult);

				if (!active) return;

				cacheRef.current.set(searchQuery, results);
				setSuggestions(results);
			} catch (searchError) {
				if (!active) return;
				setSuggestions([]);
				setError(searchError.message || "Could not load city suggestions.");
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}, DEBOUNCE_MS);

		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, [query]);

	return { suggestions, loading, error, minQueryLength: MIN_QUERY_LENGTH };
};

export default useCitySuggestions;
