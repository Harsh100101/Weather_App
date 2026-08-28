import { useState } from 'react';
import { Trash2, Download, CheckCircle, KeyRound } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { WindUnit, PressureUnit } from '../types/weather';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:28 }}>
      <p className="section-title" style={{ marginBottom:12 }}>{title}</p>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{children}</div>
    </div>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px' }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:'white' }}>{label}</p>
        {sub && <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{sub}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width:42, height:24, borderRadius:12, border:'none', cursor:'pointer',
        transition:'background 0.25s',
        background: on ? '#0ea5e9' : 'rgba(255,255,255,0.12)',
        position:'relative', flexShrink:0,
      }}
    >
      <div style={{
        width:18, height:18, borderRadius:'50%', background:'white',
        position:'absolute', top:3,
        left: on ? 21 : 3,
        transition:'left 0.22s ease',
        boxShadow:'0 1px 4px rgba(0,0,0,0.35)',
      }}/>
    </button>
  );
}

function PillSelect<T extends string>({
  options, value, onChange, activeColor,
}: { options:{label:string;val:T}[]; value:T; onChange:(v:T)=>void; activeColor?:string }) {
  return (
    <div className="hdr-pill">
      {options.map(o => (
        <button key={o.val}
          className={`hdr-pill-btn${value===o.val?' active':''}`}
          onClick={() => onChange(o.val)}
          style={value===o.val && activeColor ? { background:activeColor, color:'white' } : {}}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const {
    unit, setUnit, windUnit, setWindUnit, pressureUnit, setPressureUnit,
    theme, setTheme,
    showHumidity, showWind, showUV, showPressure, showDewPoint,
    autoRefresh, notificationsEnabled,
    setSetting,
    favorites, recentSearches, setSelectedCity,
    clearRecent, clearAll,
  } = useAppStore();

  const [saved, setSaved] = useState(false);
  const aiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  const owmKey = import.meta.env.VITE_OWM_API_KEY as string | undefined;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-inner" style={{ maxWidth:700 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Customize SkyPulse to your preferences</p>
        </div>
        <button onClick={handleSave} className="btn-primary"
          style={{ display:'flex', alignItems:'center', gap:6, minWidth:130 }}>
          {saved
            ? <><CheckCircle size={14}/> Saved!</>
            : 'Save Changes'}
        </button>
      </div>

      {/* ── Appearance ── */}
      <Section title="Appearance">
        <Row label="Theme" sub="Choose between dark and light interface">
          <PillSelect
            value={theme}
            onChange={setTheme}
            options={[
              { label:'🌙  Dark', val:'dark' },
              { label:'☀  Light', val:'light' },
            ]}
            activeColor={theme==='light' ? '#f59e0b' : '#4f46e5'}
          />
        </Row>
      </Section>

      {/* ── Units ── */}
      <Section title="Units & Measurement">
        <Row label="Temperature" sub="Celsius (°C) or Fahrenheit (°F)">
          <PillSelect value={unit} onChange={setUnit}
            options={[{ label:'°C  Celsius', val:'celsius' },{ label:'°F  Fahrenheit', val:'fahrenheit' }]}/>
        </Row>

        <Row label="Wind Speed" sub="Unit shown for wind speed across the app">
          <PillSelect<WindUnit>
            value={windUnit} onChange={setWindUnit}
            options={[
              { label:'km/h', val:'kmh' },
              { label:'mph',  val:'mph' },
              { label:'m/s',  val:'ms'  },
            ]}
          />
        </Row>

        <Row label="Pressure" sub="Unit shown for atmospheric pressure">
          <PillSelect<PressureUnit>
            value={pressureUnit} onChange={setPressureUnit}
            options={[
              { label:'hPa',  val:'hpa'  },
              { label:'inHg', val:'inhg' },
              { label:'mmHg', val:'mmhg' },
            ]}
          />
        </Row>
      </Section>

      {/* ── Dashboard display ── */}
      <Section title="Dashboard — Visible Stats">
        <Row label="Humidity" sub="Show humidity percentage on the dashboard">
          <Toggle on={showHumidity} onChange={v => setSetting('showHumidity', v)}/>
        </Row>
        <Row label="Wind Speed & Direction" sub="Show wind info on the dashboard">
          <Toggle on={showWind} onChange={v => setSetting('showWind', v)}/>
        </Row>
        <Row label="UV Index" sub="Show UV radiation level">
          <Toggle on={showUV} onChange={v => setSetting('showUV', v)}/>
        </Row>
        <Row label="Pressure" sub="Show atmospheric pressure reading">
          <Toggle on={showPressure} onChange={v => setSetting('showPressure', v)}/>
        </Row>
        <Row label="Dew Point / Wind Gust" sub="Show dew point or wind gust info">
          <Toggle on={showDewPoint} onChange={v => setSetting('showDewPoint', v)}/>
        </Row>
        <Row label="Auto Refresh" sub="Automatically update weather every 5 minutes">
          <Toggle on={autoRefresh} onChange={v => setSetting('autoRefresh', v)}/>
        </Row>
      </Section>

      {/* ── Notifications ── */}
      <Section title="Notifications">
        <Row label="Push Notifications" sub="Receive weather alerts and updates">
          <Toggle on={notificationsEnabled} onChange={v => setSetting('notificationsEnabled', v)}/>
        </Row>
        <Row label="Severe Weather Alerts" sub="Immediate alerts for extreme conditions">
          <Toggle on={true} onChange={() => {}}/>
        </Row>
        <Row label="Daily Summary" sub="Morning weather briefing">
          <Toggle on={true} onChange={() => {}}/>
        </Row>
      </Section>

      {/* ── API Keys ── */}
      <Section title="API Configuration">
        <div className="card" style={{ padding:'16px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <KeyRound size={15} style={{ color:'#38bdf8' }}/>
            <p style={{ fontSize:13, fontWeight:700, color:'white' }}>API Keys</p>
          </div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:14 }}>
            Add keys to your <code style={{ background:'rgba(255,255,255,0.08)', padding:'1px 6px', borderRadius:5, fontSize:11 }}>.env</code> file in the project root. Changes require a dev server restart.
          </p>
          {[
            {
              label:'VITE_ANTHROPIC_API_KEY',
              status: aiKey ? 'Connected' : 'Not set',
              statusColor: aiKey ? '#4ade80' : '#f87171',
              badge: aiKey ? 'badge-green' : 'badge-red',
              desc:'Enables AI Weather Insights. Get key at console.anthropic.com',
            },
            {
              label:'VITE_OWM_API_KEY',
              status: owmKey ? 'Connected' : 'Not set — using Open-Meteo fallback',
              statusColor: owmKey ? '#4ade80' : '#fbbf24',
              badge: owmKey ? 'badge-green' : 'badge-amber',
              desc:'Enhances geocoding & adds real AQI data. Get key at openweathermap.org',
            },
          ].map(({ label, status, badge, desc }) => (
            <div key={label} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <code style={{ fontSize:12, color:'#93c5fd', background:'rgba(147,197,253,0.08)', padding:'2px 8px', borderRadius:6 }}>{label}</code>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{desc}</p>
              </div>
              <span className={`badge ${badge}`} style={{ marginLeft:12, flexShrink:0 }}>{status}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Saved locations ── */}
      <Section title="Saved Locations">
        {favorites.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:28, opacity:0.5 }}>
            <span className="emoji" style={{ fontSize:28 }}>📍</span>
            <p style={{ fontSize:13, marginTop:8 }}>No saved cities — tap the heart icon on any city to save it.</p>
          </div>
        ) : (
          <div className="card" style={{ overflow:'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>City</th><th>Country</th><th>Coords</th><th></th></tr>
              </thead>
              <tbody>
                {favorites.map(fav => (
                  <tr key={fav.id}>
                    <td style={{ fontWeight:600, color:'white' }}>{fav.name}</td>
                    <td><span className="badge badge-blue">{fav.country}</span></td>
                    <td style={{ fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.4)' }}>
                      {fav.lat.toFixed(2)}, {fav.lon.toFixed(2)}
                    </td>
                    <td>
                      <button onClick={() => setSelectedCity(fav)} className="btn-ghost" style={{ fontSize:11, padding:'4px 10px' }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── Data & Privacy ── */}
      <Section title="Data & Privacy">
        <Row label="Recent Searches" sub={`${recentSearches.length} cities in search history`}>
          <button onClick={clearRecent} className="btn-ghost" style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
            <Trash2 size={12}/> Clear ({recentSearches.length})
          </button>
        </Row>
        <Row label="Export Data" sub="Download your saved cities and preferences as JSON">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify({ favorites, unit, windUnit, pressureUnit, theme }, null, 2)], { type:'application/json' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'skypulse-data.json';
              a.click();
            }}
            className="btn-ghost" style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
            <Download size={12}/> Export JSON
          </button>
        </Row>
        <Row label="Reset All Data" sub="Clear all settings, favorites and search history">
          <button
            onClick={() => { if (confirm('Reset all SkyPulse data? This cannot be undone.')) clearAll(); }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, background:'rgba(239,68,68,0.14)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', fontFamily:'inherit', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <Trash2 size={12}/> Reset All
          </button>
        </Row>
      </Section>

      {/* ── About ── */}
      <Section title="About SkyPulse">
        <div className="card" style={{ padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#38bdf8,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>☁</div>
            <div>
              <p style={{ fontSize:15, fontWeight:800, color:'white' }}>SkyPulse Weather</p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Version 6.0 · React 19 + TypeScript + Vite</p>
            </div>
          </div>
          <div className="grid-2" style={{ gap:8 }}>
            {[
              { l:'Weather Data', v:'Open-Meteo (free, no key)' },
              { l:'AI Insights',  v:'Claude Sonnet 4.6'          },
              { l:'3D Globe',     v:'react-globe.gl + Three.js'  },
              { l:'Charts',       v:'Recharts'                   },
              { l:'Animation',    v:'Framer Motion'              },
              { l:'State',        v:'Zustand + localStorage'     },
            ].map(({ l, v }) => (
              <div key={l} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'8px 10px' }}>
                <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:700, textTransform:'uppercase', marginBottom:2 }}>{l}</p>
                <p style={{ fontSize:12, fontWeight:600, color:'white' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
