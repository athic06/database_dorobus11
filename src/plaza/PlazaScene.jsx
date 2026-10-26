import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Harmonia } from '../world/Landmarks.jsx'
import { Person as WorldPerson } from '../world/Characters.jsx'
import { ATTRACTIONS, levelOf } from '../game/park.js'

// 챕터 3 하모니아 광장 (걸어서 둘러보는 장면). 광장 중심이 원점, 정문이 남쪽(+z).
export const PLAZA_RADIUS = 13.2
export const SPOTS = {
  stand: [0, 0, 6.6],
  panel: [11, 0, 3],
  visitor: [-4.5, 0, 9],
  elder: [10, 0, -4],
  gate: [0, 0, 13],
  helper: [9.5, 0, -8.5], // 수업 과제: 도움이 필요한 NPC
}
export const FACILITY_POS = {
  bench: [-8.5, 0, 4],
  fountain: [8, 0, 8],
  flower: [-9, 0, -2],
  photo: [5, 0, -10],
  balloon: [-3, 0, -11],
}

const LAMP_POS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 + Math.PI / 8
  return [Math.sin(a) * 12.4, 0, Math.cos(a) * 12.4]
})

function Tag({ y = 2.4, children }) {
  return (
    <Html position={[0, y, 0]} center zIndexRange={[1, 0]}>
      <div className="portal-label">{children}</div>
    </Html>
  )
}

// 광장 사람들: 월드와 같은 툰 모델을 쓰고, 돌아다니는 사람은 다리를 앞뒤로 움직이며 걷는다
function Person({ position, rotation = 0, color = '#E57E9A', hair = '#3B2A20', scale = 1, label, walk = false, phase = 0, pace }) {
  return (
    <group position={position}>
      <WorldPerson rotation={rotation} color={color} hair={hair} scale={scale} walk={walk} phase={phase} pace={pace} />
      {label && <Tag y={2.3 * scale}>{label}</Tag>}
    </group>
  )
}

function Wanderers({ count }) {
  const group = useRef()
  const people = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      r: 6.5 + (i % 3) * 2,
      speed: 0.12 + (i % 4) * 0.04,
      phase: i * 1.7,
      color: ['#E57E9A', '#4E8BFF', '#F5B841', '#4CAF6E', '#9B6BD6', '#F08A3E'][i % 6],
      hair: ['#3B2A20', '#B9BCC4', '#7A4A20', '#1E1E24'][i % 4],
      scale: i % 3 === 0 ? 0.75 : 1,
    })),
    [count],
  )
  useFrame((s) => {
    const t = s.clock.elapsedTime
    group.current?.children.forEach((ch, i) => {
      const p = people[i]
      if (!p) return
      const a = p.phase + t * p.speed * (i % 2 ? 1 : -1)
      ch.position.set(Math.cos(a) * p.r, 0, Math.sin(a) * p.r)
      ch.rotation.y = -a + (i % 2 ? 0 : Math.PI)
    })
  })
  return (
    <group ref={group}>
      {/* 걸음 박자는 실제로 걷는 빠르기(각속도 × 반지름)에 맞춘다 */}
      {people.map((p, i) => <Person key={i} position={[0, 0, 0]} color={p.color} hair={p.hair} scale={p.scale} walk phase={p.phase} pace={(p.speed * p.r * 4.2) / p.scale} />)}
    </group>
  )
}

// 바닥에 번지는 둥근 불빛 (가운데가 밝고 가장자리로 갈수록 투명)
let glowTexture
function glowMap() {
  if (glowTexture) return glowTexture
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,214,140,0.9)')
  grad.addColorStop(0.45, 'rgba(255,190,110,0.35)')
  grad.addColorStop(1, 'rgba(255,170,90,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  glowTexture = new THREE.CanvasTexture(c)
  glowTexture.colorSpace = THREE.SRGBColorSpace
  return glowTexture
}

// 광장 가로등: 가는 철제 기둥 위 육각 랜턴. 불이 켜지면 유리 안 전구만 빛나고 바닥에 불빛이 번진다.
const IRON = '#2E3138'
function Lamp({ position, lit }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.26, 0.3, 12]} />
        <meshStandardMaterial color={IRON} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.075, 3.2, 10]} />
        <meshStandardMaterial color={IRON} metalness={0.6} roughness={0.4} />
      </mesh>
      {[0.9, 3.25].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.08, 0.02, 6, 16]} />
          <meshStandardMaterial color="#B08D57" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <group position={[0, 3.6, 0]}>
        {/* 랜턴 유리 */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.15, 0.48, 6]} />
          <meshStandardMaterial color={lit ? '#FFE6B0' : '#9AA3B2'} emissive={lit ? '#FFB45A' : '#000'} emissiveIntensity={lit ? 0.9 : 0} transparent opacity={0.85} roughness={0.2} />
        </mesh>
        {/* 랜턴 틀 */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.025, 0.5, 0.025]} />
              <meshStandardMaterial color={IRON} metalness={0.6} roughness={0.4} />
            </mesh>
          )
        })}
        <mesh>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color="#FFF4D8" emissive={lit ? '#FFD08A' : '#000'} emissiveIntensity={lit ? 5 : 0} />
        </mesh>
        <mesh position={[0, 0.34, 0]} castShadow>
          <coneGeometry args={[0.3, 0.22, 6]} />
          <meshStandardMaterial color={IRON} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color="#B08D57" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      {lit && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <planeGeometry args={[5.5, 5.5]} />
            <meshBasicMaterial map={glowMap()} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 3.4, 0]} color="#FFC478" intensity={6} distance={9} decay={1.6} />
        </>
      )}
    </group>
  )
}

// 가로등 사이를 잇는 줄 전구: 살짝 처지게 늘어뜨리고 하나씩 반짝인다
function StringLights({ points, lit }) {
  const bulbs = useRef()
  const { wires, spots } = useMemo(() => {
    const wires = []
    const spots = []
    points.forEach((a, i) => {
      const b = points[(i + 1) % points.length]
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(a[0], 3.3, a[2]),
        new THREE.Vector3((a[0] + b[0]) / 2, 2.35, (a[2] + b[2]) / 2),
        new THREE.Vector3(b[0], 3.3, b[2]),
      )
      wires.push(new THREE.TubeGeometry(curve, 20, 0.012, 4, false))
      for (let k = 1; k < 10; k++) spots.push(curve.getPoint(k / 10))
    })
    return { wires, spots }
  }, [points])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    spots.forEach((p, i) => {
      bulbs.current.setMatrixAt(i, m.makeTranslation(p.x, p.y - 0.06, p.z))
      bulbs.current.setColorAt(i, c.set(['#FFE3A8', '#FFC9A8', '#FFF1D0'][i % 3]))
    })
    bulbs.current.instanceMatrix.needsUpdate = true
    bulbs.current.instanceColor.needsUpdate = true
  }, [spots])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#FFC27A' }), [])
  useFrame(({ clock }) => {
    mat.emissiveIntensity = lit ? 2.4 + Math.sin(clock.elapsedTime * 1.6) * 0.5 : 0
  })
  return (
    <group>
      {wires.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#2E3138" />
        </mesh>
      ))}
      <instancedMesh ref={bulbs} args={[null, mat, spots.length]}>
        <sphereGeometry args={[0.06, 8, 6]} />
      </instancedMesh>
    </group>
  )
}

function Facility({ id }) {
  const pos = FACILITY_POS[id]
  if (id === 'bench')
    return (
      <group position={pos} rotation={[0, Math.PI / 2.6, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[2.2, 0.12, 0.6]} /><meshStandardMaterial color="#C99A6B" /></mesh>
        <mesh position={[0, 0.9, -0.28]}><boxGeometry args={[2.2, 0.5, 0.08]} /><meshStandardMaterial color="#C99A6B" /></mesh>
        {[-0.9, 0.9].map((x) => <mesh key={x} position={[x, 0.25, 0]}><boxGeometry args={[0.1, 0.5, 0.5]} /><meshStandardMaterial color="#3A3D45" /></mesh>)}
      </group>
    )
  if (id === 'fountain')
    return (
      <group position={pos}>
        <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[1.3, 1.4, 0.6, 24]} /><meshStandardMaterial color="#D8DCE4" /></mesh>
        <mesh position={[0, 0.62, 0]}><cylinderGeometry args={[1.1, 1.1, 0.05, 24]} /><meshStandardMaterial color="#7FC8E8" emissive="#3FA9D6" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.15, 0.2, 1, 10]} /><meshStandardMaterial color="#D8DCE4" /></mesh>
        <mesh position={[0, 1.7, 0]}><sphereGeometry args={[0.35, 12, 12]} /><meshStandardMaterial color="#BFE8FA" transparent opacity={0.7} /></mesh>
      </group>
    )
  if (id === 'flower')
    return (
      <group position={pos}>
        <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[1.4, 1.4, 0.4, 20]} /><meshStandardMaterial color="#8B6A4A" /></mesh>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = i * 2.4
          const r = 0.3 + (i % 3) * 0.35
          return (
            <mesh key={i} position={[Math.cos(a) * r, 0.55, Math.sin(a) * r]}>
              <sphereGeometry args={[0.16, 8, 8]} />
              <meshStandardMaterial color={['#E57E9A', '#F5C451', '#FFFFFF', '#9B6BD6'][i % 4]} />
            </mesh>
          )
        })}
      </group>
    )
  if (id === 'photo')
    return (
      <group position={pos} rotation={[0, 0.5, 0]}>
        {[-1.3, 1.3].map((x) => <mesh key={x} position={[x, 1.4, 0]}><boxGeometry args={[0.2, 2.8, 0.2]} /><meshStandardMaterial color="#F5C451" /></mesh>)}
        <mesh position={[0, 2.85, 0]}><boxGeometry args={[2.8, 0.3, 0.2]} /><meshStandardMaterial color="#E57E9A" /></mesh>
        <Tag y={3.6}>📸 DOROLAND</Tag>
      </group>
    )
  if (id === 'balloon')
    return (
      <group position={pos}>
        <mesh position={[0, 0.6, 0]}><boxGeometry args={[1.4, 1.2, 0.8]} /><meshStandardMaterial color="#FBEFD9" /></mesh>
        {['#E2574C', '#4E8BFF', '#F5B841'].map((c, i) => (
          <group key={c}>
            <mesh position={[-0.4 + i * 0.4, 2.6 + (i % 2) * 0.3, 0]}><sphereGeometry args={[0.32, 12, 12]} /><meshStandardMaterial color={c} /></mesh>
            <mesh position={[-0.4 + i * 0.4, 1.7, 0]}><cylinderGeometry args={[0.01, 0.01, 1.6, 4]} /><meshStandardMaterial color="#555" /></mesh>
          </group>
        ))}
      </group>
    )
  return null
}

// B · 수업 결과물 전시 부스
const BOOTH_POS = [[-11.5, 0, -4], [-7, 0, -11.2], [11.6, 0, 7.6]]
function Booth({ art, index }) {
  const colors = ['#9ED8C6', '#F7C1CF', '#B5D4F4']
  return (
    <group position={BOOTH_POS[index]} rotation={[0, Math.atan2(-BOOTH_POS[index][0], -BOOTH_POS[index][2]), 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.8, 1, 0.9]} />
        <meshStandardMaterial color="#FBEFD9" />
      </mesh>
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 1.5, -0.35]}>
          <cylinderGeometry args={[0.04, 0.04, 2, 6]} />
          <meshStandardMaterial color="#8B6A4A" />
        </mesh>
      ))}
      <mesh position={[0, 2.55, -0.2]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[2, 0.12, 1.2]} />
        <meshStandardMaterial color={colors[index % colors.length]} />
      </mesh>
      <Tag y={3.3}>{art.icon} {art.title}</Tag>
    </group>
  )
}

export default function PlazaScene({ progress, helper }) {
  const restored = progress.harmoniaRestored
  const lit = restored && progress.lightsFixed
  // 어트랙션을 강화할수록 광장 방문객도 늘어난다 (game/park.js)
  const rideBonus = ATTRACTIONS.reduce((s, a) => s + (levelOf(progress, a.id) - 1) * 2, 0)
  const visitors = restored ? Math.min(30, 2 + progress.facilities.length * 2 + progress.artworks.length * 2 + rideBonus) : 0
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#8DBF73" />
      </mesh>
      <Harmonia stopped={!restored} gateOpen showGate={false} origin={[0, 0, 0]} labelDistance={12} />
      {LAMP_POS.map((pos, i) => <Lamp key={i} position={pos} lit={lit} />)}
      <StringLights points={LAMP_POS} lit={lit} />
      {/* 악보대 */}
      <group position={SPOTS.stand}>
        <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.05, 0.05, 1.2, 6]} /><meshStandardMaterial color="#3A3D45" /></mesh>
        <mesh position={[0, 1.25, 0]} rotation={[-0.6, 0, 0]}><boxGeometry args={[0.8, 0.55, 0.04]} /><meshStandardMaterial color={restored ? '#FFF8E7' : '#E9E4DA'} /></mesh>
        <Tag y={2}>{restored ? '악보대 · 복원 완료' : '악보대'}</Tag>
      </group>
      {/* 조명 제어반 */}
      <group position={SPOTS.panel} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.8, 0]}><boxGeometry args={[1, 1.6, 0.5]} /><meshStandardMaterial color="#5B6170" /></mesh>
        <mesh position={[0, 1.1, 0.26]}><planeGeometry args={[0.7, 0.45]} /><meshStandardMaterial color={lit ? '#7CF2A8' : '#1E2430'} emissive={lit ? '#2FB45A' : '#000'} emissiveIntensity={lit ? 1 : 0} /></mesh>
        <Tag y={2.3}>조명 제어반</Tag>
      </group>
      {progress.facilities.map((id) => <Facility key={id} id={id} />)}
      {progress.artworks.slice(0, BOOTH_POS.length).map((a, i) => <Booth key={a.id} art={a} index={i} />)}
      <Wanderers count={visitors} />
      {restored && lit && progress.facilities.length < 3 && (
        <Person position={SPOTS.visitor} color="#F08A3E" hair="#B9BCC4" label="방문객 · 요청 있음" />
      )}
      {helper && <Person position={SPOTS.helper} rotation={-0.8} color={helper === 'classDone' ? '#F5B841' : '#4E8BFF'} hair="#3B2A20" scale={helper === 'classDone' ? 1.1 : 1.4} label="❗ 도움이 필요해요" />}
      {restored && <Person position={SPOTS.elder} color="#7A8CA8" hair="#E8E8EC" label="오래된 방문객" />}
    </group>
  )
}
