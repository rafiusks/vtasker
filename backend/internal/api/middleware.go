package api

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/juju/ratelimit"
	"github.com/rafaelzasas/vtasker/internal/metrics"
)

type CircuitBreaker struct {
	maxFailures     int
	resetTimeout    time.Duration
	failureCount    int
	lastFailureTime time.Time
	mutex           sync.Mutex
}

func NewCircuitBreaker(maxFailures int, resetTimeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		maxFailures:  maxFailures,
		resetTimeout: resetTimeout,
	}
}

func (cb *CircuitBreaker) Execute(fn func() error) error {
	cb.mutex.Lock()
	defer cb.mutex.Unlock()

	if cb.failureCount >= cb.maxFailures && 
	   time.Since(cb.lastFailureTime) < cb.resetTimeout {
		return fmt.Errorf("circuit breaker open")
	}

	if err := fn(); err != nil {
		cb.failureCount++
		cb.lastFailureTime = time.Now()
		return err
	}

	cb.failureCount = 0
	return nil
}

// Usage in handler:
// cb := NewCircuitBreaker(5, time.Minute)
// err := cb.Execute(func() error {
// 	return h.repo.MoveTask(ctx, taskID, moveReq)
// })

// RateLimiter middleware for all endpoints
func RateLimiter() gin.HandlerFunc {
	// Create rate limiter bucket
	bucket := ratelimit.NewBucketWithQuantum(
		100*time.Millisecond, // Fill interval
		100,                  // Capacity
		10,                   // Quantum
	)

	return func(c *gin.Context) {
		if bucket.TakeAvailable(1) == 0 {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests - try again later",
			})
			return
		}
		c.Next()
	}
}

func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		
		duration := time.Since(start).Seconds()
		status := c.Writer.Status()
		
		metrics.ApiRequestsTotal.WithLabelValues(
			c.Request.Method,
			c.FullPath(),
			strconv.Itoa(status),
		).Inc()
		
		metrics.ApiDurationHistogram.WithLabelValues(
			c.Request.Method,
			c.FullPath(),
		).Observe(duration)
	}
} 