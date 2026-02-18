import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { FirestoreService } from '../firestore/firestore.service';
import { LoginDto, SignUpDto } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly firestoreService: FirestoreService,
  ) {}

  async signUp(dto: SignUpDto) {
    const email = dto.email?.trim().toLowerCase();
    const password = dto.password?.trim();

    if (!email || !password || password.length < 8) {
      throw new BadRequestException('Email and password (min 8 chars) are required');
    }

    const existing = await this.dataSource.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );

    if (existing.length > 0) {
      throw new BadRequestException('Email already exists');
    }

    const passwordHash = this.hashPassword(password);

    const result = await this.dataSource.query(
      `
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, created_at
      `,
      [email, passwordHash, dto.firstName || null, dto.lastName || null],
    );

    const user = result[0];

    await this.firestoreService.saveUser({
      id: user.id,
      email: user.email,
      firstName: user.first_name ?? null,
      lastName: user.last_name ?? null,
      createdAt: user.created_at,
    });

    const token = this.signToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
      },
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email?.trim().toLowerCase();
    const password = dto.password?.trim();

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const rows = await this.dataSource.query(
      'SELECT id, email, password, first_name, last_name FROM users WHERE email = $1',
      [email],
    );

    if (rows.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = rows[0];
    const valid = this.verifyPassword(password, user.password);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const firestoreUser = await this.firestoreService.getUserByEmail(user.email);

    const token = this.signToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: firestoreUser?.firstName ?? user.first_name,
        lastName: firestoreUser?.lastName ?? user.last_name,
      },
      accessToken: token,
    };
  }

  private signToken(userId: string, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}.${hash}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split('.');
    if (!salt || !hash) return false;

    const hashed = scryptSync(password, salt, 64);
    const storedBuffer = Buffer.from(hash, 'hex');

    if (storedBuffer.length !== hashed.length) return false;

    return timingSafeEqual(storedBuffer, hashed);
  }
}
