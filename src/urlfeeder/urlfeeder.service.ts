import { Inject, Injectable, OnModuleInit, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { KafkaUrlFeederDto } from './dto/create-urlfeeder.dto';
import { URL_TYPES } from 'src/shared/enum/enum';
import { KAFKA_CLIENT, KAFKA_TOPICS } from 'src/kafka/kafka.constants';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class UrlfeederService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(KAFKA_CLIENT) private readonly producer: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.producer.connect();
  }

  async getUrlCollection(): Promise<any> {
    const resp = await this.prismaService.url_collection.findMany();
    console.log('Current URL collection:', resp);
    return resp;
  }

  async addUrlToCollection(url: string, contentType: string): Promise<any> {
    //Find contentType is image or pdf or webpage
    let type = URL_TYPES.WEBPAGE;
    let topic = KAFKA_TOPICS.WEB_TOPIC;
    if (contentType.includes('image')) {
      type = URL_TYPES.IMAGE;
      topic = KAFKA_TOPICS.IMAGE_TOPIC;
    } else if (contentType.includes('pdf')) {
      type = URL_TYPES.PDF;
      topic = KAFKA_TOPICS.PDF_TOPIC;
    }

    const urlEntry = await this.prismaService.url_collection.create({
      data: { url: url, type: type },
      select: {
        id: true,
        url: true,
        type: true,
        status: true,
        retryCount: true,
        createdAt: true,
      },
    });
    console.log(`Added URL to collection: ${url}`);

    let kafkaDto = new KafkaUrlFeederDto();
    kafkaDto.id = urlEntry.id;
    kafkaDto.url = urlEntry.url;
    kafkaDto.type = urlEntry.type ? urlEntry.type : URL_TYPES.WEBPAGE;
    kafkaDto.retryCount = urlEntry.retryCount ? urlEntry.retryCount : 0;
    kafkaDto.createdAt = urlEntry.createdAt.toISOString();

    console.log('json=>', JSON.stringify({ action: 'add', data: kafkaDto }));
    this.producer.emit(topic, {
      key: `order-${Date.now()}`,
      value: JSON.stringify({ action: 'add', data: kafkaDto }),
    });
    console.log(`Sent Kafka message for added URL: ${url}`);
    return urlEntry;
  }
}
