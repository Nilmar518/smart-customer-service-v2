import { WeatherController } from '../../src/weather/weather.controller';
import { WeatherService } from '../../src/weather/weather.service';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: { getWeather: jest.Mock };

  const mockWeather = {
    city: 'La Paz',
    temperature: 12.5,
    description: 'cielo claro',
    icon: '01d',
    humidity: 45,
    windSpeed: 3.2,
  };

  beforeEach(() => {
    weatherService = {
      getWeather: jest.fn().mockResolvedValue(mockWeather),
    };
    controller = new WeatherController(weatherService as unknown as WeatherService);
  });

  describe('getWeather', () => {
    it('should call weatherService.getWeather with city and return result', async () => {
      const result = await controller.getWeather('La Paz');

      expect(weatherService.getWeather).toHaveBeenCalledWith('La Paz');
      expect(result).toEqual(mockWeather);
    });

    it('should call weatherService.getWeather with undefined when no city provided', async () => {
      const result = await controller.getWeather(undefined);

      expect(weatherService.getWeather).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockWeather);
    });
  });
});
