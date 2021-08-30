#!/bin/bash

set -x
set -euo pipefail

CLIENT_ID=${CLIENT_ID:-}
CLIENT_SECRET=${CLIENT_SECRET:-}
REFRESH_TOKEN=${REFRESH_TOKEN:-}
EXTENSION_ID=${EXTENSION_ID:-}

TOKEN=$(curl -v "https://accounts.google.com/o/oauth2/token" -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&refresh_token=$REFRESH_TOKEN&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | python -c 'import sys, json; print(json.load(sys.stdin)["access_token"])')

curl \
-H "Authorization: Bearer $TOKEN"  \
-H "x-goog-api-version: 2" \
-X PUT \
-T build/laxis-chrome-extension-*.zip \
-v \
https://www.googleapis.com/upload/chromewebstore/v1.1/items/$EXTENSION_ID

