import { useEffect, useState } from 'react';
import type { GeoLocation } from '@/shared/types';

type UseGeolocationResult = {
  location: GeoLocation | null;
  countryCode: string;
  isLocating: boolean;
  geolocationDenied: boolean;
};

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [countryCode, setCountryCode] = useState('us');
  const [isLocating, setIsLocating] = useState(true);
  const [geolocationDenied, setGeolocationDenied] = useState(false);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setIsLocating(false);
      setGeolocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          if (data.countryCode) {
            setCountryCode(data.countryCode.toLowerCase());
          }
        } catch (error) {
          console.error('Error fetching country code:', error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error.message);
        setIsLocating(false);
        setGeolocationDenied(true);
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 }
    );
  }, []);

  return { location, countryCode, isLocating, geolocationDenied };
}
