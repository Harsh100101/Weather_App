import { motion } from 'framer-motion';
import { Heart, MapPin, Thermometer, Droplets, Wind, Eye, Gauge, Sun, Sunset } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatTemp, formatTempWithUnit, getWindDirection, formatTime, isNightTime } from '../../utils/weather';
import type { WeatherData } from '../../types/weather';

interface Props {
  data: WeatherData;
  theme: 'dark' | 'light';
}

export default function CurrentWeather({ data, theme }: Props) {
  const { unit, toggleFavorite, isFavorite } = useAppStore();
  const { city, current } = data;
  const isDark = theme === 'dark';
  const fav = isFavorite(city);
  const night = isNightTime(current.dt + current.timezone_offset, current.sunrise + current.timezone_offset, current.sunset + current.timezone_offset);

  const iconUrl = `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`;
  const offset = current.timezone_offset;

  const stats = [
    { icon: Thermometer, label: 'Feels Like', value: formatTempWithUnit(current.feels_like, unit) },
    { icon: Droplets, label: 'Humidity', value: `${current.humidity}%` },
    { icon: Wind, label: 'Wind', value: `${Math.round(current.wind_speed)} km/h ${getWindDirection(current.wind_deg)}` },
    { icon: Eye, label: 'Visibility', value: `${current.visibility.toFixed(1)} km` },
    { icon: Gauge, label: 'Pressure', value: `${Math.round(current.pressure)} hPa` },
    { icon: Sun, label: 'UV Index', value: current.uvi ? current.uvi.toFixed(1) : 'N/A' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Main current weather card */}
      <div className={`rounded-3xl p-6 sm:p-8 mb-4 relative overflow-hidden ${
        isDark ? 'glass' : 'glass-light'
      }`}>
        {/* Location & favorite */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="opacity-60 shrink-0 mt-0.5" />
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{city.name}</h2>
              <p className={`text-sm opacity-60 ${isDark ? 'text-white' : 'text-black'}`}>
                {[city.state, city.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleFavorite(city)}
            className={`p-2 rounded-xl transition-all duration-200 ${
              fav
                ? 'text-rose-400 bg-rose-400/20'
                : isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/10' : 'text-black/40 hover:text-black/70 hover:bg-black/10'
            }`}
          >
            <Heart size={20} fill={fav ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Temperature & icon */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`text-7xl sm:text-8xl font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-black'}`}>
              {formatTemp(current.temp, unit)}
              <span className="text-4xl opacity-50">{unit === 'celsius' ? 'C' : 'F'}</span>
            </div>
            <p className={`text-lg font-medium mt-2 capitalize ${isDark ? 'text-white/80' : 'text-black/70'}`}>
              {current.weather[0].description}
            </p>
            <p className={`text-sm opacity-60 ${isDark ? 'text-white' : 'text-black'}`}>
              H:{formatTemp(current.temp_max, unit)} · L:{formatTemp(current.temp_min, unit)}
            </p>
          </div>
          <div className="relative">
            <img
              src={iconUrl}
              alt={current.weather[0].description}
              className={`w-28 h-28 sm:w-36 sm:h-36 drop-shadow-2xl ${night ? 'opacity-90' : ''}`}
              style={{ filter: 'drop-shadow(0 0 20px rgba(99,179,237,0.4))' }}
            />
          </div>
        </div>

        {/* Sunrise / sunset */}
        <div className={`flex gap-4 mb-6 text-sm ${isDark ? 'text-white/70' : 'text-black/60'}`}>
          <div className="flex items-center gap-1.5">
            <Sun size={15} className="text-amber-400" />
            <span>{formatTime(current.sunrise, offset)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sunset size={15} className="text-orange-400" />
            <span>{formatTime(current.sunset, offset)}</span>
          </div>
          {current.dew_point !== undefined && (
            <div className="flex items-center gap-1.5">
              <Droplets size={15} className="text-sky-400" />
              <span>Dew {formatTemp(current.dew_point, unit)}</span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className={`rounded-2xl p-3 ${isDark ? 'bg-white/5 border border-white/8' : 'bg-black/5 border border-black/8'}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={13} className="opacity-50" />
                <span className={`text-xs opacity-50 font-medium ${isDark ? 'text-white' : 'text-black'}`}>{label}</span>
              </div>
              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
