import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || '';
    const [type, token] = authHeader.split(' ');

    // BEGIN COOKIE_AUTH (OPTIONAL)
    // If using httpOnly cookies, read token from cookies instead of Authorization header:
    // const token = request.cookies?.token;
    // const type = token ? 'Bearer' : '';
    // END COOKIE_AUTH (OPTIONAL)

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
