package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
)

var (
	ApiRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "api_requests_total",
			Help: "Total number of API requests",
		},
		[]string{"method", "path", "status"},
	)
	
	ApiDurationHistogram = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "api_request_duration_seconds",
			Help:    "API request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)
)

func init() {
	prometheus.MustRegister(
		ApiRequestsTotal,
		ApiDurationHistogram,
	)
} 