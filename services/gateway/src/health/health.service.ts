import { Injectable } from '@nestjs/common';
import { proxyConfig } from '../config/proxy.config';

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'unavailable';
  responseTime?: number;
  lastCheck?: string;
  error?: string;
}

interface HealthStatus {
  gateway: {
    status: 'healthy';
    uptime: number;
    version: string;
  };
  services: Record<string, ServiceHealth>;
}

@Injectable()
export class HealthService {
  async getHealthStatus(): Promise<HealthStatus> {
    const services: Record<string, ServiceHealth> = {};
    // Check each service health
    for (const [path, config] of Object.entries(proxyConfig)) {
      const serviceName = path.replace('/api/v1/', '');

      if (!config.target) {
        services[serviceName] = {
          status: 'unavailable',
          error: 'Service URL not configured',
        };
        continue;
      }

      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${config.target}/health`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        services[serviceName] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime,
          lastCheck: new Date().toISOString(),
          error: response.ok ? undefined : `HTTP ${response.status}`,
        };
      } catch (error) {
        services[serviceName] = {
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return {
      gateway: {
        status: 'healthy',
        uptime: process.uptime(),
        version: process.env.GATEWAY_VERSION || '1.0.0',
      },
      services,
    };
  }
}
