// A · 랜덤 고장 · 업무 이벤트: 날짜와 계정으로 정해지는 "오늘 고장 난 시설" 2곳.
export const BREAKABLE = {
  carousel: { name: '회전목마', fault: '말을 돌리는 모터가 멈췄어요', pos: [-34, 0, 57] },
  ferris: { name: '관람차', fault: '태양광 패널 연결이 끊겼어요', pos: [-43, 0, -6] },
  coaster: { name: '롤러코스터', fault: '속도를 재는 가속도 센서가 고장 났어요', pos: [34, 0, -6] },
  sign: { name: '대형 전광판', fault: '도트 매트릭스 일부가 꺼졌어요', pos: [18.5, 0, 38] },
  harmonia: { name: '광장 조명', fault: '조명 제어 규칙이 지워졌어요', pos: [0, 0, 20] },
}

export const today = () => new Date().toISOString().slice(0, 10)

// A · 오래 접속하지 않으면 마이룸 가구가 고장 난다 (기획서 6쪽 메모)
export const ROOM_AWAY_DAYS = 3
export const daysSince = (date) => (date ? Math.floor((Date.parse(today()) - Date.parse(date)) / 86400000) : 0)

function hash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return Math.abs(h)
}

export function brokenToday(userId, date = today()) {
  const ids = Object.keys(BREAKABLE)
  const a = hash(`${userId}:${date}`) % ids.length
  let b = hash(`${date}:${userId}:2`) % ids.length
  if (b === a) b = (b + 1) % ids.length
  return [ids[a], ids[b]]
}

// 아직 안 고친 오늘의 고장 목록
export function pendingFaults(userId, work) {
  const d = today()
  const fixed = work?.date === d ? work.fixed : []
  return brokenToday(userId, d).filter((id) => !fixed.includes(id))
}

// B · 작품 방문객: 등록 후 시간이 지날수록, 광장 시설이 많을수록 늘어난다
export function artworkVisitors(art, facilityCount = 3) {
  const minutes = Math.max(0, (Date.now() - art.at) / 60000)
  return Math.floor(3 + minutes * (0.6 + facilityCount * 0.15))
}
