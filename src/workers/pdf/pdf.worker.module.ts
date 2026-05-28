import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PrismaService } from 'src/prisma.service';
import { PdfWorker } from './pdf.worker';

@Module({
  controllers: [PdfWorker],
  imports: [],
  providers: [PrismaService],
})
export class PdfWorkerModule {}
