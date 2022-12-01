import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { ResponseFormat } from '../util/ResponseFormat';
import { map, Observable } from 'rxjs';

export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        return ResponseFormat.success(data);
      }),
    );
  }
}
