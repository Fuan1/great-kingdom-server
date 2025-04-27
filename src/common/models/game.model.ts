import {
  GameState,
  GameMove,
  GameOptions,
  CellState,
  ColorType,
  BorderType,
  searchResult,
} from '../interfaces/game.interface';

export class Game {
  private id: string;
  private state: GameState;

  constructor(id: string) {
    this.id = id;
    this.state = this.initializeGameState();
  }

  private initializeGameState(): GameState {
    const boardSize = GameOptions.BOARD_SIZE;
    const board: CellState[][] = Array(boardSize)
      .fill(null)
      .map(() =>
        Array(boardSize)
          .fill(null)
          .map(() => ({
            stone: null,
            territory: null,
            border: null,
            visited: false,
          })),
      );

    for (let i = 0; i < 11; i++) {
      board[0][i].border = BorderType.TOP;
      board[10][i].border = BorderType.BOTTOM;
      board[i][0].border = BorderType.LEFT;
      board[i][10].border = BorderType.RIGHT;
    }
    board[5][5].stone = ColorType.NEUTRALITY;
    board[5][5].territory = ColorType.NEUTRALITY;

    return {
      gameId: this.id,
      board,
      currentPlayer: {
        id: '',
        color: null,
        time: 0,
      },
      players: [],
      gameOver: false,
      gameIndex: 0,
      winner: null,
      timer: Date.now(),
    };
  }

  public resetGameTimer(): void {
    this.state.timer = Date.now();
  }

  public updateTime(): { gameState: GameState; timeRemaining: number } | null {
    if (!this.state || this.state.gameOver || this.state.gameIndex === 0) {
      this.resetGameTimer();
      return null;
    }

    const elapsedTime = Date.now() - this.state.timer;

    this.resetGameTimer();

    this.state.currentPlayer.time = Math.max(
      0,
      this.state.currentPlayer.time - elapsedTime,
    );

    return {
      gameState: this.state,
      timeRemaining: this.state.currentPlayer.time,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public addPlayer(userId: string): boolean {
    if (this.state.players.length >= GameOptions.PLAYER_LIMIT) {
      return false;
    }

    if (this.state.players.some((player) => player.id === userId)) {
      return false;
    }

    if (this.state.players.length === 0) {
      this.state.players.push({
        id: userId,
        color: ColorType.BLACK,
        time: GameOptions.DEFAULT_TIME,
      });
      this.state.currentPlayer.id = userId;
      this.state.currentPlayer.color = ColorType.BLACK;
      this.state.currentPlayer.time = GameOptions.DEFAULT_TIME;
    } else {
      this.state.players.push({
        id: userId,
        color: ColorType.WHITE,
        time: GameOptions.DEFAULT_TIME,
      });
    }

    return true;
  }

  public removePlayer(playerId: string): boolean {
    const index = this.state.players.findIndex(
      (player) => player.id === playerId,
    );
    if (index === -1) {
      return false;
    }

    this.state.players.splice(index, 1);

    // 플레이어가 모두 나가면 게임 종료
    if (this.state.players.length === 0) {
      this.state.gameOver = true;
    }

    return true;
  }

  private isValidMove(x: number, y: number, userId: string): boolean {
    if (this.state.gameOver === true) {
      return false;
    }
    if (this.state.board[x][y].stone !== null) {
      return false;
    }
    if (this.state.board[x][y].territory !== null) {
      return false;
    }
    if (this.state.currentPlayer.id !== userId) {
      return false;
    }

    return true;
  }

  public makeMove(move: GameMove): boolean {
    const { position, userId } = move;
    const { x, y } = position;

    if (!this.isValidMove(x, y, userId)) {
      return false;
    }

    this.state.board[x][y].stone = this.state.currentPlayer.color;

    if (this.checkWin(x, y)) {
      this.state.gameOver = true;
      this.state.winner = userId;
      return true;
    }

    this.nextTurn();
    return true;
  }

  private nextTurn(): void {
    this.resetGameTimer();

    var nextIndex = this.state.gameIndex % this.state.players.length;
    this.state.players[nextIndex].time = this.state.currentPlayer.time;

    this.state.gameIndex += 1;
    nextIndex = this.state.gameIndex % this.state.players.length;

    this.state.currentPlayer.id = this.state.players[nextIndex].id;
    this.state.currentPlayer.color = this.state.players[nextIndex].color;
    this.state.currentPlayer.time = this.state.players[nextIndex].time;
  }

  private searchTerritory(
    board: CellState[][],
    row: number,
    col: number,
    color: ColorType,
    result: searchResult,
  ) {
    if (board[row][col].territory !== null) return;

    if (board[row][col].stone !== null && board[row][col].stone === color) {
      return;
    }

    if (board[row][col].border !== null) {
      if (board[row][col].border === BorderType.TOP) {
        result.meetBorder[0] = true;
      }
      if (board[row][col].border === BorderType.RIGHT) {
        result.meetBorder[1] = true;
      }
      if (board[row][col].border === BorderType.BOTTOM) {
        result.meetBorder[2] = true;
      }
      if (board[row][col].border === BorderType.LEFT) {
        result.meetBorder[3] = true;
      }
      return;
    }

    if (board[row][col].visited) return;

    if (board[row][col].stone !== null && board[row][col].stone !== color) {
      result.meetColor = true;
      result.opponentColorCount++;
    } else {
      result.blankCount++;
    }

    board[row][col].visited = true;

    this.searchTerritory(board, row - 1, col, color, result);
    this.searchTerritory(board, row + 1, col, color, result);
    this.searchTerritory(board, row, col - 1, color, result);
    this.searchTerritory(board, row, col + 1, color, result);
  }

  private initSearchResult(): searchResult {
    return {
      meetBorder: [false, false, false, false],
      meetColor: false,
      blankCount: 0,
      opponentColorCount: 0,
    };
  }

  private checkTerritory(
    board: CellState[][],
    result: searchResult,
    currentPlayer: ColorType,
  ) {
    if (
      (result.meetBorder[0] &&
        result.meetBorder[1] &&
        result.meetBorder[2] &&
        result.meetBorder[3]) ||
      result.meetColor
    ) {
      for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 11; j++) {
          if (board[i][j].visited === true) {
            board[i][j].visited = false;
          }
        }
      }
    } else {
      for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 11; j++) {
          if (board[i][j].visited === true) {
            board[i][j].territory = currentPlayer;
            board[i][j].visited = false;
          }
        }
      }
    }
  }

  private checkCapture(result: searchResult) {
    if (result.opponentColorCount > 0 && result.blankCount === 0) {
      return true;
    }
    return false;
  }
  private checkWinner(board: CellState[][]) {
    for (let i = 1; i < 10; i++) {
      for (let j = 1; j < 10; j++) {
        if (board[i][j].territory === null && board[i][j].stone === null) {
          return false;
        }
      }
    }

    let blackCount = 0;
    let whiteCount = 0;

    for (let i = 1; i < 10; i++) {
      for (let j = 1; j < 10; j++) {
        if (board[i][j].territory === 'black') {
          blackCount++;
        } else if (board[i][j].territory === 'white') {
          whiteCount++;
        }
      }
    }

    if (blackCount > whiteCount + 2.5) {
      const id = this.state.players.find(
        (player) => player.color === ColorType.BLACK,
      )?.id;
      if (id) {
        this.state.winner = id;
      }
    } else {
      const id = this.state.players.find(
        (player) => player.color === ColorType.WHITE,
      )?.id;
      if (id) {
        this.state.winner = id;
      }
    }

    return true;
  }

  private checkWin(x: number, y: number): boolean {
    if (this.state.currentPlayer.color === null) {
      return false;
    }

    const newBoard = JSON.parse(JSON.stringify(this.state.board));
    var result: searchResult = this.initSearchResult();

    const color: ColorType = this.state.currentPlayer.color;

    const dx = [0, 0, 1, -1];
    const dy = [1, -1, 0, 0];

    for (let i = 0; i < 4; i++) {
      this.searchTerritory(newBoard, x + dx[i], y + dy[i], color, result);
      this.checkTerritory(newBoard, result, color);
      if (this.checkCapture(result)) {
        this.state.winner = this.state.currentPlayer.id;
        return true;
      }
      result = this.initSearchResult();
    }

    if (this.checkWinner(newBoard)) {
      return true;
    }

    this.state.board = newBoard;
    return false;
  }
}
