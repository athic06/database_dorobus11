import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { PLACES, VAULT } from './layout.js'
import { Animal } from './Animals.jsx'

const at = (id) => PLACES[id].pos

export function Label({ y, children, locked, distance = 40 }) {
  const anchor=useRef(), element=useRef(), world=useMemo(()=>new THREE.Vector3(),[])
  useFrame(({camera})=>{
    if(!anchor.current||!element.current)return
    anchor.current.getWorldPosition(world)
    const d=camera.position.distanceTo(world)
    const o=Math.round((1-THREE.MathUtils.smoothstep(d,42,62))*20)/20
    if(element.current.dataset.o===String(o))return
    element.current.dataset.o=String(o)
    element.current.style.opacity=String(o)
    element.current.style.visibility=o>0?'visible':'hidden'
  })
  return <group ref={anchor} position={[0,y,0]}><Html center zIndexRange={[1,0]} distanceFactor={distance}>
    <div ref={element} className={`world-label${locked?' locked':''}`}>{children}</div>
  </Html></group>
}

/* ---------------- 하모니아: 도로랜드 중심에서 음악을 에너지로 바꾸는 거대한 악기 ---------------- */
export function Harmonia({ stopped, gateOpen = false, showGate = true, labelDistance = 40, origin = at('harmonia') }) {
  const rings = useRef()
  const gears = useRef([])
  const notes = useRef([])
  const c = stopped
    ? { base: '#A8A29A', body: '#BDB7AE', ring: '#8E8880', glow: '#555', light: 0 }
    : { base: '#D49A55', body: '#E7B97A', ring: '#C9853E', glow: '#FFD27A', light: 20 }

  useFrame((s, dt) => {
    if (stopped) return
    const t = s.clock.elapsedTime
    rings.current.rotation.y += dt * 0.6
    gears.current.forEach((g, i) => g && (g.rotation.z += dt * (i % 2 ? -1.2 : 1.2)))
    notes.current.forEach((n, i) => {
      if (!n) return
      const k = (t * 0.35 + i / 6) % 1
      const a = i * 1.05 + t * 0.3
      n.position.set(Math.cos(a) * (3 + k * 4), 8 + k * 14, Math.sin(a) * (3 + k * 4))
      n.scale.setScalar(Math.sin(k * Math.PI) * 1.2 + 0.01)
    })
  })

  return (
    <group position={origin}>
      {/* 광장 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[15, 48]} />
        <meshStandardMaterial color="#EADCC4" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[6, 7, 48]} />
        <meshStandardMaterial color="#D8C3A0" />
      </mesh>
      {/* 울타리와 닫힌 정문 (남쪽) */}
      {Array.from({ length: 40 }).map((_, i) => {
        const a = (i / 40) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 15.5, 0.6, Math.cos(a) * 15.5]}>
            <cylinderGeometry args={[0.12, 0.12, 1.2, 6]} />
            <meshStandardMaterial color="#8B6A4A" />
          </mesh>
        )
      })}
      <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[15.5, 0.08, 6, 80]} />
        <meshStandardMaterial color="#8B6A4A" />
      </mesh>
      <group position={[0, 0, 16]} visible={showGate}>
        {[-2.6, 2.6].map((x) => (
          <mesh key={x} position={[x, 2, 0]} castShadow>
            <boxGeometry args={[0.6, 4, 0.6]} />
            <meshStandardMaterial color="#C9853E" />
          </mesh>
        ))}
        <mesh position={[0, 4.2, 0]}>
          <boxGeometry args={[6, 0.6, 0.5]} />
          <meshStandardMaterial color="#C9853E" />
        </mesh>
        {!gateOpen && (
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[4.6, 1.6, 0.15]} />
            <meshStandardMaterial color="#B55B3A" />
          </mesh>
        )}
      </group>
      {/* 탑 */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[3.4, 3.8, 3, 24]} />
        <meshStandardMaterial color={c.base} />
      </mesh>
      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[1.6, 2.4, 12, 24]} />
        <meshStandardMaterial color={c.body} />
      </mesh>
      <group ref={rings} userData={{ dynamic: true }}>
        {[5, 8.5, 12].map((y, i) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2 + 0.25 * (i - 1), 0, 0]}>
            <torusGeometry args={[2.9 - i * 0.3, 0.18, 10, 48]} />
            <meshStandardMaterial color={c.ring} metalness={0.3} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* 나팔 */}
      <mesh position={[0, 16.3, 0]}>
        <cylinderGeometry args={[3.2, 1.2, 2.6, 28, 1, true]} />
        <meshStandardMaterial color={c.ring} side={THREE.DoubleSide} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 15.1, 0]}>
        <sphereGeometry args={[1.25, 20, 20]} />
        <meshStandardMaterial color={c.glow} emissive={c.glow} emissiveIntensity={stopped ? 0 : 1.2} />
      </mesh>
      {/* 톱니 */}
      {[[2.3, 6, 0.6], [-2.4, 10, 0.5]].map(([x, y, r], i) => (
        <group key={i} position={[x, y, 1.3]} ref={(el) => (gears.current[i] = el)} userData={{ dynamic: true }}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[r * 2, r * 2, 0.3, 16]} />
            <meshStandardMaterial color={c.ring} metalness={0.4} />
          </mesh>
          {Array.from({ length: 10 }).map((_, k) => (
            <mesh key={k} rotation={[0, 0, (k / 10) * Math.PI * 2]} position={[0, 0, 0]}>
              <boxGeometry args={[0.3, r * 4.8, 0.28]} />
              <meshStandardMaterial color={c.ring} metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      {/* 음표 */}
      {!stopped &&
        Array.from({ length: 6 }).map((_, i) => (
          <group key={i} ref={(el) => (notes.current[i] = el)} userData={{ dynamic: true }}>
            <mesh>
              <sphereGeometry args={[0.35, 12, 12]} />
              <meshStandardMaterial color="#7C5CE0" emissive="#7C5CE0" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0.3, 0.6, 0]}>
              <boxGeometry args={[0.08, 1.2, 0.08]} />
              <meshStandardMaterial color="#7C5CE0" />
            </mesh>
          </group>
        ))}
      <pointLight position={[0, 15, 0]} color="#FFD27A" intensity={c.light} distance={40} />
      <Label y={21} distance={labelDistance}>{stopped ? '하모니아 · 멈춤' : '하모니아 · 연주 중'}</Label>
    </group>
  )
}

export { FerrisWheel, RollerCoaster, Carousel } from './Rides.jsx'

/* ---------------- 회전목마 옆 오래된 구조물 (챕터 3 큐브) ---------------- */
export function CubeVault({ open, cubes }) {
  const door = useRef()
  const cubeGroup = useRef()
  useFrame((s, dt) => {
    if (door.current) door.current.position.y += ((open ? -2.6 : 1.4) - door.current.position.y) * Math.min(1, dt * 1.5)
    if (cubeGroup.current) {
      cubeGroup.current.children.forEach((c, i) => {
        c.rotation.x += dt * (0.6 + i * 0.2)
        c.rotation.y += dt * 0.8
        c.position.y = 1.3 + Math.sin(s.clock.elapsedTime * 2 + i * 2) * 0.12
      })
    }
  })
  return (
    <group position={VAULT.pos} rotation={[0, VAULT.rot, 0]} scale={1.6}>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 1.5, -0.6]} castShadow>
          <boxGeometry args={[0.8, 3, 0.8]} />
          <meshStandardMaterial color="#8A7B6C" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 3.2, -0.6]} castShadow>
        <boxGeometry args={[4.2, 0.6, 1]} />
        <meshStandardMaterial color="#7A6B5C" flatShading />
      </mesh>
      <mesh position={[0, 3.2, -0.08]}>
        <torusGeometry args={[0.3, 0.06, 6, 6]} />
        <meshStandardMaterial color="#B98CFF" emissive="#8A4DFF" emissiveIntensity={open ? 1.5 : 0.3} toneMapped={false} />
      </mesh>
      <mesh ref={door} position={[0, 1.4, -0.6]}>
        <boxGeometry args={[2.4, 2.8, 0.5]} />
        <meshStandardMaterial color="#6B5D50" flatShading />
      </mesh>
      {open && cubes && (
        <group ref={cubeGroup} position={[0, 0, -0.6]}>
          {[-0.7, 0, 0.7].map((x) => (
            <mesh key={x} position={[x, 1.3, 0]}>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial color="#7FE3FF" emissive="#2BB7FF" emissiveIntensity={1.6} transparent opacity={0.85} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
      <Label y={5.4} distance={30}>{open ? (cubes ? '숨겨진 공간 · 큐브' : '숨겨진 공간') : '오래된 구조물'}</Label>
    </group>
  )
}

/* ---------------- 대형 전광판 (도트 매트릭스) ---------------- */
export function Signboard({ stopped }) {
  const COLS = 64
  const ROWS = 16
  // 글자 모양(켜진 점) 마스크
  const textMask = useMemo(() => {
    const draw = (txt) => {
      const c = document.createElement('canvas')
      c.width = 400
      c.height = ROWS
      const g = c.getContext('2d')
      g.fillStyle = '#000'
      g.fillRect(0, 0, c.width, c.height)
      g.fillStyle = '#fff'
      g.font = 'bold 13px sans-serif'
      g.textBaseline = 'middle'
      g.fillText(txt, 0, ROWS / 2 + 1)
      const d = g.getImageData(0, 0, c.width, ROWS).data
      const w = Math.ceil(g.measureText(txt).width) + COLS / 2
      return { w, on: (x, y) => d[(y * c.width + (x % w)) * 4] > 110 }
    }
    return { ok: draw('WELCOME TO DOROLAND  ★  '), stop: draw('SYSTEM STOP · · ·  ') }
  }, [])
  // 문구 한 바퀴를 점으로 한 번만 그려 둔 긴 띠. 흐르는 효과는 텍스처 위치(offset)만 옮긴다.
  // (예전처럼 매번 점 1,000개를 다시 그리고 텍스처를 GPU로 올리지 않아 가볍다)
  const strips = useMemo(() => {
    const make = (m, color) => {
      const c = document.createElement('canvas')
      c.width = m.w * 8
      c.height = ROWS * 8
      const g = c.getContext('2d')
      g.fillStyle = '#111317'
      g.fillRect(0, 0, c.width, c.height)
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < m.w; x++) {
          g.fillStyle = m.on(x, y) ? color : '#262A31'
          g.beginPath()
          g.arc(x * 8 + 4, y * 8 + 4, 3, 0, Math.PI * 2)
          g.fill()
        }
      }
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      t.wrapS = THREE.RepeatWrapping
      t.repeat.set(COLS / m.w, 1)
      t.generateMipmaps = false
      t.minFilter = THREE.LinearFilter
      return { t, w: m.w }
    }
    return { ok: make(textMask.ok, '#FFC94D'), stop: make(textMask.stop, '#FF4D4D') }
  }, [textMask])
  const strip = stopped ? strips.stop : strips.ok
  const tex = strip.t
  const screen = useRef()
  const offset = useRef(0)
  const acc = useRef(0)
  useEffect(() => () => { strips.ok.t.dispose(); strips.stop.t.dispose() }, [strips])
  useFrame((s, dt) => {
    acc.current += dt
    if (acc.current < 0.08) return
    acc.current = 0
    offset.current += 1
    tex.offset.x = (offset.current % strip.w) / strip.w
    // 멈춤 상태: 빨간 글자가 깜빡인다 (색만 바꿈)
    if (screen.current) screen.current.color.setScalar(stopped && Math.floor(s.clock.elapsedTime * 2) % 2 ? 0.35 : 1)
  })
  return (
    <group position={at('sign')} rotation={[0, 0, 0]}>
      {[-2.5, 2.5].map((x) => (
        <mesh key={x} position={[x + 2.5, 3, 0.5]} castShadow>
          <boxGeometry args={[0.5, 6, 0.5]} />
          <meshStandardMaterial color="#5B6170" />
        </mesh>
      ))}
      <mesh position={[2.5, 6.5, 0.5]}>
        <boxGeometry args={[9.4, 2.8, 0.4]} />
        <meshStandardMaterial color="#2B2F3A" />
      </mesh>
      <mesh position={[2.5, 6.5, 0.71]}>
        <planeGeometry args={[9, 2.25]} />
        <meshBasicMaterial ref={screen} map={tex} toneMapped={false} />
      </mesh>
      <Label y={9.2}>대형 전광판</Label>
    </group>
  )
}

/* ---------------- 건물들 ---------------- */
export function MyRoomHouse() {
  return (
    <group position={at('myroom')}>
      <mesh position={[0, 2.2, 4]} castShadow receiveShadow>
        <boxGeometry args={[7, 4.4, 6]} />
        <meshStandardMaterial color="#F3E3C8" />
      </mesh>
      <mesh position={[0, 5.6, 4]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[5.6, 2.8, 4]} />
        <meshStandardMaterial color="#4E8BFF" />
      </mesh>
      <mesh position={[0, 1.3, 0.98]}>
        <boxGeometry args={[1.6, 2.6, 0.1]} />
        <meshStandardMaterial color="#9C6B43" />
      </mesh>
      {[-2.3, 2.3].map((x) => (
        <mesh key={x} position={[x, 2.6, 0.98]}>
          <boxGeometry args={[1.2, 1, 0.08]} />
          <meshStandardMaterial color="#CFEFF5" emissive="#9fd6ff" emissiveIntensity={0.2} />
        </mesh>
      ))}
      <Label y={8}>마이룸</Label>
    </group>
  )
}

// state: 'closed' 닫힘 · 'ready' 주인이 돌아와 재개장 준비 중 · 'open' 영업 중
export function Shop({ state = 'closed' }) {
  const stripes = ['#E2574C', '#FFFFFF']
  const label = { closed: '상점 · 문 닫음', ready: '상점 · 재개장 준비 중', open: '상점 · 영업 중' }[state]
  return (
    <group position={at('shop')}>
      <mesh position={[0, 2.5, -4]} castShadow receiveShadow>
        <boxGeometry args={[9, 5, 6]} />
        <meshStandardMaterial color="#FBEFD9" />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[-4 + i, 4.2, -0.6]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[1, 0.1, 1.6]} />
          <meshStandardMaterial color={stripes[i % 2]} />
        </mesh>
      ))}
      <mesh position={[0, 1.4, -0.98]}>
        <boxGeometry args={[2.4, 2.8, 0.1]} />
        <meshStandardMaterial color={state === 'open' ? '#FFE9A8' : '#5B6170'} emissive={state === 'open' ? '#FFC94D' : '#000'} emissiveIntensity={state === 'open' ? 0.6 : 0} />
      </mesh>
      {state !== 'open' && (
        <mesh position={[0, 1.6, -0.9]}>
          <boxGeometry args={[1.8, 0.5, 0.06]} />
          <meshStandardMaterial color="#F5C451" />
        </mesh>
      )}
      <Label y={7} locked={state === 'closed'}>{label}</Label>
    </group>
  )
}

export function Lab({ open = false }) {
  return (
    <group position={at('lab')}>
      <mesh position={[0, 2, 4]} castShadow>
        <cylinderGeometry args={[5, 5, 4, 24]} />
        <meshStandardMaterial color="#EEF2F7" />
      </mesh>
      <mesh position={[0, 4, 4]} castShadow>
        <sphereGeometry args={[4.6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#9FC7F5" metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0, 9.4, 4]}>
        <cylinderGeometry args={[0.08, 0.08, 2.4, 6]} />
        <meshStandardMaterial color="#5B6170" />
      </mesh>
      <mesh position={[0, 10.7, 4]}>
        <sphereGeometry args={[0.25, 10, 10]} />
        <meshStandardMaterial color="#FF5A4A" emissive="#FF5A4A" emissiveIntensity={1.5} />
      </mesh>
      <Label y={12} locked={!open}>{open ? '연구실 · 자일로의 작업실' : '연구실'}</Label>
    </group>
  )
}

export function Storage() {
  return (
    <group position={at('storage')} rotation={[0, 0.4, 0]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[5, 3.2, 4]} />
        <meshStandardMaterial color="#8B6A4A" roughness={1} />
      </mesh>
      <mesh position={[0, 3.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4, 1.8, 4]} />
        <meshStandardMaterial color="#5B4632" roughness={1} />
      </mesh>
      <mesh position={[0, 1.2, 2.02]}>
        <boxGeometry args={[1.6, 2.4, 0.06]} />
        <meshStandardMaterial color="#4A3826" />
      </mesh>
      <Label y={6}>오래된 창고</Label>
    </group>
  )
}

/* ---------------- 사파리: 울타리와 동물들 ---------------- */
export function Safari() {
  const [cx, , cz] = at('safari')
  const posts = []
  for (let x = -18; x <= 18; x += 3) {
    posts.push([x, -18])
    if (Math.abs(x) > 4) posts.push([x, 18])
  }
  for (let z = -15; z <= 15; z += 3) posts.push([-18, z], [18, z])
  return (
    <group position={[cx, 0, cz]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#D9C78E" />
      </mesh>
      {posts.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.7, z]}>
          <cylinderGeometry args={[0.12, 0.12, 1.4, 6]} />
          <meshStandardMaterial color="#8B6A4A" />
        </mesh>
      ))}
      <Animal kind="giraffe" position={[-8, 0, -6]} rotation={0.6} />
      <Animal kind="giraffe" position={[-11, 0, -2]} rotation={1.2} scale={0.85} />
      <Animal kind="elephant" position={[7, 0, -8]} rotation={-0.8} />
      <Animal kind="elephant" position={[11, 0, -4]} rotation={-1.6} scale={0.6} />
      <Animal kind="lion" position={[4, 0, 5]} rotation={2.4} />
      <Animal kind="lion" position={[9, 0, 7]} rotation={-2.6} scale={0.9} />
      <Label y={6}>사파리</Label>
    </group>
  )
}

/* ---------------- 동굴 산: 처음 보는 문양이 새겨진 입구 ---------------- */
export function CaveMountain({ open }) {
  const glyph = useRef()
  useFrame((s) => {
    if (glyph.current) glyph.current.material.emissiveIntensity = 0.8 + Math.sin(s.clock.elapsedTime * 2) * 0.4
  })
  const rocks = [
    [0, -12, 11, 1.3], [-12, -10, 8, 1], [12, -10, 8, 1], [-6, -18, 9, 1.6], [7, -17, 9, 1.5], [0, -22, 8, 2],
  ]
  return (
    <group position={at('cave')}>
      {rocks.map(([x, z, r, sy], i) => (
        <mesh key={i} position={[x, (r * sy) / 2, z]} scale={[1, sy, 1]} castShadow receiveShadow>
          <dodecahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={i % 2 ? '#8A7B6C' : '#9C8B7A'} flatShading roughness={1} />
        </mesh>
      ))}
      {/* 입구 */}
      <mesh position={[0, 2.4, -1.6]}>
        <circleGeometry args={[3, 24, 0, Math.PI]} />
        <meshStandardMaterial color="#120E14" />
      </mesh>
      <mesh position={[0, 0.02, -1.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 0.4]} />
        <meshStandardMaterial color="#120E14" />
      </mesh>
      <mesh ref={glyph} position={[0, 6.4, -1.4]} userData={{ dynamic: true }}>
        <torusGeometry args={[0.9, 0.12, 8, 6]} />
        <meshStandardMaterial color="#B98CFF" emissive="#8A4DFF" emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <mesh position={[0, 6.4, -1.38]} rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[0.45, 0.08, 6, 3]} />
        <meshStandardMaterial color="#B98CFF" emissive="#8A4DFF" emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <Label y={9} locked={!open}>{open ? '동굴 · 입장 가능' : '동굴'}</Label>
    </group>
  )
}

