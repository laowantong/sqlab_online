#!/bin/bash
# This script ensures that no other process (like a background Node server)
# is occupying port 3000 before starting the development server.
# Without this, curl or browser requests may hit an older, still-running
# instance with stale in-memory state (e.g., outdated userData like score=21).
# Use this script during development to always run a fresh instance.

PID=$(lsof -ti tcp:3000)
if [ -n "$PID" ]; then
  echo "Killing process on port 3000: $PID"
  kill $PID
fi
node server/server.js

# Make it executable with:
# chmod +x run.sh
