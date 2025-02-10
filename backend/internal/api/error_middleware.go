package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// ErrorDetails contains structured error information
type ErrorDetails struct {
	Error       string          `json:"error"`
	StackTrace   string         `json:"stack_trace,omitempty"`
	RequestBody  interface{}    `json:"request_body,omitempty"`
	Path         string         `json:"path"`
	Method       string         `json:"method"`
}

// DetailedErrorLogger middleware captures and logs detailed error information
func DetailedErrorLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Read and store the request body
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = io.ReadAll(c.Request.Body)
			// Restore the request body for subsequent middleware/handlers
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		// Create a response writer wrapper to capture the status code
		blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = blw

		// Process request
		c.Next()

		// If there was an error (status >= 500)
		if c.Writer.Status() >= http.StatusInternalServerError {
			var requestBody interface{}
			if len(bodyBytes) > 0 {
				json.Unmarshal(bodyBytes, &requestBody)
			}

			errorDetails := ErrorDetails{
				Error:       blw.body.String(), // Capture the error message
				StackTrace:  string(debug.Stack()),
				RequestBody: requestBody,
				Path:        c.Request.URL.Path,
				Method:      c.Request.Method,
			}

			// Log the detailed error information
			fmt.Printf("[ERROR] %s %s - Status: %d\nError: %s\nRequest Body: %+v\nStack Trace:\n%s\n",
				c.Request.Method,
				c.Request.URL.Path,
				c.Writer.Status(),
				errorDetails.Error,
				errorDetails.RequestBody,
				errorDetails.StackTrace,
			)
		}
	}
}

// bodyLogWriter is a custom response writer that captures the response body
type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w *bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}