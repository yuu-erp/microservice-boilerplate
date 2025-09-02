# API Reference

## Tổng quan

API Gateway cung cấp các endpoint để truy cập các microservice thông qua reverse proxy và các tính năng gateway như health check, monitoring.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Hiện tại chưa có authentication. Sẽ được thêm trong Phase 2.

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**: `X-RateLimit-*` headers trong response
- **Configurable**: Có thể thay đổi qua environment variables

## Error Responses

### Standard Error Format
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

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 502 | Bad Gateway |
| 503 | Service Unavailable |

## Endpoints

### Health Check

#### GET /health
Health status của gateway và tất cả microservices.

**Response:**
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

#### GET /healthy
Alias cho `/health` endpoint.

#### GET /health/liveness
Liveness probe cho Kubernetes.

**Response:**
```json
{
  "status": "alive"
}
```

#### GET /health/readiness
Readiness probe cho Kubernetes.

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Proxy Routes

#### Users Service
- **Base Path**: `/users/*`
- **Target**: `USERS_SERVICE_URL`
- **Features**: CRUD operations

**Example:**
```bash
# Get all users
GET /api/v1/users

# Get user by ID
GET /api/v1/users/123

# Create user
POST /api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Auth Service
- **Base Path**: `/auth/*`
- **Target**: `AUTH_SERVICE_URL`
- **Features**: Authentication

**Example:**
```bash
# Login
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Register
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Messages Service
- **Base Path**: `/messages/*`
- **Target**: `MESSAGES_SERVICE_URL`
- **Features**: WebSocket support, Real-time messaging

**Example:**
```bash
# Get messages
GET /api/v1/messages?roomId=123

# Send message
POST /api/v1/messages
Content-Type: application/json

{
  "roomId": "123",
  "content": "Hello world!",
  "type": "text"
}
```

#### Notifications Service
- **Base Path**: `/notifications/*`
- **Target**: `NOTIFICATIONS_SERVICE_URL`
- **Features**: WebSocket support, Push notifications

**Example:**
```bash
# Get notifications
GET /api/v1/notifications

# Mark as read
PUT /api/v1/notifications/123/read

# Subscribe to notifications
POST /api/v1/notifications/subscribe
Content-Type: application/json

{
  "userId": "123",
  "channels": ["email", "push"]
}
```

### Documentation

#### GET /docs
Swagger UI documentation.

**Features:**
- Interactive API documentation
- Try out endpoints
- Authentication support (Bearer token)
- Request/Response examples

## Request/Response Headers

### Request Headers
| Header | Description | Required |
|--------|-------------|----------|
| `Content-Type` | Request content type | Yes (for POST/PUT) |
| `Authorization` | Bearer token (future) | No |
| `X-Request-ID` | Request tracking ID | No |

### Response Headers
| Header | Description |
|--------|-------------|
| `X-Gateway-Version` | Gateway version |
| `X-Gateway-Timestamp` | Response timestamp |
| `X-RateLimit-Limit` | Rate limit total |
| `X-RateLimit-Remaining` | Rate limit remaining |
| `X-RateLimit-Reset` | Rate limit reset time |

## WebSocket Support

### Messages Service
```javascript
// Connect to messages WebSocket
const ws = new WebSocket('ws://localhost:3000/api/v1/messages');

ws.onopen = () => {
  console.log('Connected to messages service');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('New message:', message);
};

ws.onclose = () => {
  console.log('Disconnected from messages service');
};
```

### Notifications Service
```javascript
// Connect to notifications WebSocket
const ws = new WebSocket('ws://localhost:3000/api/v1/notifications');

ws.onopen = () => {
  console.log('Connected to notifications service');
};

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
};
```

## Examples

### cURL Examples

#### Health Check
```bash
curl -X GET http://localhost:3000/api/v1/health
```

#### Get Users
```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json"
```

#### Create User
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### JavaScript Examples

#### Fetch API
```javascript
// Health check
const healthResponse = await fetch('http://localhost:3000/api/v1/health');
const healthData = await healthResponse.json();

// Get users
const usersResponse = await fetch('http://localhost:3000/api/v1/users', {
  headers: {
    'Content-Type': 'application/json'
  }
});
const users = await usersResponse.json();

// Create user
const createUserResponse = await fetch('http://localhost:3000/api/v1/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
});
const newUser = await createUserResponse.json();
```

#### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000
});

// Health check
const health = await api.get('/health');

// Get users
const users = await api.get('/users');

// Create user
const newUser = await api.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

## Error Handling

### Validation Errors
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "email": "email must be a valid email",
    "password": "password must be at least 6 characters"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Service Unavailable
```json
{
  "status": "error",
  "message": "Service at /api/v1/users is unavailable",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Rate Limit Exceeded
```json
{
  "status": "error",
  "message": "Too many requests",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Pagination

Các endpoint hỗ trợ pagination sẽ trả về:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Filtering & Sorting

### Query Parameters
```bash
# Filtering
GET /api/v1/users?status=active&role=user

# Sorting
GET /api/v1/users?sort=name&order=asc

# Pagination
GET /api/v1/users?page=1&limit=10

# Search
GET /api/v1/users?search=john
```

## Versioning

API sử dụng URI versioning:
- Current version: `v1`
- Base URL: `/api/v1`
- Future versions: `/api/v2`, `/api/v3`

## Deprecation

Khi endpoint bị deprecated, response sẽ có header:
```
Deprecation: true
Sunset: 2024-12-31T23:59:59.000Z
```
