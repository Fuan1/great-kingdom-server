export enum GameOptions {
  BOARD_SIZE = 11,
  PLAYER_LIMIT = 2,
  DEFAULT_TIME = 5 * 60 * 1000,
  BONUS_TIME = 2 * 1000,
}

export interface SearchResult {
  borderEncountered: boolean[];
  sameColorFound: boolean;
  emptySpaceCount: number;
  opponentStoneCount: number;
}

export enum TerritoryType {
  BLACK = 'black',
  WHITE = 'white',
}

export enum StoneType {
  BLACK = 'black',
  WHITE = 'white',
  NEUTRALITY = 'neutrality',
}

export enum BorderType {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

export interface Player {
  id: string;
  name: string;
  rating: number;
  profileImage: string;
  color: StoneType;
  time: number;
  currentPlayer: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}

export enum CellType {
  STONE = 'stone',
  TERRITORY = 'territory',
  BORDER = 'border',
  BLANK = 'blank',
}

// 각 셀 타입별 상태 정의
export type BorderCell = {
  cellType: CellType.BORDER;
  filled: BorderType;
};

export type StoneCell = {
  cellType: CellType.STONE;
  filled: StoneType;
  visited: boolean;
};

export type TerritoryCell = {
  cellType: CellType.TERRITORY;
  filled: TerritoryType;
};

export type BlankCell = {
  cellType: CellType.BLANK;
  visited: boolean;
};

// 판별 유니온 타입으로 CellState 재정의
export type CellState = BorderCell | StoneCell | TerritoryCell | BlankCell;
export interface GameState {
  gameId: string;
  board: CellState[][];
  players: Player[];
  gameOver: boolean;
  gameIndex: number;
  winner: string | null;
  timer: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameMove {
  position: Position;
  userId: string;
}
