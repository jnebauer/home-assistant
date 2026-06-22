#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Committing and pushing..."
git add -A
git commit -m "update: $(date +%Y-%m-%d\ %H:%M)"
git push origin main
echo ""
echo "Done. Run this in your HA SSH terminal:"
echo ""
echo "  curl -sL \"https://raw.githubusercontent.com/jnebauer/home-assistant/main/ha-kiosk/kiosk.html\" -o /homeassistant/www/kiosk/index.html && echo DEPLOY_OK"
echo ""
