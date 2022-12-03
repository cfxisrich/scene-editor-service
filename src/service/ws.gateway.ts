import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WsExecptionFilter } from '../filter/ws-execption.filter';
import { ResponseFormat } from '../util/ResponseFormat';
import { AppService } from './app.service';

@UseFilters(WsExecptionFilter)
@WebSocketGateway({ transports: ['websocket'] })
export class WsGateway {
  @WebSocketServer() server: Server;

  private cacheBuildQueue: {
    id: number;
    publicPath: string;
    name: string;
    client: Socket;
  }[] = [];

  private building = false;

  constructor(private appService: AppService) {}

  @SubscribeMessage('buildApp')
  async appMessage(
    @MessageBody() body: { id: number; publicPath: string; name: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.cacheBuildQueue.push({
      ...body,
      client,
    });
    // 检测是否需要排队
    if (this.building) {
      this.queueNotifiy();
    } else {
      this.build();
    }
  }

  // @SubscribeMessage('buildWdiget3d')
  // async wdiget3dMessage(
  //   @MessageBody() id: number,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   this.cacheBuildQueue.push({
  //     id,
  //     client,
  //   });
  //   // 检测是否需要排队
  //   if (this.building) {
  //     this.queueNotifiy();
  //   } else {
  //     this.build();
  //   }
  // }

  // 排队数通知
  queueNotifiy() {
    this.cacheBuildQueue.forEach((elem, i) => {
      elem.client.emit('buildQueue', ResponseFormat.success(i));
    });
  }

  async build() {
    if (this.cacheBuildQueue.length) {
      this.building = true;
      const cacheBuild = this.cacheBuildQueue.shift();

      const buildPath = await this.appService.buildApp(cacheBuild);

      cacheBuild.client.emit('builded', ResponseFormat.success(buildPath));
      this.queueNotifiy();
      this.build();
    } else {
      this.building = false;
    }
  }
}
