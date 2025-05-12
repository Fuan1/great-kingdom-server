import { Module } from '@nestjs/common';
import { GameGateway } from './game/game.gateway';
import { GameLogicModule } from '../game-logic/game-logic.module';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [GameLogicModule, AuthModule],
  providers: [GameGateway],
})
export class WebsocketModule {}
