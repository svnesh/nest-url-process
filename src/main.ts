import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
      },
      consumer: {
        groupId: 'url-listener-group',
      },
      retry: {
        retries: 10,
        initialRetryTime: 300,
      },
    },
  });
  await app.startAllMicroservices();
  const port = configService.get('PORT') || 3000;
  await app.listen(port ?? 3000);
}
bootstrap();
