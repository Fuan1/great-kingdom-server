import { Module } from '@nestjs/common';
import { GameGateway } from './game/game.gateway';
import { GameLogicModule } from '../game-logic/game-logic.module';

@Module({
  imports: [GameLogicModule],
  providers: [GameGateway],
})
export class WebsocketModule {}
