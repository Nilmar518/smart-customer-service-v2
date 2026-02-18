import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirestoreUser } from './firestore.types';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private db!: admin.firestore.Firestore;
  private readonly collectionName = 'users';

  onModuleInit(): void {
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (credPath) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require(credPath.startsWith('.')
          ? require('path').resolve(__dirname, '..', '..', credPath)
          : credPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId,
        });
      } else {
        admin.initializeApp({ projectId });
      }
    }
    this.db = admin.firestore();
  }

  async saveUser(user: FirestoreUser): Promise<void> {
    await this.db.collection(this.collectionName).doc(user.id).set({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    });
  }

  async getUserByEmail(email: string): Promise<FirestoreUser | null> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      createdAt: data.createdAt,
    };
  }

  async getUserById(id: string): Promise<FirestoreUser | null> {
    const doc = await this.db.collection(this.collectionName).doc(id).get();

    if (!doc.exists) return null;

    const data = doc.data()!;
    return {
      id: doc.id,
      email: data.email,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      createdAt: data.createdAt,
    };
  }
}
