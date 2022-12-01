import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class PostStatusInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        if (req.method === 'POST') {
          if (res.statusCode === HttpStatus.CREATED) {
            res.status(HttpStatus.OK);
          }
        }
        return data;
      }),
    );
  }
}
