import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Observable } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { logger } from '../decorator/Logger';

export interface ClassType<T extends object> {
  new (): T;
}

@Injectable()
export class TransformInterceptor<T extends object> implements NestInterceptor {
  constructor(private classType: ClassType<T>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      mergeMap(async (data) => {
        const object = plainToClass(this.classType, data);
        if (Array.isArray(object)) {
          for (const item of object) {
            await this.validate(item);
          }
        } else {
          await this.validate(object);
        }

        return object;
      }),
    );
  }

  private async validate(object: any) {
    const errors = await validate(object);

    if (errors.length > 0) {
      errors.forEach((error) => {
        logger.error(
          `${error.property}-->${error.value}: ${error}`,
          this.constructor.name,
        );
      });

      throw new InternalServerErrorException('服务器对象转换有误!');
    }
  }
}
