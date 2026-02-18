import { Test, TestingModule } from '@nestjs/testing';
import { FirestoreService } from '../../src/firestore/firestore.service';

const mockDocData = new Map<string, Record<string, unknown>>();

jest.mock('firebase-admin', () => {
  const apps: unknown[] = [];

  const mockDoc = (id: string) => ({
    set: jest.fn().mockImplementation((data: Record<string, unknown>) => {
      mockDocData.set(id, data);
      return Promise.resolve();
    }),
    get: jest.fn().mockImplementation(() => {
      const data = mockDocData.get(id);
      return Promise.resolve({
        exists: !!data,
        id,
        data: () => data ?? undefined,
      });
    }),
  });

  const mockCollection = jest.fn().mockReturnValue({
    doc: jest.fn().mockImplementation((id: string) => mockDoc(id)),
    where: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation(() => {
          const results: { id: string; data: () => Record<string, unknown> }[] = [];
          for (const [id, data] of mockDocData.entries()) {
            results.push({ id, data: () => data });
          }
          return Promise.resolve({
            empty: results.length === 0,
            docs: results,
          });
        }),
      }),
    }),
  });

  return {
    get apps() { return apps; },
    __resetApps: () => { apps.length = 0; },
    __pushApp: () => { apps.push({}); },
    initializeApp: jest.fn(),
    credential: { cert: jest.fn().mockReturnValue('mock-credential') },
    firestore: jest.fn().mockReturnValue({ collection: mockCollection }),
  };
});

import * as admin from 'firebase-admin';

type AdminMock = typeof admin & {
  __resetApps: () => void;
  __pushApp: () => void;
};

describe('FirestoreService', () => {
  let service: FirestoreService;
  const adminMock = admin as AdminMock;

  beforeEach(async () => {
    mockDocData.clear();
    adminMock.__resetApps();
    (admin.initializeApp as jest.Mock).mockClear();

    process.env.FIREBASE_PROJECT_ID = 'test-project';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '';

    const module: TestingModule = await Test.createTestingModule({
      providers: [FirestoreService],
    }).compile();

    service = module.get<FirestoreService>(FirestoreService);
    service.onModuleInit();
  });

  describe('onModuleInit', () => {
    it('should initialize firebase-admin with projectId only when no credentials path', () => {
      expect(admin.initializeApp).toHaveBeenCalledWith({ projectId: 'test-project' });
    });

    it('should not re-initialize if app already exists', () => {
      adminMock.__pushApp();
      (admin.initializeApp as jest.Mock).mockClear();

      service.onModuleInit();

      expect(admin.initializeApp).not.toHaveBeenCalled();
    });

    it('should initialize with credentials from absolute path', () => {
      adminMock.__resetApps();
      (admin.initializeApp as jest.Mock).mockClear();
      const absPath = require('path').resolve(__dirname, '..', 'helpers', 'fake-service-account.json');
      process.env.GOOGLE_APPLICATION_CREDENTIALS = absPath;

      service.onModuleInit();

      expect(admin.initializeApp).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'test-project' }),
      );
      process.env.GOOGLE_APPLICATION_CREDENTIALS = '';
    });

    it('should resolve relative credentials path from service directory', () => {
      adminMock.__resetApps();
      (admin.initializeApp as jest.Mock).mockClear();
      process.env.GOOGLE_APPLICATION_CREDENTIALS = './test/helpers/fake-service-account.json';

      service.onModuleInit();

      expect(admin.initializeApp).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'test-project' }),
      );
      process.env.GOOGLE_APPLICATION_CREDENTIALS = '';
    });
  });

  describe('saveUser', () => {
    it('should save user to Firestore users collection', async () => {
      await service.saveUser({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      expect(mockDocData.get('user-1')).toEqual({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should save user with null names', async () => {
      await service.saveUser({
        id: 'user-2',
        email: 'test@example.com',
        firstName: null,
        lastName: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      expect(mockDocData.get('user-2')).toEqual({
        email: 'test@example.com',
        firstName: null,
        lastName: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('getUserById', () => {
    it('should return user when document exists', async () => {
      mockDocData.set('user-1', {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const result = await service.getUserById('user-1');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should return null when document does not exist', async () => {
      const result = await service.getUserById('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null firstName/lastName when fields are undefined', async () => {
      mockDocData.set('user-3', {
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const result = await service.getUserById('user-3');

      expect(result?.firstName).toBeNull();
      expect(result?.lastName).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      mockDocData.set('user-1', {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const result = await service.getUserByEmail('test@example.com');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should return null when no user found by email', async () => {
      const result = await service.getUserByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });

    it('should return null firstName/lastName when fields are undefined', async () => {
      mockDocData.set('user-4', {
        email: 'no-names@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const result = await service.getUserByEmail('no-names@example.com');

      expect(result?.firstName).toBeNull();
      expect(result?.lastName).toBeNull();
    });
  });
});
