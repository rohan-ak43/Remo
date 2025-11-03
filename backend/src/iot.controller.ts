import { Controller, Post, Body, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { WsGateway } from './ws.gateway';

/**
 * IoT Controller - Receives sensor data from ESP32
 * Validates API key and broadcasts to WebSocket clients
 */
@Controller('iot')
export class IoTController {
  private readonly logger = new Logger(IoTController.name);
  private readonly apiKey = process.env.SENSOR_API_KEY || 'changeme123';

  constructor(private readonly wsGateway: WsGateway) {}

  /**
   * POST /iot/reading
   * Receives FSR sensor readings from ESP32
   * Requires x-api-key header for authentication
   */
  @Post('reading')
  async receiveSensorReading(
    @Body() body: { value?: number; sensor?: number },
    @Headers('x-api-key') apiKey: string,
  ) {
    // Validate API key
    if (!apiKey || apiKey !== this.apiKey) {
      this.logger.warn(`❌ Unauthorized sensor reading attempt`);
      throw new UnauthorizedException('Invalid API key');
    }

    // Extract sensor value (support both 'value' and 'sensor' fields)
    const sensorValue = body.value ?? body.sensor ?? 0;
    const timestamp = Date.now();

    this.logger.log(`📡 Received sensor reading: ${sensorValue}`);

    // Broadcast to all connected doctor clients via WebSocket
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
}