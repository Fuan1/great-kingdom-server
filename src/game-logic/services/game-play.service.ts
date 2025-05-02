import {
  BlankCell,
  BorderType,
  CellState,
  CellType,
  GameMove,
  GameOptions,
  Player,
  Position,
  SearchResult,
  StoneCell,
  StoneType,
  TerritoryCell,
  TerritoryType,
} from 'src/game-logic/interface/game.interface';
import { GameState } from 'src/game-logic/interface/game.interface';
import { GameUtils } from '../utils/game-validator.utils';
export class GamePlay {
  private constructor() {}

  static makeMove(gameState: GameState, move: GameMove): boolean {
    const { position } = move;
    const { x, y } = position;

    const currentPlayer = GameUtils.getCurrentPlayer(gameState);

    if (!currentPlayer) {
      return false;
    }

    if (!GameUtils.isValidMove(gameState, move, currentPlayer)) {
      return false;
    }

    gameState.board[x][y] = {
      cellType: CellType.STONE,
      filled: currentPlayer.color,
      visited: false,
    };

    if (this.checkWin(gameState, position, currentPlayer)) {
      gameState.gameOver = true;
      gameState.winner = currentPlayer.id;
      return true;
    }

    // save move to db

    this.nextTurn(gameState);
    return true;
  }

  private static resetGameTimer(gameState: GameState): void {
    gameState.timer = Date.now();
  }

  public static updateTime(
    gameState: GameState,
  ): { gameState: GameState; timeRemaining: number } | null {
    if (!gameState || gameState.gameOver || gameState.gameIndex === 0) {
      this.resetGameTimer(gameState);
      return null;
    }

    const elapsedTime = Date.now() - gameState.timer;

    this.resetGameTimer(gameState);

    const currentPlayer = GameUtils.getCurrentPlayer(gameState);

    if (!currentPlayer) {
      return null;
    }

    currentPlayer.time = Math.max(0, currentPlayer.time - elapsedTime);

    return {
      gameState: gameState,
      timeRemaining: currentPlayer.time,
    };
  }

  private static nextTurn(gameState: GameState): void {
    this.resetGameTimer(gameState);

    gameState.gameIndex += 1;

    gameState.players[0].currentPlayer = !gameState.players[0].currentPlayer;
    gameState.players[1].currentPlayer = !gameState.players[1].currentPlayer;
  }

  private static searchTerritory(
    board: CellState[][],
    row: number,
    col: number,
    color: StoneType,
    result: SearchResult,
  ) {
    switch (board[row][col].cellType) {
      case CellType.STONE:
        if (
          board[row][col].filled === color &&
          board[row][col].filled === StoneType.NEUTRALITY
        ) {
          return;
        } else if (board[row][col].visited) {
          return;
        } else if (!board[row][col].visited) {
          result.sameColorFound = true;
          result.opponentStoneCount++;
          board[row][col].visited = true;
        }
        break;

      case CellType.BORDER:
        if (board[row][col].filled === BorderType.TOP) {
          result.borderEncountered[0] = true;
        }
        if (board[row][col].filled === BorderType.RIGHT) {
          result.borderEncountered[1] = true;
        }
        if (board[row][col].filled === BorderType.BOTTOM) {
          result.borderEncountered[2] = true;
        }
        if (board[row][col].filled === BorderType.LEFT) {
          result.borderEncountered[3] = true;
        }
        return;

      case CellType.TERRITORY:
        return;

      case CellType.BLANK:
        if (board[row][col].visited) {
          return;
        } else if (!board[row][col].visited) {
          result.emptySpaceCount++;
          board[row][col].visited = true;
        }
        break;
    }

    this.searchTerritory(board, row - 1, col, color, result);
    this.searchTerritory(board, row + 1, col, color, result);
    this.searchTerritory(board, row, col - 1, color, result);
    this.searchTerritory(board, row, col + 1, color, result);
  }

  private static initSearchResult(): SearchResult {
    return {
      borderEncountered: [false, false, false, false],
      sameColorFound: false,
      emptySpaceCount: 0,
      opponentStoneCount: 0,
    };
  }

  private static checkBorderTouch(board: CellState[][], result: SearchResult) {
    if (
      (result.borderEncountered[0] &&
        result.borderEncountered[1] &&
        result.borderEncountered[2] &&
        result.borderEncountered[3]) ||
      result.sameColorFound
    ) {
      for (var row = 0; row < GameOptions.BOARD_SIZE; row++) {
        for (var col = 0; col < GameOptions.BOARD_SIZE; col++) {
          this.checkBorderTouchWrapper(board, row, col);
        }
      }
      return true;
    }
    return false;
  }

  private static checkBorderTouchWrapper(
    board: CellState[][],
    row: number,
    col: number,
  ) {
    switch (board[row][col].cellType) {
      case CellType.BLANK:
        board[row][col].visited = false;
        break;
      case CellType.STONE:
        board[row][col].visited = false;
        break;

      default:
        break;
    }
  }

  private static checkTerritory(board: CellState[][], color: StoneType) {
    for (var row = 0; row < GameOptions.BOARD_SIZE; row++) {
      for (var col = 0; col < GameOptions.BOARD_SIZE; col++) {
        this.checkTerritoryWrapper(board, row, col, color);
      }
    }
  }

  private static checkTerritoryWrapper(
    board: CellState[][],
    row: number,
    col: number,
    color: StoneType,
  ) {
    switch (board[row][col].cellType) {
      case CellType.BLANK:
        if (board[row][col].visited) {
          board[row][col] = {
            cellType: CellType.TERRITORY,
            filled: color as any as TerritoryType,
          };
        }
        break;

      default:
        break;
    }
    return;
  }

  private static checkCapture(result: SearchResult) {
    if (result.opponentStoneCount > 0 && result.emptySpaceCount === 0) {
      return true;
    }
    return false;
  }
  private static checkWinner(gameState: GameState, board: CellState[][]) {
    for (var row = 1; row < 10; row++) {
      for (var col = 1; col < 10; col++) {
        switch (board[row][col].cellType) {
          case CellType.BLANK:
            return false;
          default:
            break;
        }
      }
    }

    let blackCount = 0;
    let whiteCount = 0;

    for (var row = 1; row < 10; row++) {
      for (var col = 1; col < 10; col++) {
        switch (board[row][col].cellType) {
          case CellType.TERRITORY:
            if (
              (board[row][col] as TerritoryCell).filled === TerritoryType.BLACK
            ) {
              blackCount++;
            }
            if (
              (board[row][col] as TerritoryCell).filled === TerritoryType.WHITE
            ) {
              whiteCount++;
            }
            break;
          default:
            break;
        }
      }
    }

    if (blackCount > whiteCount + 2.5) {
      const id = gameState.players.find(
        (player) => player.color === StoneType.BLACK,
      )?.id;
      if (id) {
        gameState.winner = id;
      }
    } else {
      const id = gameState.players.find(
        (player) => player.color === StoneType.WHITE,
      )?.id;
      if (id) {
        gameState.winner = id;
      }
    }

    return true;
  }

  private static checkWin(
    gameState: GameState,
    position: Position,
    currentPlayer: Player,
  ): boolean {
    const newBoard = JSON.parse(JSON.stringify(gameState.board));
    var result: SearchResult = this.initSearchResult();

    const color: StoneType = currentPlayer.color;

    const dx = [0, 0, 1, -1];
    const dy = [1, -1, 0, 0];

    for (let i = 0; i < 4; i++) {
      this.searchTerritory(
        newBoard,
        position.x + dx[i],
        position.y + dy[i],
        color,
        result,
      );

      if (!this.checkBorderTouch(newBoard, result)) {
        this.checkTerritory(newBoard, color);
      }

      if (this.checkCapture(result)) {
        return true;
      }

      result = this.initSearchResult();
    }

    if (this.checkWinner(gameState, newBoard)) {
      return true;
    }

    gameState.board = newBoard;
    return false;
  }
}
