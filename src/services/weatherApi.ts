import axios from 'axios';
import type { City, CurrentWeather, HourlyForecast, DailyForecast, WeatherData, AirQuality } from '../types/weather';

const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY || 'demo';
const OWM_BASE = 'https://api.openweathermap.org';
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';

// WMO weather codes to OWM-style condition mapping
function wmoToCondition(wmo: number, isDay: number): { id: number; main: string; description: string; icon: string } {
  const dayIcon = isDay ? 'd' : 'n';
  const map: Record<number, { id: number; main: string; description: string; iconBase: string }> = {
    0:  { id: 800, main: 'Clear', description: 'clear sky', iconBase: '01' },
    1:  { id: 801, main: 'Clouds', description: 'mainly clear', iconBase: '02' },
    2:  { id: 802, main: 'Clouds', description: 'partly cloudy', iconBase: '03' },
    3:  { id: 804, main: 'Clouds', description: 'overcast', iconBase: '04' },
    45: { id: 741, main: 'Fog', description: 'fog', iconBase: '50' },
    48: { id: 741, main: 'Fog', description: 'icy fog', iconBase: '50' },
    51: { id: 300, main: 'Drizzle', description: 'light drizzle', iconBase: '09' },
    53: { id: 301, main: 'Drizzle', description: 'moderate drizzle', iconBase: '09' },
    55: { id: 302, main: 'Drizzle', description: 'dense drizzle', iconBase: '09' },
    61: { id: 500, main: 'Rain', description: 'slight rain', iconBase: '10' },
    63: { id: 501, main: 'Rain', description: 'moderate rain', iconBase: '10' },
    65: { id: 502, main: 'Rain', description: 'heavy rain', iconBase: '10' },
    71: { id: 600, main: 'Snow', description: 'slight snow', iconBase: '13' },
    73: { id: 601, main: 'Snow', description: 'moderate snow', iconBase: '13' },
    75: { id: 602, main: 'Snow', description: 'heavy snow', iconBase: '13' },
    80: { id: 520, main: 'Rain', description: 'slight showers', iconBase: '09' },
    81: { id: 521, main: 'Rain', description: 'moderate showers', iconBase: '09' },
    82: { id: 522, main: 'Rain', description: 'violent showers', iconBase: '09' },
    95: { id: 211, main: 'Thunderstorm', description: 'thunderstorm', iconBase: '11' },
    99: { id: 212, main: 'Thunderstorm', description: 'thunderstorm with hail', iconBase: '11' },
  };
  const entry = map[wmo] ?? map[0];
  return { ...entry, icon: `${entry.iconBase}${dayIcon}` };
}

export async function searchCities(query: string): Promise<City[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await axios.get(`${OWM_BASE}/geo/1.0/direct`, {
      params: { q: query, limit: 8, appid: OWM_API_KEY },
    });
    return res.data.map((c: any) => ({
      name: c.name,
      country: c.country,
      state: c.state,
      lat: c.lat,
      lon: c.lon,
    }));
  } catch {
    // Fallback to Open-Meteo geocoding
    const res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: query, count: 8, language: 'en', format: 'json' },
    });
    if (!res.data?.results) return [];
    return res.data.results.map((c: any) => ({
      name: c.name,
      country: c.country_code?.toUpperCase() ?? '',
      state: c.admin1,
      lat: c.latitude,
      lon: c.longitude,
    }));
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<City> {
  try {
    const res = await axios.get(`${OWM_BASE}/geo/1.0/reverse`, {
      params: { lat, lon, limit: 1, appid: OWM_API_KEY },
    });
    const c = res.data[0];
    return { name: c.name, country: c.country, state: c.state, lat, lon };
  } catch {
    return { name: 'Current Location', country: '', lat, lon };
  }
}

export async function fetchWeatherData(lat: number, lon: number, cityInfo: City): Promise<WeatherData> {
  const [meteoRes, airRes] = await Promise.allSettled([
    axios.get(`${OPEN_METEO_BASE}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
          'weather_code', 'surface_pressure', 'wind_speed_10m', 'wind_direction_10m',
          'cloud_cover', 'visibility', 'uv_index', 'is_day',
          'dew_point_2m', 'wind_gusts_10m', 'precipitation_probability'
        ].join(','),
        hourly: [
          'temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
          'weather_code', 'wind_speed_10m', 'wind_direction_10m',
          'precipitation_probability', 'cloud_cover', 'uv_index', 'is_day'
        ].join(','),
        daily: [
          'weather_code', 'temperature_2m_max', 'temperature_2m_min',
          'apparent_temperature_max', 'apparent_temperature_min',
          'sunrise', 'sunset', 'precipitation_probability_max',
          'wind_speed_10m_max', 'wind_direction_10m_dominant',
          'uv_index_max', 'precipitation_sum', 'moonrise', 'moonset', 'moon_phase'
        ].join(','),
        forecast_days: 8,
        timezone: 'auto',
      },
    }),
    OWM_API_KEY !== 'demo'
      ? axios.get(`${OWM_BASE}/data/2.5/air_pollution`, {
          params: { lat, lon, appid: OWM_API_KEY },
        })
      : Promise.reject('no key'),
  ]);

  if (meteoRes.status === 'rejected') throw new Error('Failed to fetch weather data');

  const m = meteoRes.value.data;
  const cur = m.current;
  const isDay = cur.is_day ?? 1;
  const condition = wmoToCondition(cur.weather_code, isDay);

  // Parse sunrise/sunset from daily
  const sunriseStr = m.daily?.sunrise?.[0] ?? '';
  const sunsetStr = m.daily?.sunset?.[0] ?? '';
  const sunriseTs = sunriseStr ? Math.floor(new Date(sunriseStr).getTime() / 1000) : 0;
  const sunsetTs = sunsetStr ? Math.floor(new Date(sunsetStr).getTime() / 1000) : 0;

  const current: CurrentWeather = {
    temp: cur.temperature_2m,
    feels_like: cur.apparent_temperature,
    temp_min: m.daily?.temperature_2m_min?.[0] ?? cur.temperature_2m - 3,
    temp_max: m.daily?.temperature_2m_max?.[0] ?? cur.temperature_2m + 3,
    humidity: cur.relative_humidity_2m,
    pressure: cur.surface_pressure,
    visibility: (cur.visibility ?? 10000) / 1000,
    wind_speed: cur.wind_speed_10m,
    wind_deg: cur.wind_direction_10m,
    wind_gust: cur.wind_gusts_10m,
    clouds: cur.cloud_cover,
    uvi: cur.uv_index,
    dew_point: cur.dew_point_2m,
    weather: [condition],
    sunrise: sunriseTs,
    sunset: sunsetTs,
    dt: Math.floor(new Date(cur.time).getTime() / 1000),
    timezone: 0,
    timezone_offset: m.utc_offset_seconds ?? 0,
  };

  // Hourly – next 24 entries from now
  const nowIdx = m.hourly.time.findIndex((t: string) => t >= cur.time);
  const startIdx = nowIdx >= 0 ? nowIdx : 0;
  const hourly: HourlyForecast[] = m.hourly.time
    .slice(startIdx, startIdx + 24)
    .map((t: string, i: number) => {
      const idx = startIdx + i;
      return {
        dt: Math.floor(new Date(t).getTime() / 1000),
        temp: m.hourly.temperature_2m[idx],
        feels_like: m.hourly.apparent_temperature[idx],
        humidity: m.hourly.relative_humidity_2m[idx],
        wind_speed: m.hourly.wind_speed_10m[idx],
        wind_deg: m.hourly.wind_direction_10m[idx],
        weather: [wmoToCondition(m.hourly.weather_code[idx], m.hourly.is_day?.[idx] ?? 1)],
        pop: (m.hourly.precipitation_probability[idx] ?? 0) / 100,
        clouds: m.hourly.cloud_cover[idx],
        uvi: m.hourly.uv_index?.[idx],
      };
    });

  // Daily
  const daily: DailyForecast[] = m.daily.time.map((t: string, i: number) => ({
    dt: Math.floor(new Date(t).getTime() / 1000),
    sunrise: Math.floor(new Date(m.daily.sunrise[i]).getTime() / 1000),
    sunset: Math.floor(new Date(m.daily.sunset[i]).getTime() / 1000),
    temp: {
      day: m.daily.temperature_2m_max[i],
      min: m.daily.temperature_2m_min[i],
      max: m.daily.temperature_2m_max[i],
      night: m.daily.temperature_2m_min[i],
      eve: (m.daily.temperature_2m_max[i] + m.daily.temperature_2m_min[i]) / 2,
      morn: m.daily.temperature_2m_min[i] + 1,
    },
    feels_like: {
      day: m.daily.apparent_temperature_max[i],
      night: m.daily.apparent_temperature_min[i],
      eve: m.daily.apparent_temperature_min[i],
      morn: m.daily.apparent_temperature_min[i],
    },
    humidity: 60,
    wind_speed: m.daily.wind_speed_10m_max[i],
    wind_deg: m.daily.wind_direction_10m_dominant[i],
    weather: [wmoToCondition(m.daily.weather_code[i], 1)],
    pop: (m.daily.precipitation_probability_max[i] ?? 0) / 100,
    clouds: 50,
    uvi: m.daily.uv_index_max[i] ?? 0,
    rain: m.daily.precipitation_sum?.[i],
    moon_phase: m.daily.moon_phase?.[i] ?? 0,
  }));

  // Air quality
  let airQuality: AirQuality | undefined;
  if (airRes.status === 'fulfilled') {
    const aqData = airRes.value.data?.list?.[0];
    if (aqData) {
      airQuality = {
        aqi: aqData.main.aqi,
        components: aqData.components,
      };
    }
  }

  return { city: cityInfo, current, hourly, daily, airQuality };
}
