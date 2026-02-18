import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthService } from '../../src/auth/auth.service';
import { FirestoreService } from '../../src/firestore/firestore.service';

describe('AuthService', () => {
  let service: AuthService;
  let dataSource: { query: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let firestoreService: { saveUser: jest.Mock; getUserByEmail: jest.Mock; getUserById: jest.Mock };

  beforeEach(async () => {
    dataSource = { query: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('mock-token') };
    firestoreService = {
      saveUser: jest.fn().mockResolvedValue(undefined),
      getUserByEmail: jest.fn().mockResolvedValue(null),
      getUserById: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DataSource, useValue: dataSource },
        { provide: JwtService, useValue: jwtService },
        { provide: FirestoreService, useValue: firestoreService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should create a user correctly with all fields', async () => {
      dataSource.query
        .mockResolvedValueOnce([]) // SELECT id – email not found
        .mockResolvedValueOnce([
          {
            id: '1',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ]); // INSERT RETURNING

      const result = await service.signUp({
        email: 'Test@Example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.user).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result.accessToken).toBe('mock-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
      });
    });

    it('should save user to Firestore after creating in PostgreSQL', async () => {
      dataSource.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: '1',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ]);

      await service.signUp({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(firestoreService.saveUser).toHaveBeenCalledWith({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should create a user with only email and password', async () => {
      dataSource.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: '2',
            email: 'test@example.com',
            first_name: null,
            last_name: null,
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ]);

      const result = await service.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.firstName).toBeNull();
      expect(result.user.lastName).toBeNull();
      expect(result.accessToken).toBe('mock-token');
    });

    it('should trim and lowercase the email', async () => {
      dataSource.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: '3',
            email: 'spaces@example.com',
            first_name: null,
            last_name: null,
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ]);

      await service.signUp({
        email: '  Spaces@Example.COM  ',
        password: 'password123',
      });

      expect(dataSource.query).toHaveBeenCalledWith(
        'SELECT id FROM users WHERE email = $1',
        ['spaces@example.com'],
      );
    });

    it('should throw BadRequestException if email is missing', async () => {
      await expect(
        service.signUp({ email: '', password: 'password123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is missing', async () => {
      await expect(
        service.signUp({ email: 'test@example.com', password: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is less than 8 characters', async () => {
      await expect(
        service.signUp({ email: 'test@example.com', password: 'short' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email already exists', async () => {
      dataSource.query.mockResolvedValueOnce([{ id: '1' }]);

      await expect(
        service.signUp({ email: 'existing@example.com', password: 'password123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return { user, accessToken }', async () => {
      dataSource.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: '4',
            email: 'test@example.com',
            first_name: null,
            last_name: null,
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ]);

      const result = await service.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('login', () => {
    const setupUserForLogin = (password: string) => {
      const crypto = require('crypto');
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      const storedHash = `${salt}.${hash}`;

      return {
        id: '1',
        email: 'test@example.com',
        password: storedHash,
        first_name: 'John',
        last_name: 'Doe',
      };
    };

    it('should login correctly and return user + token', async () => {
      const user = setupUserForLogin('password123');
      dataSource.query.mockResolvedValueOnce([user]);
      firestoreService.getUserByEmail.mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.accessToken).toBe('mock-token');
    });

    it('should read user from Firestore on login', async () => {
      const user = setupUserForLogin('password123');
      dataSource.query.mockResolvedValueOnce([user]);

      await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(firestoreService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should fallback to PostgreSQL data when Firestore returns null', async () => {
      const user = setupUserForLogin('password123');
      dataSource.query.mockResolvedValueOnce([user]);
      firestoreService.getUserByEmail.mockResolvedValueOnce(null);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.firstName).toBe('John');
      expect(result.user.lastName).toBe('Doe');
    });

    it('should trim and lowercase the email', async () => {
      const user = setupUserForLogin('password123');
      dataSource.query.mockResolvedValueOnce([user]);

      await service.login({
        email: '  Test@Example.COM  ',
        password: 'password123',
      });

      expect(dataSource.query).toHaveBeenCalledWith(
        'SELECT id, email, password, first_name, last_name FROM users WHERE email = $1',
        ['test@example.com'],
      );
    });

    it('should throw BadRequestException if email is missing', async () => {
      await expect(
        service.login({ email: '', password: 'password123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is missing', async () => {
      await expect(
        service.login({ email: 'test@example.com', password: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if email does not exist', async () => {
      dataSource.query.mockResolvedValueOnce([]);

      await expect(
        service.login({ email: 'nonexistent@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = setupUserForLogin('password123');
      dataSource.query.mockResolvedValueOnce([user]);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyPassword (private, edge cases)', () => {
    it('should return false if stored password has no salt/hash separator', () => {
      const result = (service as any).verifyPassword('password', 'noseparator');
      expect(result).toBe(false);
    });

    it('should return false if stored hash has different length than computed hash', () => {
      const result = (service as any).verifyPassword('password', 'abcd.ef');
      expect(result).toBe(false);
    });
  });
});
