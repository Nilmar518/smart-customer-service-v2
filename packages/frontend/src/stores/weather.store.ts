import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type WeatherData = {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

type WeatherState = {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string;
  fetchWeather: (token: string, city?: string) => Promise<void>;
  clearWeather: () => void;
};

export const useWeatherStore = create<WeatherState>((set) => ({
  weatherData: null,
  isLoading: false,
  error: '',

  fetchWeather: async (token: string, city?: string) => {
    set({ isLoading: true, error: '' });
    try {
      const url = city
        ? `${API_URL}/api/weather?city=${encodeURIComponent(city)}`
        : `${API_URL}/api/weather`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to fetch weather');
      }

      const data = await res.json();
      set({ weatherData: data, isLoading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather';
      set({ error: errorMessage, isLoading: false, weatherData: null });
    }
  },

  clearWeather: () => {
    set({ weatherData: null, isLoading: false, error: '' });
  },
}));
