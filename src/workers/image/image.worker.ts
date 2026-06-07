import { Controller, Inject, Logger } from '@nestjs/common';
import { ConsumeMessageDto } from '../dto/consume.message.dto';
import { PrismaService } from 'src/prisma.service';
import { URLJobStatus } from 'src/shared/enum/enum';
import {
  ClientKafka,
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { KAFKA_CLIENT, KAFKA_TOPICS } from 'src/kafka/kafka.constants';
import { KafkaUrlFeederDto } from 'src/urlfeeder/dto/create-urlfeeder.dto';
import { downloadImage } from './image.helper';

@Controller()
export class ImageWorker {
  private readonly logger = new Logger(ImageWorker.name);

  constructor(
    @Inject(KAFKA_CLIENT) private readonly producer: ClientKafka,
    private readonly prismaService: PrismaService,
  ) {}

  @MessagePattern([KAFKA_TOPICS.IMAGE_TOPIC, KAFKA_TOPICS.IMAGE_RETRY_TOPIC])
  async processImageUrl(@Payload() payload: any, @Ctx() context: KafkaContext) {
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

        const imagePath = await downloadImage(data.url);
        if (imagePath) {
          await this.prismaService.url_collection.update({
            where: { id: data.id },
            data: { status: URLJobStatus.SUCCESS },
          });
          await this.prismaService.processed_content.create({
            data: {
              urlJobId: data.id,
              contentType: data.type,
              extracted: JSON.stringify({ imagePath }),
            },
          });
          this.logger.log(`Successfully processed: ${JSON.stringify(data)}`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to update job status to PROCESSING for URL with ID ${data.id}: ${error.message}`,
      );
      throw error;
    }
  }
}
