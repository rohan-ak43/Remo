import { WsGateway } from './ws.gateway';
export declare class IoTController {
    private readonly wsGateway;
    private readonly logger;
    private readonly apiKey;
    constructor(wsGateway: WsGateway);
    receiveSensorReading(body: {
        value?: number;
        sensor?: number;
    }, apiKey: string): Promise<{
        success: boolean;
        message: string;
        timestamp: number;
    }>;
}
