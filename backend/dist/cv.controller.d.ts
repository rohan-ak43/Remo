import { WsGateway } from './ws.gateway';
export declare class CVController {
    private readonly wsGateway;
    private readonly logger;
    private readonly apiKey;
    constructor(wsGateway: WsGateway);
    receiveCVUpdate(body: {
        reps: number;
        formAccuracy: number;
    }, apiKey: string): Promise<{
        success: boolean;
        message: string;
        timestamp: number;
    }>;
}
