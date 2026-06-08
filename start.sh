#!/usr/bin/env bash
# Backward-compat shim. Forwards to the real script in scripts/.
# Usage:  ./start.sh
exec "$(dirname "$0")/scripts/start.sh" "$@"
