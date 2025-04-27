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
      currentPlayer: { id: '', color: null },
      players: [],
      gameOver: false,
      gameIndex: 0,
      winner: null,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public addPlayer(playerId: string): boolean {
    if (this.state.players.length >= GameOptions.PLAYER_LIMIT) {
      return false;
    }

    if (this.state.players.some((player) => player.id === playerId)) {
      return false;
    }

    if (this.state.players.length === 0) {
      this.state.players.push({ id: playerId, color: ColorType.BLACK });
      this.state.currentPlayer.id = playerId;
      this.state.currentPlayer.color = ColorType.BLACK;
    } else {
      this.state.players.push({ id: playerId, color: ColorType.WHITE });
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

  private isValidMove(x: number, y: number, playerId: string): boolean {
    if (this.state.gameOver === true) {
      return false;
    }
    if (this.state.board[x][y].stone !== null) {
      return false;
    }
    if (this.state.board[x][y].territory !== null) {
      return false;
    }
    // if (this.state.currentPlayer.id !== playerId) {
    //   return false;
    // }
    return true;
  }

  public makeMove(move: GameMove): boolean {
    const { position, playerId } = move;
    const { x, y } = position;

    if (!this.isValidMove(x, y, playerId)) {
      return false;
    }

    this.state.board[x][y].stone = this.state.currentPlayer.color;

    // 게임 승리 체크 로직 (간단한 로직으로 나중에 확장 가능)
    if (this.checkWin(x, y)) {
      this.state.gameOver = true;
      this.state.winner = playerId;
      return true;
    }

    // 다음 플레이어로 턴 넘기기
    this.nextTurn();
    return true;
  }

  private nextTurn(): void {
    this.state.gameIndex += 1;
    const nextIndex = this.state.gameIndex % this.state.players.length;
    this.state.currentPlayer.id = this.state.players[nextIndex].id;
    this.state.currentPlayer.color = this.state.players[nextIndex].color;
  }

  private dfs(
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
      if (board[row][col].border === 'top') {
        result.meetBorder[0] = true;
      }
      if (board[row][col].border === 'right') {
        result.meetBorder[1] = true;
      }
      if (board[row][col].border === 'bottom') {
        result.meetBorder[2] = true;
      }
      if (board[row][col].border === 'left') {
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

    this.dfs(board, row - 1, col, color, result);
    this.dfs(board, row + 1, col, color, result);
    this.dfs(board, row, col - 1, color, result);
    this.dfs(board, row, col + 1, color, result);
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
    console.log(result);
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

    console.log(blackCount, whiteCount);

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
    // 간단한 승리 조건 체크 (5목)
    // 실제 바둑 규칙은 더 복잡하므로 나중에 확장 가능
    const newBoard = JSON.parse(JSON.stringify(this.state.board));
    var result: searchResult = this.initSearchResult();

    if (this.state.currentPlayer.color === null) {
      return false;
    }

    var isCapture = false;

    this.dfs(newBoard, x - 1, y, this.state.currentPlayer.color, result);
    this.checkTerritory(newBoard, result, this.state.currentPlayer.color);
    isCapture = this.checkCapture(result);
    if (isCapture) {
      this.state.winner = this.state.currentPlayer.id;
      return true;
    }
    result = this.initSearchResult();

    this.dfs(newBoard, x + 1, y, this.state.currentPlayer.color, result);
    this.checkTerritory(newBoard, result, this.state.currentPlayer.color);
    if (isCapture) {
      this.state.winner = this.state.currentPlayer.id;
      return true;
    }
    result = this.initSearchResult();

    this.dfs(newBoard, x, y - 1, this.state.currentPlayer.color, result);
    this.checkTerritory(newBoard, result, this.state.currentPlayer.color);
    if (isCapture) {
      this.state.winner = this.state.currentPlayer.id;
      return true;
    }
    result = this.initSearchResult();

    this.dfs(newBoard, x, y + 1, this.state.currentPlayer.color, result);
    this.checkTerritory(newBoard, result, this.state.currentPlayer.color);
    if (isCapture) {
      this.state.winner = this.state.currentPlayer.id;
      return true;
    }
    result = this.initSearchResult();

    if (this.checkWinner(newBoard)) {
      return true;
    }

    this.state.board = newBoard;

    return false;
  }
}
