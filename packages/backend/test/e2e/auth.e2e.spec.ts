import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, clearUsersStore, getUsersStore } from '../helpers/test-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    clearUsersStore();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a user and return 201 with { user, accessToken }', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'new@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe('new@example.com');
      expect(res.body.user.firstName).toBe('John');
      expect(res.body.user.lastName).toBe('Doe');
    });

    it('should return 400 if email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ password: 'password123' })
        .expect(400);
    });

    it('should return 400 if password is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('should return 400 if password is shorter than 8 characters', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'short' })
        .expect(400);
    });

    it('should return 400 if email already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'dup@example.com', password: 'password123' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'dup@example.com', password: 'password123' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'login@example.com', password: 'password123' });
    });

    it('should login and return 201 with { user, accessToken }', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'password123' })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should return 400 if email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ password: 'password123' })
        .expect(400);
    });

    it('should return 400 if password is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com' })
        .expect(400);
    });

    it('should return 401 if email does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);
    });

    it('should return 401 if password is incorrect', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 401 when stored password has no salt/hash separator', async () => {
      const store = getUsersStore();
      store.set('malformed@example.com', {
        id: '999',
        email: 'malformed@example.com',
        password: 'noseparator',
        first_name: null,
        last_name: null,
        created_at: new Date().toISOString(),
      });

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'malformed@example.com', password: 'password123' })
        .expect(401);
    });

    it('should return 401 when stored hash has different length than computed hash', async () => {
      const store = getUsersStore();
      store.set('shorthash@example.com', {
        id: '998',
        email: 'shorthash@example.com',
        password: 'abcdef0123456789abcdef0123456789.ef',
        first_name: null,
        last_name: null,
        created_at: new Date().toISOString(),
      });

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'shorthash@example.com', password: 'password123' })
        .expect(401);
    });
  });
});
