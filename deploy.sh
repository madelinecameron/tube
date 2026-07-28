#!/usr/bin/env bash
#
# Build locally, ship the built artefacts, restart.
#
# v1 rsynced the entire working tree (node_modules and all) and ran `npm install`
# on the box. This ships only what the server actually needs.
set -euo pipefail

HOST="${TUBE_HOST:-root@207.148.18.22}"
SSH_KEY="${TUBE_SSH_KEY:-$HOME/.ssh/id_rsa}"
REMOTE_DIR="${TUBE_REMOTE_DIR:-/root/tube}"
SSH="ssh -i $SSH_KEY"

echo "==> building"
npm ci
npm run build

test -f dist/index.html || { echo "build produced no dist/index.html"; exit 1; }

echo "==> syncing to $HOST:$REMOTE_DIR"
rsync -az --delete -e "$SSH" \
  dist/ "$HOST:$REMOTE_DIR/dist/"

rsync -az -e "$SSH" \
  server/ "$HOST:$REMOTE_DIR/server/"

rsync -az -e "$SSH" \
  package.json package-lock.json "$HOST:$REMOTE_DIR/"

echo "==> installing production deps and restarting"
# shellcheck disable=SC2029
$SSH "$HOST" "cd $REMOTE_DIR \
  && npm ci --omit=dev \
  && supervisorctl restart tube \
  && sleep 1 \
  && supervisorctl status tube"

echo "==> done"
