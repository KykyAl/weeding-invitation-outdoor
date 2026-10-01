#!/usr/bin/env bash
# Builds the invitation (frontend + wedding-api), migrates the database and
# (re)starts it as a systemd *user* service. Safe to re-run for every update.
#
#   ./deploy/deploy.sh                 # first run creates the production env file
#   PORT=3000 ./deploy/deploy.sh       # optional overrides on the first run
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-$HOME/apps/wedding-invitation}"
CONFIG_DIR="${CONFIG_DIR:-$HOME/.config/wedding-invitation}"
ENV_FILE="$CONFIG_DIR/production.env"
SERVICE="wedding-invitation"
UNIT_DIR="$HOME/.config/systemd/user"

step() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

# --- 1. Production settings (created once, never overwritten) -----------------
if [[ ! -f "$ENV_FILE" ]]; then
  step "Creating $ENV_FILE"
  mkdir -p "$CONFIG_DIR"
  port="${PORT:-3000}"
  db_url="${DATABASE_URL:-$(grep -E '^DATABASE_URL=' "$REPO/wedding-api/.env" 2>/dev/null | cut -d= -f2- || true)}"
  [[ -n "$db_url" ]] || { echo "Set DATABASE_URL (no wedding-api/.env to copy it from)." >&2; exit 1; }
  ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  umask 077
  cat > "$ENV_FILE" <<ENV
NODE_ENV=production
HOST=${HOST:-0.0.0.0}
PORT=$port
DATABASE_URL=$db_url
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
# Origins allowed to call the API from a browser (comma-separated).
CORS_ORIGIN=${CORS_ORIGIN:-http://${ip:-localhost}:$port,http://localhost:$port}
# Set to 1 when Nginx (or another proxy) sits in front.
TRUST_PROXY=${TRUST_PROXY:-0}
FRONTEND_DIST=$APP_DIR/frontend
ENV
  chmod 600 "$ENV_FILE"
fi
set -a; source "$ENV_FILE"; set +a

# --- 2. Build -------------------------------------------------------------------
# NODE_ENV=production (from the env file) would make npm skip devDependencies,
# which the builds need — hence --include=dev here and --omit=dev in the release.
step "Building frontend"
(cd "$REPO" && npm ci --include=dev --no-audit --no-fund && npm run build)

step "Building wedding-api"
(cd "$REPO/wedding-api" && npm ci --include=dev --no-audit --no-fund && npm run build)

# --- 3. Database ----------------------------------------------------------------
step "Running migrations"
(cd "$REPO/wedding-api" && DATABASE_URL="$DATABASE_URL" npm run migrate)

# --- 4. Release (a copy, so later builds in the repo don't affect the live site) -
step "Copying release to $APP_DIR"
mkdir -p "$APP_DIR/frontend" "$APP_DIR/api"
rsync -a --delete "$REPO/dist/" "$APP_DIR/frontend/"
rsync -a --delete "$REPO/wedding-api/dist/" "$APP_DIR/api/dist/"
cp "$REPO/wedding-api/package.json" "$REPO/wedding-api/package-lock.json" "$APP_DIR/api/"
(cd "$APP_DIR/api" && npm ci --omit=dev --no-audit --no-fund)

# --- 5. Service -------------------------------------------------------------------
step "Installing systemd user service"
mkdir -p "$UNIT_DIR"
sed -e "s#@NODE@#$(command -v node)#" -e "s#@APP_DIR@#$APP_DIR#" -e "s#@ENV_FILE@#$ENV_FILE#" \
  "$REPO/deploy/wedding-invitation.service" > "$UNIT_DIR/$SERVICE.service"
systemctl --user daemon-reload
systemctl --user enable "$SERVICE" >/dev/null
systemctl --user restart "$SERVICE"

# --- 6. Health check --------------------------------------------------------------
step "Checking http://127.0.0.1:$PORT/ready"
for _ in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:$PORT/ready" >/dev/null 2>&1; then
    echo "OK — the invitation is live:"
    echo "  http://$(hostname -I 2>/dev/null | awk '{print $1}'):$PORT/wedding/<slug>?to=<NamaTamu>"
    exit 0
  fi
  sleep 1
done
echo "Service did not become ready. Logs: journalctl --user -u $SERVICE -n 50" >&2
exit 1
