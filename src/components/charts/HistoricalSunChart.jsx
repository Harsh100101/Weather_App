import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Brush,
	CartesianGrid,
	Legend,
} from "recharts";

const HistoricalSunChart = ({ data }) => {
	return (
		<div className="chart-container">
			<h3>Sunrise / Sunset (IST)</h3>

			<ResponsiveContainer width="100%" height={220} minWidth={0}>
				<AreaChart
					data={data}
					margin={{ top: 8, right: 8, left: -16, bottom: 18 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="time" minTickGap={24} tick={{ fontSize: 11 }} />
					<YAxis
						width={34}
						tick={{ fontSize: 11 }}
						label={{ value: "IST time", angle: -90, position: "insideLeft" }}
					/>
					<Tooltip />
					<Legend />
					<Area
						type="monotone"
						dataKey="sunriseMinutes"
						name="Sunrise"
						stroke="#f59e0b"
						fill="#fbbf24"
						fillOpacity={0.25}
					/>
					<Area
						type="monotone"
						dataKey="sunsetMinutes"
						name="Sunset"
						stroke="#6366f1"
						fill="#818cf8"
						fillOpacity={0.2}
					/>
					<Brush height={16} travellerWidth={6} stroke="#64748b" />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default HistoricalSunChart;
