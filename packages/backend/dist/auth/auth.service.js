"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(dataSource, jwtService) {
        this.dataSource = dataSource;
        this.jwtService = jwtService;
    }
    async signUp(dto) {
        const email = dto.email?.trim().toLowerCase();
        const password = dto.password?.trim();
        if (!email || !password || password.length < 8) {
            throw new common_1.BadRequestException('Email and password (min 8 chars) are required');
        }
        const existing = await this.dataSource.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.length > 0) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const passwordHash = this.hashPassword(password);
        const result = await this.dataSource.query(`
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, created_at
      `, [email, passwordHash, dto.firstName || null, dto.lastName || null]);
        const user = result[0];
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
    async login(dto) {
        const email = dto.email?.trim().toLowerCase();
        const password = dto.password?.trim();
        if (!email || !password) {
            throw new common_1.BadRequestException('Email and password are required');
        }
        const rows = await this.dataSource.query('SELECT id, email, password, first_name, last_name FROM users WHERE email = $1', [email]);
        if (rows.length === 0) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = rows[0];
        const valid = this.verifyPassword(password, user.password);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = this.signToken(user.id, user.email);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
            },
            accessToken: token,
        };
    }
    signToken(userId, email) {
        return this.jwtService.sign({ sub: userId, email });
    }
    hashPassword(password) {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = (0, crypto_1.scryptSync)(password, salt, 64).toString('hex');
        return `${salt}.${hash}`;
    }
    verifyPassword(password, stored) {
        const [salt, hash] = stored.split('.');
        if (!salt || !hash)
            return false;
        const hashed = (0, crypto_1.scryptSync)(password, salt, 64);
        const storedBuffer = Buffer.from(hash, 'hex');
        if (storedBuffer.length !== hashed.length)
            return false;
        return (0, crypto_1.timingSafeEqual)(storedBuffer, hashed);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map