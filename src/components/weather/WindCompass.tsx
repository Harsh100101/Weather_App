import { motion } from 'framer-motion';
import { getWindDirection } from '../../utils/weather';

interface Props {
  windDeg: number;
  windSpeed: number;
  windGust?: number;
  theme: 'dark' | 'light';
}

export default function WindCompass({ windDeg, windSpeed, windGust, theme }: Props) {
  const isDark = theme === 'dark';
  const dir = getWindDirection(windDeg);
  const size = 110;
  const cx = size / 2;
  const r = 44;

  // Convert meteorological degree (from) to arrow direction (towards)
  const arrowAngle = windDeg - 180;

  const cardinals = [
    { label: 'N', angle: -90 },
    { label: 'E', angle: 0 },
    { label: 'S', angle: 90 },
    { label: 'W', angle: 180 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className={`rounded-3xl p-5 mb-4 ${isDark ? 'glass' : 'glass-light'}`}
    >
      <h3 className={`text-xs font-semibold tracking-wider uppercase mb-4 opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
        Wind
      </h3>

      <div className="flex items-center gap-6">
        {/* Compass */}
        <div className="relative shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Outer ring */}
            <circle
              cx={cx} cy={cx} r={r}
              fill="none"
              stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
              strokeWidth="1.5"
            />
            {/* Tick marks */}
            {Array.from({ length: 32 }).map((_, i) => {
              const a = (i / 32) * Math.PI * 2 - Math.PI / 2;
              const inner = i % 8 === 0 ? r - 10 : r - 5;
              return (
                <line
                  key={i}
                  x1={cx + inner * Math.cos(a)}
                  y1={cx + inner * Math.sin(a)}
                  x2={cx + r * Math.cos(a)}
                  y2={cx + r * Math.sin(a)}
                  stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}
                  strokeWidth={i % 8 === 0 ? 1.5 : 0.8}
                />
              );
            })}
            {/* Cardinal labels */}
            {cardinals.map(({ label, angle }) => {
              const rad = angle * (Math.PI / 180);
              const lx = cx + (r - 18) * Math.cos(rad);
              const ly = cx + (r - 18) * Math.sin(rad) + 4;
              return (
                <text
                  key={label}
                  x={lx} y={ly}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={label === 'N' ? '#38bdf8' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                >
                  {label}
                </text>
              );
            })}
            {/* Wind arrow */}
            <motion.g
              initial={{ rotate: 0, originX: `${cx}px`, originY: `${cx}px` }}
              animate={{ rotate: arrowAngle }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
              style={{ transformOrigin: `${cx}px ${cx}px` }}
            >
              {/* Arrow line */}
              <line
                x1={cx} y1={cx + r * 0.42}
                x2={cx} y2={cx - r * 0.5}
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Arrowhead */}
              <polygon
                points={`${cx},${cx - r * 0.5} ${cx - 5},${cx - r * 0.3} ${cx + 5},${cx - r * 0.3}`}
                fill="#38bdf8"
              />
            </motion.g>
            {/* Center dot */}
            <circle cx={cx} cy={cx} r="4" fill={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'} />
          </svg>
        </div>

        {/* Wind stats */}
        <div className="flex-1">
          <div className={`text-3xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-black'}`}>
            {Math.round(windSpeed)}
            <span className="text-base font-normal opacity-50 ml-1">km/h</span>
          </div>
          <div className={`text-sm font-semibold text-sky-400 mb-3`}>{dir}</div>

          <div className="space-y-2">
            <div className={`flex justify-between text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              <span>Direction</span>
              <span className="font-medium">{windDeg}°</span>
            </div>
            {windGust && (
              <div className={`flex justify-between text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                <span>Gusts</span>
                <span className="font-medium text-amber-400">{Math.round(windGust)} km/h</span>
              </div>
            )}
            <div className={`flex justify-between text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              <span>Beaufort</span>
              <span className="font-medium">{Math.min(12, Math.floor(Math.pow(windSpeed / 0.836, 2/3)))}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
