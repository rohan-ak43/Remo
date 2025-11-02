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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let WsGateway = class WsGateway {
    constructor() {
        this.doctorClients = new Set();
    }
    handleConnection(client) {
        console.log(`🔌 Client connected: ${client.id}`);
        this.doctorClients.add(client);
    }
    handleDisconnect(client) {
        console.log(`🔌 Client disconnected: ${client.id}`);
        this.doctorClients.delete(client);
    }
    handleCVUpdate(client, payload) {
        const data = {
            reps: payload.reps ?? 0,
            formAccuracy: payload.formAccuracy ?? 0,
            timestamp: payload.timestamp ?? Date.now(),
        };
        console.log(`🎥 Received CV update from client ${client.id}: ${data.reps} reps, ${data.formAccuracy}% accuracy`);
        this.server.emit('cv-update', data);
        return { success: true };
    }
    broadcastSensorData(data) {
        this.server.emit('sensor-data', data);
        console.log(`📊 Broadcasting sensor data: ${data.value}`);
    }
    broadcastCVData(data) {
        this.server.emit('cv-update', data);
        console.log(`🎥 Broadcasting CV update: ${data.reps} reps, ${data.formAccuracy}% accuracy`);
    }
    getConnectedClientsCount() {
        return this.doctorClients.size;
    }
};
exports.WsGateway = WsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('cv-update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], WsGateway.prototype, "handleCVUpdate", null);
exports.WsGateway = WsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    })
], WsGateway);
//# sourceMappingURL=ws.gateway.js.map