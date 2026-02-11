import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('hello')
export class HelloController {
  @UseGuards(AuthGuard)
  @Get()
  getHello() {
    return { message: 'Hello world' };
  }
}
