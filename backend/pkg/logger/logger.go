package logger

import (
	"net/http"
	"os"
	"time"

	"github.com/rs/zerolog"
)

var log zerolog.Logger

// Init initializes the logger
func Init(level string) {
	// Parse the log level
	logLevel, err := zerolog.ParseLevel(level)
	if err != nil {
		logLevel = zerolog.InfoLevel
	}

	// Configure zerolog
	zerolog.TimeFieldFormat = time.RFC3339
	output := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.RFC3339,
		NoColor:    false,
	}

	log = zerolog.New(output).
		Level(logLevel).
		With().
		Timestamp().
		Caller().
		Logger()
}

// WithFields adds structured fields to the log entry
func WithFields(fields map[string]interface{}) *zerolog.Event {
	return log.Info().Fields(fields)
}

// Info logs an info message with structured fields
func Info(msg string, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	log.Info().Fields(fields).Msg(msg)
}

// Error logs an error message with structured fields
func Error(msg string, err error, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	log.Error().Err(err).Fields(fields).Msg(msg)
}

// Debug logs a debug message with structured fields
func Debug(msg string, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	log.Debug().Fields(fields).Msg(msg)
}

// Fatal logs a fatal message with structured fields and exits
func Fatal(msg string, err error, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	log.Fatal().Err(err).Fields(fields).Msg(msg)
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