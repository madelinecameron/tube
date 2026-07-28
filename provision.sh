#!/usr/bin/env bash
#
# One-time (or after-infra-change) setup of the box. Safe to re-run.
set -euo pipefail

HOST="${TUBE_HOST:-root@207.148.18.22}"
SSH_KEY="${TUBE_SSH_KEY:-$HOME/.ssh/id_rsa}"
SSH="ssh -i $SSH_KEY"

echo "==> shipping infra config"
rsync -az -e "$SSH" infra/tube.conf "$HOST:/etc/supervisor/conf.d/tube.conf"
rsync -az -e "$SSH" infra/tube "$HOST:/etc/nginx/sites-available/tube"

# shellcheck disable=SC2029
$SSH "$HOST" '
  set -euo pipefail

  node -v | grep -qE "v(2[0-9]|[3-9][0-9])" || {
    echo "!! Node 20+ required; found $(node -v). Install it before continuing." >&2
    exit 1
  }

  test -f /root/tube/.env || {
    echo "!! /root/tube/.env is missing. Create it with YOUTUBE_API_KEY=... first." >&2
    exit 1
  }
  chmod 600 /root/tube/.env

  ln -sf /etc/nginx/sites-available/tube /etc/nginx/sites-enabled/tube

  # v1 left a stale site file behind that redirected to movie.voyage.
  rm -f /etc/nginx/sites-enabled/tube_http /etc/nginx/sites-available/tube_http

  nginx -t
  systemctl reload nginx

  supervisorctl reread
  supervisorctl update
  supervisorctl restart tube
  supervisorctl status tube
'

echo "==> done. If the cert is not yet issued, run: certbot --nginx -d tube.quinzel.tech"
