import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { IoTController } from './iot.controller';
import { CVController } from './cv.controller';

@Module({
  imports: [],
  controllers: [IoTController, CVController],
  providers: [WsGateway],
})
export class AppModule {}

