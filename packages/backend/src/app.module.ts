import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HelloModule } from './hello/hello.module';

@Module({
imports: [DatabaseModule, AuthModule, HelloModule],
  exports: [DatabaseModule, AuthModule, HelloModule],
})
export class AppModule {}
