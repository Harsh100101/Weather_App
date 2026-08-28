import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import AdvancedMetrics from './AdvancedMetrics';
import AIInsights from './AIInsights';
import AlertsBanner from './AlertsBanner';
import { useAppStore } from '../../store/useAppStore';
import type { WeatherData } from '../../types/weather';

const GlobeMini = lazy(() => import('../globe/GlobeMini'));

interface Props { data: WeatherData; theme: string; onGlobeClick: (lat: number, lon: number) => void }

export default function BottomRow({ data, theme, onGlobeClick }: Props) {
  const { unit } = useAppStore();

  return (
    <div className="bottom-row">
      {/* Globe */}
      <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.18 }} className="globe-panel">
        <Suspense fallback={<div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}><div style={{ width:80,height:80,borderRadius:'50%',background:'rgba(14,165,233,0.1)',border:'1px solid rgba(56,189,248,0.2)' }} className="pulse-anim"/></div>}>
          <GlobeMini lat={data.city.lat} lon={data.city.lon} onCityClick={onGlobeClick}/>
        </Suspense>
      </motion.div>

      {/* Right stack */}
      <div className="metrics-stack">
        {data.alerts && data.alerts.length > 0 && <AlertsBanner alerts={data.alerts} theme={theme as any}/>}
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.22 }} style={{ flexShrink:0,height:148 }}>
          <AdvancedMetrics data={data} theme={theme as any}/>
        </motion.div>
        <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.28 }} style={{ flexShrink:0 }}>
          <AIInsights data={data} unit={unit} theme={theme as any}/>
        </motion.div>
      </div>
    </div>
  );
}
