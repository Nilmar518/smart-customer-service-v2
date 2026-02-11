import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    // BEGIN COOKIE_AUTH (OPTIONAL)
    // If using httpOnly cookies, set cookie here instead of returning accessToken.
    // Example:
    // const data = await this.authService.login(body);
    // res.cookie('token', data.accessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    // return { user: data.user };
    // END COOKIE_AUTH (OPTIONAL)
    return this.authService.login(body);
  }
}
