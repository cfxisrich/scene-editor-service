import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Log } from '../decorator/Logger';
import { ResponseFormat } from '../util/ResponseFormat';
import { Socket } from 'socket.io';

@Catch()
export class WsExecptionFilter extends BaseWsExceptionFilter {
  @Log((exception) => {
    return exception;
  }, 'error')
  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const response = ctx.getData();
    const client = ctx.getClient<Socket>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    console.error(exception);

    Object.assign(
      response,
      Object.assign(ResponseFormat.error(exception.message, status), {
        data: '',
        timestamp: new Date().toLocaleString(undefined, { hour12: false }),
        path: client.handshake.url,
      }),
    );

    client.emit('error', response);
  }
}
