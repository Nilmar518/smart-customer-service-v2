import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { signUp: jest.Mock; login: jest.Mock };

  beforeEach(() => {
    authService = {
      signUp: jest.fn(),
      login: jest.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  describe('signUp', () => {
    it('should call authService.signUp and return its result', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const expected = { user: { id: '1' }, accessToken: 'token' };
      authService.signUp.mockResolvedValue(expected);

      const result = await controller.signUp(dto);

      expect(authService.signUp).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login and return its result', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const expected = { user: { id: '1' }, accessToken: 'token' };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });
});
