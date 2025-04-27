export interface Position {
  x: number;
  y: number;
}

export interface GameMove {
  position: Position;
  playerId: string;
}

export type Player = {
  id: string;
  color: ColorType | null;
};

export interface GameState {
  gameId: string;
  board: CellState[][];
  currentPlayer: Player;
  players: Player[];
  gameOver: boolean;
  gameIndex: number;
  winner: string | null;
}

export enum GameEventType {
  JOIN = 'join',
  LEAVE = 'leave',
  MOVE = 'move',
  GAME_OVER = 'game_over',
  CHAT = 'chat',
  ERROR = 'error',
}

export enum GameOptions {
  BOARD_SIZE = 11,
  PLAYER_LIMIT = 2,
}

export enum ColorType {
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
export type StoneType = null | ColorType;
export type TerritoryType = null | ColorType;
export type Border = null | BorderType;
export type CellState = {
  stone: StoneType;
  territory: TerritoryType;
  border: Border;
  visited: boolean;
};

export interface GameEvent {
  type: GameEventType;
  payload: any;
  timestamp: number;
  playerId?: string;
}

export interface searchResult {
  meetBorder: boolean[];
  meetColor: boolean;
  blankCount: number;
  opponentColorCount: number;
}
