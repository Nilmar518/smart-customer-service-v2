"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const database_init_service_1 = require("./database-init.service");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                ...(process.env.INSTANCE_UNIX_SOCKET
                    ? {
                        host: process.env.INSTANCE_UNIX_SOCKET,
                    }
                    : {
                        host: process.env.DB_HOST || 'localhost',
                        port: parseInt(process.env.DB_PORT || '5432', 10),
                    }),
                username: (process.env.DB_USER || 'postgres').trim(),
                password: (process.env.DB_PASSWORD || 'postgres').trim(),
                database: (process.env.DB_NAME || 'smart_customer_service').trim(),
                synchronize: false,
                logging: false,
            }),
        ],
        providers: [database_init_service_1.DatabaseInitService],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map