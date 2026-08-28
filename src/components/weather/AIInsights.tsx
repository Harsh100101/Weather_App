import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, Sparkles, KeyRound } from "lucide-react";
import type { WeatherData, TemperatureUnit } from "../../types/weather";
import { formatTempWithUnit, getWindDirection } from "../../utils/weather";

interface Card {
	emoji: string;
	title: string;
	text: string;
}

const FALLBACK: Card[] = [
	{
		emoji: "👔",
		title: "What to Wear",
		text: "Dress in layers — temperatures may shift through the day.",
	},
	{
		emoji: "🏃",
		title: "Outdoor Activities",
		text: "Check conditions before heading out; light activity is fine.",
	},
	{
		emoji: "🌿",
		title: "Air & UV",
		text: "UV levels are moderate — consider sunscreen if outdoors.",
	},
	{
		emoji: "✈️",
		title: "Travel & Commute",
		text: "No major weather disruptions expected for local travel.",
	},
];

// Read key from .env (VITE_GEMINI_API_KEY)
const AI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export default function AIInsights({
	data,
	unit,
	theme: _t,
}: {
	data: WeatherData;
	unit: TemperatureUnit;
	theme: string;
}) {
	const [cards, setCards] = useState<Card[]>([]);
	const [loading, setLoad] = useState(false);
	const [done, setDone] = useState(false);
	const [error, setError] = useState("");
	const { current, city, daily } = data;

	const fetchInsights = async () => {
		if (done) return;

		// No API key — show fallback immediately without calling API
		if (!AI_KEY) {
			setCards(FALLBACK);
			setDone(true);
			setError("no-key");
			return;
		}

		setLoad(true);
		setError("");

		const prompt = `Weather in ${city.name}, ${city.country}: ${formatTempWithUnit(current.temp, unit)}, ${current.weather[0].description}, humidity ${current.humidity}%, wind ${Math.round(current.wind_speed)} km/h ${getWindDirection(current.wind_deg)}, UV ${current.uvi ?? "N/A"}. Next 3 days highs: ${daily
			.slice(1, 4)
			.map((d) => formatTempWithUnit(d.temp.max, unit))
			.join(", ")}.
Respond ONLY with valid JSON, no markdown fences or extra text:
{"clothing":"1 concise sentence","outdoor":"1 concise sentence","air":"1 concise sentence","travel":"1 concise sentence"}`;

		try {
			const res = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(AI_KEY)}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						contents: [{ role: "user", parts: [{ text: prompt }] }],
						generationConfig: {
							maxOutputTokens: 400,
							responseMimeType: "application/json",
						},
					}),
				},
			);

			if (!res.ok) {
				const errBody = await res.json().catch(() => ({}));
				throw new Error(errBody?.error?.message ?? `HTTP ${res.status}`);
			}

			const json = await res.json();
			const raw = (json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}")
				.replace(/```json|```/g, "")
				.trim();
			const p = JSON.parse(raw);

			setCards([
				{
					emoji: "👔",
					title: "What to Wear",
					text: p.clothing ?? FALLBACK[0].text,
				},
				{
					emoji: "🏃",
					title: "Outdoor Activities",
					text: p.outdoor ?? FALLBACK[1].text,
				},
				{ emoji: "🌿", title: "Air & UV", text: p.air ?? FALLBACK[2].text },
				{
					emoji: "✈️",
					title: "Travel & Commute",
					text: p.travel ?? FALLBACK[3].text,
				},
			]);
		} catch (err: any) {
			// On error, show fallback with error message
			setCards(FALLBACK);
			setError(err.message ?? "API error");
		} finally {
			setLoad(false);
			setDone(true);
		}
	};

	return (
		<div className="card" style={{ overflow: "hidden" }}>
			{/* Trigger row */}
			<button
				onClick={fetchInsights}
				disabled={loading}
				style={{
					width: "100%",
					display: "flex",
					alignItems: "center",
					gap: 12,
					padding: "12px 14px",
					background: "none",
					border: "none",
					cursor: loading ? "wait" : "pointer",
					fontFamily: "inherit",
					textAlign: "left",
				}}
			>
				<div
					style={{
						width: 32,
						height: 32,
						borderRadius: 10,
						background: "linear-gradient(135deg,#7c3aed,#4338ca)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
						boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
					}}
				>
					{loading ? (
						<Loader2 size={14} style={{ color: "white" }} className="spin" />
					) : (
						<Sparkles size={14} style={{ color: "white" }} />
					)}
				</div>
				<div style={{ flex: 1, minWidth: 0 }}>
					<p style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
						AI Weather Insights
					</p>
					{!done && !loading && (
						<p
							style={{
								fontSize: 11,
								color: "rgba(255,255,255,0.35)",
								marginTop: 1,
							}}
						>
							{AI_KEY
								? "Tap for smart recommendations"
								: "Add VITE_GEMINI_API_KEY to .env for live AI"}
						</p>
					)}
					{done && error === "no-key" && (
						<p
							style={{
								fontSize: 10,
								color: "rgba(251,191,36,0.7)",
								marginTop: 1,
								display: "flex",
								alignItems: "center",
								gap: 4,
							}}
						>
							<KeyRound size={10} /> Showing defaults — add API key for live AI
						</p>
					)}
					{done && error && error !== "no-key" && (
						<p
							style={{
								fontSize: 10,
								color: "rgba(248,113,113,0.8)",
								marginTop: 1,
							}}
						>
							Error: {error.slice(0, 60)}
						</p>
					)}
				</div>
				{done && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							setDone(false);
							setCards([]);
							setError("");
						}}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "rgba(255,255,255,0.3)",
							display: "flex",
							padding: 4,
						}}
						title="Refresh"
					>
						<RefreshCw size={12} />
					</button>
				)}
			</button>

			<AnimatePresence>
				{done && cards.length > 0 && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.22 }}
						style={{ overflow: "hidden" }}
					>
						<div
							style={{
								borderTop: "1px solid rgba(255,255,255,0.08)",
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 8,
								padding: "10px 12px 12px",
							}}
						>
							{cards.map((c, i) => (
								<motion.div
									key={c.title}
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.07 }}
									style={{
										borderRadius: 12,
										padding: "10px 12px",
										background: "rgba(255,255,255,0.045)",
										border: "1px solid rgba(255,255,255,0.07)",
									}}
								>
									<span
										className="emoji"
										style={{
											fontSize: 16,
											lineHeight: 1,
											display: "block",
											marginBottom: 6,
										}}
									>
										{c.emoji}
									</span>
									<p
										style={{
											fontSize: 9,
											fontWeight: 800,
											textTransform: "uppercase",
											letterSpacing: "0.05em",
											color: "rgba(255,255,255,0.35)",
											marginBottom: 4,
										}}
									>
										{c.title}
									</p>
									<p
										style={{
											fontSize: 11,
											lineHeight: 1.5,
											color: "rgba(255,255,255,0.75)",
										}}
									>
										{c.text}
									</p>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
