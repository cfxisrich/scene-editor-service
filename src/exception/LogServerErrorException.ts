import { InternalServerErrorException } from '@nestjs/common';
import { logger } from '../decorator/Logger';

export class LogServerErrorException extends InternalServerErrorException {
  constructor(message: string, detail: string, service: object, func?: string) {
    super(message);
    logger.error(
      `${message} ---> ${detail}`,
      '',
      service.constructor.name + `.${func}`,
    );
  }
}
