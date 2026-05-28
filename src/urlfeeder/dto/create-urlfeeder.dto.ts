import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateKafkaUrlFeederDto {
  @IsNotEmpty()
  @IsString()
  url: string;
}

export class KafkaUrlFeederDto {
  @IsNumber()
  id: number;

  @IsString()
  url: string;

  @IsEnum(['image', 'pdf', 'web'])
  type: string;

  @IsNumber()
  retryCount: number;

  @IsString()
  createdAt: string;
}
