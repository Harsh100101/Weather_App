import { useState } from 'react';
import { Navigation, BarChart2, Wind, Calendar, Sun, Moon, User } from 'lucide-react';

import SearchBar from '../ui/SearchBar';
import { useAppStore } from '../../store/useAppStore';
import { useGeolocation } from '../../hooks/useWeather';

interface Props { onOpenDrawer?: (tab: 'chart'|'wind'|'week') => void; hasData?: boolean }

export default function Header({ onOpenDrawer, hasData }: Props) {
  const { theme, setTheme, unit, setUnit } = useAppStore();
  const { detect } = useGeolocation();
  const [locating, setLocating] = useState(false);
  const isDark = theme === 'dark';

  const handleLocate = async () => {
    setLocating(true);
    try { await detect(); } catch {} finally { setLocating(false); }
  };

  return (
    <header className="app-header">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#38bdf8,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 4px 14px rgba(56,189,248,0.35)' }}>☁</div>
        <span style={{ fontSize: 15, fontWeight: 900, color: 'white', letterSpacing: -0.5 }}>SkyPulse</span>
      </div>

      {/* Search — centred */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
        <SearchBar theme={theme} />
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button className="hdr-btn" onClick={handleLocate} disabled={locating}>
          <Navigation size={12} style={locating ? { color: '#38bdf8' } : {}} />
          <span>Use Current Location</span>
        </button>

        <div className="hdr-sep" />

        {hasData && onOpenDrawer && (
          <>
            {([
              { icon: BarChart2, tab: 'chart' as const, title: 'Temp chart' },
              { icon: Wind,      tab: 'wind'  as const, title: 'Wind' },
              { icon: Calendar,  tab: 'week'  as const, title: '8-day' },
            ]).map(({ icon: Icon, tab, title }) => (
              <button key={tab} title={title} onClick={() => onOpenDrawer(tab)}
                style={{ padding: '5px 6px', borderRadius: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                <Icon size={14} />
              </button>
            ))}
            <div className="hdr-sep" />
          </>
        )}

        {/* °C / °F */}
        <div className="hdr-pill">
          <button className={`hdr-pill-btn ${unit === 'celsius' ? 'active' : ''}`} onClick={() => setUnit('celsius')}>°C</button>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, display: 'flex', alignItems: 'center' }}>/</span>
          <button className={`hdr-pill-btn ${unit === 'fahrenheit' ? 'active' : ''}`} onClick={() => setUnit('fahrenheit')}>°F</button>
        </div>

        {/* Light / Dark */}
        <div className="hdr-pill">
          <button className={`hdr-pill-btn ${!isDark ? 'active' : ''}`} onClick={() => setTheme('light')}
            style={!isDark ? { background: '#f59e0b', color: 'white' } : {}}>
            <Sun size={12} />
          </button>
          <button className={`hdr-pill-btn ${isDark ? 'active' : ''}`} onClick={() => setTheme('dark')}>
            <Moon size={12} />
          </button>
        </div>

        <div className="hdr-avatar"><User size={13} style={{ color: 'rgba(255,255,255,0.5)' }} /></div>
      </div>
    </header>
  );
}
