import { Module } from '@nestjs/common';
import { HealthController } from '../presentation/health.controller';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}


