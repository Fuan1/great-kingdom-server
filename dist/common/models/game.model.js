"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
class Game {
    id;
    state;
    options;
    constructor(id, options) {
        this.id = id;
        this.options = options;
        this.state = this.initializeGameState();
    }
    initializeGameState() {
        const boardSize = this.options.boardSize;
        const board = Array(boardSize)
            .fill(null)
            .map(() => Array(boardSize).fill(0));
        return {
            board,
            currentPlayer: '',
            players: [],
            gameOver: false,
            winner: null,
        };
    }
    getId() {
        return this.id;
    }
    getState() {
        return { ...this.state };
    }
    getOptions() {
        return { ...this.options };
    }
    addPlayer(playerId) {
        if (this.state.players.length >= this.options.playerLimit) {
            return false;
        }
        if (this.state.players.includes(playerId)) {
            return false;
        }
        this.state.players.push(playerId);
        if (this.state.players.length === 1) {
            this.state.currentPlayer = playerId;
        }
        return true;
    }
    removePlayer(playerId) {
        const index = this.state.players.indexOf(playerId);
        if (index === -1) {
            return false;
        }
        this.state.players.splice(index, 1);
        if (this.state.players.length === 0) {
            this.state.gameOver = true;
        }
        return true;
    }
    makeMove(move) {
        const { position, playerId } = move;
        const { x, y } = position;
        if (this.state.gameOver ||
            this.state.currentPlayer !== playerId ||
            x < 0 ||
            x >= this.options.boardSize ||
            y < 0 ||
            y >= this.options.boardSize ||
            this.state.board[y][x] !== 0) {
            return false;
        }
        const playerIndex = this.state.players.indexOf(playerId) + 1;
        this.state.board[y][x] = playerIndex;
        if (this.checkWin(x, y, playerIndex)) {
            this.state.gameOver = true;
            this.state.winner = playerId;
            return true;
        }
        this.nextTurn();
        return true;
    }
    nextTurn() {
        const currentIndex = this.state.players.indexOf(this.state.currentPlayer);
        const nextIndex = (currentIndex + 1) % this.state.players.length;
        this.state.currentPlayer = this.state.players[nextIndex];
    }
    checkWin(x, y, playerIndex) {
        const directions = [
            [1, 0],
            [0, 1],
            [1, 1],
            [1, -1],
        ];
        for (const [dx, dy] of directions) {
            let count = 1;
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx < 0 ||
                    nx >= this.options.boardSize ||
                    ny < 0 ||
                    ny >= this.options.boardSize ||
                    this.state.board[ny][nx] !== playerIndex) {
                    break;
                }
                count++;
            }
            for (let i = 1; i < 5; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx < 0 ||
                    nx >= this.options.boardSize ||
                    ny < 0 ||
                    ny >= this.options.boardSize ||
                    this.state.board[ny][nx] !== playerIndex) {
                    break;
                }
                count++;
            }
            if (count >= 5) {
                return true;
            }
        }
        return false;
    }
}
exports.Game = Game;
//# sourceMappingURL=game.model.js.map