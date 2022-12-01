import { Module } from '@nestjs/common';
import { WsGateway } from '../service/ws.gateway';
import { AppModule } from './app.module';

@Module({
  imports: [AppModule],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WsModule {}
