export interface Coordinates { lat: number; lon: number }

export interface City {
  name: string; country: string; state?: string; lat: number; lon: number;
}

export interface WeatherCondition { id: number; main: string; description: string; icon: string }

export interface CurrentWeather {
  temp: number; feels_like: number; temp_min: number; temp_max: number;
  humidity: number; pressure: number; visibility: number;
  wind_speed: number; wind_deg: number; wind_gust?: number;
  clouds: number; uvi?: number; dew_point?: number;
  weather: WeatherCondition[];
  sunrise: number; sunset: number; dt: number;
  timezone: number; timezone_offset: number;
}

export interface HourlyForecast {
  dt: number; temp: number; feels_like: number; humidity: number;
  wind_speed: number; wind_deg: number;
  weather: WeatherCondition[]; pop: number; clouds: number; uvi?: number;
}

export interface DailyForecast {
  dt: number; sunrise: number; sunset: number;
  temp: { day: number; min: number; max: number; night: number; eve: number; morn: number };
  feels_like: { day: number; night: number; eve: number; morn: number };
  humidity: number; wind_speed: number; wind_deg: number;
  weather: WeatherCondition[]; pop: number; clouds: number; uvi: number;
  rain?: number; snow?: number; moon_phase: number;
}

export interface AirQuality {
  aqi: number;
  components: { co: number; no: number; no2: number; o3: number; so2: number; pm2_5: number; pm10: number; nh3: number };
}

export interface WeatherAlert {
  sender_name: string; event: string; start: number; end: number;
  description: string; tags: string[];
}

export interface WeatherData {
  city: City; current: CurrentWeather;
  hourly: HourlyForecast[]; daily: DailyForecast[];
  alerts?: WeatherAlert[]; airQuality?: AirQuality;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindUnit        = 'kmh' | 'mph' | 'ms';
export type PressureUnit    = 'hpa' | 'inhg' | 'mmhg';
export type Theme           = 'dark' | 'light';
export type MapStyle        = 'satellite' | 'dark' | 'terrain';

export interface FavoriteCity extends City { id: string; addedAt: number }

// ── Conversion helpers (pure functions, no hooks) ──────────────

export function convertTemp(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? Math.round(celsius * 9/5 + 32) : Math.round(celsius);
}

export function formatTempDisplay(celsius: number, unit: TemperatureUnit): string {
  return `${convertTemp(celsius, unit)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}

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

export function convertPressure(hpa: number, unit: PressureUnit): string {
  if (unit === 'inhg')  return (hpa * 0.02953).toFixed(2) + ' inHg';
  if (unit === 'mmhg')  return Math.round(hpa * 0.750062) + ' mmHg';
  return Math.round(hpa) + ' hPa';
}
