import { motion } from 'framer-motion';
import { formatTime, getMoonPhaseIcon } from '../../utils/weather';
import type { CurrentWeather as CW, DailyForecast } from '../../types/weather';

interface Props {
  current: CW;
  today: DailyForecast;
  theme: 'dark' | 'light';
}

export default function SunMoonCard({ current, today, theme }: Props) {
  const isDark = theme === 'dark';
  const offset = current.timezone_offset;

  const now = current.dt + offset;
  const rise = current.sunrise + offset;
  const set = current.sunset + offset;
  const dayLength = set - rise;
  const progress = Math.max(0, Math.min(1, (now - rise) / dayLength));

  const W = 260;
  const H = 110;
  const cx = W / 2;
  const cy = H + 10;
  const rx = W / 2 - 10;
  const ry = H - 10;

  // Sun position along elliptical arc
  const angle = Math.PI - progress * Math.PI; // π → 0 as day progresses
  const sunX = cx + rx * Math.cos(angle);
  const sunY = cy - ry * Math.sin(angle);

  const isAboveHorizon = progress > 0 && progress < 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className={`rounded-3xl p-5 mb-4 ${isDark ? 'glass' : 'glass-light'}`}
    >
      <h3 className={`text-xs font-semibold tracking-wider uppercase mb-4 opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
        Sun & Moon
      </h3>

      <div className="flex gap-4">
        {/* Sun arc */}
        <div className="flex-1">
          <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} className="overflow-visible">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? 'rgba(99,179,237,0.08)' : 'rgba(251,191,36,0.1)'} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Horizon line */}
            <line
              x1={10} y1={cy} x2={W - 10} y2={cy}
              stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Arc background */}
            <path
              d={`M 10 ${cy} A ${rx} ${ry} 0 0 1 ${W - 10} ${cy}`}
              fill="url(#skyGrad)"
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              strokeWidth="1"
            />

            {/* Filled arc (elapsed) */}
            {isAboveHorizon && (
              <path
                d={`M 10 ${cy} A ${rx} ${ry} 0 0 1 ${sunX} ${sunY}`}
                fill="none"
                stroke={isDark ? 'rgba(251,191,36,0.5)' : 'rgba(251,191,36,0.7)'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}

            {/* Sun */}
            {isAboveHorizon && (
              <g>
                <circle cx={sunX} cy={sunY} r="10" fill="#fbbf24" opacity="0.9" />
                <circle cx={sunX} cy={sunY} r="14" fill="rgba(251,191,36,0.2)" />
                {/* Rays */}
                {[0,45,90,135,180,225,270,315].map((deg) => {
                  const rad = deg * Math.PI / 180;
                  return (
                    <line
                      key={deg}
                      x1={sunX + 14 * Math.cos(rad)} y1={sunY + 14 * Math.sin(rad)}
                      x2={sunX + 18 * Math.cos(rad)} y2={sunY + 18 * Math.sin(rad)}
                      stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"
                    />
                  );
                })}
              </g>
            )}

            {/* Sunrise / Sunset labels */}
            <text x="10" y={cy + 15} fontSize="9" fill={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} textAnchor="start">
              {formatTime(current.sunrise, offset)}
            </text>
            <text x={W - 10} y={cy + 15} fontSize="9" fill={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} textAnchor="end">
              {formatTime(current.sunset, offset)}
            </text>
          </svg>

          {/* Day length */}
          <p className={`text-center text-xs opacity-50 -mt-1 ${isDark ? 'text-white' : 'text-black'}`}>
            {Math.floor(dayLength / 3600)}h {Math.floor((dayLength % 3600) / 60)}m of daylight
          </p>
        </div>

        {/* Moon info */}
        <div className={`shrink-0 w-24 rounded-2xl p-3 text-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <div className="text-3xl mb-2">{getMoonPhaseIcon(today.moon_phase)}</div>
          <div className={`text-xs font-medium mb-3 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
            {today.moon_phase === 0 || today.moon_phase === 1
              ? 'New Moon'
              : today.moon_phase < 0.25
              ? 'Waxing Crescent'
              : today.moon_phase === 0.25
              ? 'First Quarter'
              : today.moon_phase < 0.5
              ? 'Waxing Gibbous'
              : today.moon_phase === 0.5
              ? 'Full Moon'
              : today.moon_phase < 0.75
              ? 'Waning Gibbous'
              : today.moon_phase === 0.75
              ? 'Last Quarter'
              : 'Waning Crescent'}
          </div>
          <div className={`text-xs opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
            {Math.round(today.moon_phase * 100)}% illuminated
          </div>
        </div>
      </div>
    </motion.div>
  );
}
