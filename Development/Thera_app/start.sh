#!/bin/bash

# Exit on any error
set -e

# Step 1: Install dependencies
echo "📦 Running npm install..."
npm install

# Step 2: Start Docker containers in detached mode
echo "🐳 Starting Docker containers..."
docker compose up -d

# Step 3: Start backend (in background)
echo "🚀 Starting backend server..."
npm run back &

# Step 4: Start frontend
echo "🌐 Starting frontend (Vite)..."
npm run front

