export const toFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

export const getUVSeverity = (uv = 0) => {
	if (uv < 3) return { label: "Low", color: "#22c55e" };
	if (uv < 6) return { label: "Moderate", color: "#f59e0b" };
	if (uv < 8) return { label: "High", color: "#f97316" };
	return { label: "Very High", color: "#ef4444" };
};

export const getAQISeverity = (aqi = 0) => {
	if (aqi <= 50) return { label: "Good", color: "#22c55e" };
	if (aqi <= 100) return { label: "Moderate", color: "#eab308" };
	if (aqi <= 150) return { label: "Unhealthy", color: "#f97316" };
	return { label: "Hazardous", color: "#ef4444" };
};

export const getWeatherGradient = (weatherCode) => {
	if (weatherCode === 0) {
		return "linear-gradient(135deg, #ffd34d 0%, #ff8f1f 52%, #f06d1a 100%)";
	}

	if ([1, 2, 3, 45, 48].includes(weatherCode)) {
		return "linear-gradient(135deg, #aab6c8 0%, #7f8fa5 55%, #607287 100%)";
	}

	if (
		[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
	) {
		return "linear-gradient(135deg, #8a9bb3 0%, #5d6f84 55%, #405164 100%)";
	}

	if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
		return "linear-gradient(135deg, #c9ebff 0%, #8ebbe0 55%, #6791b8 100%)";
	}

	if ([95, 96, 99].includes(weatherCode)) {
		return "linear-gradient(135deg, #738196 0%, #425066 55%, #263446 100%)";
	}

	return "linear-gradient(135deg, #76bdfd 0%, #4779bf 55%, #2d4f8f 100%)";
};

export const getWeatherHeroTone = (weatherCode) => {
	if (weatherCode === 0) {
		return {
			pillBg: "rgba(255, 247, 214, 0.22)",
			pillBorder: "rgba(255, 235, 176, 0.48)",
		};
	}

	if ([1, 2, 3, 45, 48].includes(weatherCode)) {
		return {
			pillBg: "rgba(235, 241, 248, 0.22)",
			pillBorder: "rgba(227, 234, 241, 0.4)",
		};
	}

	if (
		[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
	) {
		return {
			pillBg: "rgba(229, 236, 245, 0.2)",
			pillBorder: "rgba(215, 225, 236, 0.36)",
		};
	}

	if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
		return {
			pillBg: "rgba(234, 247, 255, 0.22)",
			pillBorder: "rgba(210, 232, 248, 0.45)",
		};
	}

	if ([95, 96, 99].includes(weatherCode)) {
		return {
			pillBg: "rgba(225, 231, 242, 0.18)",
			pillBorder: "rgba(205, 214, 228, 0.34)",
		};
	}

	return {
		pillBg: "rgba(235, 242, 249, 0.2)",
		pillBorder: "rgba(221, 230, 240, 0.38)",
	};
};

export const getWindDirectionArrow = (degrees = 0) => {
	const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
	const index = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
	return arrows[index];
};

export const getWeatherConditionLabel = (code = -1) => {
	if (code === 0) return "Clear";
	if ([1, 2, 3].includes(code)) return "Partly cloudy";
	if ([45, 48].includes(code)) return "Fog";
	if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
	if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
	if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
	if ([95, 96, 99].includes(code)) return "Thunderstorm";
	return "Weather";
};

export const getWeatherVisual = (code = -1) => {
	if (code === 0) return { icon: "☀️", type: "Sunny" };
	if ([1, 2, 3].includes(code)) return { icon: "⛅", type: "Cloudy" };
	if ([45, 48].includes(code)) return { icon: "🌫️", type: "Fog" };
	if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
		return { icon: "🌧️", type: "Rain" };
	}
	if ([71, 73, 75, 77, 85, 86].includes(code))
		return { icon: "❄️", type: "Snow" };
	if ([95, 96, 99].includes(code)) return { icon: "⛈️", type: "Thunder" };
	return { icon: "🌤️", type: "Weather" };
};
