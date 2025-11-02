import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private doctorClients;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleCVUpdate(client: Socket, payload: {
        reps: number;
        formAccuracy: number;
        timestamp?: number;
    }): {
        success: boolean;
    };
    broadcastSensorData(data: {
        timestamp: number;
        value: number;
    }): void;
    broadcastCVData(data: {
        reps: number;
        formAccuracy: number;
        timestamp: number;
    }): void;
    getConnectedClientsCount(): number;
}
