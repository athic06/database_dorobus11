import { forwardRef, useMemo } from 'react'
import { LAKE, ROUTE_PATHS, PLACES, RIVER, WORLD_HALF } from './layout.js'

const SIZE = 180
const toMap = (v) => ((v + WORLD_HALF) / (WORLD_HALF * 2)) * SIZE
// 작은 미니맵이 보여 주는 범위(지도 단위). 약 150m 둘레를 확대해서 보여 준다.
export const LOCAL_SPAN = 64
export const localViewBox = (x, z) => `${toMap(x) - LOCAL_SPAN / 2} ${toMap(z) - LOCAL_SPAN / 2} ${LOCAL_SPAN} ${LOCAL_SPAN}`

// 모드마다 점, 글자 크기 (지도 단위)
const STYLE = {
  local: { dot: 2.2, hub: 2.8, stroke: 0.6, font: 3.4, car: 0.45, marker: 2 },
  large: { dot: 2.5, hub: 3.3, stroke: 0.8, font: 4, car: 0.6, marker: 2.2 },
}

// 이름표 자리 정하기: 점 위 → 아래 → 오른쪽 → 왼쪽 순서로 비어 있는 곳에 놓고, 어디에도 안 들어가면 숨긴다.
// 중요한 곳(하모니아, 갈 수 있는 곳)부터 먼저 자리를 잡는다.
function placeLabels(openIds, st) {
  const boxes = []
  const hits = (b) => boxes.some((o) => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y)
  const order = Object.entries(PLACES).sort(([a], [b]) => {
    const rank = (id) => (id === 'harmonia' ? 0 : openIds.includes(id) ? 1 : 2)
    return rank(a) - rank(b)
  })
  const out = {}
  for (const [id, p] of order) {
    const cx = toMap(p.pos[0])
    const cy = toMap(p.pos[2])
    const w = p.name.length * st.font * 0.92
    const h = st.font * 1.05
    const gap = st.dot + 0.8
    const spots = [
      { x: cx - w / 2, y: cy - gap - h, anchor: 'middle', tx: cx, ty: cy - gap - h * 0.2 },
      { x: cx - w / 2, y: cy + gap, anchor: 'middle', tx: cx, ty: cy + gap + h * 0.8 },
      { x: cx + gap, y: cy - h / 2, anchor: 'start', tx: cx + gap, ty: cy + h * 0.32 },
      { x: cx - gap - w, y: cy - h / 2, anchor: 'end', tx: cx - gap, ty: cy + h * 0.32 },
    ]
    const spot = spots.find((s) => !hits({ x: s.x, y: s.y, w, h }))
    if (!spot) continue
    boxes.push({ x: spot.x, y: spot.y, w, h })
    out[id] = spot
  }
  return out
}

// 지도. 자동차 표시와 작은 미니맵의 보이는 범위는 매 프레임 DOM을 직접 바꾼다(리렌더 없이).
// markers: [{ x, z, color }] 부품 위치 등 임시 표시
// large: 크게 펼친 전체 지도, 아니면 내 주변만 확대한 작은 미니맵(viewRef로 보이는 범위를 옮긴다)
// onClick: 미니맵을 누르면 크게 보기
const Minimap = forwardRef(function Minimap({ openIds, markers = [], large = false, onClick, viewRef }, carRef) {
  const st = large ? STYLE.large : STYLE.local
  const openKey = openIds.join(',')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const labels = useMemo(() => placeLabels(openIds, st), [openKey, large])
  return (
    <svg
      ref={viewRef}
      className={`minimap${large ? ' big' : ' local'}${onClick ? ' clickable' : ''}`}
      viewBox={large ? `0 0 ${SIZE} ${SIZE}` : localViewBox(PLACES.myroom.pos[0], PLACES.myroom.pos[2])}
      role={onClick ? 'button' : 'img'}
      aria-label={onClick ? '지도 크게 보기' : '도로랜드 지도'}
      onClick={onClick}
    >
      <rect width={SIZE} height={SIZE} rx={large ? 8 : 0} fill="#5D795D" />
      <rect
        x={toMap(RIVER.x - RIVER.width / 2)}
        y={toMap(RIVER.z - RIVER.length / 2)}
        width={toMap(RIVER.width) - toMap(0)}
        height={toMap(RIVER.length) - toMap(0)}
        fill="#8FD0EC"
      />
      <circle cx={toMap(LAKE[0])} cy={toMap(LAKE[1])} r={toMap(LAKE[2]) - toMap(0)} fill="#8FD0EC" />
      {ROUTE_PATHS.map((path, i) => (
        <polyline key={i} points={path.map((p) => toMap(p[0]) + ',' + toMap(p[2])).join(' ')} stroke="#D5C6A3" strokeWidth={large ? 1.6 : 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {Object.entries(PLACES).map(([id, p]) => (
        <circle key={id} cx={toMap(p.pos[0])} cy={toMap(p.pos[2])} r={id === 'harmonia' ? st.hub : st.dot} fill={openIds.includes(id) ? '#2F7BFF' : '#8A93A6'} stroke="#fff" strokeWidth={st.stroke} />
      ))}
      {Object.entries(labels).map(([id, l]) => (
        <text key={id} x={l.tx} y={l.ty} textAnchor={l.anchor} className="mm-name" style={{ fontSize: st.font }}>{PLACES[id].name}</text>
      ))}
      {markers.map((m, i) => (
        <circle key={i} cx={toMap(m.x)} cy={toMap(m.z)} r={st.marker} fill={m.color || '#F08A3E'} stroke="#fff" strokeWidth={st.stroke} className="mm-blink" />
      ))}
      <g ref={carRef}>
        <path d="M0 -7 L5 5 L0 2.5 L-5 5 Z" fill="#E2574C" stroke="#fff" strokeWidth="1.4" transform={`scale(${st.car})`} />
      </g>
    </svg>
  )
})

export { toMap }
export default Minimap
