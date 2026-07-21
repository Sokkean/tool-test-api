import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('proxy')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async proxyRequest(@Body() requestData: any) {
    try {
      const result = await this.requestsService.executeRequest(requestData);
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || error.message || 'Unknown error',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
