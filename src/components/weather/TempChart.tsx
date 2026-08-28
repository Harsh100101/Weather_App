import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { formatHour, formatTemp } from '../../utils/weather';
import type { HourlyForecast, TemperatureUnit } from '../../types/weather';

interface Props {
  hourly: HourlyForecast[];
  unit: TemperatureUnit;
  timezoneOffset: number;
  theme: 'dark' | 'light';
}

function CustomTooltip({ active, payload, unit, isDark }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={`px-3 py-2 rounded-xl text-xs ${isDark ? 'bg-slate-800 border border-white/15 text-white' : 'bg-white border border-black/10 text-black'} shadow-xl`}>
      <div className="font-bold text-sm">{formatTemp(d.temp, unit)}</div>
      <div className="opacity-60">{d.time}</div>
      {d.pop > 0 && <div className="text-sky-400">{Math.round(d.pop * 100)}% rain</div>}
    </div>
  );
}

export default function TempChart({ hourly, unit, timezoneOffset, theme }: Props) {
  const isDark = theme === 'dark';

  const data = hourly.slice(0, 24).map((h) => ({
    time: formatHour(h.dt, timezoneOffset),
    temp: Math.round(unit === 'fahrenheit' ? h.temp * 9/5 + 32 : h.temp),
    pop: h.pop,
    rawTemp: h.temp,
  }));

  const temps = data.map(d => d.temp);
  const avg = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className={`rounded-3xl p-5 mb-4 ${isDark ? 'glass' : 'glass-light'}`}
    >
      <h3 className={`text-xs font-semibold tracking-wider uppercase mb-1 opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
        Temperature Trend
      </h3>
      <p className={`text-xs mb-4 opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
        Daily avg: {avg}°{unit === 'celsius' ? 'C' : 'F'}
      </p>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rainAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 10, fill: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
            tickLine={false}
            axisLine={false}
          />
          <ReferenceLine
            y={avg}
            stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
            strokeDasharray="4 4"
          />
          <Tooltip content={<CustomTooltip unit={unit} isDark={isDark} />} />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#tempAreaGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
