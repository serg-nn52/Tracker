#!/usr/bin/env bash
echo ''
echo '  ┌─────────────────────────────────────────┐'
echo '  │  🚀  Frontend  →  http://localhost:5173  │'
echo '  │  🔧  Backend   →  http://localhost:3001  │'
echo '  └─────────────────────────────────────────┘'
echo ''
npx concurrently -n front,back -c cyan,blue "npm run dev" "npm run dev:backend"
