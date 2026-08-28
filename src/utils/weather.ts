import type { TemperatureUnit, WindUnit, PressureUnit } from '../types/weather';

// ── Temperature ──────────────────────────────────────────────
export function convertTemp(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? Math.round(celsius * 9/5 + 32) : Math.round(celsius);
}
export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  return `${convertTemp(celsius, unit)}°`;
}
export function formatTempWithUnit(celsius: number, unit: TemperatureUnit): string {
  return `${convertTemp(celsius, unit)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}

// ── Wind ─────────────────────────────────────────────────────
export function convertWind(kmh: number, unit: WindUnit): number {
  if (unit === 'mph') return Math.round(kmh * 0.621371);
  if (unit === 'ms')  return Math.round(kmh / 3.6);
  return Math.round(kmh);
}
export function windLabel(unit: WindUnit): string {
  if (unit === 'mph') return 'mph';
  if (unit === 'ms')  return 'm/s';
  return 'km/h';
}
export function formatWind(kmh: number, unit: WindUnit): string {
  return `${convertWind(kmh, unit)} ${windLabel(unit)}`;
}

// ── Pressure ─────────────────────────────────────────────────
export function formatPressure(hpa: number, unit: PressureUnit): string {
  if (unit === 'inhg')  return `${(hpa * 0.02953).toFixed(2)} inHg`;
  if (unit === 'mmhg')  return `${Math.round(hpa * 0.750062)} mmHg`;
  return `${Math.round(hpa)} hPa`;
}

// ── Directions ───────────────────────────────────────────────
export function getWindDirection(deg: number): string {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// ── UV / AQI labels ──────────────────────────────────────────
export function getUVLabel(uvi: number): { label: string; color: string } {
  if (uvi <= 2)  return { label: 'Low',       color: '#4ade80' };
  if (uvi <= 5)  return { label: 'Moderate',  color: '#facc15' };
  if (uvi <= 7)  return { label: 'High',      color: '#f97316' };
  if (uvi <= 10) return { label: 'Very High', color: '#ef4444' };
  return                 { label: 'Extreme',  color: '#a855f7' };
}

export function getAQILabel(aqi: number): { label: string; color: string; numericEst: number } {
  const map: Record<number, { label: string; color: string; numericEst: number }> = {
    1: { label: 'Good',      color: '#4ade80', numericEst: 25  },
    2: { label: 'Fair',      color: '#a3e635', numericEst: 60  },
    3: { label: 'Moderate',  color: '#facc15', numericEst: 100 },
    4: { label: 'Poor',      color: '#f97316', numericEst: 150 },
    5: { label: 'Very Poor', color: '#ef4444', numericEst: 200 },
  };
  return map[aqi] ?? { label: 'Unknown', color: '#6b7280', numericEst: 0 };
}

// ── Moon ─────────────────────────────────────────────────────
export function getMoonPhaseIcon(phase: number): string {
  if (phase === 0 || phase === 1) return '🌑';
  if (phase < 0.25)  return '🌒';
  if (phase === 0.25) return '🌓';
  if (phase < 0.5)   return '🌔';
  if (phase === 0.5)  return '🌕';
  if (phase < 0.75)  return '🌖';
  if (phase === 0.75) return '🌗';
  return '🌘';
}

// ── Time formatting ──────────────────────────────────────────
export function formatTime(ts: number, offsetSeconds = 0): string {
  const d = new Date((ts + offsetSeconds) * 1000);
  let h = d.getUTCHours(), m = d.getUTCMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}
export function formatHour(ts: number, offsetSeconds = 0): string {
  const d = new Date((ts + offsetSeconds) * 1000);
  return `${String(d.getUTCHours()).padStart(2,'0')}:00`;
}
export function formatDay(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', { weekday: 'short' });
}
export function formatDateShort(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}
export function formatLocalDateTime(ts: number, offset: number): string {
  const d = new Date((ts + offset) * 1000);
  return d.toUTCString().slice(0, 22);
}

// ── Background ───────────────────────────────────────────────
export function getWeatherGradient(condition: string, isNight: boolean): string {
  if (isNight) return 'from-[#060c1a] via-[#0a1228] to-[#050a18]';
  const c = condition.toLowerCase();
  if (c.includes('thunder')) return 'from-[#1a1025] via-[#2d1b4e] to-[#111827]';
  if (c.includes('rain') || c.includes('drizzle')) return 'from-[#0f1b2d] via-[#1a2a3d] to-[#0d1826]';
  if (c.includes('snow')) return 'from-[#0f1e2e] via-[#1a2f42] to-[#0d1929]';
  if (c.includes('clear')) return 'from-[#0a1628] via-[#0f2042] to-[#0a1830]';
  return 'from-[#0a1628] via-[#111f38] to-[#0c1a2e]';
}

export function isNightTime(dt: number, sunrise: number, sunset: number): boolean {
  return dt < sunrise || dt > sunset;
}
