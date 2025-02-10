package repository

import "errors"

var (
	// ErrNotFound is returned when a requested resource is not found
	ErrNotFound = errors.New("resource not found")

	// ErrDuplicate is returned when a unique constraint is violated
	ErrDuplicate = errors.New("duplicate resource")

	// ErrInvalidInput is returned when the input data is invalid
	ErrInvalidInput = errors.New("invalid input")

	// ErrUnauthorized is returned when the user is not authorized to perform the action
	ErrUnauthorized = errors.New("unauthorized")

	// ErrForbidden is returned when the user is forbidden from performing the action
	ErrForbidden = errors.New("forbidden")

	// ErrInternal is returned when an internal error occurs
	ErrInternal = errors.New("internal error")
) 