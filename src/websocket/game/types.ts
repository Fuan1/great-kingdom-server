export enum GameEventType {
  JOIN = 'join',
  LEAVE = 'leave',
  MOVE = 'move',
  GAME_OVER = 'game_over',
  CHAT = 'chat',
  ERROR = 'error',
  TIME_UPDATE = 'time_update',
}

export interface GameEvent {
  type: GameEventType;
  payload: any;
  timestamp: number;
  playerId?: string;
}
