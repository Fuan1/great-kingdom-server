import { Game } from '../../common/models/game.model';
import { GameMove, GameOptions, GameState } from '../../common/interfaces/game.interface';
export declare class GameService {
    private games;
    createGame(options: GameOptions): string;
    getGame(gameId: string): Game | undefined;
    joinGame(gameId: string, playerId: string): boolean;
    leaveGame(gameId: string, playerId: string): boolean;
    makeMove(gameId: string, move: GameMove): boolean;
    getGameState(gameId: string): GameState | null;
    deleteGame(gameId: string): boolean;
}
