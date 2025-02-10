# VTasker Service Management Architecture

## Overview

VTasker Service Manager is a comprehensive solution for managing containerized services in a Kubernetes environment. It provides a modern web interface for service management, monitoring, and log aggregation.

## Core Components

### 1. Backend Service Manager (Go)

The backend is written in Go and serves as the central management system:

```go
package manager

type ServiceManager struct {
    // Kubernetes client for service management
    k8sClient *kubernetes.Clientset
    
    // Service state and configuration
    services map[string]*Service
    
    // Real-time communication
    wsHub *websocket.Hub
    
    // Metrics collector
    metricsCollector *metrics.Collector
    
    // Log aggregator
    logAggregator *logs.Aggregator
}

type Service struct {
    Name            string
    Namespace       string
    Status          ServiceStatus
    Replicas        int32
    Resources       ResourceMetrics
    ConfigMaps      []string
    Secrets         []string
    LastDeployment  time.Time
}

type ResourceMetrics struct {
    CPU struct {
        Usage     float64
        Limit     float64
        Requests  float64
    }
    Memory struct {
        Usage     int64
        Limit     int64
        Requests  int64
    }
    Network struct {
        RxBytes   int64
        TxBytes   int64
    }
}
```

### 2. Frontend Dashboard (Next.js/React)

The frontend provides a modern, responsive interface:

```typescript
// Core types
interface ServiceDashboard {
    services: Map<string, ServiceState>;
    metrics: MetricsState;
    logs: LogState;
    actions: ServiceActions;
}

interface ServiceState {
    status: 'running' | 'stopped' | 'error';
    metrics: ResourceMetrics;
    config: ServiceConfig;
    logs: LogStream;
}

interface ServiceActions {
    start: (name: string) => Promise<void>;
    stop: (name: string) => Promise<void>;
    restart: (name: string) => Promise<void>;
    scale: (name: string, replicas: number) => Promise<void>;
    updateConfig: (name: string, config: ServiceConfig) => Promise<void>;
    rollback: (name: string, version: string) => Promise<void>;
}
```

## Architecture Details

### 1. Service Management

#### Kubernetes Integration
```go
// k8s/client.go
type K8sClient struct {
    clientset *kubernetes.Clientset
    config    *rest.Config
}

func (c *K8sClient) DeployService(svc *Service) error {
    // Create or update deployment
    deployment := &appsv1.Deployment{
        ObjectMeta: metav1.ObjectMeta{
            Name: svc.Name,
        },
        Spec: appsv1.DeploymentSpec{
            Replicas: &svc.Replicas,
            Template: corev1.PodTemplateSpec{
                Spec: corev1.PodSpec{
                    Containers: []corev1.Container{
                        {
                            Name:  svc.Name,
                            Image: svc.Image,
                            Resources: svc.Resources,
                        },
                    },
                },
            },
        },
    }
    
    return c.clientset.AppsV1().Deployments(svc.Namespace).
        Create(context.Background(), deployment, metav1.CreateOptions{})
}
```

#### Metrics Collection
```go
// metrics/collector.go
type MetricsCollector struct {
    promClient prometheus.Client
    metrics    map[string]*ServiceMetrics
}

func (c *MetricsCollector) CollectMetrics(svc *Service) (*ResourceMetrics, error) {
    // Query Prometheus for service metrics
    cpuQuery := fmt.Sprintf(
        'container_cpu_usage_seconds_total{pod=~"%s-.*"}[5m]',
        svc.Name,
    )
    
    // Process and return metrics
    return &ResourceMetrics{
        CPU:    cpuMetrics,
        Memory: memoryMetrics,
        Network: networkMetrics,
    }
}
```

### 2. Real-time Communication

#### WebSocket Hub
```go
// ws/hub.go
type Hub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
}

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.clients[client] = true
        case client := <-h.unregister:
            delete(h.clients, client)
            close(client.send)
        case message := <-h.broadcast:
            for client := range h.clients {
                client.send <- message
            }
        }
    }
}
```

### 3. Log Aggregation

#### Log Streaming
```go
// logs/aggregator.go
type LogAggregator struct {
    lokiClient *loki.Client
    streams    map[string]*LogStream
}

func (a *LogAggregator) StreamLogs(
    ctx context.Context,
    svc *Service,
    options LogOptions,
) (<-chan LogEntry, error) {
    logChan := make(chan LogEntry)
    
    go func() {
        defer close(logChan)
        
        query := fmt.Sprintf(
            '{container="%s",pod=~"%s-.*"}',
            svc.Name,
            svc.Name,
        )
        
        stream, err := a.lokiClient.TailLogs(ctx, query, options)
        if err != nil {
            return
        }
        
        for entry := range stream {
            logChan <- LogEntry{
                Timestamp: entry.Timestamp,
                Message:   entry.Message,
                Level:    entry.Level,
            }
        }
    }()
    
    return logChan, nil
}
```

## API Endpoints

### REST API
```go
// api/routes.go
func SetupRoutes(r *gin.Engine, sm *ServiceManager) {
    api := r.Group("/api/v1")
    {
        // Service management
        api.GET("/services", sm.ListServices)
        api.GET("/services/:name", sm.GetService)
        api.POST("/services/:name/start", sm.StartService)
        api.POST("/services/:name/stop", sm.StopService)
        api.POST("/services/:name/restart", sm.RestartService)
        
        // Metrics
        api.GET("/services/:name/metrics", sm.GetMetrics)
        
        // Logs
        api.GET("/services/:name/logs", sm.StreamLogs)
        
        // Configuration
        api.GET("/services/:name/config", sm.GetConfig)
        api.PUT("/services/:name/config", sm.UpdateConfig)
        
        // Deployments
        api.POST("/services/:name/rollback", sm.RollbackService)
    }
}
```

## Deployment

### Kubernetes Resources

```yaml
# deploy/manager.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vtasker-manager
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: manager
        image: vtasker/manager:latest
        ports:
        - containerPort: 8000
        env:
        - name: PROMETHEUS_URL
          value: http://prometheus:9090
        - name: LOKI_URL
          value: http://loki:3100
```

## Security

### Authentication & Authorization
```go
// auth/middleware.go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.AbortWithStatus(401)
            return
        }
        
        // Validate JWT token
        claims, err := validateToken(token)
        if err != nil {
            c.AbortWithStatus(401)
            return
        }
        
        // Check permissions
        if !hasPermission(claims, c.Request.URL.Path) {
            c.AbortWithStatus(403)
            return
        }
        
        c.Next()
    }
}
```

## Monitoring & Alerting

### Prometheus Integration
```yaml
# deploy/prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: vtasker-alerts
spec:
  groups:
  - name: vtasker
    rules:
    - alert: ServiceDown
      expr: up{job="vtasker-service"} == 0
      for: 5m
      labels:
        severity: critical
      annotations:
        description: "Service {{ $labels.service }} has been down for 5 minutes"
```

## Containerization & Deployment

### Current Implementation

#### Production Environment
```dockerfile
# Multi-stage build process
FROM golang:1.21 as builder
# Build backend...

FROM node:20 as frontend-builder
# Build frontend...

FROM gcr.io/distroless/static:nonroot
# Final minimal image
```

#### Development Environment (Planned)
```yaml
# docker-compose.yml (Coming soon)
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app/backend
    ports:
      - "8000:8000"

  frontend:
    build:
      context: .
      dockerfile: web/Dockerfile.dev
    volumes:
      - ./web:/app
    ports:
      - "3000:3000"

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: vtasker
      POSTGRES_USER: vtasker
    ports:
      - "5432:5432"

  prometheus:
    image: prom/prometheus
    volumes:
      - ./deploy/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  loki:
    image: grafana/loki
    ports:
      - "3100:3100"
```

### Deployment Architecture

#### Local Development
- Hot-reloading enabled for both frontend and backend
- Local database with persistent volume
- Metrics and logging stack for development
- Development-specific environment variables

#### Production Deployment
- Kubernetes-native deployment
- Horizontal scaling capabilities
- Prometheus and Loki integration
- Secure secrets management
- Load balancing and ingress configuration

### Next Steps

1. Development Environment
   - Implement development Dockerfiles
   - Configure Docker Compose for local development
   - Set up hot-reloading
   - Configure local monitoring stack

2. Production Environment
   - Complete Kubernetes manifests
   - Configure resource limits and requests
   - Set up monitoring and logging
   - Implement auto-scaling

3. CI/CD Pipeline
   - Automated testing
   - Security scanning
   - Deployment automation
   - Environment promotion

## Development Setup

### Local Development
```bash
# Start development environment
make dev

# Run tests
make test

# Build containers
make build

# Deploy to local k8s cluster
make deploy
```

## Future Enhancements

1. **Service Mesh Integration**
   - Istio support for advanced traffic management
   - Service-to-service communication metrics
   - Distributed tracing

2. **GitOps Integration**
   - Flux/ArgoCD integration
   - Automated deployments from git
   - Configuration version control

3. **Advanced Monitoring**
   - Custom metrics collection
   - Advanced alerting rules
   - Metric correlation

4. **Multi-cluster Support**
   - Management across multiple k8s clusters
   - Cross-cluster service discovery
   - Unified monitoring and logging

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and setup instructions. 