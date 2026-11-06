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
| `public/models/forest` | 숲 3D 모델과 텍스처: Quaternius Stylized Nature MegaKit (CC0, 라이선스 파일 함께 둠). 원본에서 도형만 GLB로 뽑고 텍스처는 줄여서 공용으로 씀 |
| `public/models/robot` | 플레이어 로봇 모션 (Mixamo). 원본 FBX를 `scripts/mixamo-to-json.mjs`로 줄여 JSON 하나로 만듦. 출처와 다시 만드는 법은 같은 폴더 CREDITS.txt |
| `public/models/animals` | 사파리 동물, 호수 오리 모델 (Poly Pizza, CC BY 3.0). 작가와 링크는 같은 폴더 CREDITS.txt |
| `server/` | 미니PC 설정 (Caddy, systemd, DuckDNS, 자동 배포) |

확인용 페이지: `#/dev/characters`(캐릭터 3D · 배포 사이트에서도 열림), `#/dev/mission/lights`(미션 창 · 개발 서버만), `#/dev/portraits`(대화 초상화 · 개발 서버만).

## 도로랜드 그래픽 미리보기

개발 서버에서 `#/dev/world`를 열면 회전목마·관람차·롤러코스터와 확장 맵을 저장 데이터 변경 없이 확인할 수 있다. 드래그로 회전하고 휠로 확대한다. 정지 상태 버튼으로 고장 시 표시를, 입장 연출 버튼으로 카메라 이동과 복귀를 확인한다.

- 월드 범위: 420 × 420. 기존 스토리 장소, NPC, 미션 조건을 유지하고 외곽 순환로와 휴게 정원을 추가했다.
- 놀이기구 모델: `src/world/Rides.jsx`. 코스터 경로·충돌 기준: `src/world/rideGeometry.js`.
- 카메라 연출: `src/world/SceneEntry.jsx`. 각 3D 페이지에서 장소별 구도를 지정한다. 연출 건너뛰기와 OS의 모션 감소 설정을 지원한다.
- 메인 스토리 전체 플레이 검증은 별도로 진행한다. 그래픽 변경은 로컬 빌드와 모델 미리보기, 자동차 점검 미션 진입·복귀로 확인했다.

## 보이드와 함께하는 고장 수사대

마이룸에서 도로랜드로 나간 뒤 미니맵 노란 점이 있는 시설에 접근한다. **R · 현장 조사 열기**를 누르면 전체 화면 2D 수사 장면으로 전환된다. 관찰, NPC에게 질문, 점검, 기록으로 단서를 모은 뒤 원인을 문장으로 말하면 보이드가 정답, 부분 정답, 오답을 판정한다(기준: 도로랜드_프롬프트 문서. 개발 서버에서는 Gemini가 server/prompts의 사건별 프롬프트로 대화와 판정을 하고, 키가 없거나 빌드된 사이트에서는 src/game/voidJudge.js 규칙으로 판정한다. 키는 .env.repair-demo.local의 GEMINI_API_KEY). 근거 단서를 직접 확인하고 원인을 맞혀야 작업대로 넘어가 부품을 조정하고 두 조건에서 시험한다. 개막 퍼레이드는 네 문제를 따로 판정하고, 가진 부품으로 문제마다 여러 해결 방법 중 하나를 고른다. 화면을 닫으면 직전 도로랜드 위치로 돌아온다. 스탬프 4개를 모으면 광장 북쪽 축제 무대의 개막 퍼레이드를 시작할 수 있다. 개막 퍼레이드를 마치면 정식 정비사가 되어 **원격 수리 자격증**을 받고, 그때부터 마이룸 컴퓨터의 **원격 수리실**에서 별도의 2D 의뢰를 시작할 수 있다.

기본 실행은 게임에 포함된 보이드 안내를 사용한다. 성인 개발자 전용 로컬 시연에서 Gemini를 쓰려면 프로젝트 루트에 Git이 무시하는 `.env.repair-demo.local` 파일을 만들고 `GEMINI_API_KEY=발급받은_키`를 넣는다. `npm run dev:repair-demo`로 실행하고 터미널의 `http://127.0.0.1:5175/#/myroom`를 연다. 기본 모델은 `gemini-3.1-flash-lite`이며, 다른 호환 Gemini 3 Flash 모델이 필요하면 `GEMINI_MODEL`로 설정한다. 키를 추가하거나 바꾸면 개발 서버를 재시작한다.

시연에서 보이드에게 쓴 질문과 확인된 사건 단서만 Gemini로 전달한다. 성인 시연에서는 가상의 질문을 사용한다. Gemini는 조사 의도와 단서 ID만 반환하며 수리 판정과 진행은 게임에서 계산한다. 질문 아래 **Gemini 시연** 또는 **기본 안내** 표시로 응답 경로를 확인한다. 시연 API는 루프백 Vite 개발 서버에만 등록된다.

삽화: [OpenMoji 17.0.0](https://github.com/hfg-gmuend/openmoji/tree/17.0.0), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). 원본 SVG와 라이선스는 `public/repair/openmoji`에 있다. 고장 수사대 2D 장면의 배경(하늘, 풀밭, 나무, 구름), 컨베이어, 톱니, 상자, 경광등, 선물 상자, 구슬은 [Kenney](https://kenney.nl/)의 CC0 스프라이트(Background Elements Remastered, Platformer Pack Industrial, Shooting Gallery, Platformer Assets Holiday)를 여백만 잘라 쓴다. 파일과 라이선스는 `public/repair/kenney`에 있다. 회전 바이킹, 푸드코트, 사파리 차량, 축제 무대의 3D 소품은 Kenney의 CC0 모델을 사용한다. 원본 모델과 출처는 `public/models/festival`에 있다.
