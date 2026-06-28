#!/bin/bash
set -e
cd "$(dirname "$0")"

HA_URL="https://trmrkruz5ssdwqauhjq2hnzyziqy4sxl.ui.nabu.casa"
TOKEN_FILE="$(dirname "$0")/.ha-token"
RAW_URL="https://raw.githubusercontent.com/jnebauer/home-assistant/main/ha-kiosk/kiosk.html"
MANUAL_CMD="curl -sL \"$RAW_URL\" -o /config/www/kiosk/index.html && echo DEPLOY_OK"

echo "Committing and pushing..."
git add -A
git commit -m "update: $(date +%Y-%m-%d\ %H:%M)" || echo "(nothing to commit)"
git push origin main

echo "Waiting for GitHub CDN to propagate..."
sleep 20

if [ ! -f "$TOKEN_FILE" ]; then
  echo ""
  echo "No .ha-token file found — can't trigger HA automatically."
  echo "Create it once with:   echo 'YOUR_HA_TOKEN' > .ha-token"
  echo "Or deploy manually in the HA SSH terminal:"
  echo "  $MANUAL_CMD"
  exit 0
fi

TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"
echo "Triggering HA deploy via API..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$HA_URL/api/services/shell_command/deploy_kiosk")

if [ "$HTTP" = "200" ]; then
  echo ""
  echo "DEPLOY_OK — HA pulled the latest kiosk. Hard-refresh the panel (Cmd/Ctrl+Shift+R)."
else
  echo ""
  echo "HA deploy trigger failed (HTTP $HTTP)."
  echo "Check the token / shell_command setup, or deploy manually in HA SSH:"
  echo "  $MANUAL_CMD"
  exit 1
fi
