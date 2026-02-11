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
exports.DatabaseInitService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DatabaseInitService = class DatabaseInitService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onApplicationBootstrap() {
        await this.ensureConnection();
        if (process.env.CLEAN_DB_ON_START === 'true') {
            await this.cleanSchema();
        }
        await this.ensureSchema();
    }
    async ensureConnection() {
        await this.dataSource.query('SELECT 1');
    }
    async ensureSchema() {
        await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        email text UNIQUE NOT NULL,
        password text NOT NULL,
        first_name text,
        last_name text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);
        await this.dataSource.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;');
        await this.dataSource.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;');
        await this.dataSource.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();');
        await this.dataSource.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();');
    }
    async cleanSchema() {
        await this.dataSource.query('DROP SCHEMA public CASCADE;');
        await this.dataSource.query('CREATE SCHEMA public;');
        await this.dataSource.query('GRANT ALL ON SCHEMA public TO appuser;');
        await this.dataSource.query('GRANT ALL ON SCHEMA public TO public;');
    }
};
exports.DatabaseInitService = DatabaseInitService;
exports.DatabaseInitService = DatabaseInitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatabaseInitService);
//# sourceMappingURL=database-init.service.js.map