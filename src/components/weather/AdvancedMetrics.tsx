import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatTime, getAQILabel } from '../../utils/weather';
import { useAppStore } from '../../store/useAppStore';
import type { WeatherData } from '../../types/weather';

interface Props { data: WeatherData; theme: 'dark' | 'light' }

function AQIGauge({ aqi, isDark }: { aqi: number; isDark: boolean }) {
  const { label, color, numericEst } = getAQILabel(aqi);
  const pct = Math.min(numericEst / 200, 1);
  const R = 34, cx = 50, cy = 52;
  const START = 210, SWEEP = 240;
  const toRad = (d: number) => d * Math.PI / 180;
  const pt = (f: number) => {
    const a = toRad(START + SWEEP * f);
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  };
  const s = pt(0), e = pt(1), f = pt(pct);
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, width:100 }}>
      <svg width={100} height={72} viewBox="0 0 100 72">
        <path d={`M ${s.x} ${s.y} A ${R} ${R} 0 1 1 ${e.x} ${e.y}`} fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} strokeWidth={7} strokeLinecap="round"/>
        {pct > 0.01 && (
          <path d={`M ${s.x} ${s.y} A ${R} ${R} 0 ${SWEEP*pct>180?1:0} 1 ${f.x} ${f.y}`}
            fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"/>
        )}
        <text x={cx} y={cy-4} textAnchor="middle" fontSize={14} fontWeight={800} fill={color}>{aqi}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontSize={8}
          fill={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}>{label}</text>
      </svg>
      <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'rgba(255,255,255,0.3)', marginTop:2 }}>AQI</p>
    </div>
  );
}

function AQIPlaceholder({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, width:100 }}>
      <svg width={100} height={72} viewBox="0 0 100 72">
        <path d="M 16 52 A 34 34 0 1 1 84 52" fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
          strokeWidth={7} strokeLinecap="round" strokeDasharray="5 4"/>
        <text x={50} y={48} textAnchor="middle" fontSize={10}
          fill={isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)'}>N/A</text>
      </svg>
      <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginTop:2 }}>AQI</p>
    </div>
  );
}

function RainChart({ hourly, isDark }: { hourly: { pop: number; time: string }[]; isDark: boolean }) {
  const data = hourly.map(h => ({ time: h.time, pop: Math.round(h.pop * 100) }));
  return (
    <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
      <p style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.65)', marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>
        <span className="emoji">💧</span> Rain Probability
      </p>
      <div style={{ flex:1, minHeight:0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={13} margin={{ top:2, right:4, bottom:0, left:-12 }}>
            <XAxis dataKey="time"
              tick={{ fontSize:8, fill: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)' }}
              tickLine={false} axisLine={false}/>
            <Tooltip cursor={false}
              contentStyle={{ background:'#0d1b2e', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, fontSize:11, color:'white' }}
              formatter={(v: any) => [`${v}%`, 'Rain']}/>
            <Bar dataKey="pop" radius={[4,4,0,0]}>
              {data.map((d, i) => (
                <Cell key={i}
                  fill={d.pop > 60 ? '#38bdf8' : d.pop > 30 ? 'rgba(56,189,248,0.55)' : 'rgba(56,189,248,0.28)'}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SunArc({ sunrise, sunset, dt, offset, isDark }: {
  sunrise: number; sunset: number; dt: number; offset: number; isDark: boolean;
}) {
  const now  = dt + offset;
  const rise = sunrise + offset;
  const set  = sunset  + offset;
  const pct  = Math.max(0, Math.min(1, (now - rise) / (set - rise)));
  const isDay = now >= rise && now <= set;
  const W = 164, H = 56;
  const cx = W / 2, cy = H;
  const rx = W/2-10, ry = H-8;
  const arc = (p: number) => {
    const a = Math.PI * (1-p);
    return { x: cx + rx*Math.cos(a), y: cy - ry*Math.sin(a) };
  };
  const sun = arc(pct);
  return (
    <div style={{ display:'flex', flexDirection:'column', flexShrink:0, width:W }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, padding:'0 2px' }}>
        {[{ label:'Sunrise', ts: sunrise }, { label:'Sunset', ts: sunset }].map(({ label, ts }) => (
          <div key={label} style={{ textAlign:'center' }}>
            <p style={{ fontSize:8, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</p>
            <p style={{ fontSize:12, fontWeight:700, color:'white' }}>{formatTime(ts, offset)}</p>
          </div>
        ))}
      </div>
      <svg width={W} height={H+16} viewBox={`0 0 ${W} ${H+16}`}>
        <line x1={10} y1={cy} x2={W-10} y2={cy}
          stroke={isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.09)'} strokeWidth={1} strokeDasharray="3 3"/>
        <path d={`M 10 ${cy} A ${rx} ${ry} 0 0 1 ${W-10} ${cy}`}
          fill="none" stroke={isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'} strokeWidth={1.5}/>
        {isDay && pct > 0.01 && (
          <path d={`M 10 ${cy} A ${rx} ${ry} 0 0 1 ${sun.x} ${sun.y}`}
            fill="none" stroke="rgba(251,191,36,0.60)" strokeWidth={2.5} strokeLinecap="round"/>
        )}
        {isDay ? (
          <>
            <circle cx={sun.x} cy={sun.y} r={12} fill="rgba(251,191,36,0.15)"/>
            <circle cx={sun.x} cy={sun.y} r={7} fill="#fbbf24"/>
            <circle cx={sun.x} cy={sun.y} r={4} fill="#fde68a"/>
          </>
        ) : (
          <text x={cx} y={cy-14} textAnchor="middle" fontSize={18} className="emoji">🌙</text>
        )}
        <circle cx={10}    cy={cy} r={3.5} fill="rgba(251,191,36,0.40)"/>
        <circle cx={W-10}  cy={cy} r={3.5} fill="rgba(251,191,36,0.22)"/>
        <text x={10}   y={cy+13} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.22)">↑</text>
        <text x={W-10} y={cy+13} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.22)">↓</text>
      </svg>
    </div>
  );
}

export default function AdvancedMetrics({ data, theme }: Props) {
  const isDark = theme === 'dark';
  const { windUnit: _wu, pressureUnit: _pu } = useAppStore(); // ensure re-render on unit change
  const { current, hourly, airQuality } = data;
  const offset = current.timezone_offset;
  const hourlySlice = hourly.slice(0, 8).map(h => ({
    pop: h.pop,
    time: formatTime(h.dt, offset).slice(0, 5),
  }));
  return (
    <div className="card" style={{ height:'100%', padding:'10px 14px', display:'flex', flexDirection:'column' }}>
      <h3 style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:8, flexShrink:0 }}>Advanced metrics</h3>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start', flex:1, minHeight:0 }}>
        {airQuality
          ? <AQIGauge aqi={airQuality.aqi} isDark={isDark}/>
          : <AQIPlaceholder isDark={isDark}/>
        }
        <RainChart hourly={hourlySlice} isDark={isDark}/>
        <SunArc sunrise={current.sunrise} sunset={current.sunset} dt={current.dt} offset={offset} isDark={isDark}/>
      </div>
    </div>
  );
}
