import {
  CellType,
  GameMove,
  Player,
} from 'src/game-logic/interface/game.interface';

import { GameState } from 'src/game-logic/interface/game.interface';

export class GameUtils {
  private constructor() {}

  static isValidMove(
    gameState: GameState,
    gameMove: GameMove,
    currentPlayer: Player,
  ): boolean {
    const { x, y } = gameMove.position;
    const userId = gameMove.userId;

    if (gameState.gameOver === true) {
      return false;
    }

    switch (gameState.board[x][y].cellType) {
      case CellType.BLANK:
        break;
      case CellType.BORDER:
        return false;
      case CellType.TERRITORY:
        return false;
      case CellType.STONE:
        return false;
    }

    if (currentPlayer.id !== userId) {
      return false;
    }

    return true;
  }

  static getCurrentPlayer(gameState: GameState): Player | undefined {
    const currentPlayer = gameState.players.find(
      (player) => player.currentPlayer === true,
    );
    return currentPlayer;
  }
}
