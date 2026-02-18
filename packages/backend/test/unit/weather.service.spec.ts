import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WeatherService } from '../../src/weather/weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let fetchSpy: jest.SpyInstance;

  const mockWeatherData = {
    name: 'La Paz',
    main: { temp: 12.5, humidity: 45 },
    weather: [{ description: 'cielo claro', icon: '01d' }],
    wind: { speed: 3.2 },
  };

  beforeEach(async () => {
    process.env.WEATHER_API_KEY = 'test-api-key';
    process.env.WEATHER_DEFAULT_CITY = 'La Paz';

    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherService],
    }).compile();

    service = module.get<WeatherService>(WeatherService);

    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('getWeather', () => {
    it('should return weather data for a given city', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      const result = await service.getWeather('La Paz');

      expect(result).toEqual({
        city: 'La Paz',
        temperature: 12.5,
        description: 'cielo claro',
        icon: '01d',
        humidity: 45,
        windSpeed: 3.2,
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('q=La%20Paz'),
      );
    });

    it('should use default city when no city is provided', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      await service.getWeather();

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('q=La%20Paz'),
      );
    });

    it('should use default city when city is empty string', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      await service.getWeather('   ');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('q=La%20Paz'),
      );
    });

    it('should throw BadRequestException when API returns error with message', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'city not found' }),
      });

      await expect(service.getWeather('InvalidCity')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getWeather('InvalidCity')).rejects.toThrow(
        'city not found',
      );
    });

    it('should throw BadRequestException with fallback message when API returns no message', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error('parse error')),
      });

      await expect(service.getWeather('BadCity')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getWeather('BadCity')).rejects.toThrow(
        'Failed to fetch weather for "BadCity"',
      );
    });

    it('should include api key in request URL', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      await service.getWeather('La Paz');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('appid=test-api-key'),
      );
    });

    it('should request metric units and spanish language', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      await service.getWeather('La Paz');

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('units=metric');
      expect(url).toContain('lang=es');
    });
  });

  describe('env var defaults', () => {
    it('should use empty string for apiKey and La Paz for defaultCity when env vars are missing', async () => {
      delete process.env.WEATHER_API_KEY;
      delete process.env.WEATHER_DEFAULT_CITY;

      const module: TestingModule = await Test.createTestingModule({
        providers: [WeatherService],
      }).compile();

      const svc = module.get<WeatherService>(WeatherService);

      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWeatherData),
      });

      await svc.getWeather();

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('appid=&');
      expect(url).toContain('q=La%20Paz');
    });
  });
});
