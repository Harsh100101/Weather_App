import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { formatTemp, formatHour } from '../../utils/weather';
import type { HourlyForecast as HF, TemperatureUnit } from '../../types/weather';

interface Props {
  hourly: HF[];
  unit: TemperatureUnit;
  timezoneOffset: number;
  theme: 'dark' | 'light';
}

export default function HourlyForecast({ hourly, unit, timezoneOffset, theme }: Props) {
  const isDark = theme === 'dark';
  const temps = hourly.map((h) => h.temp);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`rounded-3xl p-5 mb-4 ${isDark ? 'glass' : 'glass-light'}`}
    >
      <h3 className={`text-xs font-semibold tracking-wider uppercase mb-4 opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
        24-Hour Forecast
      </h3>

      {/* Chart area */}
      <div className="relative mb-2">
        <svg width="100%" height="60" className="overflow-visible" viewBox={`0 0 ${hourly.length * 56} 60`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? 'rgba(99,179,237,0.5)' : 'rgba(59,130,246,0.4)'} />
              <stop offset="100%" stopColor="rgba(99,179,237,0)" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <path
            d={`M 28 ${55 - ((temps[0] - minT) / range) * 45}
               ${temps.map((t, i) => `L ${28 + i * 56} ${55 - ((t - minT) / range) * 45}`).join(' ')}
               L ${28 + (temps.length - 1) * 56} 60 L 28 60 Z`}
            fill="url(#tempGrad)"
          />
          {/* Line */}
          <polyline
            points={temps.map((t, i) => `${28 + i * 56},${55 - ((t - minT) / range) * 45}`).join(' ')}
            fill="none"
            stroke={isDark ? 'rgba(147,197,253,0.8)' : 'rgba(59,130,246,0.8)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dots */}
          {temps.map((t, i) => (
            <circle
              key={i}
              cx={28 + i * 56}
              cy={55 - ((t - minT) / range) * 45}
              r="3"
              fill={isDark ? '#93c5fd' : '#3b82f6'}
            />
          ))}
        </svg>
      </div>

      {/* Scroll row */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {hourly.map((h, i) => (
          <div
            key={h.dt}
            className={`flex-none flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl min-w-[56px] transition-colors ${
              i === 0
                ? isDark ? 'bg-white/15 border border-white/20' : 'bg-black/10 border border-black/15'
                : isDark ? 'hover:bg-white/8' : 'hover:bg-black/5'
            }`}
          >
            <span className={`text-xs font-medium opacity-60 ${isDark ? 'text-white' : 'text-black'}`}>
              {i === 0 ? 'Now' : formatHour(h.dt, timezoneOffset)}
            </span>
            <img
              src={`https://openweathermap.org/img/wn/${h.weather[0].icon}.png`}
              alt={h.weather[0].description}
              className="w-8 h-8"
            />
            <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
              {formatTemp(h.temp, unit)}
            </span>
            {h.pop > 0.1 && (
              <div className="flex items-center gap-0.5">
                <Droplets size={9} className="text-sky-400" />
                <span className="text-xs text-sky-400">{Math.round(h.pop * 100)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
