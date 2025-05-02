import { Module } from '@nestjs/common';
import { WebsocketModule } from './websocket/websocket.module';
import { GameLogicModule } from './game-logic/game-logic.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule, // 전역으로 사용할 PrismaModule
    WebsocketModule,
    GameLogicModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
