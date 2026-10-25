// G · 마이룸 가구로 만드는 보물찾기. 숨길 수 있는 자리 = 기본 가구 + 상점에서 산 가구.
export const HIDE_SPOTS = {
  sofa: { name: '피아노 소파', icon: '🎹' },
  portal: { name: '상점 포탈', icon: '🌀' },
  door: { name: '외출 문', icon: '🚪' },
  car: { name: '모바일 로봇', icon: '🚙' },
  plant: { name: '몬스테라 화분', icon: '🪴' },
  lamp: { name: '스탠드 조명', icon: '💡' },
  rug: { name: '동그란 러그', icon: '🟣' },
  shelf: { name: '책장', icon: '📚' },
}
export const BASE_SPOTS = ['sofa', 'portal', 'door', 'car']
export const spotsFor = (owned) => [...BASE_SPOTS, ...owned.filter((id) => HIDE_SPOTS[id])]

// 같은 브라우저에서 플레이한 계정이 없어도 체험할 수 있는 예시 친구 방
export const EXAMPLE_ROOMS = [
  { id: 'ex-1', name: '예시 · 도로 친구 하나', example: true, owned: ['plant', 'shelf'], minigame: { title: '책 사이를 잘 봐!', hideIn: 'shelf', plays: 12, likes: 5, likedBy: [], stake: 50, hiddenAt: '2026-01-01T00:00:00Z' } },
  { id: 'ex-2', name: '예시 · 도로 친구 둘', example: true, owned: ['lamp', 'rug'], minigame: { title: '불빛 아래 보물', hideIn: 'lamp', plays: 7, likes: 3, likedBy: [], stake: 100, hiddenAt: '2026-01-01T00:00:00Z' } },
]

// 친구 방(3D) 방문에서 살펴볼 자리. 가구 위치는 myroom/Furniture.jsx · MyRoom.jsx와 같다.
export const SPOT_POS = {
  sofa: [-6.5, 0, 6],
  portal: [8.9, 0, -4],
  door: [-5, 0, -9.2],
  car: [4.5, 0, 4.5],
  rug: [-1, 0, -2],
  plant: [8.6, 0, -8.6],
  lamp: [-8.4, 0, -8.6],
  shelf: [2.5, 0, -9.65],
}
