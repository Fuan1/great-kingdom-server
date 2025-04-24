import {
  Position,
  GameState,
  GameOptions,
  GameMove,
} from '../interfaces/game.interface';

export class Game {
  private id: string;
  private state: GameState;
  private options: GameOptions;

  constructor(id: string, options: GameOptions) {
    this.id = id;
    this.options = options;
    this.state = this.initializeGameState();
  }

  private initializeGameState(): GameState {
    const boardSize = this.options.boardSize;
    const board = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(0));

    return {
      board,
      currentPlayer: '',
      players: [],
      gameOver: false,
      winner: null,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public getOptions(): GameOptions {
    return { ...this.options };
  }

  public addPlayer(playerId: string): boolean {
    if (this.state.players.length >= this.options.playerLimit) {
      return false;
    }

    if (this.state.players.includes(playerId)) {
      return false;
    }

    this.state.players.push(playerId);

    // 첫 번째 플레이어가 게임 시작할 때 현재 플레이어로 설정
    if (this.state.players.length === 1) {
      this.state.currentPlayer = playerId;
    }

    return true;
  }

  public removePlayer(playerId: string): boolean {
    const index = this.state.players.indexOf(playerId);
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

  public makeMove(move: GameMove): boolean {
    const { position, playerId } = move;
    const { x, y } = position;

    // 유효성 검사
    if (
      this.state.gameOver ||
      this.state.currentPlayer !== playerId ||
      x < 0 ||
      x >= this.options.boardSize ||
      y < 0 ||
      y >= this.options.boardSize ||
      this.state.board[y][x] !== 0
    ) {
      return false;
    }

    // 바둑돌 놓기 (1: 흑돌, 2: 백돌)
    const playerIndex = this.state.players.indexOf(playerId) + 1;
    this.state.board[y][x] = playerIndex;

    // 게임 승리 체크 로직 (간단한 로직으로 나중에 확장 가능)
    if (this.checkWin(x, y, playerIndex)) {
      this.state.gameOver = true;
      this.state.winner = playerId;
      return true;
    }

    // 다음 플레이어로 턴 넘기기
    this.nextTurn();
    return true;
  }

  private nextTurn(): void {
    const currentIndex = this.state.players.indexOf(this.state.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.state.players.length;
    this.state.currentPlayer = this.state.players[nextIndex];
  }

  private checkWin(x: number, y: number, playerIndex: number): boolean {
    // 간단한 승리 조건 체크 (5목)
    // 실제 바둑 규칙은 더 복잡하므로 나중에 확장 가능
    const directions = [
      [1, 0], // 가로
      [0, 1], // 세로
      [1, 1], // 대각선 1
      [1, -1], // 대각선 2
    ];

    for (const [dx, dy] of directions) {
      let count = 1;

      // 한쪽 방향으로 확인
      for (let i = 1; i < 5; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;

        if (
          nx < 0 ||
          nx >= this.options.boardSize ||
          ny < 0 ||
          ny >= this.options.boardSize ||
          this.state.board[ny][nx] !== playerIndex
        ) {
          break;
        }

        count++;
      }

      // 반대 방향으로 확인
      for (let i = 1; i < 5; i++) {
        const nx = x - dx * i;
        const ny = y - dy * i;

        if (
          nx < 0 ||
          nx >= this.options.boardSize ||
          ny < 0 ||
          ny >= this.options.boardSize ||
          this.state.board[ny][nx] !== playerIndex
        ) {
          break;
        }

        count++;
      }

      if (count >= 5) {
        return true;
      }
    }

    return false;
  }
}
