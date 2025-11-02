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
var IoTController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoTController = void 0;
const common_1 = require("@nestjs/common");
const ws_gateway_1 = require("./ws.gateway");
let IoTController = IoTController_1 = class IoTController {
    constructor(wsGateway) {
        this.wsGateway = wsGateway;
        this.logger = new common_1.Logger(IoTController_1.name);
        this.apiKey = process.env.SENSOR_API_KEY || 'changeme123';
    }
    async receiveSensorReading(body, apiKey) {
        if (!apiKey || apiKey !== this.apiKey) {
            this.logger.warn(`❌ Unauthorized sensor reading attempt`);
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        const sensorValue = body.value ?? body.sensor ?? 0;
        const timestamp = Date.now();
        this.logger.log(`📡 Received sensor reading: ${sensorValue}`);
        this.wsGateway.broadcastSensorData({
            timestamp,
            value: sensorValue,
        });
        return {
            success: true,
            message: 'Sensor reading received and broadcasted',
            timestamp,
        };
    }
};
exports.IoTController = IoTController;
__decorate([
    (0, common_1.Post)('reading'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "receiveSensorReading", null);
exports.IoTController = IoTController = IoTController_1 = __decorate([
    (0, common_1.Controller)('iot'),
    __metadata("design:paramtypes", [ws_gateway_1.WsGateway])
], IoTController);
//# sourceMappingURL=iot.controller.js.map