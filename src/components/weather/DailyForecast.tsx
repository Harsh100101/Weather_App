import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { formatTemp, formatDay, getMoonPhaseIcon } from '../../utils/weather';
import type { DailyForecast as DF, TemperatureUnit } from '../../types/weather';

interface Props {
  daily: DF[];
  unit: TemperatureUnit;
  theme: 'dark' | 'light';
}

export default function DailyForecast({ daily, unit, theme }: Props) {
  const isDark = theme === 'dark';
  const days = daily.slice(0, 7);
  const allMax = days.map((d) => d.temp.max);
  const allMin = days.map((d) => d.temp.min);
  const globalMax = Math.max(...allMax);
  const globalMin = Math.min(...allMin);
  const range = globalMax - globalMin || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`rounded-3xl p-5 mb-4 ${isDark ? 'glass' : 'glass-light'}`}
    >
      <h3 className={`text-xs font-semibold tracking-wider uppercase mb-4 opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
        7-Day Forecast
      </h3>
      <div className="flex flex-col gap-1">
        {days.map((day, i) => {
          const barMin = ((day.temp.min - globalMin) / range) * 100;
          const barMax = ((day.temp.max - globalMin) / range) * 100;
          const barWidth = barMax - barMin;

          return (
            <div
              key={day.dt}
              className={`flex items-center gap-3 py-2.5 px-2 rounded-2xl transition-colors ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
              }`}
            >
              {/* Day */}
              <span className={`text-sm font-medium w-10 ${isDark ? 'text-white/80' : 'text-black/70'}`}>
                {i === 0 ? 'Today' : formatDay(day.dt)}
              </span>

              {/* Icon */}
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                alt={day.weather[0].description}
                className="w-8 h-8 shrink-0"
              />

              {/* Moon phase */}
              <span className="text-sm w-5 text-center opacity-60">
                {getMoonPhaseIcon(day.moon_phase)}
              </span>

              {/* Rain chance */}
              {day.pop > 0.05 ? (
                <div className="flex items-center gap-0.5 w-10">
                  <Droplets size={11} className="text-sky-400" />
                  <span className="text-xs text-sky-400">{Math.round(day.pop * 100)}%</span>
                </div>
              ) : <div className="w-10" />}

              {/* Temperature bar */}
              <div className="flex-1 flex items-center gap-2">
                <span className={`text-xs font-medium w-8 text-right opacity-60 ${isDark ? 'text-white' : 'text-black'}`}>
                  {formatTemp(day.temp.min, unit)}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 relative">
                  <div
                    className="absolute h-full rounded-full"
                    style={{
                      left: `${barMin}%`,
                      width: `${barWidth}%`,
                      background: 'linear-gradient(to right, #60a5fa, #f97316)',
                    }}
                  />
                </div>
                <span className={`text-xs font-semibold w-8 ${isDark ? 'text-white' : 'text-black'}`}>
                  {formatTemp(day.temp.max, unit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
