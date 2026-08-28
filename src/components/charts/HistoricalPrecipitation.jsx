import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Brush,
	CartesianGrid,
} from "recharts";

const HistoricalPrecipitation = ({ data }) => {
	return (
		<div className="chart-container">
			<h3>Precipitation Trend</h3>

			<ResponsiveContainer width="100%" height={220} minWidth={0}>
				<BarChart
					data={data}
					margin={{ top: 8, right: 8, left: -16, bottom: 18 }}
				>
					<CartesianGrid strokeDasharray="3 3" />

					<XAxis dataKey="time" minTickGap={24} tick={{ fontSize: 11 }} />

					<YAxis width={34} tick={{ fontSize: 11 }} />

					<Tooltip
						formatter={(value) =>
							typeof value === "number" ? `${value} mm` : value
						}
					/>

					<Bar dataKey="precipitation" fill="#3b82f6" />

					<Brush height={16} travellerWidth={6} stroke="#64748b" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default HistoricalPrecipitation;
