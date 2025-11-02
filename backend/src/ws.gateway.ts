import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket Gateway for real-time communication
 * Broadcasts updates to all connected doctor clients
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected clients
  private doctorClients: Set<Socket> = new Set();

  /**
   * Handle new client connection
   */
  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
    this.doctorClients.add(client);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
    this.doctorClients.delete(client);
  }

  /**
   * Handle cv-update events from patient clients
   * Receives rep count and form accuracy, then broadcasts to all doctor clients
   */
  @SubscribeMessage('cv-update')
  handleCVUpdate(client: Socket, payload: { reps: number; formAccuracy: number; timestamp?: number }) {
    const data = {
      reps: payload.reps ?? 0,
      formAccuracy: payload.formAccuracy ?? 0,
      timestamp: payload.timestamp ?? Date.now(),
    };

    console.log(`🎥 Received CV update from client ${client.id}: ${data.reps} reps, ${data.formAccuracy}% accuracy`);

    // Broadcast to all connected clients (doctor dashboard)
    this.server.emit('cv-update', data);
    
    return { success: true };
  }

  /**
   * Broadcast sensor data to all doctor clients
   */
  broadcastSensorData(data: { timestamp: number; value: number }) {
    this.server.emit('sensor-data', data);
    console.log(`📊 Broadcasting sensor data: ${data.value}`);
  }

  /**
   * Broadcast CV data (reps and form accuracy) to all doctor clients
   * (Alternative method for HTTP POST endpoint compatibility)
   */
  broadcastCVData(data: { reps: number; formAccuracy: number; timestamp: number }) {
    this.server.emit('cv-update', data);
    console.log(`🎥 Broadcasting CV update: ${data.reps} reps, ${data.formAccuracy}% accuracy`);
  }

  /**
   * Get number of connected doctor clients
   */
  getConnectedClientsCount(): number {
    return this.doctorClients.size;
  }
}

