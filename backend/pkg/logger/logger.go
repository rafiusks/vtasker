package logger

import (
	"net/http"
	"os"
	"time"

	"github.com/rs/zerolog"
)

var log zerolog.Logger

func init() {
	// Configure zerolog
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log = zerolog.New(os.Stdout).With().Timestamp().Logger()
}

// Error logs an error message with context
func Error(msg string, err error, fields map[string]interface{}) {
	event := log.Error().Err(err)
	for k, v := range fields {
		event = event.Interface(k, v)
	}
	event.Msg(msg)
}

// Info logs an info message with context
func Info(msg string, fields map[string]interface{}) {
	event := log.Info()
	for k, v := range fields {
		event = event.Interface(k, v)
	}
	event.Msg(msg)
}

// Debug logs a debug message with context
func Debug(msg string, fields map[string]interface{}) {
	event := log.Debug()
	for k, v := range fields {
		event = event.Interface(k, v)
	}
	event.Msg(msg)
}

// Fatal logs a fatal message with context and exits
func Fatal(msg string, err error, fields map[string]interface{}) {
	event := log.Fatal().Err(err)
	for k, v := range fields {
		event = event.Interface(k, v)
	}
	event.Msg(msg)
}

// RequestLogger is a middleware that logs HTTP requests
func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Create a custom response writer to capture the status code
		ww := &responseWriter{w: w, status: http.StatusOK}

		// Process request
		next.ServeHTTP(ww, r)

		// Log request details
		duration := time.Since(start)
		fields := map[string]interface{}{
			"method":     r.Method,
			"path":      r.URL.Path,
			"status":    ww.status,
			"duration":  duration.Milliseconds(),
			"remote_ip": r.RemoteAddr,
			"user_agent": r.UserAgent(),
		}

		// Add query parameters if they exist
		if len(r.URL.Query()) > 0 {
			fields["query"] = r.URL.Query()
		}

		level := zerolog.InfoLevel
		if ww.status >= 400 {
			level = zerolog.WarnLevel
		}
		if ww.status >= 500 {
			level = zerolog.ErrorLevel
		}

		log.WithLevel(level).Fields(fields).Msg("HTTP Request")
	})
}

// responseWriter is a custom response writer that captures the status code
type responseWriter struct {
	w      http.ResponseWriter
	status int
}

func (rw *responseWriter) Header() http.Header {
	return rw.w.Header()
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	return rw.w.Write(b)
}

func (rw *responseWriter) WriteHeader(statusCode int) {
	rw.status = statusCode
	rw.w.WriteHeader(statusCode)
} 