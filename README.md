# 도로버스 프로토타입 (도로랜드)

(주)도로 × 한양대 ERICA IC-PBL 팀 프로젝트. React + Vite + react-three-fiber로 만든 웹 프로토타입이다.
배포 주소: https://a1doro.duckdns.org

## 내 컴퓨터에서 실행하기

[Node.js](https://nodejs.org) 20 이상이 필요하다.

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 을 연다. 체험 계정은 `src/accounts.js`에 있다.

## 수정하고 사이트에 반영하기

`main` 브랜치에 올리면 **2~3분 안에 사이트에 자동으로 반영된다.**

1. GitHub Actions가 빌드한다 (저장소의 Actions 탭에서 진행 상황 확인).
2. 빌드 결과물이 `deploy` 브랜치에 저장된다. 이 브랜치는 직접 고치지 않는다.
3. 미니PC가 1분마다 `deploy` 브랜치를 확인해서 새 버전이면 받아 간다.

빌드가 실패하면(빨간 X) 사이트는 이전 버전 그대로 유지된다. 큰 작업은 브랜치를 따로 만들어 Pull Request로 합치는 걸 권장한다.

## 폴더 안내

| 위치 | 내용 |
|---|---|
| `src/pages` | 화면 (대시보드, 마이룸, 도로랜드 월드, 동굴, 광장, 미니게임, 친구 방) |
| `src/missions` | 스토리 미션 · 수업 과제 창 |
| `src/world`, `src/plaza`, `src/myroom`, `src/cave` | 3D 공간과 캐릭터 모형 |
| `src/game` | 진행 상태 · 일상 루트 · 테마파크 등 규칙과 수치 (`routine.js`, `park.js` …) |
| `src/game/content.js` | 범용 콘텐츠 라이브러리: 개념별 문제(일반 문제, 도로랜드 문제). 수업과 상관없이 쓴다 |
| `src/game/courses.js` | 도로버스 수업 목록(레벨 1~8)과 수업마다 라이브러리에서 고른 과제(ASSIGN). 수업이 바뀌면 이 파일만 고친다 |
| `src/store.jsx` | 계정별 저장 (브라우저 localStorage) |
| `server/` | 미니PC 설정 (Caddy, systemd, DuckDNS, 자동 배포) |

확인용 페이지: `#/dev/characters`(캐릭터 3D · 배포 사이트에서도 열림), `#/dev/mission/lights`(미션 창 · 개발 서버만), `#/dev/portraits`(대화 초상화 · 개발 서버만).

## 도로랜드 그래픽 미리보기

개발 서버에서 `#/dev/world`를 열면 회전목마·관람차·롤러코스터와 확장 맵을 저장 데이터 변경 없이 확인할 수 있다. 드래그로 회전하고 휠로 확대한다. 정지 상태 버튼으로 고장 시 표시를, 입장 연출 버튼으로 카메라 이동과 복귀를 확인한다.

- 월드 범위: 420 × 420. 기존 스토리 장소, NPC, 미션 조건을 유지하고 외곽 순환로와 휴게 정원을 추가했다.
- 놀이기구 모델: `src/world/Rides.jsx`. 코스터 경로·충돌 기준: `src/world/rideGeometry.js`.
- 카메라 연출: `src/world/SceneEntry.jsx`. 각 3D 페이지에서 장소별 구도를 지정한다. 연출 건너뛰기와 OS의 모션 감소 설정을 지원한다.
- 메인 스토리 전체 플레이 검증은 별도로 진행한다. 그래픽 변경은 로컬 빌드와 모델 미리보기, 자동차 점검 미션 진입·복귀로 확인했다.
