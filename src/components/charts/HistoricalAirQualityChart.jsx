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
	ReferenceLine,
} from "recharts";

const HistoricalAirQualityChart = ({ data }) => {
	return (
		<div className="chart-container">
			<h3>PM10 / PM2.5 Trend</h3>

			<ResponsiveContainer width="100%" height={220} minWidth={0}>
				<AreaChart
					data={data}
					margin={{ top: 8, right: 8, left: -16, bottom: 18 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="time" minTickGap={24} tick={{ fontSize: 11 }} />
					<YAxis width={34} tick={{ fontSize: 11 }} />
					<Tooltip
						formatter={(value) =>
							typeof value === "number" ? `${value} µg/m³` : value
						}
					/>
					<Legend />
					<ReferenceLine
						y={15}
						stroke="#22c55e"
						strokeDasharray="4 4"
						label="WHO PM2.5"
					/>
					<ReferenceLine
						y={45}
						stroke="#f97316"
						strokeDasharray="4 4"
						label="WHO PM10"
					/>
					<Area
						type="monotone"
						dataKey="pm25"
						name="PM2.5"
						stroke="#ef4444"
						fill="#fecaca"
						fillOpacity={0.35}
					/>
					<Area
						type="monotone"
						dataKey="pm10"
						name="PM10"
						stroke="#f59e0b"
						fill="#fde68a"
						fillOpacity={0.25}
					/>
					<Brush height={16} travellerWidth={6} stroke="#64748b" />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default HistoricalAirQualityChart;
