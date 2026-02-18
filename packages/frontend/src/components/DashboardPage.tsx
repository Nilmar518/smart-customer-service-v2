import HelloPanel from './HelloPanel';
import { WeatherPanel } from './WeatherPanel';
import { useAuthStore } from '../stores/auth.store';
import { useWeatherStore } from '../stores/weather.store';

export default function DashboardPage() {
  const clearToken = useAuthStore((s) => s.clearToken);
  const clearWeather = useWeatherStore((s) => s.clearWeather);

  const handleLogout = (): void => {
    clearToken();
    clearWeather();
  };

  return (
    <>
      <div className="tabs">
        <button className="active">Dashboard</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <WeatherPanel />
      <HelloPanel />
    </>
  );
}
