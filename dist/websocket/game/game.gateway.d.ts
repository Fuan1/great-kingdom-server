import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../../game-logic/game/game.service';
import { GameMove, GameOptions } from '../../common/interfaces/game.interface';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly gameService;
    private readonly logger;
    private playerGameMap;
    server: Server;
    constructor(gameService: GameService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    createGame(client: Socket, options: GameOptions): {
        event: string;
        data: {
            gameId: string;
            message?: undefined;
        };
    } | {
        event: string;
        data: {
            message: string;
            gameId?: undefined;
        };
    };
    joinGame(client: Socket, data: {
        gameId: string;
    }): {
        event: string;
        data: {
            message: string;
            gameId?: undefined;
            gameState?: undefined;
        };
    } | {
        event: string;
        data: {
            gameId: string;
            gameState: import("../../common/interfaces/game.interface").GameState;
            message?: undefined;
        };
    };
    leaveGame(client: Socket, data: {
        gameId: string;
    }): {
        event: string;
        data: {
            message: string;
            gameId?: undefined;
        };
    } | {
        event: string;
        data: {
            gameId: string;
            message?: undefined;
        };
    };
    makeMove(client: Socket, data: {
        gameId: string;
        move: GameMove;
    }): {
        event: string;
        data: {
            message: string;
            gameState?: undefined;
        };
    } | {
        event: string;
        data: {
            gameState: import("../../common/interfaces/game.interface").GameState;
            message?: undefined;
        };
    };
    getGameState(client: Socket, data: {
        gameId: string;
    }): {
        event: string;
        data: {
            gameState: import("../../common/interfaces/game.interface").GameState;
            message?: undefined;
        };
    } | {
        event: string;
        data: {
            message: string;
            gameState?: undefined;
        };
    };
}
