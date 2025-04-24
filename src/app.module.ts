import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketModule } from './websocket/websocket.module';
import { GameLogicModule } from './game-logic/game-logic.module';

@Module({
  imports: [WebsocketModule, GameLogicModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
