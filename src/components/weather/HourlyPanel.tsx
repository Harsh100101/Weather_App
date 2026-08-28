import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatHour, convertTemp } from '../../utils/weather';
import type { HourlyForecast, TemperatureUnit } from '../../types/weather';

const CELL = 54, CH = 52, CPAD = 16;

export default function HourlyPanel({ hourly, unit, timezoneOffset }: { hourly: HourlyForecast[]; unit: TemperatureUnit; timezoneOffset: number; theme: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const hours = hourly.slice(0, 24);
  const data  = hours.map((h, i) => ({
    time: formatHour(h.dt, timezoneOffset),
    temp: convertTemp(h.temp, unit),
    pop:  Math.round(h.pop * 100),
    icon: h.weather[0].icon,
    isCur: i === 0,
  }));

  const temps = data.map(d => d.temp);
  const minT  = Math.min(...temps), maxT = Math.max(...temps);
  const range = maxT - minT || 1;
  const W     = CELL * data.length;

  const pts = data.map((d, i) => ({
    x: i * CELL + CELL / 2,
    y: CPAD + CH - 8 - ((d.temp - minT) / range) * (CH - 16),
  }));

  let pathD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i-1].x + pts[i].x) / 2;
    pathD += ` C ${cpx} ${pts[i-1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const areaD = pathD + ` L ${pts[pts.length-1].x} ${CPAD+CH} L ${pts[0].x} ${CPAD+CH} Z`;

  const scroll = (dir: 'l'|'r') => ref.current?.scrollBy({ left: dir==='l'?-220:220, behavior:'smooth' });

  return (
    <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.35,delay:0.1 }}
      className="card" style={{ flexShrink:0, overflow:'hidden' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 0' }}>
        <h3 style={{ fontSize:13, fontWeight:700, color:'white' }}>Hourly forecast</h3>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <button onClick={()=>scroll('l')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', padding:4, display:'flex', borderRadius:6 }}><ChevronLeft size={14}/></button>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Next 24 hours</span>
          <button onClick={()=>scroll('r')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', padding:4, display:'flex', borderRadius:6 }}><ChevronRight size={14}/></button>
        </div>
      </div>

      <div ref={ref} className="scroll-x no-scroll">
        <div style={{ width: W }}>
          {/* SVG curve */}
          <svg width={W} height={CPAD+CH+4} viewBox={`0 0 ${W} ${CPAD+CH+4}`} style={{ display:'block' }}>
            <defs>
              <linearGradient id="hfg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22"/>
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#hfg)"/>
            <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
            {pts.map((p, i) => (
              <g key={i}>
                {i%2===0 && (
                  <text x={p.x} y={p.y-6} textAnchor="middle" fontSize={9} fontWeight={600} fill="rgba(255,255,255,0.65)">{data[i].temp}°</text>
                )}
                {data[i].isCur
                  ? <><circle cx={p.x} cy={p.y} r={7} fill="rgba(56,189,248,0.18)"/><circle cx={p.x} cy={p.y} r={4.5} fill="#38bdf8" stroke="white" strokeWidth={1.5}/></>
                  : <circle cx={p.x} cy={p.y} r={2.5} fill="#38bdf8" opacity={0.6}/>
                }
              </g>
            ))}
          </svg>

          {/* Cells */}
          <div style={{ display:'flex', paddingBottom:10 }}>
            {data.map((h, i) => (
              <div key={i} className={`hourly-cell${h.isCur?' now':''}`} style={{ width:CELL }}>
                <span style={{ fontSize:10, fontWeight:600, color: h.isCur?'#38bdf8':'rgba(255,255,255,0.4)', position:'relative' }}>{i===0?'Now':h.time}</span>
                <img src={`https://openweathermap.org/img/wn/${h.icon}.png`} alt="" style={{ width:32, height:32, position:'relative' }}/>
                <span style={{ fontSize:12, fontWeight:700, color:'white', position:'relative' }}>{h.temp}°</span>
                <span style={{ fontSize:10, fontWeight:700, color:'#38bdf8', visibility:h.pop>0?'visible':'hidden', position:'relative' }}>{h.pop}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
