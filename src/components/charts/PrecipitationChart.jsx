import {
	BarChart, Bar, XAxis, YAxis, Tooltip,
	ResponsiveContainer, Brush, CartesianGrid, Cell,
} from "recharts";

const axisStyle = { fontSize: 11, fill: "rgba(160,190,240,0.45)" };
const gridStyle = { stroke: "rgba(100,160,255,0.07)" };

const CustomTooltip = ({ active, payload, label }) => {
	if (!active || !payload?.length) return null;
	return (
		<div style={{
			background: "rgba(8,12,24,0.95)", border: "1px solid rgba(100,160,255,0.18)",
			borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#e8f0fe",
		}}>
			<div style={{ color: "rgba(160,190,240,0.55)", marginBottom: 4 }}>{label}</div>
			<div style={{ color: "#3b82f6", fontWeight: 600 }}>{payload[0].value} mm</div>
		</div>
	);
};

const PrecipitationChart = ({ data }) => (
	<div className="chart-container">
		<h3>Precipitation</h3>
		<ResponsiveContainer width="100%" height={220} minWidth={0}>
			<BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 18 }}>
				<defs>
					<linearGradient id="precip-grad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#60a5fa" stopOpacity={0.9} />
						<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5} />
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" {...gridStyle} />
				<XAxis dataKey="time" minTickGap={24} tick={axisStyle} />
				<YAxis width={34} tick={axisStyle} />
				<Tooltip content={<CustomTooltip />} />
				<Bar dataKey="precipitation" fill="url(#precip-grad)" radius={[3, 3, 0, 0]} />
				<Brush height={14} travellerWidth={6} stroke="rgba(100,160,255,0.2)" fill="rgba(0,0,0,0.3)" />
			</BarChart>
		</ResponsiveContainer>
	</div>
);

export default PrecipitationChart;
