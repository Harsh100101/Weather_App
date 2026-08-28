import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from 'recharts';
import { useWeather } from '../hooks/useWeather';
import { useAppStore } from '../store/useAppStore';
import { searchCities } from '../services/weatherApi';
import { formatTemp, convertTemp } from '../utils/weather';
import type { City } from '../types/weather';
import type { WeatherData } from '../types/weather';

const PRESETS: City[] = [
  { name:'London',   country:'GB', lat:51.5074,  lon:-0.1278   },
  { name:'New York', country:'US', lat:40.7128,  lon:-74.006   },
  { name:'Tokyo',    country:'JP', lat:35.6762,  lon:139.6503  },
  { name:'Dubai',    country:'AE', lat:25.2048,  lon:55.2708   },
  { name:'Sydney',   country:'AU', lat:-33.8688, lon:151.2093  },
  { name:'Paris',    country:'FR', lat:48.8566,  lon:2.3522    },
];

const COLORS = ['#38bdf8', '#f97316', '#4ade80', '#a78bfa'];

// ── Single city card — hooks called at top level, never inside a loop ──
function CityCard({ city, color, onRemove, onData }: {
  city: City; color: string;
  onRemove: () => void;
  onData: (data: WeatherData | null) => void;
}) {
  const { unit } = useAppStore();
  const { data, isLoading } = useWeather(city);

  // Bubble data up so CompareCharts can use it without calling hooks
  useEffect(() => { onData(data ?? null); }, [data]);

  if (isLoading) {
    return (
      <div className="metric-card skeleton" style={{ minHeight:220 }}/>
    );
  }
  if (!data) return null;

  const { current } = data;
  return (
    <motion.div
      initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
      className="metric-card" style={{ position:'relative' }}
    >
      {/* Color indicator + remove */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }}/>
          <p style={{ fontSize:14, fontWeight:800, color:'white' }}>{city.name}</p>
          <span className="badge badge-blue" style={{ borderColor:color+'88', color }}>{city.country}</span>
        </div>
        <button onClick={onRemove}
          style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', padding:4, display:'flex' }}>
          <X size={14}/>
        </button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <img src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`} alt="" style={{ width:48, height:48 }}/>
        <div>
          <p style={{ fontSize:32, fontWeight:900, color:'white', lineHeight:1 }}>
            {formatTemp(current.temp, unit)}<span style={{ fontSize:16, opacity:0.4 }}>{unit==='celsius'?'C':'F'}</span>
          </p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', textTransform:'capitalize' }}>
            {current.weather[0].description}
          </p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {[
          { l:'Humidity',   v:`${current.humidity}%`                          },
          { l:'Wind',       v:`${Math.round(current.wind_speed)} km/h`         },
          { l:'Feels Like', v:formatTemp(current.feels_like,unit)+(unit==='celsius'?'C':'F') },
          { l:'Pressure',   v:`${Math.round(current.pressure)} hPa`            },
        ].map(({ l, v }) => (
          <div key={l} style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'6px 8px' }}>
            <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>{l}</p>
            <p style={{ fontSize:12, fontWeight:700, color:'white' }}>{v}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Chart section — receives already-fetched data, NO hooks ──
function CompareCharts({ cities, weatherMap, unit }: {
  cities: City[];
  weatherMap: Record<string, WeatherData>;
  unit: string;
}) {
  const ready = cities.filter(c => weatherMap[`${c.lat}-${c.lon}`]);
  if (ready.length < 2) {
    return (
      <div className="card card-pad" style={{ textAlign:'center', padding:32, opacity:0.4 }}>
        <p style={{ fontSize:13 }}>Waiting for weather data…</p>
      </div>
    );
  }

  const barData = ready.map((city, i) => {
    const d = weatherMap[`${city.lat}-${city.lon}`].current;
    return {
      city  : city.name,
      temp  : convertTemp(d.temp, unit as any),
      humid : d.humidity,
      wind  : Math.round(d.wind_speed),
      color : COLORS[i % COLORS.length],
    };
  });

  const radarMetrics = ['Temperature', 'Humidity', 'Wind', 'UV Index', 'Clouds'];
  const radarData = radarMetrics.map(metric => {
    const row: any = { metric };
    ready.forEach((city) => {
      const d = weatherMap[`${city.lat}-${city.lon}`].current;
      const vals: Record<string, number> = {
        'Temperature': Math.min(100, Math.max(0, (convertTemp(d.temp, unit as any) + 20) * 1.2)),
        'Humidity'   : d.humidity,
        'Wind'       : Math.min(100, d.wind_speed * 3),
        'UV Index'   : Math.min(100, (d.uvi ?? 0) * 8.33),
        'Clouds'     : d.clouds,
      };
      row[city.name] = Math.round(vals[metric]);
    });
    return row;
  });

  const TT = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'rgba(10,18,38,0.96)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'8px 12px', fontSize:11 }}>
        <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:4 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color:p.color ?? p.fill, fontWeight:600 }}>
            {p.name}: {p.value}{p.dataKey==='temp'?'°':p.dataKey==='humid'?'%':' km/h'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Temperature bar chart */}
      <div className="card card-pad">
        <p className="section-title">Temperature Comparison</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barData} margin={{ top:4, right:10, bottom:0, left:-15 }} barGap={6} barSize={32}>
            <XAxis dataKey="city" tick={{ fontSize:12, fill:'rgba(255,255,255,0.5)' }} tickLine={false} axisLine={false}/>
            <YAxis tick={{ fontSize:10, fill:'rgba(255,255,255,0.35)' }} tickLine={false} axisLine={false}/>
            <Tooltip content={<TT/>}/>
            <Bar dataKey="temp" radius={[6,6,0,0]}>
              {barData.map((d, idx) => <Cell key={idx} fill={d.color}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Humidity + Wind */}
      <div className="grid-2">
        <div className="card card-pad">
          <p className="section-title">Humidity %</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={barData} barSize={28} margin={{ top:4, right:8, bottom:0, left:-15 }}>
              <XAxis dataKey="city" tick={{ fontSize:11, fill:'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false}/>
              <YAxis tick={{ fontSize:9, fill:'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} domain={[0,100]}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="humid" radius={[4,4,0,0]}>
                {barData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card card-pad">
          <p className="section-title">Wind Speed (km/h)</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={barData} barSize={28} margin={{ top:4, right:8, bottom:0, left:-15 }}>
              <XAxis dataKey="city" tick={{ fontSize:11, fill:'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false}/>
              <YAxis tick={{ fontSize:9, fill:'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="wind" radius={[4,4,0,0]}>
                {barData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar */}
      <div className="card card-pad">
        <p className="section-title">Multi-metric Radar Comparison</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.10)"/>
            <PolarAngleAxis dataKey="metric" tick={{ fontSize:11, fill:'rgba(255,255,255,0.5)' }}/>
            {ready.map((city, i) => (
              <Radar key={city.name} name={city.name} dataKey={city.name}
                stroke={COLORS[i%COLORS.length]} fill={COLORS[i%COLORS.length]}
                fillOpacity={0.12} strokeWidth={2}/>
            ))}
            <Legend wrapperStyle={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Main page ──
export default function ComparePage() {
  const { unit } = useAppStore();
  const [cities, setCities]         = useState<City[]>([PRESETS[0], PRESETS[1]]);
  const [search, setSearch]         = useState('');
  const [searchResults, setResults] = useState<City[]>([]);
  // Store fetched weather data keyed by "lat-lon"
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});

  const handleData = (city: City) => (data: WeatherData | null) => {
    const key = `${city.lat}-${city.lon}`;
    setWeatherMap(prev => {
      if (!data) { const n = {...prev}; delete n[key]; return n; }
      if (prev[key] === data) return prev; // avoid re-render loop
      return { ...prev, [key]: data };
    });
  };

  const doSearch = async (q: string) => {
    setSearch(q);
    if (!q.trim()) { setResults([]); return; }
    try { setResults(await searchCities(q)); } catch { setResults([]); }
  };

  const addCity = (city: City) => {
    if (cities.length >= 4) return;
    if (cities.find(c => c.lat === city.lat && c.lon === city.lon)) return;
    setCities(prev => [...prev, city]);
    setSearch(''); setResults([]);
  };

  const removeCity = (index: number) => {
    const removed = cities[index];
    const key = `${removed.lat}-${removed.lon}`;
    setCities(prev => prev.filter((_, i) => i !== index));
    setWeatherMap(prev => { const n = {...prev}; delete n[key]; return n; });
  };

  const colCount = Math.min(Math.max(cities.length, 2), 4) as 2|3|4;

  return (
    <div className="page-inner">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 className="page-title">Compare Cities</h1>
          <p className="page-sub">Side-by-side weather comparison · up to 4 cities</p>
        </div>
        <span className="badge badge-blue" style={{ fontSize:11, padding:'4px 10px' }}>
          {cities.length}/4 cities
        </span>
      </div>

      {/* Add city search */}
      {cities.length < 4 && (
        <div style={{ position:'relative', maxWidth:360, marginBottom:14 }}>
          <div style={{ position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)', pointerEvents:'none' }}/>
            <input className="inp" value={search} onChange={e=>doSearch(e.target.value)}
              placeholder="Search city to add…"
              style={{ paddingLeft:34 }}
            />
          </div>
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, borderRadius:12, overflow:'hidden', background:'rgba(10,18,38,0.97)', border:'1px solid rgba(255,255,255,0.11)', zIndex:50, boxShadow:'0 12px 40px rgba(0,0,0,0.5)' }}>
                {searchResults.slice(0,5).map((c,i) => (
                  <button key={i} onClick={() => addCity(c)}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer', color:'white', fontFamily:'inherit', fontSize:13, textAlign:'left' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.08)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                    <Plus size={13} style={{ color:'#38bdf8', flexShrink:0 }}/>
                    <div>
                      <p style={{ fontWeight:600 }}>{c.name}{c.state?`, ${c.state}`:''}</p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{c.country}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Quick-add presets */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
        {PRESETS.filter(p => !cities.find(c=>c.lat===p.lat)).slice(0,6).map(p => (
          <button key={p.name} className="btn-ghost" onClick={()=>addCity(p)}
            style={{ fontSize:11, padding:'5px 12px', display:'flex', alignItems:'center', gap:4 }}>
            <Plus size={11}/> {p.name}
          </button>
        ))}
      </div>

      {/* City cards — each card fetches its own data via hooks at TOP LEVEL */}
      <div className={`grid-${colCount}`} style={{ marginBottom:24 }}>
        {cities.map((city, i) => (
          <CityCard
            key={`${city.lat}-${city.lon}`}
            city={city}
            color={COLORS[i % COLORS.length]}
            onRemove={() => removeCity(i)}
            onData={handleData(city)}
          />
        ))}
      </div>

      {/* Charts — receive pre-fetched data, no hooks inside */}
      {cities.length >= 2 && (
        <CompareCharts cities={cities} weatherMap={weatherMap} unit={unit}/>
      )}
    </div>
  );
}
