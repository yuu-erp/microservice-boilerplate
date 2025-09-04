import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller(['health', 'healthy'])
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(@Res() res: Response) {
    const healthStatus = await this.healthService.getHealthStatus();
    const isHealthy = Object.values(healthStatus.services).every(
      (status) => status.status === 'healthy',
    );

    const statusCode = isHealthy
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      gateway: healthStatus.gateway,
      services: healthStatus.services,
      uptime: process.uptime(),
      version: process.env.GATEWAY_VERSION || '1.0.0',
    });
  }

  @Get('liveness')
  liveness() {
    return { status: 'alive' };
  }

  @Get('readiness')
  async readiness(@Res() res: Response) {
    const healthStatus = await this.healthService.getHealthStatus();
    const isReady = Object.values(healthStatus.services).every(
      (status) => status.status === 'healthy',
    );

    res.status(isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({
      status: isReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
}
