#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm install
npm run dist:arm64
echo "--- DMG artifacts ---"
ls -lh release/*.dmg
