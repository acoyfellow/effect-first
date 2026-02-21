#!/bin/bash
set -euo pipefail

cd /home/exedev/effect-first

if [ ! -x "$HOME/.bun/bin/bun" ]; then
  echo "❌ bun not found at $HOME/.bun/bin/bun"
  exit 1
fi

OUTPUT=$("$HOME/.bun/bin/bunx" vitest run 2>&1)
STATUS=$?
if [ $STATUS -ne 0 ]; then
  echo "❌ Tests failed"
  echo "$OUTPUT" | head -20
  exit 1
fi

echo "✅ Tests pass"
