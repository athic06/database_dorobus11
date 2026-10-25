// 도로랜드 오픈월드 배치도. 단위는 미터 정도, 북쪽이 -z.
export const WORLD_HALF = 95

export const PLACES = {
  myroom: { name: '마이룸', pos: [0, 0, 68], radius: 7 },
  harmonia: { name: '하모니아', pos: [0, 0, 0], radius: 18 },
  sign: { name: '대형 전광판', pos: [16, 0, 34], radius: 6 },
  shop: { name: '상점', pos: [-24, 0, 24], radius: 7 },
  carousel: { name: '회전목마', pos: [-34, 0, 48], radius: 8 },
  lab: { name: '연구실', pos: [42, 0, 46], radius: 8 },
  ferris: { name: '관람차', pos: [-50, 0, -6], radius: 9 },
  coaster: { name: '롤러코스터', pos: [48, 0, -10], radius: 14 },
  safari: { name: '사파리', pos: [-52, 0, -56], radius: 18 },
  storage: { name: '오래된 창고', pos: [-78, 0, 14], radius: 5 },
  cave: { name: '동굴', pos: [44, 0, -66], radius: 7 },
}

// 길: 하모니아 광장 둘레에서 각 장소로 이어진다.
export const ROADS = [
  ['myroom', 'harmonia'],
  ['harmonia', 'shop'],
  ['shop', 'carousel'],
  ['harmonia', 'sign'],
  ['sign', 'lab'],
  ['harmonia', 'ferris'],
  ['ferris', 'storage'],
  ['harmonia', 'coaster'],
  ['harmonia', 'safari'],
  ['coaster', 'cave'],
]

// 회전목마 옆 오래된 돌 구조물: 챕터 3 끝에 열리며 큐브 3개가 나온다
export const VAULT = { pos: [-41, 0, 56], rot: Math.PI / 4, front: [-38, 0, 59] }

// 자동차가 통과할 수 없는 원형 영역 [x, z, 반지름]
export const COLLIDERS = [
  [0, 0, 16.5], // 하모니아 광장 울타리 (챕터 3 전까지 닫힘)
  [0, 72, 4.5], // 마이룸 집
  [16, 34.5, 1.2], [21, 34.5, 1.2], // 전광판 기둥
  [-24, 20, 5], // 상점
  [-34, 48, 6], // 회전목마
  [-41, 56, 3], // 회전목마 옆 오래된 구조물 (챕터 3 큐브)
  [42, 50, 5.5], // 연구실
  [-50, -6, 4], // 관람차 다리
  [48, -10, 3], [56, -18, 2], [40, -18, 2], // 롤러코스터 기둥
  [-78, 14, 3.5], // 창고
  [44, -78, 11], [32, -76, 8], [56, -76, 8], // 동굴 산
]

// 나무 배치: 고정 시드라 항상 같은 숲이 나온다. 장소·길·강 근처는 비운다.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

export const TREES = (() => {
  const rnd = seeded(42)
  const list = []
  const places = Object.values(PLACES)
  for (let i = 0; i < 1200 && list.length < 200; i++) {
    const x = (rnd() * 2 - 1) * (WORLD_HALF - 4)
    const z = (rnd() * 2 - 1) * (WORLD_HALF - 4)
    if (places.some((p) => Math.hypot(x - p.pos[0], z - p.pos[2]) < p.radius + 9)) continue
    if (ROADS.some(([a, b]) => distToSegment(x, z, PLACES[a].pos[0], PLACES[a].pos[2], PLACES[b].pos[0], PLACES[b].pos[2]) < 10)) continue
    if (x > 62 && z > -40 && z < 70) continue // 강
    list.push({ x, z, s: 0.7 + rnd() * 0.55, c: rnd() })
  }
  return list
})()

// 자동차 충돌용: 건물 + 나무 기둥
export const ALL_COLLIDERS = [...COLLIDERS, ...TREES.map((t) => [t.x, t.z, 0.6 * t.s])]
