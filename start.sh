#!/usr/bin/env bash
# Serves the built landing page (web/) on 127.0.0.1:8630. Usage: ./start.sh [port]
# Demo links come from web/config.json (receiptUrl, returnsUrl); edit it and reload, no rebuild needed.
set -euo pipefail
cd "$(dirname "$0")/web"
PORT="${1:-${PORT:-8630}}"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
