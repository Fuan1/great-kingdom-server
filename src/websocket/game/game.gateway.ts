import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../../game-logic/game-logic.service';
import { GameMove } from '../../game-logic/interface/game.interface';
import { GameEventType } from './types';
import { Logger } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(GameGateway.name);
  private playerGameMap: Map<string, string> = new Map();
  private userSocketMap: Map<string, string> = new Map();
  private activeGames: Set<string> = new Set();
  private timeInterval: NodeJS.Timeout;

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: any) {
    this.timeInterval = setInterval(() => {
      this.updateGameTime();
    }, 1000);

    this.logger.log('Game timer started');
  }

  private updateGameTime() {
    this.activeGames.forEach((gameId) => {
      try {
        const timeUpdate = this.gameService.updateGameTime(gameId);
        if (!timeUpdate) return;
        const { gameState, timeRemaining } = timeUpdate;
        this.server.to(gameId).emit('gameEvent', {
          type: GameEventType.TIME_UPDATE,
          payload: { timeUpdate },
          timestamp: Date.now(),
        });
        // if (timeRemaining <= 0)
      } catch (error) {
        this.logger.error(`Error updating game time for ${gameId}: ${error}`);
      }
    });
  }

  // 게임 중에 소켓 연결 해제 된 경우 다시 접속 가능해야 함
  // 연결 해제 1분이 지난 경우 게임이 종료되어야 함 (time loss)

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.authService.verifyToken(token);
      const userId = payload.id;

      this.userSocketMap.set(userId, client.id);
      client.data.userId = userId;

      this.logger.log(`Client connected: ${client.id}, userId: ${userId}`);
    } catch (error) {
      this.logger.error(`Error handling connection: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSocketMap.delete(userId);
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  // 재연결 처리를 위한 메서드
  @SubscribeMessage('reconnect')
  handleReconnect(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const userId = client.data.userId;
    if (userId) {
      // 이전 상태 복원 로직
      // 예: 놓친 메시지 전송, 상태 업데이트 등
      return { status: 'reconnected', userId };
    }
    return { status: 'error', message: 'Authentication required' };
  }

  @SubscribeMessage('createGame')
  createGame(@ConnectedSocket() client: Socket) {
    try {
      const gameId = this.gameService.createGame();

      client.join(gameId);

      this.activeGames.add(gameId);

      this.logger.log(`Game created: ${gameId} by player: ${client.id}`);

      return { event: 'gameCreated', data: { gameId } };
    } catch (error) {
      this.logger.error(`Error creating game: ${error.message}`);
      return { event: 'error', data: { message: 'Failed to create game' } };
    }
  }

  @SubscribeMessage('getGameList')
  getGameList(@ConnectedSocket() client: Socket) {
    try {
      const gameList = this.gameService.getGameList();
      return { event: 'gameList', data: { gameList } };
    } catch (error) {
      this.logger.error(`Error getting game list: ${error.message}`);
      return { event: 'error', data: { message: 'Failed to get game list' } };
    }
  }

  @SubscribeMessage('joinGame')
  joinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; userId: string },
  ) {
    try {
      const { gameId, userId } = data;
      const result = this.gameService.joinGame(gameId, userId);

      if (result) {
        client.join(gameId);
        this.playerGameMap.set(client.id, gameId);

        const gameState = this.gameService.getGameState(gameId);
        if (!gameState) {
          return { event: 'error', data: { message: 'Game not found' } };
        }

        this.server.to(gameId).emit('gameEvent', {
          type: GameEventType.JOIN,
          payload: {
            playerId: client.id,
            gameState,
          },
          timestamp: Date.now(),
        });

        return { event: 'joinedGame', data: { gameId, gameState } };
      } else {
        return { event: 'error', data: { message: 'Unable to join game' } };
      }
    } catch (error) {
      this.logger.error(`Error joining game: ${error.message}`);
      return { event: 'error', data: { message: 'Failed to join game' } };
    }
  }

  @SubscribeMessage('leaveGame')
  leaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    try {
      const { gameId } = data;
      const result = this.gameService.leaveGame(gameId, client.id);

      if (result) {
        client.leave(gameId);
        this.playerGameMap.delete(client.id);

        // 현재 게임 상태 가져오기
        const gameState = this.gameService.getGameState(gameId);
        if (!gameState) {
          return { event: 'error', data: { message: 'Game not found' } };
        }

        // 게임 이벤트 브로드캐스트
        this.server.to(gameId).emit('gameEvent', {
          type: GameEventType.LEAVE,
          payload: {
            playerId: client.id,
            gameState,
          },
          timestamp: Date.now(),
        });

        return { event: 'leftGame', data: { gameId } };
      } else {
        return { event: 'error', data: { message: 'Unable to leave game' } };
      }
    } catch (error) {
      this.logger.error(`Error leaving game: ${error.message}`);
      return { event: 'error', data: { message: 'Failed to leave game' } };
    }
  }

  @SubscribeMessage('makeMove')
  makeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; move: GameMove },
  ) {
    try {
      this.logger.log('makeMove', data);
      const { gameId, move } = data;

      const result = this.gameService.makeMove(gameId, move);

      if (result) {
        const gameState = this.gameService.getGameState(gameId);
        if (!gameState) {
          return { event: 'error', data: { message: 'Game not found' } };
        }

        if (gameState.gameOver) {
          this.activeGames.delete(gameId);
        }

        this.server.to(gameId).emit('gameEvent', {
          type: gameState.gameOver
            ? GameEventType.GAME_OVER
            : GameEventType.MOVE,
          payload: {
            move,
            gameState,
          },
          timestamp: Date.now(),
          playerId: move.userId,
        });

        return { event: 'moveMade', data: { move, gameState } };
      } else {
        return { event: 'error', data: { message: 'Invalid move' } };
      }
    } catch (error) {
      this.logger.error(`Error making move: ${error.message}`);
      return { event: 'error', data: { message: 'Failed to make move' } };
    }
  }

  onModuleDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}
