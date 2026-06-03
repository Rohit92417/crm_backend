// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client'; // Path from your setup
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. Initialize the DB pool
    const isLocal =
      process.env.DATABASE_URL?.includes('localhost') ||
      process.env.DATABASE_URL?.includes('127.0.0.1');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocal
        ? false
        : {
            rejectUnauthorized: false,
          },
    });

    // NOTE: rejectUnauthorized: false is scoped to this pool only.
    // Never set process.env.NODE_TLS_REJECT_UNAUTHORIZED globally — it disables
    // TLS verification for every outgoing HTTPS connection in the process.
    const adapter = new PrismaPg(pool);

    // 2. Pass adapter to parent (PrismaClient)
    super({ adapter });
  }

  // REPLACING THE ERROR LINE:
  async onModuleInit() {
    // This is the line that was throwing "Method not implemented"
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
