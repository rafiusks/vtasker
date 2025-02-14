package logger

import (
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
	output := zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339}

	log = zerolog.New(output).
		Level(logLevel).
		With().
		Timestamp().
		Caller().
		Logger()
}

// Info logs an info message
func Info(msg string, fields ...interface{}) {
	log.Info().Fields(fields).Msg(msg)
}

// Error logs an error message
func Error(msg string, err error, fields ...interface{}) {
	log.Error().Err(err).Fields(fields).Msg(msg)
}

// Debug logs a debug message
func Debug(msg string, fields ...interface{}) {
	log.Debug().Fields(fields).Msg(msg)
}

// Fatal logs a fatal message and exits
func Fatal(msg string, err error, fields ...interface{}) {
	log.Fatal().Err(err).Fields(fields).Msg(msg)
} 