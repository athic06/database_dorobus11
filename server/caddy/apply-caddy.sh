#!/bin/bash
# a1doro.duckdns.org → DOROBUS 프로토타입(127.0.0.1:8795) 연결을 Caddy에 추가한다.
# 실행: sudo bash ~/dorobus/apply-caddy.sh
set -e
CF=/etc/caddy/Caddyfile
if grep -q "a1doro.duckdns.org" "$CF"; then
  echo "이미 추가되어 있어요."
else
  cp "$CF" "$CF.bak-$(date +%Y%m%d-%H%M%S)"
  cat >> "$CF" <<"BLOCK"

# DOROBUS 프로토타입 (~/dorobus, 사용자 서비스 dorobus.service)
a1doro.duckdns.org {
	encode gzip
	header -Server
	reverse_proxy 127.0.0.1:8795
}
BLOCK
  echo "Caddyfile에 추가했어요 (백업 저장됨)."
fi
caddy validate --config "$CF" --adapter caddyfile
systemctl reload caddy
echo "Caddy를 다시 불러왔어요."
