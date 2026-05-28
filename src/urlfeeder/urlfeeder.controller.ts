import { Body, Controller, Get, Post } from '@nestjs/common';
import { UrlfeederService } from './urlfeeder.service';
import { ContentType } from 'src/shared/decorator/get-headers';

@Controller('urlfeeder')
export class UrlfeederController {
  constructor(private readonly urlfeederService: UrlfeederService) {}

  @Get('')
  async getUrlCollection(): Promise<any> {
    return this.urlfeederService.getUrlCollection();
  }

  @Post('')
  async addUrlToCollection(
    @Body('url') url: string,
    @ContentType() contentType: string,
  ): Promise<any> {
    return this.urlfeederService.addUrlToCollection(url, contentType);
  }
}
