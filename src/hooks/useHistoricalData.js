import { useQuery } from "@tanstack/react-query";
import { fetchHistorical } from "../api/weather";

const useHistoricalData = (lat, lng, start, end) => {
	return useQuery({
		queryKey: ["historical", lat, start, end],
		queryFn: () => fetchHistorical(lat, lng, start, end),
		enabled: !!lat && !!lng && !!start && !!end,
	});
};

export default useHistoricalData;
