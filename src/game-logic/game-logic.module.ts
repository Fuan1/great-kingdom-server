import { Module } from '@nestjs/common';
import { GameService } from './game-logic.service';

@Module({
  providers: [GameService],
  exports: [GameService],
})
export class GameLogicModule {}
