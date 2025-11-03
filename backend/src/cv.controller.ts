import { Controller, Post, Body, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { WsGateway } from './ws.gateway';

/**
 * CV Controller - Receives computer vision data from patient page
 * Validates API key and broadcasts to WebSocket clients
 */
@Controller('cv')
export class CVController {
  private readonly logger = new Logger(CVController.name);
  private readonly apiKey = process.env.SENSOR_API_KEY || 'changeme123';

  constructor(private readonly wsGateway: WsGateway) {}

  /**
   * POST /cv/update
   * Receives rep count and form accuracy from patient webcam page
   * Requires x-api-key header for authentication
   */
  @Post('update')
  async receiveCVUpdate(
    @Body() body: { reps: number; formAccuracy: number },
    @Headers('x-api-key') apiKey: string,
  ) {
    // Validate API key
    if (!apiKey || apiKey !== this.apiKey) {
      this.logger.warn(`❌ Unauthorized CV update attempt`);
      throw new UnauthorizedException('Invalid API key');
    }

    // Validate body data
    const reps = body.reps ?? 0;
    const formAccuracy = body.formAccuracy ?? 0;
    const timestamp = Date.now();

    this.logger.log(`🎥 Received CV update: ${reps} reps, ${formAccuracy}% accuracy`);

    // Broadcast to all connected doctor clients via WebSocket
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
}