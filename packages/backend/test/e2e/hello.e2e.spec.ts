import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, clearUsersStore } from '../helpers/test-app';

describe('Hello (e2e)', () => {
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

  describe('GET /api/hello', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/api/hello').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/hello')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 200 with { message: "Hello world" } with valid token', async () => {
      // First signup to get a valid token
      const signupRes = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'hello@example.com', password: 'password123' });

      const token = signupRes.body.accessToken;

      const res = await request(app.getHttpServer())
        .get('/api/hello')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toEqual({ message: 'Hello world' });
    });
  });
});
