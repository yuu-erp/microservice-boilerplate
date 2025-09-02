# Micro Chat — Enterprise Microservices (Node.js + TypeScript + Docker + K8s)

A production-grade scaffold for a chat-style microservices system.
Includes: Turborepo monorepo, shared libs, Express services with health/ready/metrics,
JWT, Socket.IO + Redis, Prisma, Prometheus/OpenTelemetry, CI/CD (GitHub Actions),
Kubernetes manifests + Helm skeleton, and local docker-compose for dev.

## Quick start (local)
```bash
# 1) Node deps
npm ci

# 2) Dev mode (parallel)
npm run dev

# or bring up infra + services in containers
docker compose -f docker-compose.dev.yml up --build -d
```

> Prisma is configured; run per-service migrations as needed.
