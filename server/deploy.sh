#!/usr/bin/env bash
# 도로버스 프로토타입을 빌드해서 미니PC(ssh minipc)에 올린다.
# 사용: 프로젝트 폴더에서  bash server/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

npx vite build
tar -czf - -C dist . | ssh minipc 'rm -rf ~/dorobus/dist/* && tar -xzf - -C ~/dorobus/dist && systemctl --user restart dorobus.service && systemctl --user is-active dorobus.service'
curl -s -o /dev/null -w "a1doro.duckdns.org → HTTP %{http_code}\n" https://a1doro.duckdns.org/
