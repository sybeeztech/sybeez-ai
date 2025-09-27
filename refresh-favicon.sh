#!/bin/bash

echo "🔄 Clearing favicon cache and restarting server..."

# Kill any existing Vite processes
pkill -f "vite" 2>/dev/null || true

# Add a timestamp to the favicon to force refresh
TIMESTAMP=$(date +%s)

# Update the favicon reference with new timestamp
sed -i '' "s/favicon\.ico?v=[0-9.]*/favicon.ico?v=${TIMESTAMP}/g" index.html

echo "✅ Updated favicon cache buster to: v=${TIMESTAMP}"

# Restart the development server
npm run dev

echo "🚀 Server restarted! The new favicon should now be visible."
echo ""
echo "💡 If the favicon still doesn't update, try these steps:"
echo "   1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "   2. Clear browser cache for localhost:8081"
echo "   3. Open incognito/private browsing window"
echo "   4. Try a different browser"