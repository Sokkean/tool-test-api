import { Controller, Post, Body, HttpException, HttpStatus, UseInterceptors, UploadedFiles, Req } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RequestsService } from './requests.service';
import 'multer';

@Controller('proxy')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async proxyRequest(@Body() requestData: any, @UploadedFiles() files: Array<Express.Multer.File>) {
    try {
      const result = await this.requestsService.executeRequest(requestData, files);
      return result;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || error.message || 'Unknown error',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
