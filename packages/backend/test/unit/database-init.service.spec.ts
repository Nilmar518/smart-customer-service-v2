import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { DatabaseInitService } from '../../src/database/database-init.service';

describe('DatabaseInitService', () => {
  let service: DatabaseInitService;
  let dataSource: { query: jest.Mock };
  const originalEnv = process.env;

  beforeEach(async () => {
    dataSource = { query: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseInitService,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<DatabaseInitService>(DatabaseInitService);
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should execute SELECT 1 to verify connection', async () => {
    await service.onApplicationBootstrap();

    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('should create the users table if it does not exist', async () => {
    await service.onApplicationBootstrap();

    const calls = dataSource.query.mock.calls.map((c: any[]) =>
      c[0].replace(/\s+/g, ' ').trim(),
    );
    expect(calls.some((c: string) => c.includes('CREATE TABLE IF NOT EXISTS users'))).toBe(
      true,
    );
  });

  it('should execute ALTER TABLE to add columns', async () => {
    await service.onApplicationBootstrap();

    const calls = dataSource.query.mock.calls.map((c: any[]) =>
      c[0].replace(/\s+/g, ' ').trim(),
    );
    expect(
      calls.some((c: string) => c.includes('ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name')),
    ).toBe(true);
    expect(
      calls.some((c: string) => c.includes('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name')),
    ).toBe(true);
    expect(
      calls.some((c: string) => c.includes('ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at')),
    ).toBe(true);
    expect(
      calls.some((c: string) => c.includes('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at')),
    ).toBe(true);
  });

  it('should execute DROP SCHEMA + CREATE SCHEMA + GRANTs if CLEAN_DB_ON_START is "true"', async () => {
    process.env.CLEAN_DB_ON_START = 'true';

    await service.onApplicationBootstrap();

    const calls = dataSource.query.mock.calls.map((c: any[]) =>
      c[0].replace(/\s+/g, ' ').trim(),
    );
    expect(calls.some((c: string) => c.includes('DROP SCHEMA public CASCADE'))).toBe(true);
    expect(calls.some((c: string) => c.includes('CREATE SCHEMA public'))).toBe(true);
    expect(
      calls.some((c: string) => c.includes('GRANT ALL ON SCHEMA public TO appuser')),
    ).toBe(true);
    expect(
      calls.some((c: string) => c.includes('GRANT ALL ON SCHEMA public TO public')),
    ).toBe(true);
  });

  it('should NOT execute cleanSchema if CLEAN_DB_ON_START is not "true"', async () => {
    process.env.CLEAN_DB_ON_START = 'false';

    await service.onApplicationBootstrap();

    const calls = dataSource.query.mock.calls.map((c: any[]) =>
      c[0].replace(/\s+/g, ' ').trim(),
    );
    expect(calls.some((c: string) => c.includes('DROP SCHEMA'))).toBe(false);
  });

  it('should create uuid-ossp extension', async () => {
    await service.onApplicationBootstrap();

    const calls = dataSource.query.mock.calls.map((c: any[]) =>
      c[0].replace(/\s+/g, ' ').trim(),
    );
    expect(
      calls.some((c: string) => c.includes('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')),
    ).toBe(true);
  });
});
