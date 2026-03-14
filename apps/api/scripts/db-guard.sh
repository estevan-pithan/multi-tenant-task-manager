#!/bin/bash
set -euo pipefail

ENV_FILE="$(dirname "$0")/../.env"
PRODUCTION_ENDPOINT=$(grep '^NEON_PRODUCTION_ENDPOINT=' "$ENV_FILE" | sed 's/NEON_PRODUCTION_ENDPOINT=//')

if [ -z "$PRODUCTION_ENDPOINT" ]; then
  echo "ERROR: NEON_PRODUCTION_ENDPOINT not found in .env"
  exit 1
fi

CURRENT_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | sed 's/DATABASE_URL=//')
CURRENT_HOST=$(echo "$CURRENT_URL" | sed 's|.*@\(.*\)/.*|\1|')

if echo "$CURRENT_HOST" | grep -q "$PRODUCTION_ENDPOINT"; then
  echo "BLOCKED: Cannot run migrations against production locally."
  echo ""
  echo "Your .env is pointing to the production branch."
  echo "Switch to a dev branch first:"
  echo "  bun run db:branch <branch-name>"
  echo ""
  echo "Production migrations run via CI/CD (GitHub Actions) on push to main."
  exit 1
fi

exec "$@"
