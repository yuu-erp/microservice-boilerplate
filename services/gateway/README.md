# API Gateway Service

API Gateway cho hệ thống Micro Chat Enterprise, được thiết kế theo kiến trúc microservices.

## 🚀 Tính năng

### ✅ Đã triển khai (Phase 1)
- **Request Routing**: Reverse proxy tới các microservice
- **Basic Security**: CORS, Helmet security headers
- **Logging**: Structured logging với Morgan
- **Health Check**: Liveness và readiness probes
- **Configuration Management**: Environment-based config
- **API Versioning**: URI versioning (v1)
- **Rate Limiting**: Throttler với configurable limits

### 🔄 Sắp tới (Phase 2)
- **Authentication & Authorization**: JWT middleware
- **Error Handling**: Standardized error responses
- **API Documentation**: Swagger UI
- **Request/Response Transformation**: Custom middleware

### 📋 Tương lai (Phase 3)
- **Load Balancing**: Multiple service instances
- **Caching**: Redis integration
- **Circuit Breaker**: Service resilience
- **Service Discovery**: Dynamic service registry
- **Advanced Monitoring**: Prometheus/Grafana

## 🏗️ Cấu trúc dự án

```
src/
├── bootstrap/           # Khởi tạo ứng dụng
│   ├── logging.bootstrap.ts
│   ├── security.bootstrap.ts
│   ├── proxy.bootstrap.ts
│   └── validation.bootstrap.ts
├── config/              # Cấu hình
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

## ⚙️ Cấu hình

### Biến môi trường

Tạo file `.env` từ `.env.example`:

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

## 🚀 Chạy ứng dụng

### Development
```bash
yarn dev
```

### Production
```bash
yarn build
yarn start:prod
```

## 📚 API Endpoints

### Health Check
- `GET /api/v1/health` - Health status của gateway và services
- `GET /api/v1/healthy` - Alias cho health check
- `GET /api/v1/health/liveness` - Liveness probe
- `GET /api/v1/health/readiness` - Readiness probe

### Proxy Routes
- `GET /api/v1/users/*` → Users Service
- `GET /api/v1/auth/*` → Auth Service
- `GET /api/v1/messages/*` → Messages Service (WebSocket support)
- `GET /api/v1/notifications/*` → Notifications Service (WebSocket support)

### Documentation
- `GET /api/v1/docs` - Swagger UI

## 🔧 Development

### Cài đặt dependencies
```bash
yarn install
```

### Linting
```bash
yarn lint
```

### Testing
```bash
yarn test
yarn test:e2e
```

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
    }
  }
}
```

## 🔒 Security

- **CORS**: Configurable origins
- **Helmet**: Security headers
- **Rate Limiting**: IP-based throttling
- **Input Validation**: Request validation
- **Trust Proxy**: X-Forwarded headers support

## 📝 Logging

Structured JSON logging với:
- Timestamp
- Log level
- Service name
- Request tracking
- Error details

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes theo conventional commits
4. Push và tạo Pull Request

## 📄 License

UNLICENSED - Private project
