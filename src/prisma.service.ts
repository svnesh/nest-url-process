import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter, log: ['query', 'error', 'warn'] });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected successfully');
  }
}
