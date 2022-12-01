import { WsException } from '@nestjs/websockets';
import { logger } from '../decorator/Logger';

export class LogWsException extends WsException {
  constructor(message: string, detail: string, service: object, func?: string) {
    super(message);
    logger.error(
      `${message} ---> ${detail}`,
      '',
      service.constructor.name + `.${func}`,
    );
  }
}
