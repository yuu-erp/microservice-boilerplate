# Gateway Documentation Index

## 📚 Tổng quan

Đây là bộ tài liệu đầy đủ cho API Gateway service trong hệ thống Micro Chat Enterprise.

## 📖 Tài liệu chính

### [📋 Tổng quan](./README.md)
- Kiến trúc tổng thể
- Tính năng chính
- Quick start guide
- Cấu hình cơ bản

### [🔗 API Reference](./api/API_REFERENCE.md)
- Endpoint documentation
- Request/Response examples
- Error handling
- WebSocket support
- Authentication & Authorization

### [🚀 Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)
- Local development
- Docker deployment
- Kubernetes deployment
- Cloud deployment (AWS, GCP, Azure)
- CI/CD pipeline
- Monitoring & Security

### [🐛 Troubleshooting Guide](./troubleshooting/TROUBLESHOOTING_GUIDE.md)
- Common issues & solutions
- Diagnostic tools
- Performance troubleshooting
- Recovery procedures
- Support contacts

## 🎯 Hướng dẫn sử dụng

### Cho Developers
1. Đọc [Tổng quan](./README.md) để hiểu kiến trúc
2. Xem [API Reference](./api/API_REFERENCE.md) để tích hợp
3. Sử dụng [Troubleshooting](./troubleshooting/TROUBLESHOOTING_GUIDE.md) khi gặp vấn đề

### Cho DevOps
1. Đọc [Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md) để triển khai
2. Cấu hình monitoring và alerting
3. Thiết lập CI/CD pipeline

### Cho Operations
1. Sử dụng [Troubleshooting Guide](./troubleshooting/TROUBLESHOOTING_GUIDE.md)
2. Monitor health checks
3. Maintain logs và metrics

## 🔗 Liên kết nhanh

### Health Checks
- `GET /api/v1/health` - Health status
- `GET /api/v1/health/liveness` - Liveness probe
- `GET /api/v1/health/readiness` - Readiness probe

### Documentation
- `GET /api/v1/docs` - Swagger UI

### Service Endpoints
- `GET /api/v1/users/*` → Users Service
- `GET /api/v1/auth/*` → Auth Service
- `GET /api/v1/messages/*` → Messages Service
- `GET /api/v1/notifications/*` → Notifications Service

## 📊 Monitoring

### Key Metrics
- Response time (p95, p99)
- Error rate
- Request rate
- Memory usage
- CPU usage
- Service health status

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

### Headers
- `X-Gateway-Version` - Gateway version
- `X-Gateway-Timestamp` - Response timestamp
- `X-RateLimit-*` - Rate limiting info

### Configuration
- CORS với configurable origins
- Helmet security headers
- Rate limiting với ThrottlerModule
- Trust proxy cho X-Forwarded headers

## 🚀 Quick Commands

### Development
```bash
# Start gateway
cd services/gateway && yarn dev

# Health check
curl http://localhost:3000/api/v1/health

# Swagger docs
open http://localhost:3000/api/v1/docs
```

### Production
```bash
# Build
yarn build

# Start
yarn start:prod

# Docker
docker build -t gateway:latest .
docker run -p 3000:3000 gateway:latest
```

### Troubleshooting
```bash
# Check logs
tail -f logs/gateway.log

# Test services
curl $USERS_SERVICE_URL/health
curl $AUTH_SERVICE_URL/health

# Debug mode
NODE_ENV=development DEBUG=* yarn dev
```

## 📞 Support

### Documentation Issues
- Tạo issue trên GitHub
- Tag với `documentation` label

### Technical Issues
- Sử dụng [Troubleshooting Guide](./troubleshooting/TROUBLESHOOTING_GUIDE.md)
- Liên hệ development team

### Emergency
- On-call: +1-555-0123
- Manager: +1-555-0124

## 📝 Contributing

### Documentation Updates
1. Fork repository
2. Tạo feature branch
3. Update documentation
4. Tạo Pull Request

### Code Standards
- Conventional Commits
- ESLint + Prettier
- TypeScript strict mode
- Test coverage

## 📄 License

UNLICENSED - Private project

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
