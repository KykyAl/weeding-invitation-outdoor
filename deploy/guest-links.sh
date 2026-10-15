#!/usr/bin/env bash
# Creates signed guest links for one invitation.
#
#   ./deploy/guest-links.sh <slug> "Nama Tamu 1" "Nama Tamu 2" ...
#   ./deploy/guest-links.sh example-wedding "Andi Pratama" "Keluarga Bpk. Budi"
#
# Links use the server's network address; set BASE_URL for a domain, e.g.
#   BASE_URL=https://undangan.domain-anda.com ./deploy/guest-links.sh …
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Pakai: $0 <slug> \"Nama Tamu 1\" [\"Nama Tamu 2\" ...]" >&2
  exit 1
fi
slug="$1"; shift

CONFIG_DIR="${CONFIG_DIR:-$HOME/.config/wedding-invitation}"
port="$(grep -E '^PORT=' "$CONFIG_DIR/production.env" | cut -d= -f2)"
BASE_URL="${BASE_URL:-http://$(hostname -I | awk '{print $1}'):${port:-3000}}"
API="$BASE_URL/api/v1"

json() { python3 -c 'import json,sys; print(json.dumps(sys.argv[1:] if len(sys.argv) > 2 else sys.argv[1]))' "$@"; }

# Log in as admin.
login="{\"username\":\"admin\",\"password\":$(json "$(cat "$CONFIG_DIR/admin-password")")}"
token="$(curl -fsS -X POST "$API/auth/login" -H 'Content-Type: application/json' -d "$login" |
  python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["token"])')"

# Find the wedding by its slug.
wedding="$(curl -fsS "$API/weddings/$slug" 2>/dev/null)" || {
  echo "Undangan dengan slug \"$slug\" tidak ditemukan." >&2
  exit 1
}
id="$(python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["id"])' <<<"$wedding")"

# One signed link per guest.
guests="$(python3 -c 'import json,sys; print(json.dumps({"guests": sys.argv[1:]}))' "$@")"
curl -fsS -X POST "$API/admin/weddings/$id/guest-links" -H "Authorization: Bearer $token" \
  -H 'Content-Type: application/json' -d "$guests" |
  python3 -c 'import sys,json
for g in json.load(sys.stdin)["data"]:
    print(g["name"])
    print("  " + g["url"])
    print()'
