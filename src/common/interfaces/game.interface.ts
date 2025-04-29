import { User } from './user.interface';

export enum GameEventType {
  JOIN = 'join',
  LEAVE = 'leave',
  MOVE = 'move',
  GAME_OVER = 'game_over',
  CHAT = 'chat',
  ERROR = 'error',
  TIME_UPDATE = 'time_update',
}

export enum GameOptions {
  BOARD_SIZE = 11,
  PLAYER_LIMIT = 2,
  DEFAULT_TIME = 5 * 60 * 1000,
  BONUS_TIME = 2 * 1000,
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

export interface SearchResult {
  borderEncountered: boolean[];
  sameColorFound: boolean;
  emptySpaceCount: number;
  opponentStoneCount: number;
}

export interface Player extends User {
  color: ColorType | null;
  time: number;
}

export interface GameState {
  gameId: string;
  board: CellState[][];
  currentPlayer: Player;
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

export interface GameEvent {
  type: GameEventType;
  payload: any;
  timestamp: number;
  playerId?: string;
}
