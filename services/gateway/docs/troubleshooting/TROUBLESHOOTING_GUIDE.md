# Troubleshooting Guide

## Tổng quan

Hướng dẫn xử lý các vấn đề thường gặp khi triển khai và vận hành API Gateway.

## 🔍 Diagnostic Tools

### Health Check Commands
```bash
# Basic health check
curl -v http://localhost:3000/api/v1/health

# Liveness probe
curl -v http://localhost:3000/api/v1/health/liveness

# Readiness probe
curl -v http://localhost:3000/api/v1/health/readiness

# Service-specific health
curl -v http://localhost:3000/api/v1/users/health
```

### Log Analysis
```bash
# View real-time logs
tail -f logs/gateway.log

# Search for errors
grep -i error logs/gateway.log

# Search for specific service
grep "users-service" logs/gateway.log

# Count requests by status
grep "GET /api/v1/health" logs/gateway.log | wc -l
```

### Network Diagnostics
```bash
# Test service connectivity
curl -v http://localhost:4001/health
curl -v http://localhost:4002/health

# Test proxy routing
curl -v http://localhost:3000/api/v1/users
curl -v http://localhost:3000/api/v1/auth

# Check DNS resolution
nslookup users-service
nslookup auth-service
```

## 🚨 Common Issues

### 1. Gateway không khởi động

#### Symptoms
- Gateway không start
- Port 3000 không available
- Error trong logs

#### Diagnosis
```bash
# Check if port is in use
lsof -i :3000

# Check process
ps aux | grep node

# Check logs
tail -f logs/gateway.log
```

#### Solutions
```bash
# Kill existing process
pkill -f "node.*gateway"

# Check environment variables
echo $PORT
echo $NODE_ENV

# Restart gateway
yarn dev
```

### 2. Service không khả dụng

#### Symptoms
- 502 Bad Gateway errors
- Service health check failed
- Proxy errors trong logs

#### Diagnosis
```bash
# Check service URLs
echo $USERS_SERVICE_URL
echo $AUTH_SERVICE_URL

# Test service directly
curl -v $USERS_SERVICE_URL/health
curl -v $AUTH_SERVICE_URL/health

# Check gateway proxy logs
grep "proxy error" logs/gateway.log
```

#### Solutions
```bash
# Start missing services
cd ../users && yarn dev
cd ../auth && yarn dev

# Update service URLs
export USERS_SERVICE_URL=http://localhost:4001
export AUTH_SERVICE_URL=http://localhost:4002

# Restart gateway
yarn dev
```

### 3. CORS Errors

#### Symptoms
- Browser CORS errors
- Preflight requests failing
- 403 Forbidden responses

#### Diagnosis
```bash
# Test CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:3000/api/v1/health

# Check ALLOWED_ORIGINS
echo $ALLOWED_ORIGINS
```

#### Solutions
```bash
# Update CORS configuration
export ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Restart gateway
yarn dev
```

### 4. Rate Limiting Issues

#### Symptoms
- 429 Too Many Requests
- Rate limit headers missing
- Unexpected throttling

#### Diagnosis
```bash
# Check rate limit headers
curl -I http://localhost:3000/api/v1/health

# Check throttle configuration
echo $THROTTLE_TTL
echo $THROTTLE_LIMIT

# Test rate limiting
for i in {1..110}; do
  curl http://localhost:3000/api/v1/health
done
```

#### Solutions
```bash
# Adjust rate limits
export THROTTLE_TTL=60
export THROTTLE_LIMIT=200

# Restart gateway
yarn dev
```

### 5. Health Check Failures

#### Symptoms
- Health check returning unhealthy
- Kubernetes probes failing
- Service status showing errors

#### Diagnosis
```bash
# Check health endpoint
curl -v http://localhost:3000/api/v1/health

# Check individual services
curl -v http://localhost:3000/api/v1/health/readiness

# Check service dependencies
curl -v $USERS_SERVICE_URL/health
curl -v $AUTH_SERVICE_URL/health
```

#### Solutions
```bash
# Fix service dependencies
# Start all required services first

# Check service URLs
# Ensure all services are running

# Restart gateway
yarn dev
```

### 6. Performance Issues

#### Symptoms
- Slow response times
- High memory usage
- CPU spikes

#### Diagnosis
```bash
# Check response times
curl -w "@curl-format.txt" http://localhost:3000/api/v1/health

# Monitor resources
htop -p $(pgrep -f "node.*gateway")

# Check memory usage
ps aux | grep gateway
```

#### Solutions
```bash
# Increase memory limits
export NODE_OPTIONS="--max-old-space-size=2048"

# Optimize proxy settings
# Adjust timeout values

# Restart gateway
yarn dev
```

### 7. Logging Issues

#### Symptoms
- No logs generated
- Log format incorrect
- Missing request information

#### Diagnosis
```bash
# Check log file
ls -la logs/

# Test logging
curl http://localhost:3000/api/v1/health
tail -f logs/gateway.log

# Check log format
head -n 5 logs/gateway.log
```

#### Solutions
```bash
# Create log directory
mkdir -p logs

# Set log level
export LOG_LEVEL=debug

# Restart gateway
yarn dev
```

## 🔧 Advanced Troubleshooting

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development DEBUG=* yarn dev

# Or with specific debug
DEBUG=gateway:*,proxy:* yarn dev
```

### Performance Profiling
```bash
# CPU profiling
node --prof dist/main

# Memory profiling
node --inspect dist/main

# Heap dump
curl -X POST http://localhost:3000/debug/heapdump
```

### Network Analysis
```bash
# TCP dump
sudo tcpdump -i lo0 port 3000

# Network connections
netstat -an | grep 3000

# Connection limits
ulimit -n
```

### Memory Analysis
```bash
# Memory usage
node -e "console.log(process.memoryUsage())"

# Garbage collection
node --trace-gc dist/main

# Memory leak detection
node --inspect --expose-gc dist/main
```

## 📊 Monitoring & Alerts

### Key Metrics to Monitor
- Response time (p95, p99)
- Error rate
- Request rate
- Memory usage
- CPU usage
- Service health status

### Alert Conditions
```yaml
alerts:
  - name: "High Error Rate"
    condition: "error_rate > 5%"
    duration: "5m"
    
  - name: "High Response Time"
    condition: "response_time_p95 > 1000ms"
    duration: "5m"
    
  - name: "Service Unhealthy"
    condition: "health_status != 'healthy'"
    duration: "1m"
    
  - name: "High Memory Usage"
    condition: "memory_usage > 80%"
    duration: "5m"
```

### Log Analysis Commands
```bash
# Error rate calculation
grep "ERROR" logs/gateway.log | wc -l

# Request rate
grep "GET /api/v1/health" logs/gateway.log | wc -l

# Response time analysis
grep "response_time" logs/gateway.log | awk '{sum+=$NF} END {print sum/NR}'

# Top endpoints
grep "GET\|POST\|PUT\|DELETE" logs/gateway.log | awk '{print $2}' | sort | uniq -c | sort -nr
```

## 🛠️ Recovery Procedures

### Service Recovery
```bash
# 1. Stop gateway
pkill -f "node.*gateway"

# 2. Check dependencies
curl $USERS_SERVICE_URL/health
curl $AUTH_SERVICE_URL/health

# 3. Start gateway
yarn dev

# 4. Verify health
curl http://localhost:3000/api/v1/health
```

### Configuration Recovery
```bash
# 1. Backup current config
cp .env .env.backup

# 2. Reset to defaults
cp .env.example .env

# 3. Update with correct values
nano .env

# 4. Restart gateway
yarn dev
```

### Data Recovery
```bash
# 1. Check logs for errors
grep -i error logs/gateway.log

# 2. Restore from backup
cp logs/gateway.log.backup logs/gateway.log

# 3. Restart gateway
yarn dev
```

## 📞 Support Contacts

### Escalation Matrix
1. **Level 1**: Development team
2. **Level 2**: DevOps team
3. **Level 3**: Infrastructure team

### Contact Information
- **Development**: dev-team@company.com
- **DevOps**: devops@company.com
- **Infrastructure**: infra@company.com

### Emergency Contacts
- **On-call**: +1-555-0123
- **Manager**: +1-555-0124

## 📚 Additional Resources

### Documentation
- [API Reference](./api/API_REFERENCE.md)
- [Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)
- [Architecture Overview](../README.md)

### Tools
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- [ELK Stack](https://www.elastic.co/elk-stack)
- [Jaeger](https://www.jaegertracing.io/)

### Best Practices
- Monitor health checks regularly
- Set up proper alerting
- Maintain log rotation
- Regular performance testing
- Security scanning
- Backup procedures
