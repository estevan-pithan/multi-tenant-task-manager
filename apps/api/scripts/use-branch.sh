#!/bin/bash
set -euo pipefail

NEON_PROJECT_ID="sparkling-star-92049067"
ENV_FILE="$(dirname "$0")/../.env"

BRANCH_NAME="${1:-}"

if [ -z "$BRANCH_NAME" ]; then
  CURRENT_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | sed 's/DATABASE_URL=//')
  CURRENT_HOST=$(echo "$CURRENT_URL" | sed 's|.*@\(.*\)/.*|\1|')

  BRANCHES_JSON=$(neonctl branches list --project-id "$NEON_PROJECT_ID" --output json)
  CURRENT_BRANCH=""

  while IFS= read -r name; do
    BRANCH_CONN=$(neonctl connection-string --project-id "$NEON_PROJECT_ID" --branch "$name" 2>/dev/null)
    BRANCH_HOST=$(echo "$BRANCH_CONN" | sed 's|.*@\(.*\)/.*|\1|')
    if [ "$BRANCH_HOST" = "$CURRENT_HOST" ]; then
      CURRENT_BRANCH="$name"
      break
    fi
  done < <(echo "$BRANCHES_JSON" | python3 -c "import sys,json; [print(b['name']) for b in json.load(sys.stdin)]")

  echo "Current branch: ${CURRENT_BRANCH:-unknown}"
  echo ""
  echo "Available branches:"
  echo "$BRANCHES_JSON" | python3 -c "import sys,json; [print(f'  - {b[\"name\"]}') for b in json.load(sys.stdin)]"
  echo ""
  echo "Usage: bun run db:branch <branch-name>"
  exit 0
fi

echo "Fetching connection string for branch '$BRANCH_NAME'..."
CONN_STRING=$(neonctl connection-string --project-id "$NEON_PROJECT_ID" --branch "$BRANCH_NAME")

# Replace DATABASE_URL line in .env
awk -v new="DATABASE_URL=$CONN_STRING" '/^DATABASE_URL=/{$0=new} 1' "$ENV_FILE" > "$ENV_FILE.tmp" && mv "$ENV_FILE.tmp" "$ENV_FILE"

echo "Updated .env with branch '$BRANCH_NAME'"
# echo "DATABASE_URL=$CONN_STRING"
