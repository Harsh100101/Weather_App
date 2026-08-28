const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";
const ARCHIVE_BASE = "https://archive-api.open-meteo.com/v1/archive";
const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const requestJson = async (url, extraHeaders = {}) => {
	const res = await fetch(url, {
		headers: { "Accept": "application/json", ...extraHeaders },
	});
	if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
	return res.json();
};

export const fetchWeather = async (lat, lng, date) => {
	const today = new Date().toISOString().split("T")[0];
	const isHistoricalDay = date < today;

	const params = new URLSearchParams({
		latitude: String(lat),
		longitude: String(lng),
		start_date: date,
		end_date: date,
		timezone: "auto",
		hourly: "temperature_2m,precipitation,relative_humidity_2m,visibility,wind_speed_10m,uv_index,precipitation_probability",
		daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code",
	});

	if (!isHistoricalDay) {
		params.set("current", "weather_code");
		const sevenDays = new Date();
		sevenDays.setDate(sevenDays.getDate() + 6);
		params.set("end_date", sevenDays.toISOString().split("T")[0]);
	}

	const base = isHistoricalDay ? ARCHIVE_BASE : FORECAST_BASE;
	return requestJson(`${base}?${params.toString()}`);
};

export const fetchAirQuality = async (lat, lng, startDate, endDate) => {
	const params = new URLSearchParams({
		latitude: String(lat),
		longitude: String(lng),
		hourly: "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,us_aqi",
		timezone: "auto",
	});
	if (startDate && endDate) {
		params.set("start_date", startDate);
		params.set("end_date", endDate);
	}
	return requestJson(`${AIR_QUALITY_BASE}?${params.toString()}`);
};

export const fetchHistorical = async (lat, lng, start, end) => {
	const weatherParams = new URLSearchParams({
		latitude: String(lat),
		longitude: String(lng),
		start_date: start,
		end_date: end,
		timezone: "GMT",
		daily: "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset",
	});
	const [weather, air] = await Promise.all([
		requestJson(`${ARCHIVE_BASE}?${weatherParams.toString()}`),
		fetchAirQuality(lat, lng, start, end),
	]);
	return { weather, air };
};

export const fetchGeocoding = async (city) => {
	const params = new URLSearchParams({ name: city, count: "5", language: "en", format: "json" });
	return requestJson(`${GEOCODING_BASE}?${params.toString()}`);
};

/**
 * Reverse geocoding using Nominatim (OpenStreetMap).
 * Falls back to nearest Open-Meteo geocoding result if Nominatim fails.
 * Returns { results: [{ name, state, country, countryCode, latitude, longitude, displayName }] }
 */
export const fetchReverseGeocoding = async (lat, lng) => {
	// ── Try Nominatim first ──────────────────────────────────
	try {
		const params = new URLSearchParams({
			lat: String(lat),
			lon: String(lng),
			format: "json",
			zoom: "10",
			addressdetails: "1",
		});
		const data = await requestJson(
			`${NOMINATIM_BASE}/reverse?${params.toString()}`,
			{ "User-Agent": "AtmosWeatherApp/1.0" }
		);

		if (data && !data.error && data.address) {
			const addr = data.address;
			const city =
				addr.city || addr.town || addr.village || addr.municipality ||
				addr.suburb || addr.county || addr.state_district || addr.region;
			const state       = addr.state || addr.state_district || "";
			const country     = addr.country || "";
			const countryCode = (addr.country_code || "").toUpperCase();
			const rLat        = parseFloat(data.lat);
			const rLng        = parseFloat(data.lon);

			if (city) {
				return {
					results: [{
						name:        city,
						state,
						country,
						countryCode,
						latitude:    isFinite(rLat) ? rLat : lat,
						longitude:   isFinite(rLng) ? rLng : lng,
						displayName: [city, state, country].filter(Boolean).join(", "),
					}],
				};
			}
		}
	} catch { /* fall through to Open-Meteo fallback */ }

	// ── Fallback: nearest city via Open-Meteo ────────────────
	// Search for a country name near the clicked point using bounding-box heuristics
	// We generate a simple nearby place name by searching lat/lng rounded to region
	try {
		// Use the BigDataCloud free API as secondary fallback (no key required)
		const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
		const bdc = await requestJson(bdcUrl);
		if (bdc && bdc.city) {
			return {
				results: [{
					name:        bdc.city || bdc.locality || bdc.principalSubdivision || "Unknown",
					state:       bdc.principalSubdivision || "",
					country:     bdc.countryName || "",
					countryCode: bdc.countryCode || "",
					latitude:    lat,
					longitude:   lng,
					displayName: [bdc.city || bdc.locality, bdc.principalSubdivision, bdc.countryName].filter(Boolean).join(", "),
				}],
			};
		}
	} catch { /* all fallbacks exhausted */ }

	return null;
};

/**
 * Search cities within a country using Open-Meteo geocoding.
 */
export const fetchCitiesInCountry = async (countryCode, query = "") => {
	const params = new URLSearchParams({
		name: query || "a",
		count: "20",
		language: "en",
		format: "json",
		country_id: countryCode,
	});
	return requestJson(`${GEOCODING_BASE}?${params.toString()}`);
};
