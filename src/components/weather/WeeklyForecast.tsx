import { motion } from 'framer-motion';
import { formatTemp, formatDay, formatDateShort } from '../../utils/weather';
import type { DailyForecast, TemperatureUnit } from '../../types/weather';

export default function WeeklyForecast({ daily, unit }: { daily: DailyForecast[]; unit: TemperatureUnit; theme: string }) {
  const days = daily.slice(0, 7);
  return (
    <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.35,delay:0.05 }}
      className="card weekly-strip" style={{ flexShrink:0 }}>
      {days.map((d, i) => {
        const pop = Math.round(d.pop * 100);
        return (
          <div key={d.dt} className={`weekly-day${i===0?' today':''}`}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', color: i===0 ? '#38bdf8' : 'rgba(255,255,255,0.45)' }}>
              {i===0 ? 'TODAY' : formatDay(d.dt)}
            </span>
            <img src={`https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`} alt="" style={{ width:36, height:36 }} />
            <p style={{ fontSize:11, fontWeight:700, color:'white', textAlign:'center' }}>
              {formatTemp(d.temp.max,unit)} / {formatTemp(d.temp.min,unit)}
            </p>
            <p style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>{formatDateShort(d.dt)}</p>
            <p style={{ fontSize:10, fontWeight:700, color:'#38bdf8', visibility: pop>0?'visible':'hidden', minHeight:14 }}>{pop}%</p>
          </div>
        );
      })}
    </motion.div>
  );
}
