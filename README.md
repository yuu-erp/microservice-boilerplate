# Enterprise Microservices (Node.js + TypeScript + Docker + K8s)

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

# Sơ đồ hoạt động hệ thống Microservices (Chi tiết)

```mermaid
flowchart TD
    %% Khởi tạo các service
    subgraph Client
        U[User / Client]
    end

    subgraph Gateway
        APIGW[API Gateway]
    end

    subgraph Services
        US[User Service\n(DB)]
        OS[Order Service\n(DB)]
        PS[Payment Service\n(DB)]
        IS[Inventory Service\n(DB)]
        NS[Notification Service]
    end

    subgraph MQ
        MQ[Message Queue]
    end

    %% Luồng chính
    U -->|Gửi request đặt hàng| APIGW
    APIGW -->|Forward request| OS
    OS -->|Check user info| US
    OS -->|Process payment| PS
    OS -->|Create order event| MQ
    MQ --> IS
    MQ --> NS

    %% Luồng phụ
    IS -->|Update stock| IS
    NS -->|Send email/notification| U

    %% Tùy chỉnh style
    style APIGW fill:#e0f7fa,stroke:#000,stroke-width:2px
    style US fill:#fff9c4,stroke:#000,stroke-width:2px
    style OS fill:#ffe0b2,stroke:#000,stroke-width:2px
    style PS fill:#ffccbc,stroke:#000,stroke-width:2px
    style IS fill:#c8e6c9,stroke:#000,stroke-width:2px
    style NS fill:#d1c4e9,stroke:#000,stroke-width:2px
    style MQ fill:#f5f5f5,stroke:#000,stroke-width:2px
