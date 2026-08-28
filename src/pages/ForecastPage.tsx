import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { useWeather } from '../hooks/useWeather';
import { formatTemp, formatDay, formatHour, convertTemp } from '../utils/weather';

function NoCity() {
  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, opacity:0.5 }}>
      <span className="emoji" style={{ fontSize:48 }}>🌦</span>
      <p style={{ fontSize:14, fontWeight:600 }}>Search for a city to view forecast</p>
    </div>
  );
}

export default function ForecastPage() {
  const { selectedCity, unit } = useAppStore();
  const { data, isLoading } = useWeather(selectedCity);
  const [view, setView] = useState<'daily'|'hourly'|'radar'>('daily');

  if (!selectedCity) return <NoCity />;
  if (isLoading || !data) {
    return (
      <div className="page-inner">
        <div className="skeleton" style={{ height:40, borderRadius:10, marginBottom:20 }}/>
        <div className="grid-2" style={{ gap:16 }}>
          {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{ height:140, borderRadius:16 }}/>)}
        </div>
      </div>
    );
  }

  // Daily chart data
  const dailyData = data.daily.slice(0, 8).map(d => ({
    day  : formatDay(d.dt),
    high : convertTemp(d.temp.max, unit),
    low  : convertTemp(d.temp.min, unit),
    pop  : Math.round(d.pop * 100),
    uvi  : d.uvi,
    icon : d.weather[0].icon,
  }));

  // Hourly chart data
  const hourlyData = data.hourly.slice(0, 24).map(h => ({
    time: formatHour(h.dt, data.current.timezone_offset),
    temp: convertTemp(h.temp, unit),
    pop : Math.round(h.pop * 100),
    humidity: h.humidity,
    wind: Math.round(h.wind_speed),
  }));

  // Radar: today's weather profile
  const radarData = [
    { subject:'Temp',     value: Math.min(100, Math.max(0, (convertTemp(data.current.temp, unit) + 20) * 1.5)) },
    { subject:'Humidity', value: data.current.humidity },
    { subject:'Wind',     value: Math.min(100, data.current.wind_speed * 2) },
    { subject:'Clouds',   value: data.current.clouds },
    { subject:'Pressure', value: Math.min(100, ((data.current.pressure - 970) / 60) * 100) },
    { subject:'UV',       value: Math.min(100, (data.current.uvi ?? 0) * 8.33) },
  ];

  const TT = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'rgba(10,18,38,0.95)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'8px 12px', fontSize:11 }}>
        <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:4 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color:p.color, fontWeight:600 }}>{p.name}: {p.value}{p.name==='temp'||p.name==='high'||p.name==='low'?'°':'%'}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="page-inner">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 className="page-title">Forecast</h1>
          <p className="page-sub">{data.city.name}, {data.city.country} · Extended weather outlook</p>
        </div>
        <div className="toggle-wrap">
          {(['daily','hourly','radar'] as const).map(v => (
            <button key={v} className={`toggle-opt${view===v?' active':''}`} onClick={()=>setView(v)}
              style={{ textTransform:'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Daily view */}
      {view === 'daily' && (
        <div className="fadein" style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* High / Low area chart */}
          <div className="card card-pad">
            <p className="section-title">8-Day Temperature Range</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{ top:10, right:10, bottom:0, left:-15 }}>
                <defs>
                  <linearGradient id="hiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="loGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'rgba(255,255,255,0.35)' }} tickLine={false} axisLine={false}/>
                <Tooltip content={<TT/>}/>
                <Area type="monotone" dataKey="high" name="high" stroke="#f97316" strokeWidth={2} fill="url(#hiGrad)" dot={{ fill:'#f97316', r:3 }}/>
                <Area type="monotone" dataKey="low"  name="low"  stroke="#38bdf8" strokeWidth={2} fill="url(#loGrad)" dot={{ fill:'#38bdf8', r:3 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Rain probability bars */}
          <div className="card card-pad">
            <p className="section-title">Rain Probability</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={dailyData} barSize={28} margin={{ top:4, right:10, bottom:0, left:-15 }}>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'rgba(255,255,255,0.35)' }} tickLine={false} axisLine={false} domain={[0,100]}/>
                <Tooltip content={<TT/>}/>
                <Bar dataKey="pop" name="pop" radius={[4,4,0,0]}>
                  {dailyData.map((d,i) => <Cell key={i} fill={d.pop>60?'#38bdf8':d.pop>30?'rgba(56,189,248,0.55)':'rgba(56,189,248,0.25)'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* UV index */}
          <div className="card card-pad">
            <p className="section-title">UV Index Forecast</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={dailyData} barSize={28} margin={{ top:4, right:10, bottom:0, left:-15 }}>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'rgba(255,255,255,0.35)' }} tickLine={false} axisLine={false} domain={[0,12]}/>
                <Tooltip content={<TT/>}/>
                <Bar dataKey="uvi" name="uvi" radius={[4,4,0,0]}>
                  {dailyData.map((d,i) => <Cell key={i} fill={d.uvi>8?'#ef4444':d.uvi>5?'#f97316':d.uvi>3?'#facc15':'#4ade80'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Day cards grid */}
          <div className="grid-4">
            {dailyData.map((d,i) => (
              <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                className="metric-card">
                <p style={{ fontSize:12, fontWeight:700, color: i===0?'#38bdf8':'rgba(255,255,255,0.6)' }}>{i===0?'Today':d.day}</p>
                <img src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`} style={{ width:40, height:40 }} alt=""/>
                <p className="metric-value" style={{ fontSize:20 }}>{d.high}°<span style={{ fontSize:14, opacity:0.5 }}>/{d.low}°</span></p>
                <div style={{ display:'flex', gap:4 }}>
                  {d.pop > 0 && <span className="badge badge-blue">{d.pop}% rain</span>}
                  {d.uvi > 5 && <span className="badge badge-amber">UV {d.uvi.toFixed(0)}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hourly view */}
      {view === 'hourly' && (
        <div className="fadein" style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card card-pad">
            <p className="section-title">24-Hour Temperature & Rain</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={hourlyData} margin={{ top:10, right:10, bottom:0, left:-15 }}>
                <defs>
                  <linearGradient id="tGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/><stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="time" tick={{ fontSize:10, fill:'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false} interval={2}/>
                <YAxis tick={{ fontSize:10, fill:'rgba(255,255,255,0.35)' }} tickLine={false} axisLine={false}/>
                <Tooltip content={<TT/>}/>
                <Area type="monotone" dataKey="temp" name="temp" stroke="#38bdf8" strokeWidth={2} fill="url(#tGrad2)" dot={false} activeDot={{ r:4 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card card-pad">
            <p className="section-title">Humidity & Wind Speed (24h)</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={hourlyData} margin={{ top:10, right:10, bottom:0, left:-15 }}>
                <defs>
                  <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/><stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="time" tick={{ fontSize:10, fill:'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false} interval={2}/>
                <YAxis tick={{ fontSize:10, fill:'rgba(255,255,255,0.35)' }} tickLine={false} axisLine={false}/>
                <Tooltip content={<TT/>}/>
                <Area type="monotone" dataKey="humidity" name="humidity" stroke="#a78bfa" strokeWidth={2} fill="url(#humGrad)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Radar view */}
      {view === 'radar' && (
        <div className="fadein" style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="grid-2">
            <div className="card card-pad">
              <p className="section-title">Current Conditions Profile</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)"/>
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fill:'rgba(255,255,255,0.5)' }}/>
                  <Radar name="Today" dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.18} strokeWidth={2}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'Temperature', value: formatTemp(data.current.temp, unit), pct: 60, color:'#f97316' },
                { label:'Humidity',    value: `${data.current.humidity}%`, pct: data.current.humidity, color:'#38bdf8' },
                { label:'Wind Speed',  value: `${Math.round(data.current.wind_speed)} km/h`, pct: Math.min(100, data.current.wind_speed*2), color:'#a78bfa' },
                { label:'Cloud Cover', value: `${data.current.clouds}%`, pct: data.current.clouds, color:'#94a3b8' },
                { label:'UV Index',    value: data.current.uvi?.toFixed(1) ?? 'N/A', pct: Math.min(100,(data.current.uvi??0)*8.33), color:'#fbbf24' },
                { label:'Visibility',  value: `${data.current.visibility.toFixed(0)} km`, pct: Math.min(100,data.current.visibility*5), color:'#34d399' },
              ].map(({ label, value, pct, color }) => (
                <div key={label} className="metric-card" style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>{label}</span>
                    <span style={{ fontSize:14, fontWeight:800, color:'white' }}>{value}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width:`${pct}%`, background:color }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
