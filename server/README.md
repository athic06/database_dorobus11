# 도로버스 프로토타입 서버 구성 (미니PC)

https://a1doro.duckdns.org 를 띄우는 미니PC(Ubuntu 24.04, `ssh minipc`) 쪽 설정 파일 사본입니다.
웹 앱 코드는 이 폴더의 상위 프로젝트(`src/`)이고, 빌드 결과 `dist/`를 미니PC에 올려 서비스합니다.

```
브라우저 ──HTTPS──▶ Caddy (443, 인증서 자동) ──▶ 127.0.0.1:8795 python http.server ──▶ ~/dorobus/dist
DuckDNS a1doro ◀── 5분마다 IP 갱신 (cron)
디스코드 봇 ── !on / !off / !restart a1doro · /status ──▶ systemctl --user dorobus.service
```

| 파일 | 미니PC 위치 | 역할 |
|---|---|---|
| `systemd/dorobus.service` | `~/.config/systemd/user/dorobus.service` | 정적 파일 서버(포트 8795, 메모리 128M · CPU 50% 제한) |
| `caddy/Caddyfile.a1doro` | `/etc/caddy/Caddyfile` 안의 a1doro 블록 | HTTPS 리버스 프록시 |
| `caddy/apply-caddy.sh` | `~/dorobus/apply-caddy.sh` | Caddyfile에 a1doro 블록 추가 후 리로드 (sudo 필요) |
| `duckdns/duckdns_update.py` | `/home/server/riftflow/app/deploy/duckdns_update.py` | DuckDNS IP 갱신. cron `*/5 * * * *` |
| `duckdns/domain.txt` | `~/.config/duckdns/domain` | 갱신할 도메인 목록 |
| `discord-bot/main_bot.py` | `~/hy-discordbot/main_bot.py` | 마크 서버 + 웹 서비스 on/off/restart, `/status` |
| `deploy.sh` | (로컬) | 빌드 → 미니PC 업로드 → 서비스 재시작 |

## 비밀값은 들어 있지 않습니다
- DuckDNS 토큰: 미니PC `~/.config/duckdns/token` 파일에만 있음
- 디스코드 봇 토큰: 봇의 `.env`(`DISCORD_TOKEN`)에만 있음

## 자주 쓰는 명령
```bash
bash server/deploy.sh                                   # 배포
ssh minipc 'systemctl --user status dorobus.service'    # 상태
ssh minipc 'systemctl --user restart dorobus.service'   # 재시작
sudo bash ~/dorobus/apply-caddy.sh                      # (미니PC에서) Caddy 설정 적용
sudo systemctl restart hy-discordbot.service            # (미니PC에서) 디스코드 봇 재시작
```

## 새 서버에 다시 설치할 때
1. `npx vite build` 후 `dist/`를 `~/dorobus/dist`에 복사
2. `systemd/dorobus.service`를 `~/.config/systemd/user/`에 두고 `systemctl --user daemon-reload && systemctl --user enable --now dorobus.service`
3. 로그아웃해도 돌게 `sudo loginctl enable-linger <사용자>`
4. DuckDNS에서 도메인 등록 → `domain.txt`에 추가, token 파일 준비, cron 등록
5. `sudo bash apply-caddy.sh`로 Caddy 블록 추가 (공유기 80/443 포트포워딩 필요)

## 자동 배포 (GitHub → 미니PC)

`main`에 push → GitHub Actions가 빌드해서 `deploy` 브랜치에 저장 → 미니PC 타이머가 1분마다 확인해서 받아 감.
미니PC에는 Node·git이 필요 없다 (python3 표준 라이브러리만 사용).

설치 (미니PC, sudo 불필요):

```bash
mkdir -p ~/dorobus/autodeploy ~/.config/dorobus-deploy
# server/autodeploy/pull_deploy.py → ~/dorobus/autodeploy/
# server/autodeploy/*.service, *.timer → ~/.config/systemd/user/
echo "<owner>/<repo>" > ~/.config/dorobus-deploy/repo
# token: GitHub fine-grained token (이 저장소만, Contents: Read-only). 직접 붙여 넣고 권한 600
chmod 600 ~/.config/dorobus-deploy/token
systemctl --user daemon-reload
systemctl --user enable --now dorobus-autodeploy.timer
journalctl --user -u dorobus-autodeploy -n 20   # 반영 기록 확인
```

수동 배포(`bash server/deploy.sh`)도 그대로 쓸 수 있다. 다만 다음 push 때 자동 배포가 덮어쓴다.
