#!/bin/bash

echo "=== Starting Application ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

echo "=== Checking for dist directory ==="
if [ ! -d "dist" ]; then
    echo "ERROR: dist directory not found!"
    echo "Running build command..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "ERROR: Build failed!"
        exit 1
    fi
fi

echo "=== Checking for dist/index.js ==="
if [ ! -f "dist/index.js" ]; then
    echo "ERROR: dist/index.js not found!"
    echo "Build may have failed. Contents of dist directory:"
    ls -la dist/ || echo "dist directory is empty or doesn't exist"
    exit 1
fi

echo "=== Checking environment variables ==="
if [ -z "$MONGODB_URI" ]; then
    echo "ERROR: MONGODB_URI is not set!"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "ERROR: JWT_SECRET is not set!"
    exit 1
fi

AI_PROVIDER=${AI_PROVIDER:-groq}
echo "AI Provider: $AI_PROVIDER"

if [ "$AI_PROVIDER" = "groq" ] && [ -z "$GROQ_API_KEY" ]; then
    echo "ERROR: GROQ_API_KEY is not set (required for AI_PROVIDER=groq)!"
    exit 1
fi

if [ "$AI_PROVIDER" = "anthropic" ] && [ -z "$CLAUDE_API_KEY" ]; then
    echo "ERROR: CLAUDE_API_KEY is not set (required for AI_PROVIDER=anthropic)!"
    exit 1
fi

echo "=== All checks passed ==="
echo "Starting server..."
echo ""

exec node dist/index.js
