import useGeolocation from "../hooks/useGeolocation";
import useHistoricalData from "../hooks/useHistoricalData";
import RangePicker from "../components/RangePicker";
import CitySearchInput from "../components/CitySearchInput";
import { useMemo, useState } from "react";

import HistoricalChart from "../components/charts/HistoricalChart";
import HistoricalPrecipitation from "../components/charts/HistoricalPrecipitation";
import HistoricalWind from "../components/charts/HistoricalWind";
import HistoricalSunChart from "../components/charts/HistoricalSunChart";
import HistoricalAirQualityChart from "../components/charts/HistoricalAirQualityChart";

import {
	convertUtcToIstTime,
	differenceInDays,
	groupHourlyToDailyAverage,
} from "../utils/dateUtils";

/* ─── Stat summary card (light version for historical) ──── */
function SummaryChip({ label, value, icon }) {
	return (
		<div className="hist-chip">
			<span className="hist-chip-icon">{icon}</span>
			<div>
				<p className="hist-chip-label">{label}</p>
				<p className="hist-chip-value">{value}</p>
			</div>
		</div>
	);
}

/* ─── Component ─────────────────────────────────────────── */
const HistoricalWeather = () => {
	const { location, denied, error, setManualLocation } = useGeolocation();

	const [range, setRange] = useState();
	const [city, setCity] = useState("");
	const [cityError, setCityError] = useState("");

	const MAX_RANGE = 730;
	const rangeDays =
		range?.from && range?.to ? differenceInDays(range.from, range.to) : 0;
	const isRangeTooLarge = rangeDays > MAX_RANGE;

	const start = range?.from?.toISOString().split("T")[0] || null;
	const end = range?.to?.toISOString().split("T")[0] || null;

	const { data, isLoading } = useHistoricalData(
		location?.lat,
		location?.lng,
		isRangeTooLarge ? null : start,
		isRangeTooLarge ? null : end,
	);

	const chartData = useMemo(() => {
		const daily = data?.weather?.daily;
		return (
			daily?.time?.map((time, index) => {
				const sunriseIst = convertUtcToIstTime(daily.sunrise[index]);
				const sunsetIst = convertUtcToIstTime(daily.sunset[index]);
				const sunriseMinutes =
					Number(sunriseIst.slice(0, 2)) * 60 + Number(sunriseIst.slice(3, 5));
				const sunsetMinutes =
					Number(sunsetIst.slice(0, 2)) * 60 + Number(sunsetIst.slice(3, 5));
				return {
					time,
					maxTemp: daily.temperature_2m_max[index],
					meanTemp: daily.temperature_2m_mean[index],
					minTemp: daily.temperature_2m_min[index],
					precipitation: daily.precipitation_sum[index],
					wind: daily.wind_speed_10m_max[index],
					windDirection: daily.wind_direction_10m_dominant[index],
					sunriseIst,
					sunsetIst,
					sunriseMinutes,
					sunsetMinutes,
				};
			}) || []
		);
	}, [data]);

	const historicalAirData = useMemo(() => {
		const airHourly = data?.air?.hourly;
		if (!airHourly?.time?.length) return [];
		const pm10ByDay = groupHourlyToDailyAverage(airHourly.time, airHourly.pm10);
		const pm25ByDay = groupHourlyToDailyAverage(
			airHourly.time,
			airHourly.pm2_5,
		);
		const pm25Map = new Map(pm25ByDay.map((item) => [item.day, item.value]));
		return pm10ByDay.map((item) => ({
			time: item.day,
			pm10: item.value,
			pm25: pm25Map.get(item.day) ?? null,
		}));
	}, [data]);

	/* ── Summary stats ── */
	const summaryStats = useMemo(() => {
		if (!chartData.length) return null;
		const maxTemps = chartData.map((d) => d.maxTemp).filter(Boolean);
		const minTemps = chartData.map((d) => d.minTemp).filter(Boolean);
		const precipSums = chartData
			.map((d) => d.precipitation)
			.filter((v) => v != null);
		return {
			avgMax: (maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length).toFixed(
				1,
			),
			avgMin: (minTemps.reduce((a, b) => a + b, 0) / minTemps.length).toFixed(
				1,
			),
			totalPrecip: precipSums.reduce((a, b) => a + b, 0).toFixed(1),
			days: chartData.length,
		};
	}, [chartData]);

	/* ── Location denied ── */
	if (denied && !location) {
		return (
			<div className="container">
				<section className="hero historical-hero">
					<div className="hero-main">
						<div>
							<div className="hero-badge">Historical</div>
							<h1>Past Weather</h1>
							<p className="hero-summary">
								Grant location access or search for a city to explore historical
								trends.
							</p>
						</div>
					</div>
				</section>

				<div className="search-box" style={{ marginTop: 16 }}>
					<h3>Location access denied</h3>
					<p style={{ color: "var(--n-600)", fontSize: 14, margin: "4px 0 0" }}>
						{error}
					</p>
					<CitySearchInput
						city={city}
						setCity={setCity}
						error={cityError}
						setError={setCityError}
						onSelectCoordinates={setManualLocation}
						placeholder="Search city (type at least 3 letters)"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			{/* ── Hero ── */}
			<section className="hero historical-hero">
				<div className="hero-main">
					<div className="hero-left">
						<div className="hero-badge">Historical insights</div>
						<h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 8 }}>
							Past weather trends
						</h1>
						<p className="hero-summary">
							Explore temperature, precipitation, wind, sunrise/sunset and air
							quality trends for any date range up to 2 years.
						</p>
					</div>

					{summaryStats && (
						<div className="hero-meta">
							<div className="hero-meta-grid">
								<div className="hero-meta-card">
									<span>Avg High</span>
									<strong>{summaryStats.avgMax}°</strong>
								</div>
								<div className="hero-meta-card">
									<span>Avg Low</span>
									<strong>{summaryStats.avgMin}°</strong>
								</div>
								<div className="hero-meta-card">
									<span>Total Rain</span>
									<strong>{summaryStats.totalPrecip}mm</strong>
								</div>
							</div>
							<p
								style={{
									margin: "8px 0 0",
									fontSize: 12,
									opacity: 0.75,
									textAlign: "center",
								}}
							>
								Over {summaryStats.days} days
							</p>
						</div>
					)}
				</div>
			</section>

			{/* ── Controls ── */}
			<div className="controls-row">
				<div className="date-picker-wrap">
					<RangePicker range={range} setRange={setRange} />
				</div>
			</div>

			{isRangeTooLarge && (
				<div
					className="section-block"
					style={{ background: "#fff5f5", border: "1.5px solid #fecaca" }}
				>
					<p
						style={{
							margin: 0,
							color: "#dc2626",
							fontWeight: 700,
							fontSize: 14,
						}}
					>
						⚠️ Maximum date range is 2 years (730 days). Please narrow your
						selection.
					</p>
				</div>
			)}

			{isLoading && (
				<div
					className="section-block"
					style={{ textAlign: "center", padding: 32 }}
				>
					<p style={{ margin: 0, color: "var(--n-600)", fontSize: 15 }}>
						⏳ Loading historical data…
					</p>
				</div>
			)}

			{!range && !isLoading && (
				<div
					className="section-block"
					style={{ textAlign: "center", padding: 40 }}
				>
					<p style={{ margin: 0, color: "var(--n-400)", fontSize: 15 }}>
						Select a date range above to view historical charts.
					</p>
				</div>
			)}

			{chartData.length > 0 && (
				<section className="section-block">
					<div className="section-header">
						<h2 className="section-title">
							<span className="section-title-icon">📊</span>Historical charts
						</h2>
						{summaryStats && (
							<span
								style={{ fontSize: 13, color: "var(--n-400)", fontWeight: 600 }}
							>
								{summaryStats.days} days
							</span>
						)}
					</div>

					<div className="charts-grid">
						<HistoricalChart data={chartData} />
						<HistoricalSunChart data={chartData} />
						<HistoricalPrecipitation data={chartData} />
						<HistoricalWind data={chartData} />
						<HistoricalAirQualityChart data={historicalAirData} />
					</div>
				</section>
			)}
		</div>
	);
};

export default HistoricalWeather;
