#!/bin/sh
# Resolves a Node.js binary matching supported LTS versions (22, 24, or 26).
# After sourcing and calling resolve_node, $NODE holds the path and PATH is updated.

resolve_node() {
  NODE=""

  # 1. If NVM is available, load it and try to activate a supported version
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
      if [ -f .nvmrc ] && nvm use >/dev/null 2>&1; then
        NODE=$(command -v node)
        return 0
      fi
      for v in 22 24 26; do
        if nvm use "$v" >/dev/null 2>&1; then
          NODE=$(command -v node)
          return 0
        fi
      done
    fi
  fi

  # 2. Build a candidate list and pick the first supported version
  _candidates=""
  if command -v node >/dev/null 2>&1; then
    _candidates="$_candidates $(command -v node)"
  fi

  # NVM directories (without loading nvm)
  if [ -d "$NVM_DIR/versions/node" ]; then
    for _d in "$NVM_DIR/versions/node"/v2[246]*; do
      [ -x "$_d/bin/node" ] && _candidates="$_candidates $_d/bin/node"
    done
  fi

  # Homebrew and system paths
  for _p in \
    /opt/homebrew/opt/node@22/bin/node \
    /opt/homebrew/opt/node@24/bin/node \
    /usr/local/opt/node@22/bin/node \
    /usr/local/opt/node@24/bin/node \
    /opt/homebrew/bin/node \
    /usr/local/bin/node \
    /usr/bin/node; do
    [ -x "$_p" ] && _candidates="$_candidates $_p"
  done

  for _c in $_candidates; do
    if [ -x "$_c" ]; then
      _major=$("$_c" -e 'console.log(process.versions.node.split(".")[0])' 2>/dev/null)
      case "$_major" in
        22|24|26)
          _dir=$(dirname "$_c")
          case ":$PATH:" in
            *:"$_dir":*) ;;
            *) export PATH="$_dir:$PATH" ;;
          esac
          NODE="$_c"
          return 0
          ;;
      esac
    fi
  done

  return 1
}
