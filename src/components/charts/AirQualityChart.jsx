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
	ReferenceLine,
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
			{payload.map((p) => (
				<div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
					{p.name}: {p.value} µg/m³
				</div>
			))}
		</div>
	);
};

const AirQualityChart = ({ data }) => (
	<div className="chart-container">
		<h3>Air Quality (PM2.5 / PM10)</h3>
		<ResponsiveContainer width="100%" height={220} minWidth={0}>
			<LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 18 }}>
				<CartesianGrid strokeDasharray="3 3" {...gridStyle} />
				<XAxis dataKey="time" minTickGap={24} tick={axisStyle} />
				<YAxis width={34} tick={axisStyle} />
				<Tooltip content={<CustomTooltip />} />
				<Legend
					wrapperStyle={{ fontSize: 11, color: "rgba(160,190,240,0.6)" }}
				/>
				<ReferenceLine y={15} stroke="#22c55e" strokeDasharray="4 4"
					label={{ value: "WHO PM2.5", fill: "#22c55e", fontSize: 10 }} />
				<ReferenceLine y={45} stroke="#f97316" strokeDasharray="4 4"
					label={{ value: "WHO PM10", fill: "#f97316", fontSize: 10 }} />
				<Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2}
					name="PM2.5" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
				<Line type="monotone" dataKey="pm10" stroke="#f59e0b" strokeWidth={2}
					name="PM10" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
				<Brush height={14} travellerWidth={6} stroke="rgba(100,160,255,0.2)" fill="rgba(0,0,0,0.3)" />
			</LineChart>
		</ResponsiveContainer>
	</div>
);

export default AirQualityChart;
