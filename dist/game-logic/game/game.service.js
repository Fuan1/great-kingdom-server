"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const game_model_1 = require("../../common/models/game.model");
const uuid_1 = require("uuid");
let GameService = class GameService {
    games = new Map();
    createGame(options) {
        const gameId = (0, uuid_1.v4)();
        const game = new game_model_1.Game(gameId, options);
        this.games.set(gameId, game);
        return gameId;
    }
    getGame(gameId) {
        return this.games.get(gameId);
    }
    joinGame(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game) {
            return false;
        }
        return game.addPlayer(playerId);
    }
    leaveGame(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game) {
            return false;
        }
        return game.removePlayer(playerId);
    }
    makeMove(gameId, move) {
        const game = this.games.get(gameId);
        if (!game) {
            return false;
        }
        return game.makeMove(move);
    }
    getGameState(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            return null;
        }
        return game.getState();
    }
    deleteGame(gameId) {
        return this.games.delete(gameId);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)()
], GameService);
//# sourceMappingURL=game.service.js.map