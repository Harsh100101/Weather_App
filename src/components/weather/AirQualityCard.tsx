import { motion } from 'framer-motion';

import { getAQILabel, getUVLabel } from '../../utils/weather';
import type { AirQuality } from '../../types/weather';

interface Props {
  airQuality?: AirQuality;
  uvi?: number;
  clouds?: number;
  theme: 'dark' | 'light';
}

function RadialGauge({ value, max, color, label, sublabel }: {
  value: number; max: number; color: string; label: string; sublabel: string;
}) {
  const pct = Math.min(value / max, 1);
  const angle = pct * 220 - 110;
  const r = 36;
  const cx = 50, cy = 54;
  const startAngle = -200 * (Math.PI / 180);
  const arcAngle = 220 * (Math.PI / 180);
  const endAngle = startAngle + arcAngle;

  const describeArc = (start: number, end: number, radius: number) => {
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const needleAngleRad = (angle - 90) * (Math.PI / 180);
  const nx = cx + (r - 8) * Math.cos(needleAngleRad);
  const ny = cy + (r - 8) * Math.sin(needleAngleRad);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 70" className="w-24 h-16">
        <path d={describeArc(startAngle, endAngle, r)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" strokeLinecap="round" />
        <path
          d={describeArc(startAngle, startAngle + arcAngle * pct, r)}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="3" fill={color} />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="bold">{label}</text>
      </svg>
      <p className="text-xs opacity-50 mt-1">{sublabel}</p>
    </div>
  );
}

export default function AirQualityCard({ airQuality, uvi, clouds, theme }: Props) {
  const isDark = theme === 'dark';
  const aqiInfo = airQuality ? getAQILabel(airQuality.aqi) : null;
  const uvInfo = uvi !== undefined ? getUVLabel(uvi) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`rounded-3xl p-5 mb-4 ${isDark ? 'glass' : 'glass-light'}`}
    >
      <h3 className={`text-xs font-semibold tracking-wider uppercase mb-4 opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
        Environment
      </h3>

      <div className={`grid ${airQuality ? 'grid-cols-3' : 'grid-cols-2'} gap-4 text-center`}>
        {uvInfo && uvi !== undefined && (
          <div className={`rounded-2xl p-3 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            <RadialGauge
              value={uvi}
              max={12}
              color={uvInfo.color}
              label={uvi.toFixed(1)}
              sublabel={`UV · ${uvInfo.label}`}
            />
          </div>
        )}

        {aqiInfo && airQuality && (
          <div className={`rounded-2xl p-3 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            <RadialGauge
              value={airQuality.aqi}
              max={5}
              color={aqiInfo.color}
              label={String(airQuality.aqi)}
              sublabel={`AQI · ${aqiInfo.label}`}
            />
          </div>
        )}

        {clouds !== undefined && (
          <div className={`rounded-2xl p-3 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            <RadialGauge
              value={clouds}
              max={100}
              color="#94a3b8"
              label={`${clouds}%`}
              sublabel="Cloud Cover"
            />
          </div>
        )}
      </div>

      {airQuality && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: 'PM2.5', value: airQuality.components.pm2_5.toFixed(1) },
            { label: 'PM10', value: airQuality.components.pm10.toFixed(1) },
            { label: 'O₃', value: airQuality.components.o3.toFixed(1) },
            { label: 'NO₂', value: airQuality.components.no2.toFixed(1) },
          ].map(({ label, value }) => (
            <div key={label} className={`rounded-xl p-2 text-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
              <div className={`text-xs opacity-50 mb-0.5 ${isDark ? 'text-white' : 'text-black'}`}>{label}</div>
              <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
