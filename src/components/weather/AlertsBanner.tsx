import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, X } from 'lucide-react';
import type { WeatherAlert } from '../../types/weather';

function fmt(ts: number) {
  return new Date(ts * 1000).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

export default function AlertsBanner({ alerts }: { alerts: WeatherAlert[]; theme: string }) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const visible = alerts.filter((_,i) => !dismissed.has(i));
  if (!visible.length) return null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
      {alerts.map((alert, i) => {
        if (dismissed.has(i)) return null;
        const isOpen = expanded === i;
        return (
          <motion.div key={i} initial={{ opacity:0,y:-6 }} animate={{ opacity:1,y:0 }}
            style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(249,156,0,0.3)', background:'rgba(249,156,0,0.10)' }}>
            <button onClick={() => setExpanded(isOpen ? null : i)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
              <Bell size={13} style={{ color:'#fbbf24', flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0, textAlign:'left' }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#fde68a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{alert.event}</p>
                <p style={{ fontSize:10, color:'rgba(253,230,138,0.6)' }}>{alert.sender_name}</p>
              </div>
              <ChevronDown size={13} style={{ color:'rgba(253,230,138,0.5)', flexShrink:0, transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}/>
              <button onClick={e=>{e.stopPropagation();setDismissed(new Set([...dismissed,i]));}}
                style={{ background:'none',border:'none',cursor:'pointer',color:'rgba(253,230,138,0.5)',display:'flex',padding:2 }}>
                <X size={13}/>
              </button>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }} style={{ overflow:'hidden' }}>
                  <div style={{ padding:'0 14px 12px', borderTop:'1px solid rgba(249,156,0,0.18)' }}>
                    <p style={{ fontSize:10, color:'rgba(253,230,138,0.6)', marginTop:8, marginBottom:6, fontWeight:500 }}>
                      {fmt(alert.start)} — {fmt(alert.end)}
                    </p>
                    <p style={{ fontSize:11, color:'rgba(253,230,138,0.75)', lineHeight:1.5,
                      display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {alert.description}
                    </p>
                    {alert.tags?.length > 0 && (
                      <div style={{ display:'flex', gap:4, marginTop:8, flexWrap:'wrap' }}>
                        {alert.tags.map(tag => (
                          <span key={tag} style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'rgba(249,156,0,0.2)', color:'#fde68a', fontWeight:600 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
