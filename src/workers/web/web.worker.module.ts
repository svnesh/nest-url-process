import { Module } from '@nestjs/common';
import { URLWebWorker } from './url-web.worker';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [URLWebWorker],
  imports: [],
  providers: [PrismaService],
})
export class WebWorkerModule {}
