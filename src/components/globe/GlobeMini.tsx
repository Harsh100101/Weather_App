import { useRef, useEffect, useState, useCallback } from 'react';

let GlobeGL: any = null;

interface Props {
  lat: number;
  lon: number;
  onCityClick: (lat: number, lon: number) => void;
  textureUrl?: string;
}

const DEFAULT_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

export default function GlobeMini({ lat, lon, onCityClick, textureUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef     = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [size, setSize]     = useState({ w: 172, h: 300 });

  const init = useCallback(async () => {
    if (GlobeGL) { setLoaded(true); return; }
    try {
      const m = await import('react-globe.gl');
      GlobeGL  = m.default;
      setLoaded(true);
    } catch { /* globe unavailable */ }
  }, []);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!loaded || !globeRef.current) return;
    globeRef.current.pointOfView({ lat, lng: lon, altitude: 1.9 }, 900);
  }, [lat, lon, loaded]);

  // Observe container size so globe fills correctly
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const texture = textureUrl ?? DEFAULT_TEXTURE;

  return (
    <div ref={containerRef} style={{ width:'100%', height:'100%' }}>
      {loaded && GlobeGL ? (
        <GlobeGL
          ref={globeRef}
          width={size.w}
          height={size.h}
          globeImageUrl={texture}
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={[{ lat, lng: lon, size: 0.7, color: '#38bdf8' }]}
          pointLat="lat" pointLng="lng" pointColor="color"
          pointAltitude={0.01} pointRadius="size"
          pointLabel={() => ''}
          onPointClick={(p: any) => onCityClick(p.lat, p.lng)}
          atmosphereColor="#38bdf8"
          atmosphereAltitude={0.14}
          enablePointerInteraction
        />
      ) : (
        <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="pulse-anim" style={{
            width:90, height:90, borderRadius:'50%',
            background:'radial-gradient(circle at 35% 35%,#1d4ed8,#1e3a8a,#0c2461)',
            boxShadow:'0 0 28px rgba(56,189,248,0.18)',
            border:'1px solid rgba(56,189,248,0.25)',
          }}/>
        </div>
      )}
    </div>
  );
}
