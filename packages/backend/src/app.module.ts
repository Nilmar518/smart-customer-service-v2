import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { FirestoreModule } from './firestore/firestore.module';
import { HelloModule } from './hello/hello.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [DatabaseModule, FirestoreModule, AuthModule, HelloModule, WeatherModule],
  exports: [DatabaseModule, FirestoreModule, AuthModule, HelloModule, WeatherModule],
})
export class AppModule {}
