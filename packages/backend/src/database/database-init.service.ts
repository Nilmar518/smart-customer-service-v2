import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseInitService implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.ensureConnection();
    if (process.env.CLEAN_DB_ON_START === 'true') {
      await this.cleanSchema();
    }
    await this.ensureSchema();
  }

  private async ensureConnection() {
    await this.dataSource.query('SELECT 1');
  }

  private async ensureSchema() {
    await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        email text UNIQUE NOT NULL,
        password text NOT NULL,
        first_name text,
        last_name text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await this.dataSource.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;');
    await this.dataSource.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;');
    await this.dataSource.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();');
    await this.dataSource.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();');
  }

  private async cleanSchema() {
    await this.dataSource.query('DROP SCHEMA public CASCADE;');
    await this.dataSource.query('CREATE SCHEMA public;');
    await this.dataSource.query('GRANT ALL ON SCHEMA public TO appuser;');
    await this.dataSource.query('GRANT ALL ON SCHEMA public TO public;');
  }
}
