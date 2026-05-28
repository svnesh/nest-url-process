import { Controller, Inject, Logger } from '@nestjs/common';
import { ConsumeMessageDto } from '../dto/consume.message.dto';
import { PrismaService } from 'src/prisma.service';
import { URLJobStatus } from 'src/shared/enum/enum';
import { WebHelper } from './web.helper';
import {
  ClientKafka,
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { KAFKA_CLIENT, KAFKA_TOPICS } from 'src/kafka/kafka.constants';
import { KafkaUrlFeederDto } from 'src/urlfeeder/dto/create-urlfeeder.dto';

@Controller()
export class URLWebWorker {
  private readonly logger = new Logger(URLWebWorker.name);

  constructor(
    @Inject(KAFKA_CLIENT) private readonly producer: ClientKafka,
    private readonly prismaService: PrismaService,
  ) {}

  @MessagePattern([KAFKA_TOPICS.WEB_TOPIC, KAFKA_TOPICS.WEB_RETRY_TOPIC])
  async processWebUrl(
    @Payload() payload: any,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const kafkaMessage = context.getMessage();
    const { action, data }: ConsumeMessageDto = payload;

    const job = await this.prismaService.url_collection.findUnique({
      where: { id: data.id },
    });
    if (job && job.status === URLJobStatus.SUCCESS) {
      this.logger.log(
        `URL with ID ${data.id} has already been processed successfully. Skipping.`,
      );
      return;
    }
    try {
      if (action === 'add') {
        //update status to processing
        await this.prismaService.url_collection.update({
          where: { id: data.id },
          data: {
            status: URLJobStatus.PROCESSING,
            retryCount: data.retryCount,
          },
        });
        const response = await WebHelper(data);
        if (response) {
          await this.prismaService.url_collection.update({
            where: { id: data.id },
            data: { status: URLJobStatus.SUCCESS },
          });
          await this.prismaService.processed_content.create({
            data: {
              urlJobId: data.id,
              contentType: data.type,
              extracted: JSON.stringify(response),
            },
          });
          this.logger.log(`Successfully processed: ${JSON.stringify(data)}`);
        } else {
          this.logger.error(`Entering retry job for URL ${data.url}.`);
          await this.retryFailedJob(data);
        }
      }
    } catch (error) {
      this.logger.error(`Entering retry job for URL ${data.url}.`);
      await this.retryFailedJob(data);
    }
  }

  async retryFailedJob(data: KafkaUrlFeederDto) {
    let kafkaDto = new KafkaUrlFeederDto();
    kafkaDto.id = data.id;
    kafkaDto.url = data.url;
    kafkaDto.type = data.type ? data.type : 'web';
    kafkaDto.retryCount = data.retryCount ? data.retryCount + 1 : 1;
    kafkaDto.createdAt = data.createdAt;

    if (data && data.retryCount < 3) {
      this.producer.emit(KAFKA_TOPICS.WEB_RETRY_TOPIC, {
        key: `order-${Date.now()}`,
        value: JSON.stringify({ action: 'add', data: kafkaDto }),
      });
    } else {
      await this.prismaService.url_collection.update({
        where: { id: data.id },
        data: {
          status: URLJobStatus.FAILED,
          error: `Processing failed after 3 attempts`,
        },
      });
      this.producer.emit(KAFKA_TOPICS.URL_DLQ_TOPIC, {
        key: `order-${Date.now()}`,
        value: JSON.stringify({ action: 'add', data: kafkaDto }),
      });
      this.logger.log(
        `Failed to process after 3 attempts: ${JSON.stringify(data)}`,
      );
    }
  }
}
