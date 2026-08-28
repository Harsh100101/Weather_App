import { useQuery } from '@tanstack/react-query';
import { fetchWeatherData, reverseGeocode } from '../services/weatherApi';
import { useAppStore } from '../store/useAppStore';
import type { City } from '../types/weather';

export function useWeather(city: City | null) {
  return useQuery({
    queryKey: ['weather', city?.lat, city?.lon],
    queryFn: () => fetchWeatherData(city!.lat, city!.lon, city!),
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useGeolocation() {
  const setSelectedCity = useAppStore((s) => s.setSelectedCity);

  const detect = () => {
    return new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            setSelectedCity(city);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        (err) => reject(err),
        { timeout: 10000 }
      );
    });
  };

  return { detect };
}
