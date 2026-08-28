import { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Thermometer, Wind, CloudRain, Eye } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useWeather } from '../hooks/useWeather';
import { formatTemp, formatWind, getWindDirection } from '../utils/weather';

const GlobeFull = lazy(() => import('../components/globe/GlobeMini'));

type Layer    = 'temp' | 'wind' | 'rain' | 'pressure';
type MapStyle = 'satellite' | 'dark' | 'terrain';

const LAYER_INFO: Record<Layer, { label: string; icon: any; color: string; desc: string }> = {
  temp    : { label:'Temperature',   icon:Thermometer, color:'#f97316', desc:'Surface temperature map'  },
  wind    : { label:'Wind Speed',    icon:Wind,        color:'#a78bfa', desc:'Wind speed & direction'   },
  rain    : { label:'Precipitation', icon:CloudRain,   color:'#38bdf8', desc:'Rainfall & precipitation' },
  pressure: { label:'Pressure',      icon:Eye,         color:'#34d399', desc:'Atmospheric pressure'     },
};

// Globe textures per style
const GLOBE_TEXTURES: Record<MapStyle, string> = {
  satellite : 'https://unpkg.com/three-globe/example/img/earth-day.jpg',
  dark      : 'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
  terrain   : 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
};

const WORLD_CITIES = [
  { name:'London',   country:'GB', lat:51.5074,  lon:-0.1278,  tempC:17, cond:'Cloudy',  icon:'04d' },
  { name:'New York', country:'US', lat:40.7128,  lon:-74.006,  tempC:24, cond:'Sunny',   icon:'01d' },
  { name:'Tokyo',    country:'JP', lat:35.6762,  lon:139.6503, tempC:29, cond:'Humid',   icon:'02d' },
  { name:'Dubai',    country:'AE', lat:25.2048,  lon:55.2708,  tempC:41, cond:'Clear',   icon:'01d' },
  { name:'Sydney',   country:'AU', lat:-33.8688, lon:151.2093, tempC:15, cond:'Rainy',   icon:'10d' },
  { name:'Paris',    country:'FR', lat:48.8566,  lon:2.3522,   tempC:19, cond:'Partly',  icon:'03d' },
  { name:'Mumbai',   country:'IN', lat:19.076,   lon:72.8777,  tempC:33, cond:'Hazy',    icon:'50d' },
  { name:'Moscow',   country:'RU', lat:55.7558,  lon:37.6173,  tempC:8,  cond:'Cloudy',  icon:'04d' },
];

// GlobeWithTexture — receives texture URL so it re-renders when mapStyle changes
function GlobeWithTexture({
  lat, lon, texture, onCityClick,
}: { lat: number; lon: number; texture: string; onCityClick: (lat: number, lon: number) => void }) {
  return (
    <Suspense fallback={
      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="pulse-anim" style={{ width:120, height:120, borderRadius:'50%',
          background:'radial-gradient(circle at 35% 35%,#1d4ed8,#0c2461)',
          border:'1px solid rgba(56,189,248,0.3)' }}/>
      </div>
    }>
      <GlobeFull lat={lat} lon={lon} onCityClick={onCityClick} textureUrl={texture}/>
    </Suspense>
  );
}

export default function MapPage() {
  const { selectedCity, setSelectedCity, unit, windUnit } = useAppStore();
  const { data } = useWeather(selectedCity);
  const [activeLayer, setActiveLayer] = useState<Layer>('temp');
  const [mapStyle,    setMapStyle]    = useState<MapStyle>('satellite');

  const handleGlobeClick = (lat: number, lon: number) => {
    const closest = WORLD_CITIES.reduce((best, c) => {
      const d  = Math.abs(c.lat - lat) + Math.abs(c.lon - lon);
      const bd = Math.abs(best.lat - lat) + Math.abs(best.lon - lon);
      return d < bd ? c : best;
    }, WORLD_CITIES[0]);
    setSelectedCity(closest);
  };

  const globeLat = selectedCity?.lat ?? 20;
  const globeLon = selectedCity?.lon ?? 0;

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', gap:10 }}>

      {/* ── Globe panel ── */}
      <div style={{ flex:1, minWidth:0, position:'relative', borderRadius:16, overflow:'hidden',
        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)' }}>

        <GlobeWithTexture
          lat={globeLat} lon={globeLon}
          texture={GLOBE_TEXTURES[mapStyle]}
          onCityClick={handleGlobeClick}
        />

        {/* Layer selector */}
        <div style={{ position:'absolute', top:12, left:12, display:'flex', flexDirection:'column', gap:6, zIndex:10 }}>
          {(Object.entries(LAYER_INFO) as [Layer, typeof LAYER_INFO[Layer]][]).map(([key, info]) => {
            const Icon = info.icon;
            const isActive = activeLayer === key;
            return (
              <button key={key} onClick={() => setActiveLayer(key)}
                style={{
                  display:'flex', alignItems:'center', gap:8, padding:'7px 12px', borderRadius:10,
                  background  : isActive ? `${info.color}28` : 'rgba(10,18,38,0.82)',
                  border      : `1px solid ${isActive ? info.color + '66' : 'rgba(255,255,255,0.10)'}`,
                  backdropFilter:'blur(14px)', color: isActive ? info.color : 'rgba(255,255,255,0.6)',
                  fontFamily:'inherit', fontSize:12, fontWeight:600, cursor:'pointer',
                  transition:'all 0.18s', boxShadow: isActive ? `0 0 14px ${info.color}33` : 'none',
                }}>
                <Icon size={14}/>
                {info.label}
              </button>
            );
          })}
        </div>

        {/* Map style selector */}
        <div style={{ position:'absolute', bottom:12, left:12, zIndex:10 }}>
          <div className="toggle-wrap" style={{ background:'rgba(10,18,38,0.88)', backdropFilter:'blur(14px)' }}>
            {(['satellite','dark','terrain'] as MapStyle[]).map(s => (
              <button key={s} className={`toggle-opt${mapStyle===s?' active':''}`}
                onClick={() => setMapStyle(s)}
                style={{ textTransform:'capitalize', fontSize:11 }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* City quick-pins top-right */}
        <div style={{ position:'absolute', top:12, right:12, display:'flex', flexDirection:'column', gap:4, zIndex:10 }}>
          {WORLD_CITIES.slice(0,5).map(c => {
            const dispTemp = unit === 'fahrenheit' ? Math.round(c.tempC * 9/5 + 32) : c.tempC;
            const isSelected = selectedCity?.name === c.name;
            return (
              <button key={c.name} onClick={() => setSelectedCity(c)}
                style={{
                  display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:9,
                  background:'rgba(10,18,38,0.85)', backdropFilter:'blur(12px)',
                  border:`1px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.10)'}`,
                  color:'white', fontFamily:'inherit', fontSize:11, fontWeight:600, cursor:'pointer',
                  transition:'all 0.15s', boxShadow: isSelected ? '0 0 10px rgba(56,189,248,0.3)' : 'none',
                }}>
                <img src={`https://openweathermap.org/img/wn/${c.icon}.png`} style={{ width:20, height:20 }} alt=""/>
                <span>{c.name}</span>
                <span style={{ color: c.tempC > 30 ? '#f97316' : c.tempC < 10 ? '#38bdf8' : '#4ade80', fontWeight:800 }}>
                  {dispTemp}°
                </span>
              </button>
            );
          })}
        </div>

        {/* Layer legend bottom-right */}
        <div style={{
          position:'absolute', bottom:12, right:12, zIndex:10,
          background:'rgba(10,18,38,0.88)', border:'1px solid rgba(255,255,255,0.10)',
          backdropFilter:'blur(14px)', borderRadius:12, padding:'10px 14px',
        }}>
          <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'rgba(255,255,255,0.35)', marginBottom:6 }}>
            {LAYER_INFO[activeLayer].label}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)' }}>Low</span>
            <div style={{ width:80, height:6, borderRadius:3, background:`linear-gradient(to right,#38bdf8,${LAYER_INFO[activeLayer].color})` }}/>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.45)' }}>High</span>
          </div>
        </div>
      </div>

      {/* ── Right info panel ── */}
      <div style={{ width:230, flexShrink:0, display:'flex', flexDirection:'column', gap:8, overflowY:'auto' }} className="no-scroll">

        {/* Active layer info */}
        <div className="card card-pad">
          <p className="section-title">Active Layer</p>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {(() => { const I = LAYER_INFO[activeLayer].icon; return <I size={16} style={{ color:LAYER_INFO[activeLayer].color }}/>; })()}
            <div>
              <p style={{ fontSize:13, fontWeight:700 }}>{LAYER_INFO[activeLayer].label}</p>
              <p style={{ fontSize:11, opacity:0.45, marginTop:1 }}>{LAYER_INFO[activeLayer].desc}</p>
            </div>
          </div>
        </div>

        {/* Selected city live data */}
        {data && selectedCity && (
          <motion.div key={selectedCity.name} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} className="card card-pad">
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
              <MapPin size={12} style={{ color:'#38bdf8' }}/>
              <p style={{ fontSize:13, fontWeight:700 }}>{data.city.name}</p>
              <span className="badge badge-blue" style={{ fontSize:9 }}>{data.city.country}</span>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <img src={`https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`} style={{ width:44, height:44 }} alt=""/>
              <div>
                <p style={{ fontSize:30, fontWeight:900, lineHeight:1 }}>
                  {formatTemp(data.current.temp, unit)}<span style={{ fontSize:14, opacity:0.4 }}>{unit==='celsius'?'C':'F'}</span>
                </p>
                <p style={{ fontSize:11, opacity:0.5, textTransform:'capitalize' }}>
                  {data.current.weather[0].description}
                </p>
              </div>
            </div>

            {[
              { l:'Wind',     v:`${formatWind(data.current.wind_speed, windUnit)} ${getWindDirection(data.current.wind_deg)}` },
              { l:'Humidity', v:`${data.current.humidity}%`                        },
              { l:'Pressure', v:`${Math.round(data.current.pressure)} hPa`         },
              { l:'Clouds',   v:`${data.current.clouds}%`                          },
            ].map(({ l, v }) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize:11, opacity:0.45, fontWeight:600 }}>{l}</span>
                <span style={{ fontSize:11, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* World temps list */}
        <div className="card" style={{ overflow:'hidden', flex:1 }}>
          <div style={{ padding:'10px 14px 6px' }}>
            <p className="section-title">World Temperatures</p>
          </div>
          {WORLD_CITIES.map(c => {
            const dispTemp = unit === 'fahrenheit' ? Math.round(c.tempC * 9/5 + 32) : c.tempC;
            const isSelected = selectedCity?.name === c.name;
            return (
              <button key={c.name} onClick={() => setSelectedCity(c)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
                  background: isSelected ? 'rgba(14,165,233,0.10)' : 'none',
                  borderBottom:'1px solid rgba(255,255,255,0.04)',
                  border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.12s',
                  borderLeft: isSelected ? '2px solid #38bdf8' : '2px solid transparent',
                }}>
                <img src={`https://openweathermap.org/img/wn/${c.icon}.png`} style={{ width:26, height:26 }} alt=""/>
                <div style={{ flex:1, textAlign:'left' }}>
                  <p style={{ fontSize:12, fontWeight:600 }}>{c.name}</p>
                  <p style={{ fontSize:10, opacity:0.4 }}>{c.cond}</p>
                </div>
                <p style={{ fontSize:14, fontWeight:800,
                  color: c.tempC > 30 ? '#f97316' : c.tempC < 10 ? '#38bdf8' : '#4ade80' }}>
                  {dispTemp}°
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
