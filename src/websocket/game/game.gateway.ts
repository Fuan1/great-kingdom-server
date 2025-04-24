import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../../game-logic/game/game.service';
import {
  GameEventType,
  GameMove,
  GameOptions,
} from '../../common/interfaces/game.interface';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name);
  private playerGameMap: Map<string, string> = new Map();

  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const gameId = this.playerGameMap.get(client.id);
    if (gameId) {
      this.leaveGame(client, { gameId });
    }
  }

  @SubscribeMessage('createGame')
  createGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() options: GameOptions,
  ) {
    try {
      const gameId = this.gameService.createGame(options);
      client.join(gameId);
      this.logger.log(`Game created: ${gameId} by player: ${client.id}`);
      return { event: 'gameCreated', data: { gameId } };
    } catch (error) {
      this.logger.error(`Error creating game: ${error.message}`);
      return { event: 'error', data: { message: 'Failed to create game' } };
    }
  }

  @SubscribeMessage('joinGame')
  joinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    try {
      const { gameId } = data;
      const result = this.gameService.joinGame(gameId, client.id);

      if (result) {
        client.join(gameId);
        this.playerGameMap.set(client.id, gameId);

        // 현재 게임 상태 가져오기
        const gameState = this.gameService.getGameState(gameId);
        if (!gameState) {
          return { event: 'error', data: { message: 'Game not found' } };
        }

        // 게임 이벤트 브로드캐스트
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
      const { gameId, move } = data;
      // playerId 설정
      move.playerId = client.id;

      const result = this.gameService.makeMove(gameId, move);

      if (result) {
        // 현재 게임 상태 가져오기
        const gameState = this.gameService.getGameState(gameId);
        if (!gameState) {
          return { event: 'error', data: { message: 'Game not found' } };
        }

        // 게임 이벤트 브로드캐스트
        this.server.to(gameId).emit('gameEvent', {
          type: gameState.gameOver
            ? GameEventType.GAME_OVER
            : GameEventType.MOVE,
          payload: {
            move,
            gameState,
          },
          timestamp: Date.now(),
          playerId: client.id,
        });

        return { event: 'moveMade', data: { gameState } };
      } else {
        return { event: 'error', data: { message: 'Invalid move' } };
      }
    } catch (error) {
      this.logger.error(`Error making move: ${error.message}`);
      return { event: 'error', data: { message: 'Failed to make move' } };
    }
  }

  @SubscribeMessage('getGameState')
  getGameState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    try {
      const { gameId } = data;
      const gameState = this.gameService.getGameState(gameId);

      if (gameState) {
        return { event: 'gameState', data: { gameState } };
      } else {
        return { event: 'error', data: { message: 'Game not found' } };
      }
    } catch (error) {
      this.logger.error(`Error getting game state: ${error.message}`);
      return { event: 'error', data: { message: 'Failed to get game state' } };
    }
  }
}
