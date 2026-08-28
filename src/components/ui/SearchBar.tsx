import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Clock, MapPin } from 'lucide-react';
import { searchCities } from '../../services/weatherApi';
import { useAppStore } from '../../store/useAppStore';
import type { City } from '../../types/weather';

function flag(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  const b = 0x1F1E6 - 65;
  return String.fromCodePoint(code.charCodeAt(0) + b) + String.fromCodePoint(code.charCodeAt(1) + b);
}

interface Props { theme: 'dark'|'light'; onSelect?: (c: City) => void }

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery]   = useState('');
  const [results, setRes]   = useState<City[]>([]);
  const [loading, setLoad]  = useState(false);
  const [open, setOpen]     = useState(false);
  const [pos, setPos]       = useState({ top: 0, left: 0, width: 0 });

  const wrapRef  = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { recentSearches, setSelectedCity } = useAppStore();

  const updatePos = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  };

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setRes([]); return; }
    setLoad(true);
    try { setRes(await searchCities(q)); } finally { setLoad(false); }
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 320);
    return () => clearTimeout(timerRef.current);
  }, [query, doSearch]);

  const pick = (city: City) => {
    setSelectedCity(city); onSelect?.(city);
    setQuery(''); setOpen(false); setRes([]);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const list = query.length > 0 ? results : recentSearches.slice(0, 6);
  const show = open && list.length > 0;

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
      <div className="search-input-wrap"
        onClick={() => { updatePos(); setOpen(true); }}>
        {loading
          ? <Loader2 size={15} style={{ color: '#38bdf8', flexShrink: 0 }} className="spin" />
          : <Search size={15} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
        }
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); updatePos(); }}
          onFocus={() => { updatePos(); setOpen(true); }}
          placeholder="Search cities worldwide…"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button onClick={() => { setQuery(''); setRes([]); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 2 }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Portal dropdown */}
      {createPortal(
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.13 }}
              className="search-dropdown"
              style={{ top: pos.top, left: pos.left, width: pos.width, minWidth: 280 }}
            >
              {!query && list.length > 0 && (
                <div style={{ padding: '10px 16px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={10} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Recent</span>
                </div>
              )}
              {list.map((city, i) => (
                <button
                  key={`${city.lat}-${city.lon}-${i}`}
                  className="search-dropdown-item"
                  onMouseDown={e => { e.preventDefault(); pick(city); }}
                >
                  <span className="emoji" style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>{flag(city.country)}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {city.name}{city.state ? `, ${city.state}` : ''}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{city.country}</div>
                  </div>
                  <MapPin size={11} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
