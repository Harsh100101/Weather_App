import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Brush,
	CartesianGrid,
} from "recharts";

import { getWindDirectionArrow } from "../../utils/weatherUtils";

const DirectionDot = ({ cx, cy, payload }) => {
	if (!cx || !cy || !payload) return null;

	return (
		<g>
			<circle cx={cx} cy={cy} r={3} fill="#10b981" />
			<text x={cx + 6} y={cy + 4} fontSize={12} fill="#065f46">
				{getWindDirectionArrow(payload.windDirection)}
			</text>
		</g>
	);
};

const HistoricalWind = ({ data }) => {
	return (
		<div className="chart-container">
			<h3>Wind Speed Trend</h3>

			<ResponsiveContainer width="100%" height={220} minWidth={0}>
				<LineChart
					data={data}
					margin={{ top: 8, right: 8, left: -16, bottom: 18 }}
				>
					<CartesianGrid strokeDasharray="3 3" />

					<XAxis dataKey="time" minTickGap={24} tick={{ fontSize: 11 }} />

					<YAxis width={34} tick={{ fontSize: 11 }} />

					<Tooltip
						formatter={(value, name, point) => {
							if (name === "wind") return `${value} km/h`;
							return `${value} ${point?.payload?.windDirection ?? ""}°`;
						}}
					/>

					<Line dataKey="wind" stroke="#10b981" dot={<DirectionDot />} />

					<Brush height={16} travellerWidth={6} stroke="#64748b" />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default HistoricalWind;
