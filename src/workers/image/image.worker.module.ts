import { Module } from '@nestjs/common';
import { ImageWorker } from './image.worker';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ImageWorker],
  imports: [],
  providers: [PrismaService],
})
export class ImageWorkerModule {}
