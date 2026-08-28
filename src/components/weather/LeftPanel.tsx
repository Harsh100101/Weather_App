import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  formatTemp, formatWind, formatPressure,
  getWindDirection, getUVLabel, getAQILabel, formatLocalDateTime,
} from '../../utils/weather';
import type { WeatherData } from '../../types/weather';

export default function LeftPanel({ data }: { data: WeatherData; theme: string }) {
  const { unit, windUnit, pressureUnit, toggleFavorite, isFavorite,
          showHumidity, showWind, showUV, showPressure, showDewPoint } = useAppStore();
  const { city, current, airQuality } = data;
  const fav     = isFavorite(city);
  const uvInfo  = current.uvi != null ? getUVLabel(current.uvi) : null;
  const aqiInfo = airQuality ? getAQILabel(airQuality.aqi) : null;

  // Build stat rows based on visibility settings
  const allStats = [
    { emoji:'🌡', color:'#38bdf8', label:'Feels Like',
      value: formatTemp(current.feels_like, unit) + (unit==='celsius'?'C':'F'), always: true },
    { emoji:'💧', color:'#60a5fa', label:'Humidity',
      value: `${current.humidity}%`, key:'showHumidity', show: showHumidity },
    { emoji:'💨', color:'#a78bfa', label:'Wind',
      value: `${formatWind(current.wind_speed, windUnit)} ${getWindDirection(current.wind_deg)}`, key:'showWind', show: showWind },
    { emoji:'⏱', color:'#fb923c', label:'Pressure',
      value: formatPressure(current.pressure, pressureUnit), key:'showPressure', show: showPressure },
    { emoji:'👁', color:'#34d399', label:'Visibility',
      value: `${current.visibility.toFixed(0)} km`, always: true },
    { emoji:'⚡', color:'#facc15', label:'AQI',
      value: aqiInfo ? `${aqiInfo.numericEst} – ${aqiInfo.label}` : 'N/A', always: true },
    { emoji:'☀', color:'#f472b6', label:'UV Index',
      value: uvInfo?.label ?? 'N/A', key:'showUV', show: showUV },
    { emoji:'💦', color:'#f97316', label: current.wind_gust ? 'Wind Gust' : 'Dew Point',
      value: current.wind_gust
        ? formatWind(current.wind_gust, windUnit)
        : current.dew_point != null
          ? formatTemp(current.dew_point, unit) + (unit==='celsius'?'C':'F')
          : 'N/A',
      key:'showDewPoint', show: showDewPoint },
  ];

  const stats = allStats.filter(s => s.always || s.show);

  return (
    <motion.div
      key={`lp-${city.lat}`}
      initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.35 }}
      style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}
    >
      {/* City */}
      <div className="left-city">
        <div>
          <h1 style={{ fontSize:17, fontWeight:900, color:'white', lineHeight:1.2, letterSpacing:-0.3 }}>
            {city.name}
            {city.country && <span style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.45)' }}>, {city.country}</span>}
          </h1>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2, fontWeight:500 }}>
            {formatLocalDateTime(current.dt, current.timezone_offset)}
          </p>
        </div>
        <button onClick={() => toggleFavorite(city)}
          style={{ background:'none', border:'none', cursor:'pointer', padding:6, borderRadius:10, color: fav ? '#fb7185' : 'rgba(255,255,255,0.22)', transition:'all 0.2s' }}>
          <Heart size={17} fill={fav ? 'currentColor' : 'none'}/>
        </button>
      </div>

      {/* Hero */}
      <div className="left-hero">
        <div className="float">
          <img src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`}
            alt={current.weather[0].description}
            style={{ width:68, height:68, filter:'drop-shadow(0 4px 18px rgba(99,179,237,0.5))' }}/>
        </div>
        <div>
          <div style={{ display:'flex', alignItems:'flex-end', lineHeight:1 }}>
            <span style={{ fontSize:54, fontWeight:900, color:'white' }}>{formatTemp(current.temp, unit)}</span>
            <span style={{ fontSize:20, fontWeight:600, color:'rgba(255,255,255,0.35)', marginBottom:6 }}>
              {unit==='celsius'?'C':'F'}
            </span>
          </div>
          <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.55)', textTransform:'capitalize', marginTop:1 }}>
            {current.weather[0].description}
          </p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>
            H:{formatTemp(current.temp_max, unit)}° · L:{formatTemp(current.temp_min, unit)}°
          </p>
        </div>
      </div>

      <div className="left-divider"/>

      {/* Stats grid */}
      <div className="left-stats">
        {stats.map(s => (
          <div key={s.label} className="stat-item">
            <div className="stat-icon" style={{ background: s.color+'1a', border:`1px solid ${s.color}33` }}>
              <span className="emoji">{s.emoji}</span>
            </div>
            <div className="stat-text">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
