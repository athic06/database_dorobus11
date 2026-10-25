import { useCallback, useRef, useState } from 'react'

// 로봇과 가장 가까운 상호작용 대상(포탈, 문, 자동차 …)을 찾는다.
// items: [{ id, pos: [x, y, z], radius?, hidden? }]
export function useProximity(items) {
  const itemsRef = useRef(items)
  itemsRef.current = items
  const [near, setNear] = useState(null)
  const nearRef = useRef(null)

  const onMove = useCallback((p) => {
    let best = null
    let bestDist = Infinity
    for (const it of itemsRef.current) {
      if (!it || it.hidden) continue
      const d = Math.hypot(p.x - it.pos[0], p.z - it.pos[2])
      if (d < (it.radius ?? 2.2) && d < bestDist) {
        bestDist = d
        best = it.id
      }
    }
    if (best !== nearRef.current) {
      nearRef.current = best
      setNear(best)
    }
  }, [])

  return { near, nearRef, onMove }
}
