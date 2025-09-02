# API Gateway Documentation

## Tổng quan

API Gateway là thành phần trung tâm trong kiến trúc microservices của Micro Chat Enterprise. Gateway đảm nhiệm việc định tuyến request, bảo mật, rate limiting và monitoring cho toàn bộ hệ thống.

## 🏗️ Kiến trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│  API Gateway   │───▶│ Microservices  │
│                 │    │   (Port 3000)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Swagger UI    │
                       │  /api/v1/docs   │
                       └─────────────────┘
```

## 📋 Tính năng chính

### ✅ Đã triển khai
- **Request Routing**: Reverse proxy tới microservices
- **Security**: CORS, Helmet, Rate Limiting
- **Logging**: Structured JSON logging
- **Health Check**: Liveness/Readiness probes
- **API Versioning**: URI versioning (v1)
- **Documentation**: Swagger UI

### 🔄 Đang phát triển
- **Authentication**: JWT middleware
- **Error Handling**: Standardized error responses
- **Request Transformation**: Custom middleware

### 📋 Kế hoạch
- **Load Balancing**: Multiple instances
- **Caching**: Redis integration
- **Circuit Breaker**: Service resilience
- **Service Discovery**: Dynamic registry

## 🚀 Quick Start

### 1. Cài đặt
```bash
cd services/gateway
yarn install
```

### 2. Cấu hình
```bash
cp .env.example .env
# Chỉnh sửa .env với service URLs
```

### 3. Chạy
```bash
# Development
yarn dev

# Production
yarn build
yarn start:prod
```

### 4. Kiểm tra
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Swagger docs
open http://localhost:3000/api/v1/docs
```

## 📚 API Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
Hiện tại chưa có authentication. Sẽ được thêm trong Phase 2.

### Rate Limiting
- **Limit**: 100 requests per minute per IP
- **Headers**: `X-RateLimit-*` headers trong response

### Error Responses
```json
{
  "status": "error",
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "errors": {
    "field": "validation error"
  }
}
```

## 🔗 Service Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health status của gateway và services |
| GET | `/healthy` | Alias cho health check |
| GET | `/health/liveness` | Liveness probe cho Kubernetes |
| GET | `/health/readiness` | Readiness probe cho Kubernetes |

### Proxy Routes
| Service | Endpoint | Target | Features |
|---------|----------|--------|----------|
| Users | `/users/*` | Users Service | CRUD operations |
| Auth | `/auth/*` | Auth Service | Authentication |
| Messages | `/messages/*` | Messages Service | WebSocket support |
| Notifications | `/notifications/*` | Notifications Service | WebSocket support |

### Documentation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/docs` | Swagger UI documentation |

## 📊 Monitoring

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "gateway": {
    "status": "healthy",
    "uptime": 3600,
    "version": "1.0.0"
  },
  "services": {
    "users": {
      "status": "healthy",
      "responseTime": 45,
      "lastCheck": "2024-01-01T00:00:00.000Z"
    },
    "auth": {
      "status": "unhealthy",
      "responseTime": null,
      "lastCheck": "2024-01-01T00:00:00.000Z",
      "error": "Connection timeout"
    }
  }
}
```

### Logging
Structured JSON logs với format:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "GET /api/v1/health 200 45ms",
  "service": "gateway"
}
```

## 🔒 Security

### CORS Configuration
```typescript
{
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}
```

### Helmet Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

### Rate Limiting
- IP-based throttling
- Configurable limits via environment variables
- Rate limit headers trong response

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Gateway port |
| `NODE_ENV` | `development` | Environment |
| `GATEWAY_VERSION` | `1.0.0` | Gateway version |
| `THROTTLE_TTL` | `60` | Rate limit window (seconds) |
| `THROTTLE_LIMIT` | `100` | Rate limit requests per window |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS origins (comma-separated) |
| `USERS_SERVICE_URL` | - | Users service URL |
| `AUTH_SERVICE_URL` | - | Auth service URL |
| `MESSAGES_SERVICE_URL` | - | Messages service URL |
| `NOTIFICATIONS_SERVICE_URL` | - | Notifications service URL |

### Example .env
```bash
# Gateway Configuration
PORT=3000
NODE_ENV=development
GATEWAY_VERSION=1.0.0

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Microservice URLs
USERS_SERVICE_URL=http://localhost:4001
AUTH_SERVICE_URL=http://localhost:4002
MESSAGES_SERVICE_URL=http://localhost:4003
NOTIFICATIONS_SERVICE_URL=http://localhost:4004
```

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
      - name: gateway
        image: gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        - name: USERS_SERVICE_URL
          value: "http://users-service:4001"
        livenessProbe:
          httpGet:
            path: /api/v1/health/liveness
            port: 3000
        readinessProbe:
          httpGet:
            path: /api/v1/health/readiness
            port: 3000
```

## 🔧 Development

### Scripts
```bash
# Development
yarn dev              # Start with watch mode
yarn start:dev        # Start development server
yarn start:debug      # Start with debug mode

# Production
yarn build            # Build for production
yarn start:prod       # Start production server

# Testing
yarn test             # Unit tests
yarn test:e2e         # End-to-end tests
yarn test:cov         # Test coverage

# Code Quality
yarn lint             # ESLint
yarn format           # Prettier
```

### Project Structure
```
src/
├── bootstrap/           # Application bootstrap
│   ├── logging.bootstrap.ts
│   ├── security.bootstrap.ts
│   ├── proxy.bootstrap.ts
│   └── validation.bootstrap.ts
├── config/              # Configuration
│   └── proxy.config.ts
├── health/              # Health check
│   ├── health.controller.ts
│   └── health.service.ts
├── middleware/          # Custom middleware
├── proxy/               # Proxy logic
├── security/            # Security modules
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Service không khả dụng
```bash
# Kiểm tra service URL
curl http://localhost:4001/health

# Kiểm tra gateway logs
docker logs gateway
```

#### 2. CORS errors
```bash
# Kiểm tra ALLOWED_ORIGINS
echo $ALLOWED_ORIGINS

# Test CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:3000/api/v1/health
```

#### 3. Rate limiting
```bash
# Kiểm tra rate limit headers
curl -I http://localhost:3000/api/v1/health
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
```

#### 4. Health check failed
```bash
# Kiểm tra từng service
curl http://localhost:3000/api/v1/health/readiness

# Kiểm tra logs
tail -f logs/gateway.log
```

### Debug Mode
```bash
# Start với debug logging
NODE_ENV=development DEBUG=* yarn dev

# Hoặc với debug port
yarn start:debug
```

### Performance Monitoring
```bash
# Kiểm tra response time
curl -w "@curl-format.txt" http://localhost:3000/api/v1/health

# Monitor với htop
htop -p $(pgrep -f "node.*gateway")
```

## 📈 Metrics

### Key Metrics
- **Response Time**: Average response time per endpoint
- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second
- **Service Health**: Health status của từng service
- **Rate Limit**: Number of rate-limited requests

### Monitoring Tools
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Log aggregation
- **Jaeger**: Distributed tracing

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Tạo feature branch: `git checkout -b feat/gateway-feature`
3. Commit changes: `git commit -m "feat(gateway): add new feature"`
4. Push branch: `git push origin feat/gateway-feature`
5. Tạo Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Testing
```bash
# Unit tests
yarn test

# Integration tests
yarn test:e2e

# Coverage
yarn test:cov
```

## 📄 License

UNLICENSED - Private project

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: `/docs` folder
- **Team**: Development team
