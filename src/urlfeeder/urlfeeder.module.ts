import { Module } from '@nestjs/common';
import { UrlfeederController } from './urlfeeder.controller';
import { UrlfeederService } from './urlfeeder.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UrlfeederController],
  providers: [UrlfeederService, PrismaService],
  imports: [],
})
export class UrlfeederModule {}
