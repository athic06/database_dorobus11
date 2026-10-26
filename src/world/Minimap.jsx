import { forwardRef } from 'react'
import { LAKE, PLACES, RIVER, ROADS, WORLD_HALF } from './layout.js'

const SIZE = 180
const toMap = (v) => ((v + WORLD_HALF) / (WORLD_HALF * 2)) * SIZE

// 오른쪽 위 미니맵. 자동차 표시는 매 프레임 DOM을 직접 움직인다(리렌더 없이).
// markers: [{ x, z, color }] 부품 위치 등 임시 표시
const Minimap = forwardRef(function Minimap({ openIds, markers = [] }, carRef) {
  return (
    <svg className="minimap" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="도로랜드 미니맵">
      <rect width={SIZE} height={SIZE} rx="14" fill="#BFE2A8" />
      <rect
        x={toMap(RIVER.x - RIVER.width / 2)}
        y={toMap(RIVER.z - RIVER.length / 2)}
        width={toMap(RIVER.width) - toMap(0)}
        height={toMap(RIVER.length) - toMap(0)}
        fill="#8FD0EC"
      />
      <circle cx={toMap(LAKE[0])} cy={toMap(LAKE[1])} r={toMap(LAKE[2]) - toMap(0)} fill="#8FD0EC" />
      {ROADS.map(([a, b]) => (
        <line
          key={a + b}
          x1={toMap(PLACES[a].pos[0])}
          y1={toMap(PLACES[a].pos[2])}
          x2={toMap(PLACES[b].pos[0])}
          y2={toMap(PLACES[b].pos[2])}
          stroke="#F1DDB5"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      {Object.entries(PLACES).map(([id, p]) => {
        const open = openIds.includes(id)
        return (
          <g key={id}>
            <circle cx={toMap(p.pos[0])} cy={toMap(p.pos[2])} r={id === 'harmonia' ? 6 : 4.5} fill={open ? '#2F7BFF' : '#8A93A6'} stroke="#fff" strokeWidth="1.5" />
            <text x={toMap(p.pos[0])} y={toMap(p.pos[2]) - 7} textAnchor="middle" className="mm-name">{p.name}</text>
          </g>
        )
      })}
      {markers.map((m, i) => (
        <circle key={i} cx={toMap(m.x)} cy={toMap(m.z)} r="4" fill={m.color || '#F08A3E'} stroke="#fff" strokeWidth="1.5" className="mm-blink" />
      ))}
      <g ref={carRef}>
        <path d="M0 -7 L5 5 L0 2.5 L-5 5 Z" fill="#E2574C" stroke="#fff" strokeWidth="1.2" />
      </g>
    </svg>
  )
})

export { toMap }
export default Minimap
