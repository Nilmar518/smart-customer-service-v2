import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthService } from '../../src/auth/auth.service';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthGuard } from '../../src/auth/auth.guard';
import { HelloController } from '../../src/hello/hello.controller';

export type FakeUser = {
  id: string;
  email: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
};

const usersStore = new Map<string, FakeUser>();
let idCounter = 0;

function createMockDataSource(): Partial<DataSource> {
  return {
    query: jest.fn().mockImplementation((sql: string, params?: unknown[]) => {
      const normalised = sql.replace(/\s+/g, ' ').trim();

      // DatabaseInitService queries – return empty / ok
      if (
        normalised.startsWith('SELECT 1') ||
        normalised.startsWith('CREATE EXTENSION') ||
        normalised.startsWith('CREATE TABLE') ||
        normalised.startsWith('ALTER TABLE') ||
        normalised.startsWith('DROP SCHEMA') ||
        normalised.startsWith('CREATE SCHEMA') ||
        normalised.startsWith('GRANT ALL')
      ) {
        return Promise.resolve([]);
      }

      // SELECT id FROM users WHERE email = $1
      if (normalised.includes('SELECT id FROM users WHERE email')) {
        const email = params?.[0] as string;
        const user = [...usersStore.values()].find((u) => u.email === email);
        return Promise.resolve(user ? [{ id: user.id }] : []);
      }

      // INSERT INTO users ... RETURNING ...
      if (normalised.startsWith('INSERT INTO users')) {
        const email = params?.[0] as string;
        const password = params?.[1] as string;
        const firstName = (params?.[2] as string) || null;
        const lastName = (params?.[3] as string) || null;
        idCounter++;
        const newUser: FakeUser = {
          id: String(idCounter),
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
        };
        usersStore.set(email, newUser);
        return Promise.resolve([
          {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            created_at: newUser.created_at,
          },
        ]);
      }

      // SELECT id, email, password, first_name, last_name FROM users WHERE email = $1
      if (
        normalised.includes('SELECT id, email, password, first_name, last_name FROM users')
      ) {
        const email = params?.[0] as string;
        const user = [...usersStore.values()].find((u) => u.email === email);
        return Promise.resolve(user ? [user] : []);
      }

      return Promise.resolve([]);
    }),
  };
}

export function getUsersStore(): Map<string, FakeUser> {
  return usersStore;
}

export function clearUsersStore(): void {
  usersStore.clear();
  idCounter = 0;
}

export async function createTestApp(): Promise<INestApplication> {
  const mockDataSource = createMockDataSource();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      JwtModule.register({
        secret: 'test-secret',
        signOptions: { expiresIn: '15m' },
      }),
    ],
    controllers: [AuthController, HelloController],
    providers: [
      AuthService,
      AuthGuard,
      { provide: DataSource, useValue: mockDataSource },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();

  return app;
}
