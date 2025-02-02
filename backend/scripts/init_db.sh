#!/bin/bash

# Load environment variables
set -a
source ../.env
set +a

# Create database if it doesn't exist
psql -h $DB_HOST -p $DB_PORT -U $DB_USER postgres -c "CREATE DATABASE $DB_NAME" || true

# Apply schema
psql -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME -f ../db/schema.sql 