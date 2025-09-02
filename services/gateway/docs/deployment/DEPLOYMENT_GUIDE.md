# Deployment Guide

## Tổng quan

Hướng dẫn triển khai API Gateway trong các môi trường khác nhau: development, staging, và production.

## 🏗️ Kiến trúc Deployment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │───▶│  API Gateway   │───▶│ Microservices   │
│   (Nginx/ALB)   │    │   (Port 3000)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Monitoring   │
                       │ (Prometheus)    │
                       └─────────────────┘
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Yarn
- Docker (optional)

### Setup
```bash
# Clone repository
git clone <repository-url>
cd micro-chat-enterprise/services/gateway

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### Environment Configuration
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

# Microservice URLs (Local)
USERS_SERVICE_URL=http://localhost:4001
AUTH_SERVICE_URL=http://localhost:4002
MESSAGES_SERVICE_URL=http://localhost:4003
NOTIFICATIONS_SERVICE_URL=http://localhost:4004
```

### Run Development Server
```bash
# Start with watch mode
yarn dev

# Or start development server
yarn start:dev

# Or start with debug
yarn start:debug
```

### Verify Deployment
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Swagger docs
open http://localhost:3000/api/v1/docs
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN yarn build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health/liveness || exit 1

# Start application
CMD ["node", "dist/main"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  gateway:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - USERS_SERVICE_URL=http://users-service:4001
      - AUTH_SERVICE_URL=http://auth-service:4002
      - MESSAGES_SERVICE_URL=http://messages-service:4003
      - NOTIFICATIONS_SERVICE_URL=http://notifications-service:4004
    depends_on:
      - users-service
      - auth-service
      - messages-service
      - notifications-service
    networks:
      - microservices

  users-service:
    image: users-service:latest
    ports:
      - "4001:4001"
    networks:
      - microservices

  auth-service:
    image: auth-service:latest
    ports:
      - "4002:4002"
    networks:
      - microservices

  messages-service:
    image: messages-service:latest
    ports:
      - "4003:4003"
    networks:
      - microservices

  notifications-service:
    image: notifications-service:latest
    ports:
      - "4004:4004"
    networks:
      - microservices

networks:
  microservices:
    driver: bridge
```

### Build và Run
```bash
# Build image
docker build -t gateway:latest .

# Run with docker-compose
docker-compose up -d

# Or run standalone
docker run -d \
  --name gateway \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e USERS_SERVICE_URL=http://host.docker.internal:4001 \
  gateway:latest
```

## ☸️ Kubernetes Deployment

### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: microservices
```

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gateway-config
  namespace: microservices
data:
  NODE_ENV: "production"
  PORT: "3000"
  GATEWAY_VERSION: "1.0.0"
  THROTTLE_TTL: "60"
  THROTTLE_LIMIT: "100"
  ALLOWED_ORIGINS: "https://app.example.com,https://admin.example.com"
```

### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gateway-secrets
  namespace: microservices
type: Opaque
data:
  JWT_SECRET: <base64-encoded-jwt-secret>
```

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
  namespace: microservices
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
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: gateway-config
              key: NODE_ENV
        - name: PORT
          valueFrom:
            configMapKeyRef:
              name: gateway-config
              key: PORT
        - name: USERS_SERVICE_URL
          value: "http://users-service:4001"
        - name: AUTH_SERVICE_URL
          value: "http://auth-service:4002"
        - name: MESSAGES_SERVICE_URL
          value: "http://messages-service:4003"
        - name: NOTIFICATIONS_SERVICE_URL
          value: "http://notifications-service:4004"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health/liveness
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health/readiness
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: gateway-service
  namespace: microservices
spec:
  selector:
    app: gateway
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gateway-ingress
  namespace: microservices
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: gateway-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 80
```

### Horizontal Pod Autoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: gateway-hpa
  namespace: microservices
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Deploy to Kubernetes
```bash
# Apply namespace
kubectl apply -f namespace.yaml

# Apply config
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Deploy application
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml

# Check status
kubectl get pods -n microservices
kubectl get services -n microservices
kubectl get ingress -n microservices
```

## ☁️ Cloud Deployment

### AWS ECS

#### Task Definition
```json
{
  "family": "gateway",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "gateway",
      "image": "account.dkr.ecr.region.amazonaws.com/gateway:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/gateway",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/v1/health/liveness || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### Service Definition
```json
{
  "cluster": "microservices",
  "serviceName": "gateway",
  "taskDefinition": "gateway",
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/gateway/123",
      "containerName": "gateway",
      "containerPort": 3000
    }
  ],
  "desiredCount": 3,
  "launchType": "FARGATE",
  "platformVersion": "LATEST",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-123", "subnet-456"],
      "securityGroups": ["sg-123"],
      "assignPublicIp": "ENABLED"
    }
  }
}
```

### Google Cloud Run

#### Service Configuration
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: gateway
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "3"
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
      - image: gcr.io/project/gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        resources:
          limits:
            cpu: "1000m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /api/v1/health/liveness
            port: 3000
        readinessProbe:
          httpGet:
            path: /api/v1/health/readiness
            port: 3000
```

### Azure Container Instances

#### Container Group
```yaml
apiVersion: 2019-12-01
location: eastus
name: gateway
properties:
  containers:
  - name: gateway
    properties:
      image: registry.azurecr.io/gateway:latest
      ports:
      - port: 3000
      environmentVariables:
      - name: NODE_ENV
        value: "production"
      - name: PORT
        value: "3000"
      resources:
        requests:
          cpu: 0.5
          memoryInGB: 0.5
        limits:
          cpu: 1.0
          memoryInGB: 1.0
  osType: Linux
  restartPolicy: Always
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: 3000
```

## 🔧 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy Gateway

on:
  push:
    branches: [main]
    paths: ['services/gateway/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: cd services/gateway && yarn install
    - run: cd services/gateway && yarn test
    - run: cd services/gateway && yarn lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: cd services/gateway && yarn install
    - run: cd services/gateway && yarn build
    - uses: actions/upload-artifact@v3
      with:
        name: gateway-dist
        path: services/gateway/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/download-artifact@v3
      with:
        name: gateway-dist
    - uses: docker/setup-buildx-action@v2
    - uses: docker/login-action@v2
      with:
        registry: ${{ secrets.REGISTRY }}
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}
    - uses: docker/build-push-action@v4
      with:
        context: ./services/gateway
        push: true
        tags: ${{ secrets.REGISTRY }}/gateway:${{ github.sha }}
    - uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s/deployment.yaml
          k8s/service.yaml
        images: |
          ${{ secrets.REGISTRY }}/gateway:${{ github.sha }}
        namespace: microservices
```

## 📊 Monitoring & Logging

### Prometheus Metrics
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'gateway'
      static_configs:
      - targets: ['gateway-service:3000']
      metrics_path: /metrics
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Gateway Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: gateway-network-policy
  namespace: microservices
spec:
  podSelector:
    matchLabels:
      app: gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: users-service
    ports:
    - protocol: TCP
      port: 4001
  - to:
    - podSelector:
        matchLabels:
          app: auth-service
    ports:
    - protocol: TCP
      port: 4002
```

### RBAC
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ServiceAccount
metadata:
  name: gateway-sa
  namespace: microservices

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: gateway-role
  namespace: microservices
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: gateway-role-binding
  namespace: microservices
subjects:
- kind: ServiceAccount
  name: gateway-sa
  namespace: microservices
roleRef:
  kind: Role
  name: gateway-role
  apiGroup: rbac.authorization.k8s.io
```

## 🚀 Production Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Secrets properly set
- [ ] Health checks implemented
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Security policies applied
- [ ] Backup strategy defined

### Deployment
- [ ] Blue-green deployment tested
- [ ] Rollback procedure documented
- [ ] Load testing completed
- [ ] Performance benchmarks met
- [ ] Security scan passed

### Post-deployment
- [ ] Health checks passing
- [ ] Metrics collection working
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team notified
- [ ] Monitoring dashboard accessible
