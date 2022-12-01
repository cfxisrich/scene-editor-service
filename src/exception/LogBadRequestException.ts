import { BadRequestException } from '@nestjs/common';
import { logger } from '../decorator/Logger';

export class LogBadRequestException extends BadRequestException {
  constructor(message: string, detail: string, service: object, func?: string) {
    super(message);
    logger.error(
      `${message} ---> ${detail}`,
      '',
      service.constructor.name + `.${func}`,
    );
  }
}
