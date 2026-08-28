import {
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Brush,
	CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label, unit }) => {
	if (!active || !payload?.length) return null;
	return (
		<div style={{
			background: "rgba(8, 12, 24, 0.95)",
			border: "1px solid rgba(100, 160, 255, 0.18)",
			borderRadius: 10,
			padding: "8px 12px",
			fontSize: 12,
			color: "#e8f0fe",
		}}>
			<div style={{ color: "rgba(160,190,240,0.55)", marginBottom: 4 }}>{label}</div>
			<div style={{ fontWeight: 600, color: payload[0].color }}>
				{payload[0].value}{unit ? ` ${unit}` : ""}
			</div>
		</div>
	);
};

const axisStyle = { fontSize: 11, fill: "rgba(160,190,240,0.45)" };
const gridStyle = { stroke: "rgba(100,160,255,0.07)" };

const HourlyChart = ({ data, dataKey, label, color, unit = "", showArea = false }) => {
	const accentColor = color || "#6366f1";

	return (
		<div className="chart-container">
			<h3>{label}</h3>
			<ResponsiveContainer width="100%" height={220} minWidth={0}>
				{showArea ? (
					<AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 18 }}>
						<defs>
							<linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
								<stop offset="95%" stopColor={accentColor} stopOpacity={0.0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" {...gridStyle} />
						<XAxis dataKey="time" minTickGap={24} tick={axisStyle} />
						<YAxis width={34} tick={axisStyle} />
						<Tooltip content={<CustomTooltip unit={unit} />} />
						<Area
							type="monotone"
							dataKey={dataKey}
							stroke={accentColor}
							strokeWidth={2}
							fill={`url(#grad-${dataKey})`}
							dot={false}
							activeDot={{ r: 4, strokeWidth: 0 }}
						/>
						<Brush height={14} travellerWidth={6} stroke="rgba(100,160,255,0.2)" fill="rgba(0,0,0,0.3)" />
					</AreaChart>
				) : (
					<LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 18 }}>
						<CartesianGrid strokeDasharray="3 3" {...gridStyle} />
						<XAxis dataKey="time" minTickGap={24} tick={axisStyle} />
						<YAxis width={34} tick={axisStyle} />
						<Tooltip content={<CustomTooltip unit={unit} />} />
						<Line
							type="monotone"
							dataKey={dataKey}
							stroke={accentColor}
							strokeWidth={2}
							dot={false}
							activeDot={{ r: 4, strokeWidth: 0, fill: accentColor }}
						/>
						<Brush height={14} travellerWidth={6} stroke="rgba(100,160,255,0.2)" fill="rgba(0,0,0,0.3)" />
					</LineChart>
				)}
			</ResponsiveContainer>
		</div>
	);
};

export default HourlyChart;
