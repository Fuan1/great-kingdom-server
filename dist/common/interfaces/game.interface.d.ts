export interface Position {
    x: number;
    y: number;
}
export interface GameMove {
    position: Position;
    playerId: string;
}
export interface GameState {
    board: number[][];
    currentPlayer: string;
    players: string[];
    gameOver: boolean;
    winner: string | null;
}
export interface GameOptions {
    boardSize: number;
    playerLimit: number;
}
export declare enum GameEventType {
    JOIN = "join",
    LEAVE = "leave",
    MOVE = "move",
    GAME_OVER = "game_over",
    CHAT = "chat",
    ERROR = "error"
}
export interface GameEvent {
    type: GameEventType;
    payload: any;
    timestamp: number;
    playerId?: string;
}
