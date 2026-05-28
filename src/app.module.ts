import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlfeederModule } from './urlfeeder/urlfeeder.module';
import { ConfigModule } from '@nestjs/config';
import { WebWorkerModule } from './workers/web/web.worker.module';
import { ImageWorkerModule } from './workers/image/image.worker.module';
import { PdfWorkerModule } from './workers/pdf/pdf.worker.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
    }),
    KafkaModule,
    UrlfeederModule,
    WebWorkerModule,
    PdfWorkerModule,
    ImageWorkerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
