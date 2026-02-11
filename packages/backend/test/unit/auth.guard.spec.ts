import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../src/auth/auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: { verify: jest.Mock };

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    guard = new AuthGuard(jwtService as unknown as JwtService);
  });

  const createMockContext = (authHeader?: string) => {
    const request: any = { headers: {} };
    if (authHeader !== undefined) {
      request.headers['authorization'] = authHeader;
    }
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      request,
    };
  };

  it('should throw UnauthorizedException("Missing token") if no Authorization header', () => {
    const ctx = createMockContext();
    expect(() => guard.canActivate(ctx as any)).toThrow(
      new UnauthorizedException('Missing token'),
    );
  });

  it('should throw UnauthorizedException("Missing token") if header does not start with Bearer', () => {
    const ctx = createMockContext('Basic some-token');
    expect(() => guard.canActivate(ctx as any)).toThrow(
      new UnauthorizedException('Missing token'),
    );
  });

  it('should throw UnauthorizedException("Missing token") if token is empty after "Bearer "', () => {
    const ctx = createMockContext('Bearer ');
    expect(() => guard.canActivate(ctx as any)).toThrow(
      new UnauthorizedException('Missing token'),
    );
  });

  it('should throw UnauthorizedException("Invalid token") if token is invalid', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid');
    });
    const ctx = createMockContext('Bearer invalid-token');
    expect(() => guard.canActivate(ctx as any)).toThrow(
      new UnauthorizedException('Invalid token'),
    );
  });

  it('should return true and assign request.user if token is valid', () => {
    const payload = { sub: '1', email: 'test@example.com' };
    jwtService.verify.mockReturnValue(payload);
    const ctx = createMockContext('Bearer valid-token');
    const result = guard.canActivate(ctx as any);

    expect(result).toBe(true);
    expect(ctx.request.user).toEqual(payload);
  });
});
