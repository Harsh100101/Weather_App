import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Info, Wind, Thermometer, CloudRain, Zap, Eye, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useWeather } from '../hooks/useWeather';

type Severity = 'extreme'|'severe'|'moderate'|'minor';

interface MockAlert {
  id: string;
  type: string;
  severity: Severity;
  title: string;
  description: string;
  area: string;
  start: string;
  end: string;
  read: boolean;
  icon: any;
}

const SEVERITY_STYLE: Record<Severity, { bg: string; border: string; color: string; badge: string }> = {
  extreme:  { bg:'rgba(239,68,68,0.10)',  border:'rgba(239,68,68,0.30)',  color:'#f87171', badge:'badge-red'    },
  severe:   { bg:'rgba(249,115,22,0.10)', border:'rgba(249,115,22,0.30)', color:'#fb923c', badge:'badge-amber'  },
  moderate: { bg:'rgba(251,191,36,0.10)', border:'rgba(251,191,36,0.30)', color:'#fbbf24', badge:'badge-amber'  },
  minor:    { bg:'rgba(56,189,248,0.08)', border:'rgba(56,189,248,0.22)', color:'#38bdf8', badge:'badge-blue'   },
};

const generateAlerts = (cityName: string): MockAlert[] => [
  { id:'1', type:'Wind Advisory', severity:'severe', icon:Wind,
    title:'Strong Wind Advisory',
    description:`Southwesterly winds of 40–55 km/h with gusts up to 80 km/h expected across ${cityName} metropolitan area. Secure loose outdoor objects. Avoid high-sided vehicles on exposed roads.`,
    area: cityName, start:'Today 14:00', end:'Today 23:00', read:false },
  { id:'2', type:'Heat Warning', severity:'moderate', icon:Thermometer,
    title:'Heat Health Alert',
    description:`Above-average temperatures forecast for ${cityName}. Drink plenty of water, stay in shaded or air-conditioned spaces during peak hours (11:00–16:00). Check on vulnerable individuals.`,
    area: cityName, start:'Tomorrow 09:00', end:'Tomorrow 20:00', read:false },
  { id:'3', type:'Heavy Rain', severity:'minor', icon:CloudRain,
    title:'Heavy Rainfall Warning',
    description:`Bands of heavy rain expected to sweep across ${cityName} late evening. Localised flooding possible in low-lying areas. Drivers should be cautious on flooded roads.`,
    area: cityName + ' Region', start:'Tomorrow 22:00', end:'Day+2 06:00', read:true },
  { id:'4', type:'Thunderstorm', severity:'extreme', icon:Zap,
    title:'Severe Thunderstorm Watch',
    description:`Conditions are favourable for the development of severe thunderstorms capable of producing large hail, damaging winds, and isolated tornadoes across ${cityName}. Take cover immediately if a warning is issued.`,
    area: cityName + ' Metro', start:'Day+2 12:00', end:'Day+2 20:00', read:false },
];

export default function AlertsPage() {
  const { selectedCity } = useAppStore();
  const { data } = useWeather(selectedCity);
  const cityName = data?.city.name ?? selectedCity?.name ?? 'Your City';

  const [alerts, setAlerts]         = useState<MockAlert[]>(() => generateAlerts(cityName));
  const [filter, setFilter]         = useState<'all'|Severity>('all');
  const [notifications, setNotifs]  = useState(true);
  const [expanded, setExpanded]     = useState<string|null>(null);

  const markRead = (id: string) => setAlerts(prev => prev.map(a => a.id===id ? {...a, read:true} : a));
  const markAll  = () => setAlerts(prev => prev.map(a => ({...a, read:true})));

  const filtered = filter==='all' ? alerts : alerts.filter(a=>a.severity===filter);
  const unread   = alerts.filter(a=>!a.read).length;

  return (
    <div className="page-inner">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 className="page-title">Weather Alerts</h1>
          <p className="page-sub">{cityName} · {unread > 0 ? `${unread} unread alert${unread>1?'s':''}` : 'All alerts read'}</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {unread > 0 && (
            <button className="btn-ghost" onClick={markAll} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
              <CheckCircle size={13}/> Mark all read
            </button>
          )}
          <button onClick={()=>setNotifs(!notifications)}
            className={`hdr-pill-btn${notifications?' active':''}`}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', border:'1px solid rgba(255,255,255,0.10)', borderRadius:10, fontSize:12 }}>
            {notifications ? <Bell size={13}/> : <BellOff size={13}/>}
            {notifications ? 'Notifications on' : 'Notifications off'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {(['extreme','severe','moderate','minor'] as Severity[]).map(sev => {
          const count = alerts.filter(a=>a.severity===sev).length;
          const style = SEVERITY_STYLE[sev];
          return (
            <motion.div key={sev} whileHover={{ scale:1.02 }} onClick={()=>setFilter(filter===sev?'all':sev)}
              className="metric-card" style={{ cursor:'pointer', border:`1px solid ${filter===sev?style.color:style.border}`, background:filter===sev?style.bg:'rgba(255,255,255,0.055)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <p className="metric-label" style={{ color:style.color, textTransform:'capitalize' }}>{sev}</p>
                <span className={`badge ${style.badge}`}>{count}</span>
              </div>
              <p className="metric-value" style={{ fontSize:32, color:style.color }}>{count}</p>
              <p className="metric-sub">Active alert{count!==1?'s':''}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Alert list */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 0', opacity:0.4 }}>
            <span className="emoji" style={{ fontSize:36 }}>✅</span>
            <p style={{ fontSize:14, fontWeight:600, marginTop:8 }}>No {filter !== 'all' ? filter : ''} alerts</p>
          </div>
        )}
        {filtered.map(alert => {
          const sty = SEVERITY_STYLE[alert.severity];
          const Icon = alert.icon;
          const isOpen = expanded === alert.id;
          return (
            <motion.div key={alert.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${sty.border}`, background:sty.bg, opacity: alert.read ? 0.65 : 1 }}>
              <button onClick={()=>{ setExpanded(isOpen?null:alert.id); markRead(alert.id); }}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
                {!alert.read && <div style={{ width:7, height:7, borderRadius:'50%', background:sty.color, flexShrink:0, boxShadow:`0 0 6px ${sty.color}` }}/>}
                <div style={{ width:34, height:34, borderRadius:10, background:sty.color+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={16} style={{ color:sty.color }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'white' }}>{alert.title}</p>
                    <span className={`badge ${sty.badge}`} style={{ textTransform:'capitalize' }}>{alert.severity}</span>
                  </div>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>{alert.area} · {alert.start} – {alert.end}</p>
                </div>
                <span style={{ fontSize:16, color:'rgba(255,255,255,0.3)', transition:'transform 0.2s', transform:isOpen?'rotate(90deg)':'none' }}>›</span>
              </button>
              {isOpen && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                  style={{ overflow:'hidden', borderTop:`1px solid ${sty.border}` }}>
                  <div style={{ padding:'12px 16px 16px' }}>
                    <p style={{ fontSize:13, lineHeight:1.6, color:'rgba(255,255,255,0.75)' }}>{alert.description}</p>
                    <div style={{ display:'flex', gap:8, marginTop:12 }}>
                      <span className="badge badge-blue"><Info size={9}/>&nbsp;{alert.type}</span>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', display:'flex', alignItems:'center', gap:3 }}>
                        <Eye size={10}/> Issued automatically for demonstration
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
