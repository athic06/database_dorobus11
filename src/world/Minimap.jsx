import { forwardRef } from 'react'
import { LAKE, ROUTE_PATHS, PLACES, RIVER, WORLD_HALF } from './layout.js'

const SIZE = 180
const toMap = (v) => ((v + WORLD_HALF) / (WORLD_HALF * 2)) * SIZE

// 오른쪽 위 미니맵. 자동차 표시는 매 프레임 DOM을 직접 움직인다(리렌더 없이).
// markers: [{ x, z, color }] 부품 위치 등 임시 표시
// large: 크게 펼친 지도 (같은 좌표계라 글자와 점만 작게 그린다), onClick: 미니맵을 누르면 크게 보기
const Minimap = forwardRef(function Minimap({ openIds, markers = [], large = false, onClick }, carRef) {
  const k = large ? 0.55 : 1 // 큰 지도에서는 점, 글자를 상대적으로 작게
  return (
    <svg
      className={`minimap${large ? ' big' : ''}${onClick ? ' clickable' : ''}`}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role={onClick ? 'button' : 'img'}
      aria-label={onClick ? '지도 크게 보기' : '도로랜드 지도'}
      onClick={onClick}
    >
      <rect width={SIZE} height={SIZE} rx="14" fill="#5D795D" />
      <rect
        x={toMap(RIVER.x - RIVER.width / 2)}
        y={toMap(RIVER.z - RIVER.length / 2)}
        width={toMap(RIVER.width) - toMap(0)}
        height={toMap(RIVER.length) - toMap(0)}
        fill="#8FD0EC"
      />
      <circle cx={toMap(LAKE[0])} cy={toMap(LAKE[1])} r={toMap(LAKE[2]) - toMap(0)} fill="#8FD0EC" />
      {ROUTE_PATHS.map((path,i)=><polyline key={i} points={path.map(p=>toMap(p[0])+','+toMap(p[2])).join(' ')} stroke="#D5C6A3" strokeWidth="2" fill="none" strokeLinecap="round" />)}
      {Object.entries(PLACES).map(([id, p]) => {
        const open = openIds.includes(id)
        return (
          <g key={id}>
            <circle cx={toMap(p.pos[0])} cy={toMap(p.pos[2])} r={(id === 'harmonia' ? 6 : 4.5) * k} fill={open ? '#2F7BFF' : '#8A93A6'} stroke="#fff" strokeWidth={1.5 * k} />
            <text x={toMap(p.pos[0])} y={toMap(p.pos[2]) - 7 * k} textAnchor="middle" className="mm-name">{p.name}</text>
          </g>
        )
      })}
      {markers.map((m, i) => (
        <circle key={i} cx={toMap(m.x)} cy={toMap(m.z)} r={4 * k} fill={m.color || '#F08A3E'} stroke="#fff" strokeWidth={1.5 * k} className="mm-blink" />
      ))}
      <g ref={carRef}>
        <path d="M0 -7 L5 5 L0 2.5 L-5 5 Z" fill="#E2574C" stroke="#fff" strokeWidth="1.2" transform={large ? 'scale(0.6)' : undefined} />
      </g>
    </svg>
  )
})

export { toMap }
export default Minimap
