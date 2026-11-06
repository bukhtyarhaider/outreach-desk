#!/bin/sh
cd "$(dirname "$0")" || exit 1

if [ -f scripts/env.sh ]; then
  # shellcheck disable=SC1091
  . scripts/env.sh
  NODE=$(resolve_node 2>/dev/null)
fi

if [ -z "$NODE" ]; then
  if command -v node >/dev/null 2>&1; then
    NODE=$(command -v node)
  fi
fi

if [ -z "$NODE" ]; then
  echo 'Install a supported Node.js LTS version (22, 24 or 26) from https://nodejs.org/, then run Setup again.'
else
  "$NODE" scripts/setup.mjs
fi

printf '\nPress Return to close.'
read -r answer
