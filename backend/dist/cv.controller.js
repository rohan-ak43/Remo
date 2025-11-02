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
var CVController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CVController = void 0;
const common_1 = require("@nestjs/common");
const ws_gateway_1 = require("./ws.gateway");
let CVController = CVController_1 = class CVController {
    constructor(wsGateway) {
        this.wsGateway = wsGateway;
        this.logger = new common_1.Logger(CVController_1.name);
        this.apiKey = process.env.SENSOR_API_KEY || 'changeme123';
    }
    async receiveCVUpdate(body, apiKey) {
        if (!apiKey || apiKey !== this.apiKey) {
            this.logger.warn(`❌ Unauthorized CV update attempt`);
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        const reps = body.reps ?? 0;
        const formAccuracy = body.formAccuracy ?? 0;
        const timestamp = Date.now();
        this.logger.log(`🎥 Received CV update: ${reps} reps, ${formAccuracy}% accuracy`);
        this.wsGateway.broadcastCVData({
            reps,
            formAccuracy,
            timestamp,
        });
        return {
            success: true,
            message: 'CV update received and broadcasted',
            timestamp,
        };
    }
};
exports.CVController = CVController;
__decorate([
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CVController.prototype, "receiveCVUpdate", null);
exports.CVController = CVController = CVController_1 = __decorate([
    (0, common_1.Controller)('cv'),
    __metadata("design:paramtypes", [ws_gateway_1.WsGateway])
], CVController);
//# sourceMappingURL=cv.controller.js.map