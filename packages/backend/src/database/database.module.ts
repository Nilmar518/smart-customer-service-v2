import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseInitService } from './database-init.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.INSTANCE_UNIX_SOCKET
        ? {
            host: process.env.INSTANCE_UNIX_SOCKET,
          }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
          }),
      username: (process.env.DB_USER || 'postgres').trim(),
      password: (process.env.DB_PASSWORD || 'postgres').trim(),
      database: (process.env.DB_NAME || 'smart_customer_service').trim(),
      synchronize: false,
      logging: false,
    }),
  ],
  providers: [DatabaseInitService],
})
export class DatabaseModule {}
