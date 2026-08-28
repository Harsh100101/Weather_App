import { useState, lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store/useAppStore';
import { useWeather } from './hooks/useWeather';
import { reverseGeocode } from './services/weatherApi';
import { isNightTime } from './utils/weather';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import LandingScreen from './components/layout/LandingScreen';
import LeftPanel from './components/weather/LeftPanel';
import WeeklyForecast from './components/weather/WeeklyForecast';
import HourlyPanel from './components/weather/HourlyPanel';
import BottomRow from './components/weather/BottomRow';
import FavoritesPanel from './components/weather/FavoritesPanel';
import DetailDrawer from './components/weather/DetailDrawer';

const ForecastPage = lazy(() => import('./pages/ForecastPage'));
const MapPage      = lazy(() => import('./pages/MapPage'));
const AlertsPage   = lazy(() => import('./pages/AlertsPage'));
const ComparePage  = lazy(() => import('./pages/ComparePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 5 * 60 * 1000 } },
});

function Skeleton() {
  return (
    <div className="dash-grid" style={{ opacity:0.5 }}>
      <div className="dash-left skeleton"/>
      <div className="dash-centre">
        <div className="card skeleton" style={{ height:110, flexShrink:0 }}/>
        <div className="card skeleton" style={{ height:145, flexShrink:0 }}/>
        <div style={{ flex:1, display:'flex', gap:8 }}>
          <div className="card skeleton" style={{ width:172, flexShrink:0 }}/>
          <div className="card skeleton" style={{ flex:1 }}/>
        </div>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="pulse-anim" style={{ width:40, height:40, borderRadius:'50%', background:'rgba(56,189,248,0.3)', border:'2px solid rgba(56,189,248,0.5)' }}/>
    </div>
  );
}

function Dashboard() {
  const { selectedCity, setSelectedCity, theme, unit, currentPage } = useAppStore();
  const { data, isLoading, isError, refetch } = useWeather(selectedCity);
  const isDark = theme === 'dark';
  const [drawerTab, setDrawerTab] = useState<'chart'|'wind'|'week'|null>(null);

  // ── Apply theme to body background ──────────────────────────
  useEffect(() => {
    document.body.style.background = isDark
      ? 'linear-gradient(160deg,#0a1628 0%,#0d1f3c 60%,#080f1e 100%)'
      : 'linear-gradient(160deg,#dbeafe 0%,#eff6ff 60%,#e0f2fe 100%)';
    document.body.style.color = isDark ? 'white' : '#0f172a';
  }, [isDark]);

  const night = data
    ? isNightTime(
        data.current.dt + data.current.timezone_offset,
        data.current.sunrise + data.current.timezone_offset,
        data.current.sunset + data.current.timezone_offset,
      )
    : false;

  const bg = isDark
    ? night
      ? 'linear-gradient(160deg,#060c1a 0%,#0a1228 60%,#050a18 100%)'
      : 'linear-gradient(160deg,#0a1628 0%,#0d1f3c 60%,#080f1e 100%)'
    : night
      ? 'linear-gradient(160deg,#1e293b 0%,#0f172a 60%,#1e1b4b 100%)'
      : 'linear-gradient(160deg,#dbeafe 0%,#eff6ff 60%,#e0f2fe 100%)';

  // Light-mode CSS overrides injected dynamically
  useEffect(() => {
    const styleId = 'theme-overrides';
    let el = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = styleId;
      document.head.appendChild(el);
    }
    if (!isDark) {
      el.textContent = `
        .card, .card-sm, .metric-card { background: rgba(255,255,255,0.72) !important; border-color: rgba(0,0,0,0.08) !important; color: #0f172a !important; }
        .app-header { background: rgba(255,255,255,0.85) !important; border-color: rgba(0,0,0,0.08) !important; }
        .sidebar { background: rgba(255,255,255,0.55) !important; border-color: rgba(0,0,0,0.08) !important; }
        .sidebar-item { color: rgba(0,0,0,0.5) !important; }
        .sidebar-item:hover { background: rgba(0,0,0,0.05) !important; color: rgba(0,0,0,0.8) !important; }
        .sidebar-item.active { background: rgba(14,165,233,0.15) !important; color: #0ea5e9 !important; }
        .search-input-wrap { background: rgba(0,0,0,0.05) !important; border-color: rgba(0,0,0,0.12) !important; }
        .search-input-wrap input { color: #0f172a !important; }
        .search-input-wrap input::placeholder { color: rgba(0,0,0,0.35) !important; }
        .stat-label { color: rgba(0,0,0,0.4) !important; }
        .stat-value { color: #0f172a !important; }
        .section-title { color: rgba(0,0,0,0.4) !important; }
        .page-title { color: #0f172a !important; }
        .page-sub { color: rgba(0,0,0,0.5) !important; }
        .hdr-btn { color: rgba(0,0,0,0.6) !important; background: rgba(0,0,0,0.05) !important; border-color: rgba(0,0,0,0.10) !important; }
        .hdr-pill { border-color: rgba(0,0,0,0.10) !important; }
        .hdr-pill-btn { color: rgba(0,0,0,0.4) !important; }
        .btn-ghost { background: rgba(0,0,0,0.06) !important; border-color: rgba(0,0,0,0.10) !important; color: rgba(0,0,0,0.7) !important; }
        .toggle-opt { color: rgba(0,0,0,0.4) !important; }
        .toggle-opt.active { background: rgba(0,0,0,0.10) !important; color: #0f172a !important; }
        .inp { background: rgba(0,0,0,0.05) !important; border-color: rgba(0,0,0,0.12) !important; color: #0f172a !important; }
        .data-table th { color: rgba(0,0,0,0.4) !important; border-color: rgba(0,0,0,0.07) !important; }
        .data-table td { color: rgba(0,0,0,0.7) !important; border-color: rgba(0,0,0,0.04) !important; }
        .weekly-day { color: #0f172a !important; }
        .favs-strip { background: rgba(0,0,0,0.05) !important; border-color: rgba(0,0,0,0.08) !important; }
        .fav-chip { background: rgba(0,0,0,0.06) !important; border-color: rgba(0,0,0,0.10) !important; color: rgba(0,0,0,0.65) !important; }
      `;
    } else {
      el.textContent = '';
    }
  }, [isDark]);

  const handleGlobeSelect = async (lat: number, lon: number) => {
    try { setSelectedCity(await reverseGeocode(lat, lon)); } catch {}
  };

  const openDrawer = (tab: 'chart'|'wind'|'week') =>
    setDrawerTab(prev => prev === tab ? null : tab);

  const isDashboard = currentPage === 'dashboard';

  return (
    <div className="app-shell" style={{ background: bg, transition:'background 0.5s ease' }}>
      <Header onOpenDrawer={isDashboard ? openDrawer : undefined} hasData={!!data && isDashboard}/>

      <div className="app-content">
        <Sidebar/>

        <div className="page-body">
          <Suspense fallback={<PageLoader/>}>
            <AnimatePresence mode="wait">

              {/* Dashboard */}
              {currentPage === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ flex:1, display:'flex', overflow:'hidden' }}>
                  <div className="app-body">
                    <AnimatePresence mode="wait">
                      {!selectedCity && (
                        <motion.div key="landing" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          style={{ display:'flex', height:'100%', width:'100%' }}>
                          <LandingScreen theme={theme}/>
                        </motion.div>
                      )}
                      {selectedCity && isLoading && (
                        <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          style={{ height:'100%', width:'100%' }}>
                          <Skeleton/>
                        </motion.div>
                      )}
                      {selectedCity && isError && (
                        <motion.div key="error" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          style={{ height:'100%', width:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <div className="card card-pad" style={{ maxWidth:360, textAlign:'center', padding:40 }}>
                            <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
                            <p style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>Weather unavailable</p>
                            <p style={{ fontSize:13, opacity:0.5, marginBottom:24 }}>Could not load weather for {selectedCity.name}.</p>
                            <button onClick={() => refetch()} className="btn-primary">Retry</button>
                          </div>
                        </motion.div>
                      )}
                      {selectedCity && data && !isLoading && (
                        <motion.div key={`d-${selectedCity.lat}-${selectedCity.lon}`}
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.28 }}
                          className="dash-grid">
                          <div className="dash-left"><LeftPanel data={data} theme={theme}/></div>
                          <div className="dash-centre">
                            <FavoritesPanel theme={theme}/>
                            <WeeklyForecast daily={data.daily} unit={unit} theme={theme}/>
                            <HourlyPanel hourly={data.hourly} unit={unit} timezoneOffset={data.current.timezone_offset} theme={theme}/>
                            <div style={{ flex:1, minHeight:0 }}>
                              <BottomRow data={data} theme={theme} onGlobeClick={handleGlobeSelect}/>
                            </div>
                          </div>
                          <AnimatePresence>
                            {drawerTab && (
                              <DetailDrawer data={data} unit={unit} theme={theme} onClose={() => setDrawerTab(null)} tab={drawerTab}/>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {currentPage === 'forecast' && (
                <motion.div key="forecast" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                  style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                  <ForecastPage/>
                </motion.div>
              )}
              {currentPage === 'map' && (
                <motion.div key="map" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                  style={{ flex:1, overflow:'hidden', padding:'10px 12px 12px' }}>
                  <MapPage/>
                </motion.div>
              )}
              {currentPage === 'alerts' && (
                <motion.div key="alerts" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                  style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                  <AlertsPage/>
                </motion.div>
              )}
              {currentPage === 'compare' && (
                <motion.div key="compare" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                  style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                  <ComparePage/>
                </motion.div>
              )}
              {currentPage === 'settings' && (
                <motion.div key="settings" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                  style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                  <SettingsPage/>
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <QueryClientProvider client={qc}><Dashboard/></QueryClientProvider>;
}
