import { Injectable, BadRequestException } from '@nestjs/common';
import { WeatherResponse } from './weather.types';

@Injectable()
export class WeatherService {
  private readonly apiKey = process.env.WEATHER_API_KEY || '';
  private readonly defaultCity = process.env.WEATHER_DEFAULT_CITY || 'La Paz';
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  async getWeather(city?: string): Promise<WeatherResponse> {
    const targetCity = city?.trim() || this.defaultCity;

    const url = `${this.baseUrl}?q=${encodeURIComponent(targetCity)}&appid=${this.apiKey}&units=metric&lang=es`;

    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new BadRequestException(
        body.message || `Failed to fetch weather for "${targetCity}"`,
      );
    }

    const data = await response.json();

    return {
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  }
}
