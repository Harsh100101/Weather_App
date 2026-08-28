import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, Wind as WindIcon, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatHour, formatTemp, formatDay, formatDateShort, getWindDirection, convertTemp, getMoonPhaseIcon, formatWind } from '../../utils/weather';
import type { WeatherData, TemperatureUnit } from '../../types/weather';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  data: WeatherData; unit: TemperatureUnit; theme: string;
  onClose: () => void; tab: 'chart'|'wind'|'week';
}

function TempTab({ data, unit, isDark }: { data: WeatherData; unit: TemperatureUnit; isDark: boolean }) {
  const chartData = data.hourly.slice(0, 24).map(h => ({
    time  : formatHour(h.dt, data.current.timezone_offset),
    temp  : convertTemp(h.temp, unit),
    feels : convertTemp(h.feels_like, unit),
    pop   : Math.round(h.pop * 100),
  }));
  const TT = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: isDark?'#1e293b':'white', border:`1px solid rgba(${isDark?'255,255,255':'0,0,0'},0.15)`, borderRadius:10, padding:'8px 12px', fontSize:11 }}>
        <p style={{ opacity:0.6, marginBottom:4 }}>{label}</p>
        <p style={{ color:'#38bdf8', fontWeight:700 }}>Temp: {payload[0]?.value}°</p>
        <p style={{ color:'#818cf8' }}>Feels: {payload[1]?.value}°</p>
        {payload[2]?.value > 0 && <p style={{ color:'#60a5fa' }}>Rain: {payload[2]?.value}%</p>}
      </div>
    );
  };
  return (
    <div>
      <p style={{ fontSize:11, opacity:0.4, marginBottom:12 }}>Next 24 hours temperature trend</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top:10, right:8, bottom:0, left:-15 }}>
          <defs>
            <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/></linearGradient>
            <linearGradient id="fg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/><stop offset="95%" stopColor="#818cf8" stopOpacity={0}/></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'} vertical={false}/>
          <XAxis dataKey="time" tick={{ fontSize:9, fill:isDark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.35)' }} tickLine={false} axisLine={false} interval={2}/>
          <YAxis tick={{ fontSize:9, fill:isDark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.35)' }} tickLine={false} axisLine={false}/>
          <Tooltip content={<TT/>}/>
          <Area type="monotone" dataKey="temp"  stroke="#38bdf8" strokeWidth={2} fill="url(#tg2)" dot={false} activeDot={{ r:4 }}/>
          <Area type="monotone" dataKey="feels" stroke="#818cf8" strokeWidth={1.5} fill="url(#fg2)" dot={false} strokeDasharray="4 2"/>
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display:'flex', gap:16, justifyContent:'center', marginTop:8 }}>
        {[{ color:'#38bdf8',label:'Temperature' },{ color:'#818cf8',label:'Feels like' }].map(({color,label}) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:16, height:2, borderRadius:1, background:color }}/>
            <span style={{ fontSize:10, opacity:0.5 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WindTab({ data, isDark }: { data: WeatherData; isDark: boolean }) {
  const { windUnit } = useAppStore();
  const { current } = data;
  const deg = current.wind_deg;
  const size = 160, cx = 80, cy = 80, r = 62;
  const needleRad = (deg - 90) * Math.PI / 180;
  const nx = cx + (r-14)*Math.cos(needleRad), ny = cy + (r-14)*Math.sin(needleRad);
  const cardinals = [{ l:'N',d:-90 },{ l:'E',d:0 },{ l:'S',d:90 },{ l:'W',d:180 }];

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'} strokeWidth={1.5}/>
        {Array.from({ length:36 }).map((_,i) => {
          const a = (i/36)*Math.PI*2 - Math.PI/2;
          const isMaj = i%9===0;
          const inner = isMaj ? r-12 : r-7;
          return <line key={i} x1={cx+inner*Math.cos(a)} y1={cy+inner*Math.sin(a)} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)}
            stroke={isDark?`rgba(255,255,255,${isMaj?0.22:0.08})`:`rgba(0,0,0,${isMaj?0.18:0.06})`} strokeWidth={isMaj?1.5:0.8}/>;
        })}
        {cardinals.map(({ l, d }) => {
          const rad = d * Math.PI/180;
          return <text key={l} x={cx+(r-22)*Math.cos(rad)} y={cy+(r-22)*Math.sin(rad)+4}
            textAnchor="middle" fontSize={l==='N'?11:9} fontWeight={700}
            fill={l==='N'?'#38bdf8':isDark?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.4)'}>{l}</text>;
        })}
        <circle cx={cx} cy={cy} r={r-24} fill={isDark?'rgba(56,189,248,0.05)':'rgba(56,189,248,0.07)'} stroke="rgba(56,189,248,0.18)" strokeWidth={1}/>
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#38bdf8" strokeWidth={2.5} strokeLinecap="round"/>
        <polygon points={`${nx},${ny} ${cx+(r-26)*Math.cos(needleRad-0.3)},${cy+(r-26)*Math.sin(needleRad-0.3)} ${cx+(r-26)*Math.cos(needleRad+0.3)},${cy+(r-26)*Math.sin(needleRad+0.3)}`} fill="#38bdf8"/>
        <line x1={cx} y1={cy} x2={cx-(r-28)*Math.cos(needleRad)} y2={cy-(r-28)*Math.sin(needleRad)}
          stroke={isDark?'rgba(255,255,255,0.18)':'rgba(0,0,0,0.12)'} strokeWidth={1.5} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={5} fill="#38bdf8"/>
        <circle cx={cx} cy={cy} r={3} fill={isDark?'#0f172a':'white'}/>
        <text x={cx} y={cy+22} textAnchor="middle" fontSize={12} fontWeight={800} fill={isDark?'white':'#111'}>
          {formatWind(current.wind_speed, windUnit)}
        </text>
        <text x={cx} y={cy+33} textAnchor="middle" fontSize={8} fill={isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)'}>
          {windUnit === 'mph' ? 'mph' : windUnit === 'ms' ? 'm/s' : 'km/h'}
        </text>
      </svg>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, width:'100%' }}>
        {[
          { label:'Direction',  val: getWindDirection(deg) },
          { label:`Speed`,      val: `${formatWind(current.wind_speed, windUnit)} ${windUnit==='mph'?'mph':windUnit==='ms'?'m/s':'km/h'}` },
          { label:'Gusts',      val: current.wind_gust ? `${formatWind(current.wind_gust, windUnit)} ${windUnit==='mph'?'mph':windUnit==='ms'?'m/s':'km/h'}` : '—' },
        ].map(({ label, val }) => (
          <div key={label} style={{ borderRadius:12, padding:'10px 8px', background:'rgba(255,255,255,0.05)', textAlign:'center' }}>
            <p style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.05em', opacity:0.35, marginBottom:4, fontWeight:700 }}>{label}</p>
            <p style={{ fontSize:12, fontWeight:700 }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekTab({ data, unit }: { data: WeatherData; unit: TemperatureUnit; isDark?: boolean }) {
  const days = data.daily.slice(0, 8);
  const all  = days.flatMap(d => [d.temp.min, d.temp.max]);
  const gMin = Math.min(...all), gMax = Math.max(...all), range = gMax - gMin || 1;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
      {days.map((day, i) => {
        const bL = ((day.temp.min - gMin) / range) * 100;
        const bW = ((day.temp.max - day.temp.min) / range) * 100;
        return (
          <div key={day.dt} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:12, background: i===0?'rgba(14,165,233,0.10)':'transparent', transition:'background 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}
            onMouseLeave={e=>(e.currentTarget.style.background= i===0?'rgba(14,165,233,0.10)':'transparent')}>
            <div style={{ width:40, flexShrink:0 }}>
              <p style={{ fontSize:11, fontWeight:700, opacity:0.8 }}>{i===0?'Today':formatDay(day.dt)}</p>
              <p style={{ fontSize:9, opacity:0.3 }}>{formatDateShort(day.dt)}</p>
            </div>
            <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} style={{ width:32, height:32, flexShrink:0 }} alt=""/>
            <span style={{ width:20, textAlign:'center', fontSize:13 }}>{getMoonPhaseIcon(day.moon_phase)}</span>
            <span style={{ width:30, fontSize:10, fontWeight:700, color:'#38bdf8', flexShrink:0, textAlign:'right' }}>
              {day.pop > 0.05 ? `${Math.round(day.pop*100)}%` : ''}
            </span>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:10, opacity:0.45, width:28, textAlign:'right' }}>{formatTemp(day.temp.min, unit)}</span>
              <div style={{ flex:1, height:6, borderRadius:3, background:'rgba(255,255,255,0.08)', position:'relative' }}>
                <div style={{ position:'absolute', height:'100%', borderRadius:3, left:`${bL}%`, width:`${bW}%`, background:'linear-gradient(to right,#60a5fa,#f97316)' }}/>
              </div>
              <span style={{ fontSize:10, fontWeight:700, width:28 }}>{formatTemp(day.temp.max, unit)}</span>
            </div>
            {day.uvi > 0 && <span style={{ fontSize:10, opacity:0.4, flexShrink:0, width:32, textAlign:'right' }}>UV{day.uvi.toFixed(0)}</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function DetailDrawer({ data, unit, theme, onClose, tab }: Props) {
  const isDark  = theme === 'dark';
  const [active, setActive] = useState<'chart'|'wind'|'week'>(tab);
  const tabs = [
    { key:'chart' as const, icon:BarChart2, label:'Temp'  },
    { key:'wind'  as const, icon:WindIcon,  label:'Wind'  },
    { key:'week'  as const, icon:Calendar,  label:'8-day' },
  ];
  return (
    <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:24 }}
      transition={{ duration:0.22 }}
      style={{ width:300, flexShrink:0, height:'100%', display:'flex', flexDirection:'column', borderRadius:16,
        overflow:'hidden', background:'rgba(255,255,255,0.055)', border:'1px solid rgba(255,255,255,0.09)', backdropFilter:'blur(20px)' }}>
      {/* Tabs + close */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:3 }}>
          {tabs.map(({ key, icon:Icon, label }) => (
            <button key={key} onClick={() => setActive(key)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:10,
                fontSize:11, fontWeight:600, border:'none', cursor:'pointer', fontFamily:'inherit',
                background: active===key ? 'rgba(255,255,255,0.14)' : 'none',
                color: active===key ? 'white' : 'rgba(255,255,255,0.4)', transition:'all 0.15s' }}>
              <Icon size={12}/>{label}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', padding:6, display:'flex', borderRadius:8 }}>
          <X size={15}/>
        </button>
      </div>
      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px' }} className="no-scroll">
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.16 }}>
            {active==='chart' && <TempTab data={data} unit={unit} isDark={isDark}/>}
            {active==='wind'  && <WindTab data={data} isDark={isDark}/>}
            {active==='week'  && <WeekTab data={data} unit={unit} isDark={isDark}/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
