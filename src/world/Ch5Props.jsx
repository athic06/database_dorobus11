import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { VoidBot, Person } from './Characters.jsx'

// 챕터 5 부품 미션 장소. npc가 없으면 부품만 놓여 있다.
export const PART_SPOTS = {
  sensor: { pos: [-40, 0, -34], npc: { label: '사파리 사육사', color: '#8B9A5B', hat: '#C9A15B', rotation: -1.2 } },
  battery: { pos: [-42, 0, 6], npc: { label: '관람차 기술자', color: '#4E8BFF', hat: '#F5C451', rotation: 1.6 } },
  motor: { pos: [30, 0, -20], npc: { label: '롤러코스터 정비사', color: '#E2574C', hat: '#2B2F3A', rotation: 2.4 } },
  wheel: { pos: [32, 0, -58], npc: null },
  antenna: { pos: [-72, 0, 24], npc: { label: '길 잃은 방문객', color: '#9B6BD6', hair: '#7A4A20', rotation: 2.2 } },
}

// 위에 둥둥 떠 있는 주황빛 부품 표시
function PartBeacon() {
  const g = useRef()
  useFrame((s, dt) => {
    if (!g.current) return
    g.current.rotation.y += dt * 1.5
    g.current.position.y = 4.2 + Math.sin(s.clock.elapsedTime * 2) * 0.25
  })
  return (
    <group ref={g}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.14, 8, 8]} />
        <meshStandardMaterial color="#F5B841" emissive="#F08A3E" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <pointLight color="#F08A3E" intensity={6} distance={8} />
    </group>
  )
}

export function PartSpot({ id }) {
  const spot = PART_SPOTS[id]
  return (
    <group position={spot.pos}>
      {spot.npc ? (
        <Person position={[0, 0, 0]} rotation={spot.npc.rotation} color={spot.npc.color} hat={spot.npc.hat} hair={spot.npc.hair} label={spot.npc.label} />
      ) : (
        <group>
          {[[-1, 0.8, 0, 1.1], [1.1, 0.7, 0.4, 1], [0, 1.2, -0.8, 1.2]].map(([x, y, z, r], i) => (
            <mesh key={i} position={[x, y, z]} castShadow>
              <dodecahedronGeometry args={[r, 0]} />
              <meshStandardMaterial color="#8A7B6C" flatShading />
            </mesh>
          ))}
          <mesh position={[0, 0.5, 0.9]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.5, 0.5, 0.35, 18]} />
            <meshStandardMaterial color="#26282E" />
          </mesh>
        </group>
      )}
      <PartBeacon />
    </group>
  )
}

// A · 고장 난 시설 표시: 깜빡이는 빨간 경고등과 피어오르는 연기
export function FaultMarker({ position, name }) {
  const light = useRef()
  const puffs = useRef([])
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (light.current) light.current.intensity = Math.sin(t * 6) > 0 ? 12 : 2
    puffs.current.forEach((p, i) => {
      if (!p) return
      const k = (t * 0.4 + i / 4) % 1
      p.position.set(Math.sin(i * 2) * 0.6, 3 + k * 4, Math.cos(i * 2) * 0.6)
      p.scale.setScalar(0.6 + k * 1.4)
      p.material.opacity = 0.55 * (1 - k)
    })
  })
  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(el) => (puffs.current[i] = el)}>
          <sphereGeometry args={[0.6, 10, 10]} />
          <meshStandardMaterial color="#6B6F78" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
      <pointLight ref={light} position={[0, 3, 0]} color="#FF3B3B" distance={12} />
      <Html position={[0, 8.2, 0]} center zIndexRange={[1, 0]} distanceFactor={40}>
        <div className="world-label fault">⚠ {name} 고장</div>
      </Html>
    </group>
  )
}

const goal = new THREE.Vector3()
// 완성된 보이드가 자동차 뒤를 졸졸 따라온다
export function VoidFollower({ posRef, headingRef }) {
  const g = useRef()
  useFrame((_, dt) => {
    if (!g.current) return
    const h = headingRef.current
    const p = posRef.current
    goal.set(p.x - Math.sin(h) * 4 + Math.cos(h) * 1.6, 0, p.z - Math.cos(h) * 4 - Math.sin(h) * 1.6)
    const cur = g.current.position
    const d = cur.distanceTo(goal)
    if (d > 30) cur.copy(goal)
    else cur.lerp(goal, 1 - Math.pow(0.04, dt))
    if (d > 0.05) g.current.rotation.y = Math.atan2(goal.x - cur.x, goal.z - cur.z) || g.current.rotation.y
  })
  return <VoidBot groupRef={g} position={[0, 0, 70]} />
}
