// 로그인 이후의 일상 루트: 출석 → 요일 퀘스트 → 셀 숨기기·훔치기 → 피아노 랭킹 → 탈것.
// 밸런스 숫자는 모두 이 파일에 모아 둔다 (팀 결정에 따라 여기만 고치면 된다).

// 한국 시간 기준 날짜 (toISOString은 UTC라 아침 9시 전에는 하루 전 날짜가 된다)
const pad = (n) => String(n).padStart(2, '0')
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
export const todayKey = (d = new Date()) => `${monthKey(d)}-${pad(d.getDate())}`
const lastDayOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
export const isLastDayOfMonth = (d = new Date()) => d.getDate() === lastDayOfMonth(d)

/* ---------------- 출석판 ---------------- */
export const MONTHLY_GOAL = 10 // 한 달에 이만큼 출석하면 말일에 이달의 탈것을 받는다

// 오늘 처음 들어왔으면 출석 도장 + 탈것 스탬프 1개
export function checkInPatch(p, d = new Date()) {
  const month = monthKey(d)
  const day = d.getDate()
  const att = p.attendance?.month === month ? p.attendance : { month, days: [] }
  if (att.days.includes(day)) return null
  return { attendance: { month, days: [...att.days, day] }, stamps: (p.stamps || 0) + 1 }
}

/* ---------------- 탈것 ---------------- */
// need: 모아야 하는 탈것 스탬프 수 · monthly: 그 달 출석판 보상 · speed: 최고 속도 배율
// 운전자가 겉으로 보여야 하는 열린 탈것(스쿠터, 카트, 썰매)은 캐릭터를 태우는 모습이 없어서 빼고, 차체로 덮인 탈것만 둔다
export const VEHICLES = [
  { id: 'car', name: '모바일 로봇 자동차', icon: '🚙', need: 0, speed: 1, desc: '자일로에게 받은 첫 탈것' },
  { id: 'bus', name: '미니 도로버스', icon: '🚌', need: 5, speed: 0.9, desc: '느리지만 든든한 노란 버스' },
  { id: 'pumpkin', name: '호박 마차', icon: '🎃', monthly: '10', speed: 1.05, desc: '10월 출석판 보상' },
  { id: 'tree', name: '트리 기차', icon: '🎄', monthly: '12', speed: 1, desc: '12월 출석판 보상' },
]
export const vehicleOf = (id) => VEHICLES.find((v) => v.id === id) || VEHICLES[0]
export const ownsVehicle = (p, v) => (v.monthly ? (p.monthlyVehicles || []).includes(v.id) : (p.stamps || 0) >= v.need)
export const monthlyVehicle = (d = new Date()) => VEHICLES.find((v) => v.monthly === String(d.getMonth() + 1)) || null

/* ---------------- 요일별 일일 퀘스트 (수업과 연결하지 않음) ---------------- */
// 이벤트 이름: fix(고장 수리) · place(명소 방문, 중복 제외) · visit(친구 방 방문, 중복 제외) · steal(셀 찾기)
//            like(좋아요) · piano(피아노 최고 점수) · collect(운영 수익 받기) · upgrade(강화·설치) · login(접속)
export const WEEKLY_QUESTS = {
  0: { theme: '휴식의 날', icon: '☀️', tasks: [{ ev: 'login', goal: 1, label: '도로버스에 접속하기' }], reward: { cell: 30, stamps: 2, badge: 'rest' } },
  1: { theme: '수리의 날', icon: '🛠️', tasks: [{ ev: 'fix', goal: 2, label: '고장 난 시설 2곳 고치기' }], reward: { cell: 60, stamps: 1, badge: 'fixer' } },
  2: { theme: '탐험의 날', icon: '🧭', tasks: [{ ev: 'place', goal: 4, label: '도로랜드 명소 4곳 둘러보기' }], reward: { cell: 50, stamps: 1, badge: 'explorer' } },
  3: { theme: '보물의 날', icon: '💎', tasks: [{ ev: 'visit', goal: 2, label: '친구 방 2곳 놀러 가기' }], reward: { cell: 50, stamps: 1, badge: 'treasure' } },
  4: { theme: '음악의 날', icon: '🎵', tasks: [{ ev: 'piano', goal: 300, label: '피아노 게임 300점 넘기' }], reward: { cell: 60, stamps: 1, badge: 'music' } },
  5: {
    theme: '운영의 날', icon: '🎡',
    tasks: [{ ev: 'collect', goal: 1, label: '테마파크 운영 수익 받기' }, { ev: 'upgrade', goal: 1, label: '시설 강화하거나 설치하기' }],
    reward: { cell: 70, stamps: 1, badge: 'manager' },
  },
  6: {
    theme: '친구의 날', icon: '🤝',
    tasks: [{ ev: 'steal', goal: 1, label: '친구 방에서 숨긴 셀 찾기' }, { ev: 'like', goal: 1, label: '친구 방에 좋아요 남기기' }],
    reward: { cell: 80, stamps: 1, badge: 'friend' },
  },
}
export const BADGES = {
  rest: { name: '여유로운 주말', icon: '☀️' },
  fixer: { name: '수리왕', icon: '🛠️' },
  explorer: { name: '도로랜드 탐험가', icon: '🧭' },
  treasure: { name: '보물 사냥꾼', icon: '💎' },
  music: { name: '하모니아 연주자', icon: '🎵' },
  manager: { name: '테마파크 사장님', icon: '🎡' },
  friend: { name: '모두의 친구', icon: '🤝' },
}
export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
export const questOf = (d = new Date()) => WEEKLY_QUESTS[d.getDay()]

// 오늘의 활동 기록 (날짜가 바뀌면 새로 시작)
export const dailyOf = (p, d = new Date()) => (p.daily?.date === todayKey(d) ? p.daily : { date: todayKey(d), counts: {}, seen: {}, claimed: false })
export const taskValue = (daily, ev) => (ev === 'login' ? 1 : daily.counts[ev] || 0)
export const questDone = (p, d = new Date()) => {
  const daily = dailyOf(p, d)
  return questOf(d).tasks.every((t) => taskValue(daily, t.ev) >= t.goal)
}

/* ---------------- 마이룸 셀 숨기기 · 훔치기 ---------------- */
export const STAKES = [50, 100, 200] // 숨길 수 있는 셀
export const GUARD_PER_HOUR = 10 // 못 찾고 버틴 1시간마다 주인이 받는 보상
export const GUARD_CAP_HOURS = 24 // 시간 보상은 최대 24시간치
export const FAIL_BONUS = 5 // 방문자가 끝내 못 찾고 돌아갈 때마다 주인 보상
export const VISITOR_TRIES = 2 // 방문자가 한 방에서 살펴볼 수 있는 횟수(하루)
export const DAILY_STEALS = 3 // 하루에 훔칠 수 있는 최대 횟수

export function guardEarned(mg, now = Date.now()) {
  if (!mg?.stake || !mg.hiddenAt) return 0
  const end = mg.foundAt ? Date.parse(mg.foundAt) : now
  const hours = Math.min(GUARD_CAP_HOURS, Math.floor((end - Date.parse(mg.hiddenAt)) / 3600000))
  return Math.max(0, hours * GUARD_PER_HOUR + (mg.fails || 0) * FAIL_BONUS - (mg.guardClaimed || 0))
}

export const raidsOf = (p, d = new Date()) => (p.raids?.date === todayKey(d) ? p.raids : { date: todayKey(d), steals: 0, rooms: {} })

/* ---------------- 피아노 랭킹 보상 ---------------- */
// 하루에 모드마다 한 번, 점수 구간에 따라 CELL
export const PIANO_TIERS = [[600, 60], [400, 40], [200, 20], [100, 10]]
export const pianoReward = (score) => (PIANO_TIERS.find(([min]) => score >= min) || [0, 0])[1]
