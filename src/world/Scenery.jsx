import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Label } from './Landmarks.jsx'
import { Glitter } from './Atmosphere.jsx'
import { Water } from './Terrain.jsx'
import { LAKE, PLACES } from './layout.js'

// 스토리 밖 바깥쪽 명소들. 둘러보기와 분위기용이라 상호작용은 대화 한두 줄만 있다(World.jsx의 LINES).
const at = (id) => PLACES[id].pos

const Std = (props) => <meshStandardMaterial roughness={0.8} {...props} />

// 같은 모양 여러 개를 그리기 호출 한 번으로 그린다. items: [{ pos, rot?, scale?, color? }]
function Many({ items, children, castShadow, receiveShadow, ...mat }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    const c = new THREE.Color()
    items.forEach((it, i) => {
      o.position.set(...it.pos)
      o.rotation.set(...(it.rot || [0, 0, 0]))
      o.scale.set(...(it.scale || [1, 1, 1]))
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
      if (it.color) ref.current.setColorAt(i, c.set(it.color))
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [items])
  return (
    <instancedMesh ref={ref} args={[null, null, items.length]} castShadow={castShadow} receiveShadow={receiveShadow}>
      {children}
      <meshStandardMaterial roughness={0.8} {...mat} />
    </instancedMesh>
  )
}

/* ---------------- 호수 공원: 선착장, 오리배, 벤치 ---------------- */
function SwanBoat({ radius, speed, phase, color }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const a = clock.elapsedTime * speed + phase
    ref.current.position.set(Math.cos(a) * radius, 0.2 + Math.sin(clock.elapsedTime * 2 + phase) * 0.06, Math.sin(a) * radius)
    ref.current.rotation.y = -a - (speed > 0 ? 0 : Math.PI)
  })
  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.5, 2.6]} />
        <Std color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 1, 1.1]} rotation={[0.4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 1.6, 8]} />
        <Std color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 1.75, 1.45]}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <Std color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 1.7, 1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.35, 6]} />
        <Std color="#FF9E3D" />
      </mesh>
      <mesh position={[0, 0.5, -0.4]}>
        <boxGeometry args={[1.3, 0.12, 1.2]} />
        <Std color={color} />
      </mesh>
    </group>
  )
}

export function LakePark() {
  const [x, z, r] = LAKE
  // 선착장은 회전목마 쪽 물가에서 호수 안으로 뻗는다
  const ang = Math.atan2(PLACES.carousel.pos[2] - z, PLACES.carousel.pos[0] - x)
  return (
    <group position={[x, 0, z]}>
      <group rotation={[0, -ang, 0]}>
        <group position={[r - 0.5, 0, 0]}>
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[6, 0.25, 3]} />
            <Std color="#C99C6B" />
          </mesh>
          {[-2.6, 0, 2.6].map((px) => [-1.4, 1.4].map((pz) => (
            <mesh key={`${px}${pz}`} position={[px, 0.1, pz]}>
              <cylinderGeometry args={[0.14, 0.14, 0.8, 6]} />
              <Std color="#8B6A4A" />
            </mesh>
          )))}
        </group>
      </group>
      <SwanBoat radius={9} speed={0.12} phase={0} color="#FF8FB1" />
      <SwanBoat radius={6} speed={-0.16} phase={2} color="#7FC8FF" />
      <SwanBoat radius={11.5} speed={0.09} phase={4} color="#FFD45E" />
      {/* 연잎 */}
      {[[-8, -6], [-10, 3], [4, -11], [-3, 10], [10, 6]].map(([lx, lz], i) => (
        <group key={i} position={[lx, 0.07, lz]}>
          <mesh rotation={[-Math.PI / 2, 0, i]}>
            <circleGeometry args={[0.9, 16, 0.3, Math.PI * 1.8]} />
            <Std color="#5DAA55" side={THREE.DoubleSide} />
          </mesh>
          {i % 2 === 0 && (
            <mesh position={[0.2, 0.15, 0.1]}>
              <icosahedronGeometry args={[0.25, 0]} />
              <Std color="#FFB3CF" emissive="#FF8FB1" emissiveIntensity={0.3} flatShading />
            </mesh>
          )}
        </group>
      ))}
      {/* 벤치 */}
      {[0.6, 2.2, 3.6, 5.1].map((a, i) => (
        <group key={i} position={[Math.cos(a) * (r + 4.5), 0, Math.sin(a) * (r + 4.5)]} rotation={[0, -a - Math.PI / 2, 0]}>
          <Bench />
        </group>
      ))}
      <Label y={6}>호수 공원</Label>
    </group>
  )
}

export function Bench() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.4, 0.12, 0.7]} />
        <Std color="#C98B5A" />
      </mesh>
      <mesh position={[0, 1.05, -0.32]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[2.4, 0.6, 0.1]} />
        <Std color="#C98B5A" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.05, 0.27, 0]}>
          <boxGeometry args={[0.12, 0.55, 0.6]} />
          <Std color="#3E4A5C" metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------- 꽃 정원: 분수, 꽃밭, 아치, 나비 ---------------- */
function Butterfly({ center, phase, color }) {
  const ref = useRef()
  const l = useRef()
  const r = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.6 + phase
    ref.current.position.set(center[0] + Math.sin(t * 1.3) * 5, 1.4 + Math.sin(t * 3.1) * 0.6, center[1] + Math.cos(t) * 5)
    ref.current.rotation.y = t * 1.3
    const f = Math.sin(clock.elapsedTime * 18 + phase) * 1.1
    l.current.rotation.z = f
    r.current.rotation.z = -f
  })
  return (
    <group ref={ref}>
      <group ref={l}>
        <mesh position={[0.22, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 10]} />
          <Std color={color} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </group>
      <group ref={r}>
        <mesh position={[-0.22, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.22, 10]} />
          <Std color={color} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  )
}

function Fountain() {
  const jets = useRef([])
  useFrame(({ clock }) => {
    jets.current.forEach((j, i) => {
      if (!j) return
      const s = 1 + Math.sin(clock.elapsedTime * 4 + i * 1.7) * 0.12
      j.scale.set(1, s, 1)
    })
  })
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3.2, 0.7, 32]} />
        <Std color="#E9E3D6" />
      </mesh>
      <Water round position={[0, 0.72, 0]} scale={[2.7, 2.7, 1]} />
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 1.6, 12]} />
        <Std color="#E9E3D6" />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <cylinderGeometry args={[1.3, 0.6, 0.35, 24]} />
        <Std color="#E9E3D6" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} ref={(el) => (jets.current[i] = el)} position={i === 0 ? [0, 2.3, 0] : [Math.cos(i * 1.57) * 0.9, 2.3, Math.sin(i * 1.57) * 0.9]}>
          <cylinderGeometry args={[0.05, 0.12, i === 0 ? 2.6 : 1.2, 8]} />
          <meshStandardMaterial color="#CFF2FF" emissive="#9FE3FF" emissiveIntensity={0.6} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  )
}

export function FlowerGarden() {
  const beds = useMemo(() => {
    const colors = ['#FF8FB1', '#FFD45E', '#B79CFF', '#FF9E5E', '#FFFFFF', '#FF6B6B']
    return Array.from({ length: 6 }).map((_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.5
      const blooms = Array.from({ length: 22 }).map((__, k) => {
        const rr = 1 + ((k * 37) % 23) / 10
        const aa = k * 2.4
        return [Math.cos(aa) * rr * 0.9, Math.sin(aa) * rr * 0.55]
      })
      return { a, color: colors[i], blooms }
    })
  }, [])
  // 꽃밭마다 회전된 좌표를 정원 기준 좌표로 미리 바꿔 둔다
  const flowers = useMemo(() => {
    const stems = []
    const heads = []
    for (const b of beds) {
      const cx = Math.cos(b.a) * 8
      const cz = Math.sin(b.a) * 8
      const ca = Math.cos(-b.a)
      const sa = Math.sin(-b.a)
      for (const [x, z] of b.blooms) {
        const lx = z * 1.8
        const lz = x
        const wx = cx + lx * ca + lz * sa
        const wz = cz - lx * sa + lz * ca
        stems.push({ pos: [wx, 0.65, wz] })
        heads.push({ pos: [wx, 0.95, wz], color: b.color })
      }
    }
    return { stems, heads }
  }, [beds])
  return (
    <group position={at('garden')}>
      <Fountain />
      {beds.map((b, i) => (
        <group key={i} position={[Math.cos(b.a) * 8, 0, Math.sin(b.a) * 8]} rotation={[0, -b.a, 0]}>
          <mesh position={[0, 0.2, 0]} receiveShadow>
            <cylinderGeometry args={[3, 3.2, 0.4, 24]} />
            <Std color="#7A5B3E" />
          </mesh>
        </group>
      ))}
      <Many items={flowers.stems} color="#4E9A43">
        <cylinderGeometry args={[0.03, 0.03, 0.5, 4]} />
      </Many>
      <Many items={flowers.heads} flatShading>
        <icosahedronGeometry args={[0.24, 0]} />
      </Many>
      {/* 장미 아치: 정원 입구(창고 쪽) */}
      <group position={[7, 0, 5.5]} rotation={[0, 0.65, 0]}>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[2.6, 0.18, 8, 24, Math.PI]} />
          <Std color="#F4F0E6" />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 8) * Math.PI
          return (
            <mesh key={i} position={[Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0]}>
              <icosahedronGeometry args={[0.32, 0]} />
              <Std color={i % 2 ? '#FF6B8A' : '#FFB3CF'} flatShading />
            </mesh>
          )
        })}
        {[-2.6, 2.6].map((x) => (
          <mesh key={x} position={[x, -1.3, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 2.6, 6]} />
            <Std color="#F4F0E6" />
          </mesh>
        ))}
      </group>
      <group position={[0, 0, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Butterfly key={i} center={[Math.cos(i) * 4, Math.sin(i) * 4]} phase={i * 1.9} color={['#FFD45E', '#FF8FB1', '#7FC8FF', '#FFFFFF', '#B79CFF', '#FF9E5E'][i]} />
        ))}
      </group>
      <Label y={6}>꽃 정원</Label>
    </group>
  )
}

/* ---------------- 풍차 언덕: 돌아가는 풍차와 밀밭 ---------------- */
export function WindmillHill() {
  const blades = useRef()
  useFrame((_, dt) => (blades.current.rotation.z += dt * 0.8))
  const wheat = useMemo(() => {
    const out = []
    for (let i = -5; i <= 5; i++) for (let k = 0; k < 4; k++) out.push([i * 1.6, 7 + k * 1.6])
    return out
  }, [])
  return (
    <group position={at('windmill')}>
      {/* 언덕 */}
      <mesh position={[0, -4.2, -4]} scale={[1, 0.38, 1]} receiveShadow>
        <sphereGeometry args={[13, 28, 14]} />
        <Std color="#9DCC7A" flatShading />
      </mesh>
      <group position={[0, 0.4, -4]}>
        <mesh position={[0, 4, 0]} castShadow>
          <cylinderGeometry args={[1.8, 2.6, 8, 8]} />
          <Std color="#F6EEDC" />
        </mesh>
        <mesh position={[0, 9, 0]} castShadow>
          <coneGeometry args={[2.4, 2.6, 8]} />
          <Std color="#C9584C" />
        </mesh>
        <mesh position={[0, 1.2, 2.45]}>
          <boxGeometry args={[1.2, 2.2, 0.2]} />
          <Std color="#8B5E3C" />
        </mesh>
        {[3.8, 6].map((y) => (
          <mesh key={y} position={[0, y, 2.2]}>
            <boxGeometry args={[0.7, 0.7, 0.2]} />
            <Std color="#7FC8FF" emissive="#7FC8FF" emissiveIntensity={0.25} />
          </mesh>
        ))}
        <group ref={blades} position={[0, 7.4, 2.6]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.6, 12]} />
            <Std color="#5B4632" />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
              <mesh position={[0, 3.2, 0]} castShadow>
                <boxGeometry args={[0.18, 6, 0.12]} />
                <Std color="#8B6A4A" />
              </mesh>
              <mesh position={[0.55, 3.6, 0.02]} castShadow>
                <boxGeometry args={[1.1, 4.8, 0.05]} />
                <Std color="#FFF8E8" />
              </mesh>
            </group>
          ))}
        </group>
      </group>
      {/* 밀밭 */}
      {wheat.map(([x, z], i) => (
        <mesh key={i} position={[x - 14, 0.6, z - 10]} castShadow>
          <coneGeometry args={[0.5, 1.4, 5]} />
          <Std color={i % 3 ? '#F2C860' : '#E8B84A'} flatShading />
        </mesh>
      ))}
      {/* 건초 더미 */}
      {[[8, 6], [10, 3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.8, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 1.4, 16]} />
          <Std color="#E5C46A" />
        </mesh>
      ))}
      <Label y={12}>풍차 언덕</Label>
    </group>
  )
}

/* ---------------- 기차역: 역사, 승강장, 둘레를 도는 꼬마 기차 ---------------- */
const TRACK = { rx: 30, rz: 15, cz: 3 }
const trackPoint = (a, out) => out.set(Math.cos(a) * TRACK.rx, 0, Math.sin(a) * TRACK.rz + TRACK.cz)

function Wagon({ color, loco }) {
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[1.8, 1.2, loco ? 3 : 2.8]} />
        <Std color={color} />
      </mesh>
      {loco ? (
        <>
          <mesh position={[0, 1.9, -0.6]} castShadow>
            <boxGeometry args={[1.7, 1, 1.4]} />
            <Std color="#2F3B52" />
          </mesh>
          <mesh position={[0, 1.6, 1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 1.4, 14]} />
            <Std color="#2F3B52" />
          </mesh>
          <mesh position={[0, 2.5, 1.2]} castShadow>
            <cylinderGeometry args={[0.22, 0.3, 0.8, 10]} />
            <Std color="#1E2533" />
          </mesh>
          <mesh position={[0, 1.6, 1.75]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color="#FFF2B0" emissive="#FFD45E" emissiveIntensity={3} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[1.9, 0.15, 3]} />
          <Std color="#FFFFFF" />
        </mesh>
      )}
      {[-0.9, 0.9].map((z) => [-0.95, 0.95].map((x) => (
        <mesh key={`${x}${z}`} position={[x, 0.35, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.16, 12]} />
          <Std color="#222" />
        </mesh>
      )))}
    </group>
  )
}

function Train() {
  const cars = useRef([])
  const smoke = useRef([])
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.16
    cars.current.forEach((c, i) => {
      if (!c) return
      const ang = t - i * 0.13
      trackPoint(ang, a)
      trackPoint(ang + 0.01, b)
      c.position.copy(a)
      c.rotation.y = Math.atan2(b.x - a.x, b.z - a.z)
    })
    smoke.current.forEach((s, i) => {
      if (!s || !cars.current[0]) return
      const k = (clock.elapsedTime * 0.8 + i / smoke.current.length) % 1
      s.position.copy(cars.current[0].position)
      s.position.y = 3 + k * 4
      s.scale.setScalar(0.3 + k * 1.1)
      s.material.opacity = 0.7 * (1 - k)
    })
  })
  const colors = ['#E2574C', '#FFD45E', '#7FC8FF', '#8BD17C']
  return (
    <group>
      {colors.map((c, i) => (
        <group key={i} ref={(el) => (cars.current[i] = el)}>
          <Wagon color={c} loco={i === 0} />
        </group>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} ref={(el) => (smoke.current[i] = el)}>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function Rails() {
  const sleepers = useMemo(() => {
    const out = []
    const p = new THREE.Vector3()
    const q = new THREE.Vector3()
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2
      trackPoint(a, p)
      trackPoint(a + 0.01, q)
      out.push({ pos: [p.x, 0.06, p.z], rot: [0, Math.atan2(q.x - p.x, q.z - p.z), 0] })
    }
    return out
  }, [])
  return (
    <group>
      {[-0.75, 0.75].map((o) => (
        <mesh key={o} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.13, TRACK.cz]} scale={[1, TRACK.rz / TRACK.rx, 1]}>
          <ringGeometry args={[TRACK.rx + o - 0.14, TRACK.rx + o + 0.14, 128]} />
          <Std color="#5E6675" roughness={0.4} />
        </mesh>
      ))}
      <Many items={sleepers} color="#7A5B3E" receiveShadow>
        <boxGeometry args={[2.2, 0.1, 0.4]} />
      </Many>
    </group>
  )
}

export function TrainStation() {
  return (
    <group position={at('station')}>
      <Rails />
      <Train />
      {/* 역사 */}
      <group position={[0, 0, 7]}>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 4.4, 5]} />
          <Std color="#F3E6CF" />
        </mesh>
        <mesh position={[0, 5.3, 0]} castShadow>
          <boxGeometry args={[13, 0.5, 6]} />
          <Std color="#2F7BFF" />
        </mesh>
        <mesh position={[0, 6.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[4.8, 2.6, 4]} />
          <Std color="#3D6FD6" />
        </mesh>
        {/* 시계탑 */}
        <mesh position={[0, 8.4, -1.2]} castShadow>
          <boxGeometry args={[2, 3, 2]} />
          <Std color="#F3E6CF" />
        </mesh>
        <mesh position={[0, 8.6, -2.22]}>
          <circleGeometry args={[0.75, 24]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFF2D0" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 10.5, -1.2]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.6, 1.4, 4]} />
          <Std color="#E2574C" />
        </mesh>
        {[-4, -1.5, 1.5, 4].map((x) => (
          <mesh key={x} position={[x, 2.4, -2.52]}>
            <boxGeometry args={[1.4, 1.8, 0.05]} />
            <Std color="#9FD7FF" emissive="#7FC8FF" emissiveIntensity={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 1.2, -2.52]}>
          <boxGeometry args={[1.8, 2.4, 0.05]} />
          <Std color="#8B5E3C" />
        </mesh>
      </group>
      {/* 승강장 */}
      <mesh position={[0, 0.25, 13.5]} receiveShadow castShadow>
        <boxGeometry args={[20, 0.5, 3]} />
        <Std color="#D9D3C7" />
      </mesh>
      {[-6, 0, 6].map((x) => (
        <group key={x} position={[x, 0.5, 13.8]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 3.2, 6]} />
            <Std color="#3E4A5C" />
          </mesh>
          <mesh position={[0, 3.25, 0]}>
            <boxGeometry args={[3.4, 0.15, 2.4]} />
            <Std color="#2F7BFF" />
          </mesh>
        </group>
      ))}
      <Label y={13}>기차역</Label>
    </group>
  )
}

/* ---------------- 별빛 전망대: 돔과 망원경, 밤하늘 반짝임 ---------------- */
export function Observatory() {
  const scope = useRef()
  const ring = useRef()
  useFrame(({ clock }) => {
    scope.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.8
    ring.current.rotation.z = clock.elapsedTime * 0.5
  })
  return (
    <group position={[at('observatory')[0], 0, at('observatory')[2] - 5]}>
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <cylinderGeometry args={[7, 7.6, 0.8, 32]} />
        <Std color="#D9D3C7" />
      </mesh>
      <mesh position={[0, 3.6, 0]} castShadow>
        <cylinderGeometry args={[3.4, 3.6, 5.6, 24]} />
        <Std color="#F4F0E6" />
      </mesh>
      <mesh position={[0, 6.4, 0]} castShadow>
        <sphereGeometry args={[3.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Std color="#6E83B5" roughness={0.45} />
      </mesh>
      {/* 돔 틈 사이로 나온 망원경 */}
      <group ref={scope} position={[0, 7.2, 0]}>
        <mesh position={[0, 1.2, 1.6]} rotation={[-0.8, 0, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.55, 4, 14]} />
          <Std color="#E9E3D6" metalness={0.3} />
        </mesh>
      </group>
      <group ref={ring} position={[0, 12.5, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.4, 0.08, 8, 48]} />
          <meshStandardMaterial color="#B79CFF" emissive="#8A4DFF" emissiveIntensity={2.2} />
        </mesh>
        <mesh position={[2.4, 0, 0]}>
          <sphereGeometry args={[0.32, 12, 10]} />
          <meshStandardMaterial color="#FFF2B0" emissive="#FFD45E" emissiveIntensity={3} />
        </mesh>
      </group>
      <mesh position={[0, 1.4, 3.55]}>
        <boxGeometry args={[1.4, 2.2, 0.1]} />
        <Std color="#5B6B8C" />
      </mesh>
      <Glitter position={[0, 14, 0]} scale={[14, 6, 14]} color="#CBB8FF" count={40} size={5} />
      <Label y={16}>별빛 전망대</Label>
    </group>
  )
}

/* ---------------- 캠핑장: 텐트, 모닥불, 반딧불 ---------------- */
function Campfire() {
  const flame = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const f = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06
    flame.current.scale.set(f, 1 + Math.sin(t * 9) * 0.15, f)
  })
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[Math.cos(i * 0.785) * 1.1, 0.18, Math.sin(i * 0.785) * 1.1]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <Std color="#9A958C" flatShading />
        </mesh>
      ))}
      {[0, 1.05, 2.1].map((r) => (
        <mesh key={r} position={[0, 0.2, 0]} rotation={[0, r, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 1.6, 6]} />
          <Std color="#6B4A2E" />
        </mesh>
      ))}
      <group ref={flame} position={[0, 0.3, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.5, 1.2, 8]} />
          <meshStandardMaterial color="#FFB35C" emissive="#FF7A1A" emissiveIntensity={3} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.28, 0.8, 8]} />
          <meshStandardMaterial color="#FFF2B0" emissive="#FFD45E" emissiveIntensity={4} />
        </mesh>
      </group>
    </group>
  )
}

function Tent({ color }) {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.4, 2.4, 4]} />
        <Std color={color} flatShading />
      </mesh>
      <mesh position={[0, 0.7, 1.7]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.6, 1.3, 4]} />
        <Std color="#3A3F4B" />
      </mesh>
    </group>
  )
}

export function Campground() {
  const c = at('camp')
  return (
    <group position={c}>
      <Campfire />
      {[[-7, -6, '#FF8F5E', 0.8], [8, -7, '#5B8CFF', -0.7], [-8, 7, '#8BD17C', 2.3]].map(([x, z, col, r], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, r, 0]}>
          <Tent color={col} />
        </group>
      ))}
      {/* 통나무 의자 */}
      {[0.4, 2.1, 3.9, 5.4].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 3.2, 0.35, Math.sin(a) * 3.2]} rotation={[0, -a, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.8, 10]} />
          <Std color="#8B6A4A" />
        </mesh>
      ))}
      {/* 줄 전구 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-7 + (15 * i) / 11, 3.2 - Math.sin((i / 11) * Math.PI) * 0.8, -6.5]}>
          <sphereGeometry args={[0.14, 8, 6]} />
          <meshStandardMaterial color="#FFF2B0" emissive={['#FFD45E', '#FF8FB1', '#7FC8FF'][i % 3]} emissiveIntensity={3} />
        </mesh>
      ))}
      <Glitter position={[0, 2.5, 0]} scale={[22, 4, 22]} color="#E8FF8A" count={50} size={4} />
      <Label y={6}>캠핑장</Label>
    </group>
  )
}

export function Outskirts() {
  return (
    <>
      <LakePark />
      <FlowerGarden />
      <WindmillHill />
      <TrainStation />
      <Observatory />
      <Campground />
    </>
  )
}
