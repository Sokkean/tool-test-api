import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exception.message;
    } else if (exception instanceof SyntaxError && 'status' in exception && exception.status === 400) {
      // Handle JSON body syntax errors from body-parser
      status = HttpStatus.BAD_REQUEST;
      message = 'Syntax error in request body or param: ' + exception.message;
    } else if (exception?.type === 'entity.parse.failed') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Syntax error in request body or param: Invalid JSON payload';
    } else {
      status = exception?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception?.message || 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
