import { Body, Controller, Get, Post } from '@nestjs/common';
import { UrlfeederService } from './urlfeeder.service';

@Controller('urlfeeder')
export class UrlfeederController {
  constructor(private readonly urlfeederService: UrlfeederService) {}

  @Get('')
  async getUrlCollection(): Promise<any> {
    return this.urlfeederService.getUrlCollection();
  }

  @Post('')
  async addUrlToCollection(@Body('url') url: string): Promise<any> {
    return this.urlfeederService.addUrlToCollection(url);
  }
}
