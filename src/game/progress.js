// 메인 스토리 진행 상태. 계정마다 따로 저장된다(store.jsx).
export const INITIAL_PROGRESS = {
  classDone: false, // 챕터 0 → 1: 첫 수업 수강
  introSeen: false, // 챕터 1: 자일로에게 지도와 모바일 로봇을 받음
  carCheckDone: false, // 챕터 1 미션 「자동차 출발 점검」 → 챕터 2 (동굴 해금)
  licenseGot: false, // 챕터 1: 점검을 마치고 자동차 옆에서 운전면허증을 챙김 → 외출 가능
  licenseDate: '',
  caveIntroSeen: false,
  diaryFound: false, // 챕터 2: 일기장 발견
  caveCleared: false, // 챕터 2 미션 「출구 찾기」 → 하모니아가 멈춘 것을 봄
  plazaOpen: false, // 챕터 3: 자일로가 광장 문을 열어 줌
  harmoniaRestored: false, // 챕터 3 미션 「하모니아 멜로디 복원」
  lightsFixed: false, // 챕터 3 미션 「광장 전등 연결」 (하모니아 수리 뒤 끊겨 있던 광장 전등)
  facilities: [], // 챕터 3 미션 「방문객 맞이하기」로 설치한 시설
  shopReopened: false, // 챕터 3 미션 「상점 재개장 준비」
  cubesFound: false, // 챕터 3 끝: 회전목마 옆 숨겨진 공간에서 큐브 3개 발견, 리코가 큐브 속으로 → 챕터 4
  rescueLessonDone: false, // 챕터 4: 강사님 수업 「시그널 브레이크」로 리코 구출
  rikoBack: false, // 챕터 4: 돌아온 리코와 나무 상자
  signsDone: false, // 챕터 4 미션 「안내판 짝 맞추기」 (회전목마 주변)
  letterSeen: false, // 챕터 4 끝: 코덱스의 편지 → 챕터 5
  voidStarted: false, // 챕터 5: 나무 상자 속 로봇 설계도 이야기
  parts: [], // 챕터 5 미션 「부품 수집」으로 모은 보이드 부품
  voidBuilt: false, // 챕터 5 미션 「조립 · 작동 시험」
  futureAnswer: '', // 코덱스의 질문 "도로랜드의 미래는?"에 대한 학생의 답
  codexMet: false, // 챕터 5 끝: 코덱스와 만남 → 메인 스토리 완료
  // ---- 스토리 이후 ----
  work: { date: '', fixed: [] }, // A 오늘의 고장 수리 업무
  artworks: [], // B 등록한 수업 결과물 { id, title, course, icon, at }
  robotPersona: 'kind', // D 보이드 성격
  robotChat: [], // D 대화 기록 { role: 'me' | 'void', text }
  bestBlocks: {}, // E 코딩 챌린지 최소 블록 기록 { lv1: 7 }
  minigame: null, // G 내가 만든 보물찾기 { title, hideIn, plays, likes, likedBy }
  pianoBest: 0, // H 피아노 기억 게임 최고 단계
  roomVisit: '', // A 마이룸 마지막 방문 날짜 (오래 비우면 가구 고장)
  sofaBroken: false, // A 오래 비운 사이 보이드가 건드려 고장 난 소파 피아노
  // ---- 일상 루트 (game/routine.js) ----
  attendance: { month: '', days: [] }, // 이번 달 출석한 날
  stamps: 0, // 탈것 스탬프 (출석·일일 퀘스트로 모음)
  monthlyVehicles: [], // 출석판 말일 보상으로 받은 탈것
  vehicle: 'car', // 지금 타는 탈것
  daily: null, // 오늘의 활동 기록 { date, counts, seen, claimed }
  badges: [], // 요일 퀘스트 배지
  raids: null, // 오늘 친구 방 셀 찾기 기록 { date, steals, rooms: { id: { tries, found } } }
  piano: { best: {}, rewarded: {} }, // 피아노 모드별 최고 점수 · 보상 받은 날짜
  visitors: [], // 내 방에 놀러 온 기록 { from, date } (최근 20개)
  visitIncome: 0, // 방문으로 받은 CELL 누적
  goalItem: null, // 마이룸 구매 목표로 정한 상점 가구 id
  park: {}, // 어트랙션 강화 레벨 { carousel: 2 } (없으면 Lv.1)
  parkCollectAt: '', // 운영 수익을 마지막으로 받은 시각 (ISO)
  course: null, // 수강 중인 수업 (game/courses.js의 id)
  contentDone: [], // 마친 범용 콘텐츠 문제 id (같은 문제를 낸 수업들에 모두 완료로 보인다)
  arcade: { best: 0, rewarded: "" }, // 컴퓨터 미니게임 「셀 캐치」 최고 점수, 보상 받은 날
  attempts: {}, // 미션별 시도 기록 { 'car-check': { tries, wrong } }
}

// 체험용: 메인 스토리를 모두 마친 상태
export const STORY_DONE = {
  classDone: true, introSeen: true, carCheckDone: true, licenseGot: true, caveIntroSeen: true, diaryFound: true, caveCleared: true,
  plazaOpen: true, harmoniaRestored: true, lightsFixed: true, facilities: ['bench', 'fountain', 'photo'], shopReopened: true,
  cubesFound: true, rescueLessonDone: true, rikoBack: true, signsDone: true, letterSeen: true,
  voidStarted: true, parts: ['sensor', 'battery', 'motor', 'wheel', 'antenna'], voidBuilt: true, codexMet: true,
}
export const storyDone = (p) => p.codexMet
// 면허증이 생기기 전에 챕터 1을 지난 계정은 이미 가진 것으로 본다
export const hasLicense = (p) => p.licenseGot || p.diaryFound

export const FACILITY_GOAL = 3

// 챕터 5 보이드 부품. where: 월드 위치, from: 어떤 활동을 응용하는지
export const VOID_PARTS = [
  { id: 'sensor', name: '동물 감지 센서', icon: '👁️', slot: '얼굴', where: '사파리', from: '조건 블록 (챕터 3)' },
  { id: 'battery', name: '태양광 배터리', icon: '🔋', slot: '몸통', where: '관람차', from: '점검 순서 (챕터 1)' },
  { id: 'motor', name: '팔 모터', icon: '⚙️', slot: '어깨', where: '롤러코스터', from: '분류하기 (챕터 3)' },
  { id: 'wheel', name: '튼튼한 바퀴', icon: '🛞', slot: '다리', where: '동굴 앞', from: '길 찾기 (챕터 2)' },
  { id: 'antenna', name: '신호 안테나', icon: '📡', slot: '머리 위', where: '오래된 창고 숲', from: '방향 안내 (챕터 4)' },
]

export function chapterOf(p) {
  if (!p.classDone) return 0
  if (!p.carCheckDone) return 1
  if (!p.caveCleared) return 2
  if (!p.cubesFound) return 3
  if (!p.letterSeen) return 4
  if (!p.codexMet) return 5
  return 6
}

export const CHAPTER_TITLES = [
  '챕터 0 · 마이룸',
  '챕터 1 · 지도와 자동차',
  '챕터 2 · 동굴 속 일기장',
  '챕터 3 · 하모니아 광장',
  '챕터 4 · 잊혀진 시간 속으로',
  '챕터 5 · 보이드 구조 작전',
  '메인 스토리 완료',
]

// 챕터 4에서 리코가 큐브 속에 있는 동안은 리코 대사를 빼야 한다
export const rikoMissing = (p) => p.cubesFound && !p.rikoBack

export function objectiveOf(p) {
  if (!p.classDone) return '대시보드의 「오늘의 수업」에서 첫 수업을 들어요'
  if (!p.introSeen) return '마이룸으로 가서 자일로를 만나요'
  if (!p.carCheckDone) return '모바일 로봇 자동차 앞에서 E를 눌러 출발 점검을 해요'
  if (!hasLicense(p)) return '자동차 옆 받침대에 놓인 운전면허증을 챙겨요'
  if (!p.diaryFound) return '마이룸 문으로 나가 자동차로 북동쪽 산의 동굴까지 달려요. 네이티를 따라 동굴 안쪽을 살펴봐요'
  if (!p.caveCleared) return '동굴의 지도 표지판 앞에서 출구를 찾아요'
  if (!p.plazaOpen) return '마이룸 앞의 자일로를 찾아가 이야기를 들어 봐요'
  if (!p.harmoniaRestored) return '하모니아 광장에 들어가 악보대에서 멜로디를 복원해요'
  if (!p.lightsFixed) return '하모니아 수리 완료! 광장 조명 제어반에서 끊긴 전등을 연결하고 켜지는 조건을 만들어요'
  if (p.facilities.length < FACILITY_GOAL) return `광장 방문객의 요청을 듣고 시설을 설치해요 (${p.facilities.length}/${FACILITY_GOAL})`
  if (!p.shopReopened) return '광장 서쪽의 상점에 가서 재개장 준비를 도와요'
  if (!p.cubesFound) return '회전목마 옆 오래된 구조물이 움직였어요! 가 봐요'
  if (!p.rescueLessonDone) return '리코가 큐브 속으로 사라졌어요! 대시보드 「오늘의 수업」에서 강사님 수업 「시그널 브레이크」를 들어요'
  if (!p.rikoBack) return '도로랜드로 나가 돌아온 리코를 만나요'
  if (!p.signsDone) return '회전목마 주변 안내판을 시설 이름과 방향에 맞게 정리해요'
  if (!p.letterSeen) return '회전목마에서 무언가가 기다리고 있어요'
  if (!p.voidStarted) return '마이룸 앞의 자일로에게 나무 상자 속 설계도를 보여 줘요'
  if (p.parts.length < VOID_PARTS.length) return `도로랜드 곳곳에서 보이드 부품을 모아요 (${p.parts.length}/${VOID_PARTS.length}) · 미니맵의 주황 점`
  if (!p.voidBuilt) return '연구실(자일로의 작업실)에서 보이드를 조립하고 작동 시험을 해요'
  if (!p.codexMet) return '보이드가 가리킨 북서쪽, 오래된 창고로 가 봐요'
  return '메인 스토리 완료! 오늘의 수리 업무 · 테마파크 운영 · 미니게임을 즐겨 봐요'
}

export function continuePath(p) {
  const c = chapterOf(p)
  if (c === 0) return null
  if (c === 1) return '/myroom'
  if (c === 2 && p.diaryFound) return '/cave'
  if (c === 3 && p.plazaOpen && p.facilities.length < FACILITY_GOAL) return '/plaza'
  if (c === 4 && !p.rescueLessonDone) return null // 대시보드에서 수업 먼저
  return '/world'
}

// 월드에서 하모니아가 멈춰 있는가 (챕터 2 끝 ~ 멜로디 복원 전)
export const harmoniaStopped = (p) => p.caveCleared && !p.harmoniaRestored
