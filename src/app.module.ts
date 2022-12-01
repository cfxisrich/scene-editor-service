import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import DBConnect from './config/DBConnect.json';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { FileModule } from './module/file.module';
import { AppModule as AModule } from './module/app.module';
import { ModelModule } from './module/model.module';
import { ComponentsModule } from './module/component.module';
import { WsModule } from './module/ws.module';
import { TextureModule } from './module/texture.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...DBConnect,
      namingStrategy: new SnakeNamingStrategy(),
    } as TypeOrmModuleOptions),
    FileModule,
    AModule,
    ModelModule,
    TextureModule,
    ComponentsModule,
    WsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
