import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Brush,
	CartesianGrid,
	Legend,
} from "recharts";

const HistoricalChart = ({ data }) => {
	return (
		<div className="chart-container">
			<h3>Temperature Trend</h3>

			<ResponsiveContainer width="100%" height={220} minWidth={0}>
				<LineChart
					data={data}
					margin={{ top: 8, right: 8, left: -16, bottom: 18 }}
				>
					<CartesianGrid strokeDasharray="3 3" />

					<XAxis dataKey="time" minTickGap={24} tick={{ fontSize: 11 }} />

					<YAxis width={34} tick={{ fontSize: 11 }} />

					<Tooltip
						formatter={(value) =>
							typeof value === "number" ? `${value} °C` : value
						}
					/>

					<Legend />

					<Line dataKey="maxTemp" stroke="#ef4444" name="Max Temp" />

					<Line dataKey="meanTemp" stroke="#6b7280" name="Mean Temp" />

					<Line dataKey="minTemp" stroke="#3b82f6" name="Min Temp" />

					<Brush height={16} travellerWidth={6} stroke="#64748b" />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default HistoricalChart;
