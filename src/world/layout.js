import * as THREE from 'three'
import { createCoasterTrack } from './rideGeometry.js'
// 도로랜드 오픈월드 배치도. 단위는 미터 정도, 북쪽이 -z.
export const WORLD_HALF = 210

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
  // 바깥쪽 명소: 스토리와 상관없이 둘러보는 곳 (탐험의 날 퀘스트에 포함)
  lake: { name: '호수 공원', pos: [-100, 0, 80], radius: 22 },
  garden: { name: '꽃 정원', pos: [-112, 0, -12], radius: 13 },
  windmill: { name: '풍차 언덕', pos: [116, 0, -30], radius: 12 },
  station: { name: '기차역', pos: [36, 0, 116], radius: 16 },
  observatory: { name: '별빛 전망대', pos: [-6, 0, -122], radius: 10 },
  camp: { name: '캠핑장', pos: [-108, 0, -106], radius: 13 },
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
  ['carousel', 'lake'],
  ['storage', 'garden'],
  ['coaster', 'windmill'],
  ['myroom', 'station'],
  ['lab', 'station'],
  ['safari', 'camp'],
  ['harmonia', 'observatory'],
]

// Scenic routes do not add or move any quest destination.
export const SCENIC_ROADS = [
  [[-174,0,-164],[0,0,-174]], [[0,0,-174],[174,0,-164]],
  [[174,0,-164],[174,0,168]], [[174,0,168],[0,0,174]],
  [[0,0,174],[-174,0,168]], [[-174,0,168],[-174,0,-164]],
  [PLACES.station.pos,[0,0,174]], [PLACES.windmill.pos,[174,0,-30]],
  [PLACES.garden.pos,[-174,0,-12]], [PLACES.observatory.pos,[0,0,-174]],
  [PLACES.camp.pos,[-174,0,-164]], [PLACES.lake.pos,[-174,0,168]],
]
export const DISTRICTS = [
  {id:'carousel',radius:11.5,gate:[-30,0,64],rotation:0,benches:[[7,4],[7,-3]]},
  {id:'ferris',radius:13,gate:[-33,0,-6],rotation:Math.PI/2,benches:[]},
  {id:'coaster',radius:16.5,gate:[28,0,-5],rotation:-Math.PI/2,benches:[[-6,12],[3,13]]},
]
export const PROMENADE_SITES = [[-154,0,140], [152,0,140], [-154,0,-135], [150,0,-135]]
export const PROMENADE_COLLIDERS = PROMENADE_SITES.flatMap(([x,,z]) => [
  ...[-4,4].flatMap(dx => [-3,3].map(dz => [x+dx,z+dz,0.3])),
  [x-3,z,1.25], [x+3,z,1.25],
])
// 길 배치: 실제 공원처럼
// 1) 하모니아 둘레에 순환 도로(RING_R)를 두르고, 하모니아로 이어지는 길은 순환 도로에서 갈라져 나간다.
//    (예전처럼 탑 한가운데로 모이면 울타리를 뚫고 겹쳐 보인다)
// 2) 길은 장소 한가운데가 아니라 가장자리(입구)에서 끝난다. 건물을 뚫고 들어가지 않게.
export const RING_R = 23
const ringPoint = (angle) => [Math.cos(angle) * RING_R, 0, Math.sin(angle) * RING_R]
const RING_PATH = Array.from({ length: 65 }, (_, i) => ringPoint((i / 64) * Math.PI * 2))
// id 장소에서 target 쪽을 향한 가장자리 점. 놀이시설은 하모니아 쪽 길이면 정문(gate)을 쓴다.
function edgeToward(id, target, useGate) {
  const district = DISTRICTS.find((d) => d.id === id)
  if (district && useGate) return district.gate
  const [px, , pz] = PLACES[id].pos
  const dx = target[0] - px
  const dz = target[2] - pz
  const len = Math.hypot(dx, dz)
  const r = district ? district.radius + 1 : PLACES[id].radius * 0.75
  const k = Math.min(r, len * 0.4) / len
  return [px + dx * k, 0, pz + dz * k]
}
const routeEnds = [
  ...ROADS.map(([a, b]) => {
    if (a === 'harmonia' || b === 'harmonia') {
      const id = a === 'harmonia' ? b : a
      const end = edgeToward(id, [0, 0, 0], true)
      return [ringPoint(Math.atan2(end[2], end[0])), end]
    }
    return [edgeToward(a, PLACES[b].pos), edgeToward(b, PLACES[a].pos)]
  }),
  ...SCENIC_ROADS,
]
const straight = ([a, b]) => {
  // 땅 높이 계산과 가로등 배치를 위해 5m 간격으로 점을 나눠 둔다
  const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 5))
  return Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, 0, a[2] + (b[2] - a[2]) * i / n])
}
export const ROUTE_PATHS = [RING_PATH, ...routeEnds.map(straight)]
// 길이 끝나거나 갈라지는 점: 둥글게 덮어 이음매를 깔끔하게 한다
export const ROAD_JOINTS = [...new Map(routeEnds.flat().map((p) => [p.map((v) => v.toFixed(2)).join(','), p])).values()]
export const ALL_ROAD_SEGMENTS = ROUTE_PATHS.flatMap(points=>points.slice(1).map((p,i)=>[points[i],p]))

// 강: 동쪽을 남북으로 가로지른다. 풍차 언덕 길에는 다리가 놓인다.
export const RIVER = { x: 76, z: 22, width: 18, length: 256 }
export const inRiver = (x, z, pad = 0) => Math.abs(x - RIVER.x) < RIVER.width / 2 + pad && Math.abs(z - RIVER.z) < RIVER.length / 2 + pad
// 호수 공원의 물: 원 [x, z, 반지름]
export const LAKE = [-100, 80, 16]

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
  [-50, -6, 12.8], // 관람차 언덕 (자동차는 못 오른다. 걸어서는 계단으로)
  [48, -10, 3], [56, -18, 2], [40, -18, 2], // 롤러코스터 기둥
  [-78, 14, 3.5], // 창고
  [44, -78, 11], [32, -76, 8], [56, -76, 8], // 동굴 산
  [-100, 80, 15.5], // 호수
  [-112, -12, 2.6], // 꽃 정원 분수
  [116, -34, 3.2], // 풍차
  [36, 123, 5], [29, 123, 2], [43, 123, 2], // 기차역 건물
  [-6, -127, 3.6], // 전망대 탑
  [-108, -106, 1.2], [-115, -112, 2], [-100, -113, 2], [-116, -99, 2], // 캠프파이어, 텐트
]

// 관람차 언덕: 꼭대기 평지(top) 위에 관람차, 동쪽(+x)으로 계단. 걸을 때만 오를 수 있다.
export const FERRIS_HILL = { x: -50, z: -6, top: 7.5, base: 12.5, h: 3, stairHalf: 1.6, steps: 10 }
const onStairs = (x, z) => x > FERRIS_HILL.x && Math.abs(z - FERRIS_HILL.z) < FERRIS_HILL.stairHalf
// 걸어 다닐 때의 발밑 높이 (계단은 칸마다 높이가 올라간다)
export function walkHeight(x, z) {
  const { x: hx, z: hz, top, base, h, steps } = FERRIS_HILL
  const d = Math.hypot(x - hx, z - hz)
  if (d <= top) return h
  if (d < base && onStairs(x, z)) return Math.min(steps, Math.floor(((base - d) / (base - top)) * steps) + 1) * (h / steps)
  return 0
}
// 축대 벽은 계단 말고는 넘을 수 없다 (위에서는 떨어지지 않게, 아래에서는 오르지 못하게)
export function walkBlocked(x, z) {
  const d = Math.hypot(x - FERRIS_HILL.x, z - FERRIS_HILL.z)
  if (d > FERRIS_HILL.top - 0.4 && d < FERRIS_HILL.top + 0.7 && !onStairs(x, z)) return true
  // 계단 양옆 돌벽
  const side = Math.abs(z - FERRIS_HILL.z)
  return x > FERRIS_HILL.x && d > FERRIS_HILL.top - 0.4 && d < FERRIS_HILL.base && side > FERRIS_HILL.stairHalf - 0.1 && side < FERRIS_HILL.stairHalf + 0.6
}

// Keep story NPCs and collectible interaction areas clear as the forest expands.
export const STORY_CLEARINGS = [[7,52],[-6,24],[-38,59],[-40,-34],[-42,6],[30,-20],[32,-58],[-72,24],[-71,18.5],[-60,-32],[-40,-15],[-26,61],[-17,31],[24,40],[35,40]]

// 나무 배치: 고정 시드라 항상 같은 숲이 나온다. 장소·길·강 근처는 비운다.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

export function roadDistance(x,z) {
  let best=Infinity
  for(const [a,b] of ALL_ROAD_SEGMENTS) best=Math.min(best,distToSegment(x,z,a[0],a[2],b[0],b[2]))
  return best
}
const smooth=(a,b,x)=> {const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
// Buildings, paths, water and quest interactions stay level; forest islands rise between them.
export function groundHeight(x,z) {
  let clearance=roadDistance(x,z)-4.8
  for(const d of DISTRICTS) clearance=Math.min(clearance,Math.hypot(x-PLACES[d.id].pos[0],z-PLACES[d.id].pos[2])-d.radius-3,Math.hypot(x-d.gate[0],z-d.gate[2])-7)
  for(const p of Object.values(PLACES)) clearance=Math.min(clearance,Math.hypot(x-p.pos[0],z-p.pos[2])-p.radius-3)
  for(const [cx,cz] of STORY_CLEARINGS) clearance=Math.min(clearance,Math.hypot(x-cx,z-cz)-8)
  for(const [cx,,cz] of PROMENADE_SITES) clearance=Math.min(clearance,Math.hypot(x-cx,z-cz)-13)
  if(inRiver(x,z,6))return 0
  clearance=Math.min(clearance,Math.hypot(x-LAKE[0],z-LAKE[1])-LAKE[2]-4)
  const undulation=2.5+2.8*(0.5+0.5*Math.sin(x*0.045+z*0.019))* (0.5+0.5*Math.cos(z*0.052-x*0.021))
  return smooth(0,11,clearance)*undulation
}
export const PARK_EDGES = DISTRICTS.flatMap(d=>{
  const [x,,z]=PLACES[d.id].pos,points=[]
  for(let i=0;i<42;i++) {
    const a=i*Math.PI*2/42,px=x+Math.sin(a)*d.radius,pz=z+Math.cos(a)*d.radius
    const open=d.id==='carousel'?Math.cos(a)>0.1:d.id==='ferris'?Math.sin(a)>0.35:Math.sin(a)<-0.35
    points.push(open||roadDistance(px,pz)<5||STORY_CLEARINGS.some(([cx,cz])=>Math.hypot(px-cx,pz-cz)<5)?null:[px,pz])
  }
  return points.flatMap((p,i)=>p?[{x:p[0],z:p[1],next:points[(i+1)%points.length]}]:[])
})
export const PARK_COLLIDERS = [
  ...PARK_EDGES.map(p=>[p.x,p.z,0.12]),
  ...DISTRICTS.flatMap(d=>{
    const [x,,z]=PLACES[d.id].pos
    return [...d.benches.map(([dx,dz])=>[x+dx,z+dz,1.3]),...[-3.2,3.2].map(dx=>[d.gate[0]+Math.cos(d.rotation)*dx,d.gate[2]-Math.sin(d.rotation)*dx,0.23])]
  })
]
export const TREES = (() => {
  const rnd=seeded(42), list=[], cells=new Map()
  for(let i=0;i<45000 && list.length<2100;i++) {
    const x=(rnd()*2-1)*(WORLD_HALF-5),z=(rnd()*2-1)*(WORLD_HALF-5)
    if(DISTRICTS.some(d=>Math.hypot(x-PLACES[d.id].pos[0],z-PLACES[d.id].pos[2])<d.radius+5 || Math.hypot(x-d.gate[0],z-d.gate[2])<7))continue
    if(PROMENADE_SITES.some(([cx,,cz])=>Math.hypot(x-cx,z-cz)<13))continue
    if(STORY_CLEARINGS.some(([cx,cz])=>Math.hypot(x-cx,z-cz)<8))continue
    if(Object.values(PLACES).some(p=>Math.hypot(x-p.pos[0],z-p.pos[2])<p.radius+4.8))continue
    if(roadDistance(x,z)<6.5 || inRiver(x,z,3))continue
    // Cluster the forest into groves; avoid evenly spaced toy-tree rows.
    if(rnd()>0.65+0.22*Math.sin(x*0.07)*Math.cos(z*0.065))continue
    const key=Math.floor(x/4)+','+Math.floor(z/4)
    if(cells.has(key))continue
    cells.set(key,true)
    list.push({x,z,y:groundHeight(x,z),s:0.8+rnd()*0.7,c:rnd(),r:rnd()*Math.PI*2})
  }
  // Lower, dense groves screen adjacent rides at the driver's eye level.
  for(const [cx,cz] of [[24,18],[-31,5],[-38,22],[27,-32],[-20,-32],[9,-42],[-53,28]]) {
    for(let i=0;i<15;i++) {
      const a=i*2.4,r=2+Math.sqrt(i)*2.2,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r
      if(roadDistance(x,z)<6.5||inRiver(x,z,3))continue
      if(STORY_CLEARINGS.some(([sx,sz])=>Math.hypot(x-sx,z-sz)<8))continue
      if(Object.values(PLACES).some(p=>Math.hypot(x-p.pos[0],z-p.pos[2])<p.radius+4))continue
      if(DISTRICTS.some(d=>Math.hypot(x-PLACES[d.id].pos[0],z-PLACES[d.id].pos[2])<d.radius+4))continue
      list.push({x,z,y:groundHeight(x,z),s:i%3===0?1.05:0.57+(i%4)*0.07,c:0.5+(i%3)*0.1,r:a,screen:true})
    }
  }
  return list
})()

// 길가 가로등: 길을 따라 일정 간격으로, 양쪽을 번갈아 세운다. 장소 안쪽과 강은 비운다.
export const LAMPS = (() => {
  const list=[]
  ROUTE_PATHS.forEach((path,ri)=>{
    let distance=0,next=12
    for(let i=1;i<path.length;i++) {
      const a=path[i-1],b=path[i],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz)
      while(next<distance+len) {
        const t=(next-distance)/len,side=(ri+list.length)%2?1:-1
        const x=a[0]+dx*t-dz/len*4.2*side,z=a[2]+dz*t+dx/len*4.2*side
        if(roadDistance(x,z)>3.65&&!STORY_CLEARINGS.some(([cx,cz])=>Math.hypot(x-cx,z-cz)<3)&&!inRiver(x,z,2)&&!Object.values(PLACES).some(p=>Math.hypot(x-p.pos[0],z-p.pos[2])<p.radius+1))list.push({x,z,r:Math.atan2(-dz/len*side,-dx/len*side)})
        next+=23
      }
      distance+=len
    }
  })
  return list
})()

// 잔디 장식(풀, 꽃, 돌) 자리를 고를 때 쓴다: 길과 장소, 물을 피한다
export function isOpenGround(x, z, roadPad = 3.4) {
  if (DISTRICTS.some(d=>Math.hypot(x-PLACES[d.id].pos[0],z-PLACES[d.id].pos[2])<d.radius+1 || Math.hypot(x-d.gate[0],z-d.gate[2])<6)) return false
  if (PROMENADE_SITES.some(([cx,,cz]) => Math.hypot(x-cx,z-cz) < 13)) return false
  if (inRiver(x, z, 1.5)) return false
  if (Math.hypot(x - LAKE[0], z - LAKE[1]) < LAKE[2] + 1.5) return false
  if (Object.values(PLACES).some((p) => Math.hypot(x - p.pos[0], z - p.pos[2]) < p.radius * 0.8)) return false
  return !ALL_ROAD_SEGMENTS.some(([a, b]) => distToSegment(x, z, a[0], a[2], b[0], b[2]) < roadPad)
}

export { seeded }

// 자동차 충돌용: 건물 + 나무 기둥 + 가로등
const coasterTrack = createCoasterTrack()
export const RIDE_COLLIDERS = Array.from({ length: 18 }, (_, i) => {
  const p = coasterTrack.getPointAt(i / 18)
  return [PLACES.coaster.pos[0] + p.x, PLACES.coaster.pos[2] + p.z, 0.28]
})
export const ALL_COLLIDERS = [...COLLIDERS, ...RIDE_COLLIDERS, ...PARK_COLLIDERS, ...PROMENADE_COLLIDERS, ...TREES.map((t) => [t.x, t.z, 0.55 * t.s]), ...LAMPS.map((l) => [l.x, l.z, 0.35])]
// 걸어 다닐 때: 언덕은 walkBlocked로 따로 막으므로 언덕 원은 뺀다
export const WALK_COLLIDERS = ALL_COLLIDERS.filter((c) => !(c[0] === FERRIS_HILL.x && c[1] === FERRIS_HILL.z))
