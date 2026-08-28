import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';
import { useGeolocation } from '../../hooks/useWeather';
import { useAppStore } from '../../store/useAppStore';
import { useState } from 'react';

function flag(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  const b = 0x1F1E6 - 65;
  return String.fromCodePoint(code.charCodeAt(0) + b) + String.fromCodePoint(code.charCodeAt(1) + b);
}

const CITIES = [
  { name: 'London',   country: 'GB', lat: 51.5074,  lon: -0.1278  },
  { name: 'New York', country: 'US', lat: 40.7128,  lon: -74.006  },
  { name: 'Tokyo',    country: 'JP', lat: 35.6762,  lon: 139.6503 },
  { name: 'Dubai',    country: 'AE', lat: 25.2048,  lon: 55.2708  },
  { name: 'Sydney',   country: 'AU', lat: -33.8688, lon: 151.2093 },
  { name: 'Paris',    country: 'FR', lat: 48.8566,  lon: 2.3522   },
];

export default function LandingScreen({ theme: _t }: { theme: string }) {
  const { detect } = useGeolocation();
  const { setSelectedCity } = useAppStore();
  const [locating, setLocating] = useState(false);

  const handleLocate = async () => {
    setLocating(true);
    try { await detect(); } catch {} finally { setLocating(false); }
  };

  return (
    <div className="landing">
      <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
        <div className="emoji float" style={{ fontSize: 68, lineHeight: 1, marginBottom: 20, display: 'block', textAlign: 'center' }}>⛅</div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: 'white', marginBottom: 10, letterSpacing: -0.5 }}>Welcome to SkyPulse</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 360, lineHeight: 1.6 }}>
          Real-time global weather, 3D globe, AI insights, and hourly forecasts — search any city or use your location.
        </p>
      </motion.div>

      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', maxWidth: 310 }}>

        <button onClick={handleLocate} disabled={locating}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', borderRadius: 16, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(14,165,233,0.35)', transition: 'all 0.15s' }}>
          <Navigation size={14} style={locating ? { color: '#bae6fd' } : {}} />
          {locating ? 'Detecting location…' : 'Use My Location'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>or pick a city</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div className="quick-cities">
          {CITIES.map(c => (
            <button key={c.name} className="city-btn" onClick={() => setSelectedCity(c)}>
              <span className="city-flag">{flag(c.country)}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
