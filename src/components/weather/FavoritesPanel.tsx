import { AnimatePresence, motion } from 'framer-motion';
import { Star, X, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { FavoriteCity } from '../../types/weather';

export default function FavoritesPanel({ theme: _t }: { theme: string }) {
  const { favorites, setSelectedCity, toggleFavorite, selectedCity } = useAppStore();
  if (!favorites.length) return null;
  return (
    <div className="favs-strip" style={{ flexShrink:0 }}>
      <Star size={10} style={{ color:'#fbbf24', flexShrink:0 }} fill="currentColor"/>
      <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,255,255,0.3)', flexShrink:0 }}>Saved Cities</span>
      <div style={{ width:1, height:14, background:'rgba(255,255,255,0.10)', flexShrink:0 }}/>
      <div style={{ display:'flex', gap:6, overflowX:'auto', flex:1 }} className="no-scroll">
        <AnimatePresence>
          {favorites.map((fav: FavoriteCity) => {
            const active = selectedCity?.lat===fav.lat && selectedCity?.lon===fav.lon;
            return (
              <motion.button key={fav.id} layout initial={{ scale:0.85,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.85,opacity:0 }}
                onClick={() => setSelectedCity(fav)}
                className={`fav-chip${active?' active':''}`}>
                <MapPin size={9} style={{ opacity:0.6, flexShrink:0 }}/>
                <span>{fav.name}</span>
                <span style={{ fontSize:9, opacity:0.4 }}>{fav.country}</span>
                <button onClick={e=>{e.stopPropagation();toggleFavorite(fav);}} style={{ background:'none',border:'none',cursor:'pointer',color:'inherit',opacity:0.35,padding:0,display:'flex',marginLeft:2 }}>
                  <X size={10}/>
                </button>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
