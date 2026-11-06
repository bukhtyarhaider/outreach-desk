#!/bin/sh
# Resolves a Node.js binary matching supported LTS versions (22, 24, or 26)

resolve_node() {
  # 1. If NVM is available in the shell or home directory, try loading it
  if [ -z "$NVM_DIR" ]; then
    if [ -d "$HOME/.nvm" ]; then
      export NVM_DIR="$HOME/.nvm"
    elif [ -d "$HOME/.config/nvm" ]; then
      export NVM_DIR="$HOME/.config/nvm"
    fi
  fi

  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh" --no-use >/dev/null 2>&1
    if command -v nvm >/dev/null 2>&1; then
      # Try nvm use from .nvmrc or supported versions
      if [ -f .nvmrc ] && nvm use >/dev/null 2>&1; then
        command -v node
        return 0
      fi
      for v in 22 24 26; do
        if nvm use "$v" >/dev/null 2>&1; then
          command -v node
          return 0
        fi
      done
    fi
  fi

  # 2. Check candidate node binaries directly
  # Priority: active node, NVM installed versions, brew paths, common standard paths
  candidates=""
  if command -v node >/dev/null 2>&1; then
    candidates="$candidates $(command -v node)"
  fi

  # Check standard NVM directories without invoking nvm
  if [ -d "$NVM_DIR/versions/node" ]; then
    for dir in "$NVM_DIR/versions/node"/v2[246]*; do
      if [ -x "$dir/bin/node" ]; then
        candidates="$candidates $dir/bin/node"
      fi
    done
  fi

  # Homebrew, MacPorts, and system paths
  for p in \
    /opt/homebrew/opt/node@22/bin/node \
    /opt/homebrew/opt/node@24/bin/node \
    /usr/local/opt/node@22/bin/node \
    /usr/local/opt/node@24/bin/node \
    /opt/homebrew/bin/node \
    /usr/local/bin/node \
    /usr/bin/node; do
    if [ -x "$p" ]; then
      candidates="$candidates $p"
    fi
  done

  for candidate in $candidates; do
    if [ -x "$candidate" ]; then
      major=$("$candidate" -e 'console.log(process.versions.node.split(".")[0])' 2>/dev/null)
      case "$major" in
        22|24|26)
          # Put candidate's bin folder in PATH so npm/npx match
          dir=$(dirname "$candidate")
          case ":$PATH:" in
            *:"$dir":*) ;;
            *) export PATH="$dir:$PATH" ;;
          esac
          echo "$candidate"
          return 0
          ;;
      esac
    fi
  done

  return 1
}

