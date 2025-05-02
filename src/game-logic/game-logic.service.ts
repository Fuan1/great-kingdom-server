import { Injectable } from '@nestjs/common';
import { GameMove, GameState } from './interface/game.interface';
import { Game } from './services/game-core.service';
import { v4 as uuidv4 } from 'uuid';
import { GamePlay } from './services/game-play.service';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();

  createGame(): string {
    const gameId = uuidv4();
    const game = new Game(gameId);
    this.games.set(gameId, game);
    return gameId;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  deleteGame(gameId: string): boolean {
    return this.games.delete(gameId);
  }

  getGameList(): string[] {
    return Array.from(this.games.keys());
  }

  getGameState(gameId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game) {
      return null;
    }
    return game.getState();
  }

  joinGame(gameId: string, playerId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }
    return game.addPlayer(
      playerId,
      'Test User',
      1200,
      'https://example.com/image.png',
    );
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
    if (!game) return false;

    return GamePlay.makeMove(game.getState(), move);
  }

  updateGameTime(
    gameId: string,
  ): { gameState: GameState; timeRemaining: number } | null {
    const game = this.games.get(gameId);
    if (!game) {
      return null;
    }

    return GamePlay.updateTime(game.getState());
  }

  handleTimeOut(gameId: string) {
    return null;
  }
}
