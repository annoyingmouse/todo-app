#!/bin/sh

# Start json-server in background
echo "Starting json-server..."
npx json-server --watch db.json --port 3001 &
JSON_SERVER_PID=$!

# Wait for json-server to be ready
echo "Waiting for json-server to be available..."
until nc -z localhost 3001; do
  sleep 0.5
done

echo "json-server is running."

# Now run build
echo "Running TypeScript + Vite build..."
tsc -b && vite build

# Keep container alive (if needed)
wait $JSON_SERVER_PID