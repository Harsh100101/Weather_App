import { useQuery } from "@tanstack/react-query";
import { fetchWeather, fetchAirQuality } from "../api/weather";

const useWeatherData = (lat, lng, date) => {
	return useQuery({
		queryKey: ["weather", lat, lng, date],

		queryFn: async () => {
			const [weather, air] = await Promise.all([
				fetchWeather(lat, lng, date),
				fetchAirQuality(lat, lng),
			]);

			return { weather, air };
		},

		enabled: !!lat && !!lng && !!date,
	});
};

export default useWeatherData;
