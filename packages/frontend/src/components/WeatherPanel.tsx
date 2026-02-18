import { useWeatherStore } from '../stores/weather.store';

export function WeatherPanel() {
  const { weatherData, isLoading, error } = useWeatherStore();

  if (isLoading) {
    return (
      <div className="weather">
        <h2>Clima</h2>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather">
        <h2>Clima</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="weather">
        <h2>Clima</h2>
        <p>No hay datos del clima disponibles.</p>
      </div>
    );
  }

  return (
    <div className="weather">
      <h2>Clima en {weatherData.city}</h2>
      <div className="weather-info">
        <div className="weather-main">
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
            alt={weatherData.description}
          />
          <div className="temperature">{weatherData.temperature.toFixed(1)}°C</div>
        </div>
        <p className="description">{weatherData.description}</p>
        <div className="weather-details">
          <p>💧 Humedad: {weatherData.humidity}%</p>
          <p>💨 Viento: {weatherData.windSpeed} m/s</p>
        </div>
      </div>
    </div>
  );
}
