import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { WsGateway } from './service/ws.gateway';

@Controller()
export class AppController {
  constructor(private appService: AppService, private wsGateway: WsGateway) {}
}
