#!/usr/bin/env bash
# ReplyVerse — one-command launcher (macOS / Linux / WSL / Git Bash)
# Usage:   ./start.sh
# Stops:   Ctrl+C (kills both services)

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo
echo "=== ReplyVerse · launcher ==="
echo "root: $ROOT"
echo

need() { command -v "$1" >/dev/null || { echo "✗ '$1' is not installed. $2"; exit 1; }; }
need node   "Install Node 20+ from https://nodejs.org"
need npm    "Install Node 20+ from https://nodejs.org"
need python3 "Install Python 3.11+"

# ───── Backend ─────
echo "→ Backend (FastAPI)"
cd "$ROOT/backend"
[ -f .env ] || cp .env.example .env
if [ ! -d .venv ]; then python3 -m venv .venv; fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

# ───── Frontend ─────
echo "→ Frontend (Next.js)"
cd "$ROOT/frontend"
[ -f .env.local ] || cp .env.example .env.local
if [ ! -d node_modules ]; then npm install --silent; fi

# ───── Launch ─────
echo
echo "→ Starting services (Ctrl+C to stop both)…"
trap 'echo; echo "shutting down…"; kill 0' INT TERM

(
  cd "$ROOT/backend"
  source .venv/bin/activate
  uvicorn app.main:app --reload
) &

(
  cd "$ROOT/frontend"
  npm run dev
) &

sleep 4
( command -v xdg-open >/dev/null && xdg-open http://localhost:3000 ) \
  || ( command -v open >/dev/null && open http://localhost:3000 ) \
  || true

wait
