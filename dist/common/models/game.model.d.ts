import { GameState, GameOptions, GameMove } from '../interfaces/game.interface';
export declare class Game {
    private id;
    private state;
    private options;
    constructor(id: string, options: GameOptions);
    private initializeGameState;
    getId(): string;
    getState(): GameState;
    getOptions(): GameOptions;
    addPlayer(playerId: string): boolean;
    removePlayer(playerId: string): boolean;
    makeMove(move: GameMove): boolean;
    private nextTurn;
    private checkWin;
}
