import { Injectable } from '@nestjs/common';
import { Game } from '../../common/models/game.model';
import {
  GameMove,
  GameOptions,
  GameState,
} from '../../common/interfaces/game.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();

  createGame(options: GameOptions): string {
    const gameId = uuidv4();
    const game = new Game(gameId, options);
    this.games.set(gameId, game);
    return gameId;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  joinGame(gameId: string, playerId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }
    return game.addPlayer(playerId);
  }

  leaveGame(gameId: string, playerId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }
    return game.removePlayer(playerId);
  }

  makeMove(gameId: string, move: GameMove): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }
    return game.makeMove(move);
  }

  getGameState(gameId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game) {
      return null;
    }
    return game.getState();
  }

  deleteGame(gameId: string): boolean {
    return this.games.delete(gameId);
  }
}
