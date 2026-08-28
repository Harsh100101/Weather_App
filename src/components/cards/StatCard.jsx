const ICONS = {
	Temperature: "🌡️",
	"Feels Like Min": "🧊",
	"Feels Like Max": "🔥",
	Humidity: "💧",
	"Wind Speed": "💨",
	Precipitation: "🌧️",
	"Precip. Probability": "☔",
	"UV Index": "☀️",
	Sunrise: "🌅",
	Sunset: "🌇",
	AQI: "🌫️",
	"PM2.5": "🔬",
	PM10: "🔬",
	CO: "⚗️",
	NO2: "⚗️",
	SO2: "⚗️",
};

const UVBar = ({ value }) => {
	const pct = Math.min(100, (value / 12) * 100);
	return (
		<div className="uv-bar-wrap" aria-label={`UV Index ${value} out of 12`}>
			<div className="uv-bar-bg">
				<div className="uv-bar-fill" style={{ width: `${pct}%` }} />
			</div>
		</div>
	);
};

const StatCard = ({ label, value, unit, color, subtitle }) => {
	const icon = ICONS[label] || "📊";
	const showUVBar = label === "UV Index";

	return (
		<div
			className="stat-card"
			style={{ "--card-accent": color || "#4f88e8" }}
		>
			<div className="stat-card-header">
				<span className="stat-icon" aria-hidden="true">{icon}</span>
				<h4 className="stat-label">{label}</h4>
			</div>
			<div className="stat-value-row">
				<span className="stat-value" style={{ color: color || "inherit" }}>
					{value ?? "--"}
				</span>
				{unit && <span className="stat-unit">{unit}</span>}
			</div>
			{showUVBar && typeof value === "number" && <UVBar value={value} />}
			{subtitle && (
				<p className="stat-subtitle" style={{ color: color || "inherit" }}>
					{subtitle}
				</p>
			)}
		</div>
	);
};

export default StatCard;
