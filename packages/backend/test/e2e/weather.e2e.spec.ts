import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, clearUsersStore } from '../helpers/test-app';

describe('Weather (e2e)', () => {
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

  const signUpAndGetToken = async (): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: 'weather@example.com', password: 'password123' });
    return res.body.accessToken;
  };

  describe('GET /api/weather', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/api/weather')
        .expect(401);
    });

    it('should return weather data with valid token', async () => {
      const token = await signUpAndGetToken();

      const res = await request(app.getHttpServer())
        .get('/api/weather')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('city');
      expect(res.body).toHaveProperty('temperature');
      expect(res.body).toHaveProperty('description');
      expect(res.body).toHaveProperty('icon');
      expect(res.body).toHaveProperty('humidity');
      expect(res.body).toHaveProperty('windSpeed');
    });

    it('should return weather for a specific city', async () => {
      const token = await signUpAndGetToken();

      const res = await request(app.getHttpServer())
        .get('/api/weather?city=Cochabamba')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.city).toBe('Cochabamba');
    });

    it('should return default city weather when no city param', async () => {
      const token = await signUpAndGetToken();

      const res = await request(app.getHttpServer())
        .get('/api/weather')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.city).toBe('La Paz');
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/weather')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
