import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Log } from '../decorator/Logger';
import { ResponseFormat } from '../util/ResponseFormat';

@Catch()
export class HttpExecptionFilter implements ExceptionFilter {
  @Log((exception) => {
    return exception;
  }, 'error')
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.error(exception);

    response.status(status).json(
      Object.assign(ResponseFormat.error(exception.message, status), {
        timestamp: new Date().toLocaleString(undefined, { hour12: false }),
        path: request.url,
      }),
    );
  }
}
