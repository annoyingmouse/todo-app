#!/bin/sh
set -e

echo "Starting json-server..."
npx json-server --watch db.json --port 3001 &
JSON_SERVER_PID=$!

echo "Waiting for json-server on port 3001..."
until nc -z localhost 3001; do
  sleep 0.5
done

echo "json-server is up!"

echo "Building React app..."
npx tsc -b && npx vite build

echo "Starting Vite preview server..."
npx vite preview --host --port 5173 &
VITE_PID=$!

wait $JSON_SERVER_PID
wait $VITE_PID
