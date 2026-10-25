// 테마파크 성장 시스템: CELL로 시설을 설치·강화 → 방문객 증가 → 운영 수익(CELL) → 다시 설치·강화
// 상태는 기존 progress(계정별 저장)에 함께 넣는다: progress.park, progress.parkCollectAt, progress.facilities
import { FACILITIES } from '../missions/FacilityMission.jsx'

export const MAX_LEVEL = 5

// 도로랜드에 이미 있는 어트랙션. 처음에는 Lv.1로 운영 중이다.
export const ATTRACTIONS = [
  { id: 'carousel', name: '회전목마', icon: '🎠', baseCost: 200, visitors: 6 },
  { id: 'ferris', name: '관람차', icon: '🎡', baseCost: 300, visitors: 8 },
  { id: 'coaster', name: '롤러코스터', icon: '🎢', baseCost: 400, visitors: 10 },
]

// 챕터 3 미션 「첫 시설 설치」에서 고르지 않은 광장 시설은 CELL로 설치한다
export const FACILITY_PRICE = { bench: 100, fountain: 150, flower: 150, photo: 200, balloon: 250 }
export const PLAZA_FACILITIES = FACILITIES

export const VISITORS_PER = { facility: 4, furniture: 2, artwork: 2 }
// 방문객 10명당 1분에 1 CELL, 최대 2시간치까지 쌓인다
export const INCOME_CAP_MIN = 120

// 챕터 3에서 상점이 다시 문을 열면(광장이 살아나면) 운영을 시작할 수 있다
// 시연 계정(demoPark)은 조명 미션 직후 바로 운영을 보여 줄 수 있게 미리 열어 둔다
export const parkOpen = (p) => p.shopReopened || p.demoPark

export const levelOf = (p, id) => p.park?.[id] || 1
export const upgradeCost = (a, level) => a.baseCost * level

export function visitorsOf(p, owned = []) {
  if (!parkOpen(p)) return 0
  const rides = ATTRACTIONS.reduce((s, a) => s + a.visitors * levelOf(p, a.id), 0)
  return rides + p.facilities.length * VISITORS_PER.facility + owned.length * VISITORS_PER.furniture + p.artworks.length * VISITORS_PER.artwork
}

export const incomePerMin = (visitors) => Math.max(1, Math.floor(visitors / 10))

// 마지막으로 수익을 받은 뒤 쌓인 CELL
export function pendingIncome(p, owned, now = Date.now()) {
  if (!parkOpen(p) || !p.parkCollectAt) return 0
  const minutes = Math.min(INCOME_CAP_MIN, Math.floor((now - Date.parse(p.parkCollectAt)) / 60000))
  return minutes > 0 ? minutes * incomePerMin(visitorsOf(p, owned)) : 0
}
