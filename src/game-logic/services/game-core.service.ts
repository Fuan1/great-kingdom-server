import {
  BorderType,
  CellState,
  CellType,
  GameOptions,
  GameState,
  StoneType,
  TerritoryType,
} from 'src/game-logic/interface/game.interface';

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
            cellType: CellType.BLANK,
            visited: false,
          })),
      );

    for (let i = 0; i < boardSize; i++) {
      board[0][i] = {
        cellType: CellType.BORDER,
        filled: BorderType.TOP,
      };
      board[10][i] = {
        cellType: CellType.BORDER,
        filled: BorderType.BOTTOM,
      };
      board[i][0] = {
        cellType: CellType.BORDER,
        filled: BorderType.LEFT,
      };
      board[i][10] = {
        cellType: CellType.BORDER,
        filled: BorderType.RIGHT,
      };
    }
    board[5][5] = {
      cellType: CellType.STONE,
      filled: StoneType.NEUTRALITY,
      visited: false,
    };

    console.log('[gameCore]-[initializeGameState]-[success]');

    return {
      gameId: this.id,
      board,
      players: [],
      gameOver: false,
      gameIndex: 0,
      winner: null,
      timer: Date.now(),
    };
  }

  public getId(): string {
    return this.id;
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public addPlayer(
    userId: string,
    name: string,
    rating: number,
    profileImage: string,
  ): boolean {
    if (this.state.players.length >= GameOptions.PLAYER_LIMIT) {
      return false;
    }

    if (this.state.players.some((player) => player.id === userId)) {
      return false;
    }

    if (this.state.players.length === 0) {
      this.state.players.push({
        id: userId,
        color: StoneType.BLACK,
        time: GameOptions.DEFAULT_TIME,
        name,
        rating,
        profileImage,
        currentPlayer: true,
      });
    } else {
      this.state.players.push({
        id: userId,
        color: StoneType.WHITE,
        time: GameOptions.DEFAULT_TIME,
        name,
        rating,
        profileImage,
        currentPlayer: false,
      });
    }

    console.log('[gameCore]-[addPlayer]-[success]', this.state.players);

    return true;
  }

  public removePlayer(playerId: string): boolean {
    const index = this.state.players.findIndex(
      (player) => player.id === playerId,
    );
    if (index === -1) {
      console.log('[gameCore]-[removePlayer]-[fail] not found player');
      return false;
    }

    this.state.players.splice(index, 1);

    if (this.state.players.length === 0) {
      console.log('[gameCore]-[removePlayer]-[success] all players removed');
      this.state.gameOver = true;
    }

    console.log('[gameCore]-[removePlayer]-[success]', playerId);

    return true;
  }
}
