"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GameGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const game_service_1 = require("../../game-logic/game/game.service");
const game_interface_1 = require("../../common/interfaces/game.interface");
const common_1 = require("@nestjs/common");
let GameGateway = GameGateway_1 = class GameGateway {
    gameService;
    logger = new common_1.Logger(GameGateway_1.name);
    playerGameMap = new Map();
    server;
    constructor(gameService) {
        this.gameService = gameService;
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const gameId = this.playerGameMap.get(client.id);
        if (gameId) {
            this.leaveGame(client, { gameId });
        }
    }
    createGame(client, options) {
        try {
            const gameId = this.gameService.createGame(options);
            client.join(gameId);
            this.logger.log(`Game created: ${gameId} by player: ${client.id}`);
            return { event: 'gameCreated', data: { gameId } };
        }
        catch (error) {
            this.logger.error(`Error creating game: ${error.message}`);
            return { event: 'error', data: { message: 'Failed to create game' } };
        }
    }
    joinGame(client, data) {
        try {
            const { gameId } = data;
            const result = this.gameService.joinGame(gameId, client.id);
            if (result) {
                client.join(gameId);
                this.playerGameMap.set(client.id, gameId);
                const gameState = this.gameService.getGameState(gameId);
                if (!gameState) {
                    return { event: 'error', data: { message: 'Game not found' } };
                }
                this.server.to(gameId).emit('gameEvent', {
                    type: game_interface_1.GameEventType.JOIN,
                    payload: {
                        playerId: client.id,
                        gameState,
                    },
                    timestamp: Date.now(),
                });
                return { event: 'joinedGame', data: { gameId, gameState } };
            }
            else {
                return { event: 'error', data: { message: 'Unable to join game' } };
            }
        }
        catch (error) {
            this.logger.error(`Error joining game: ${error.message}`);
            return { event: 'error', data: { message: 'Failed to join game' } };
        }
    }
    leaveGame(client, data) {
        try {
            const { gameId } = data;
            const result = this.gameService.leaveGame(gameId, client.id);
            if (result) {
                client.leave(gameId);
                this.playerGameMap.delete(client.id);
                const gameState = this.gameService.getGameState(gameId);
                if (!gameState) {
                    return { event: 'error', data: { message: 'Game not found' } };
                }
                this.server.to(gameId).emit('gameEvent', {
                    type: game_interface_1.GameEventType.LEAVE,
                    payload: {
                        playerId: client.id,
                        gameState,
                    },
                    timestamp: Date.now(),
                });
                return { event: 'leftGame', data: { gameId } };
            }
            else {
                return { event: 'error', data: { message: 'Unable to leave game' } };
            }
        }
        catch (error) {
            this.logger.error(`Error leaving game: ${error.message}`);
            return { event: 'error', data: { message: 'Failed to leave game' } };
        }
    }
    makeMove(client, data) {
        try {
            const { gameId, move } = data;
            move.playerId = client.id;
            const result = this.gameService.makeMove(gameId, move);
            if (result) {
                const gameState = this.gameService.getGameState(gameId);
                if (!gameState) {
                    return { event: 'error', data: { message: 'Game not found' } };
                }
                this.server.to(gameId).emit('gameEvent', {
                    type: gameState.gameOver
                        ? game_interface_1.GameEventType.GAME_OVER
                        : game_interface_1.GameEventType.MOVE,
                    payload: {
                        move,
                        gameState,
                    },
                    timestamp: Date.now(),
                    playerId: client.id,
                });
                return { event: 'moveMade', data: { gameState } };
            }
            else {
                return { event: 'error', data: { message: 'Invalid move' } };
            }
        }
        catch (error) {
            this.logger.error(`Error making move: ${error.message}`);
            return { event: 'error', data: { message: 'Failed to make move' } };
        }
    }
    getGameState(client, data) {
        try {
            const { gameId } = data;
            const gameState = this.gameService.getGameState(gameId);
            if (gameState) {
                return { event: 'gameState', data: { gameState } };
            }
            else {
                return { event: 'error', data: { message: 'Game not found' } };
            }
        }
        catch (error) {
            this.logger.error(`Error getting game state: ${error.message}`);
            return { event: 'error', data: { message: 'Failed to get game state' } };
        }
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('createGame'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "createGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinGame'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "joinGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveGame'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "leaveGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('makeMove'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "makeMove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getGameState'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "getGameState", null);
exports.GameGateway = GameGateway = GameGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map