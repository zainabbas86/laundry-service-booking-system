#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-backend/.env.production}"
REPO="zainabbas86/laundry-service-booking-system"
GH_ENV="lsbs-prod"
SECRETS=(MONGO_URI JWT_SECRET ADMIN_EMAIL ADMIN_PASSWORD)
VARIABLES=(PORT ADMIN_NAME)

[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE"; exit 1; }

value_of() {
  grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '\r\n'
}

for key in "${SECRETS[@]}" "${VARIABLES[@]}"; do
  [ -n "$(value_of "$key")" ] || { echo "$key is empty or missing in $ENV_FILE"; exit 1; }
done

for key in "${SECRETS[@]}"; do
  value_of "$key" | gh secret set "$key" --env "$GH_ENV" --repo "$REPO"
done

for key in "${VARIABLES[@]}"; do
  gh variable set "$key" --body "$(value_of "$key")" --env "$GH_ENV" --repo "$REPO"
done

echo "Secrets:"
gh secret list --env "$GH_ENV" --repo "$REPO"
echo "Variables:"
gh variable list --env "$GH_ENV" --repo "$REPO"
