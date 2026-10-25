import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'

// 캐릭터 시트(2D 일러스트) 느낌을 내는 공용 부품: 셀 셰이딩 재질 + 외곽선, 사람 캐릭터 뼈대, 표정, 포즈.
export const INK = '#2A2230'
export const SKIN = '#F7C4A2'

// 2단계 명암 (일러스트처럼 밝은 면 / 그림자 면이 또렷하게)
let gradient
function toonGradient() {
  if (!gradient) {
    gradient = new THREE.DataTexture(new Uint8Array([222, 222, 222, 255, 255, 255, 255, 255]), 2, 1)
    gradient.minFilter = gradient.magFilter = THREE.NearestFilter
    gradient.needsUpdate = true
  }
  return gradient
}

export function Toon({ color, emissive, emissiveIntensity = 1, transparent, opacity = 1, side }) {
  return (
    <meshToonMaterial
      color={color}
      gradientMap={toonGradient()}
      emissive={emissive || '#000000'}
      emissiveIntensity={emissive ? emissiveIntensity : 0}
      transparent={transparent}
      opacity={opacity}
      side={side}
    />
  )
}

// 외곽선이 있는 셀 셰이딩 메시. line=false면 외곽선 없이 (눈 · 입처럼 작은 부품)
export function P({ children, color, line = true, thick = 0.018, mat, ...props }) {
  return (
    <mesh castShadow={line} {...props}>
      {children}
      {mat || <Toon color={color} />}
      {line && <Outlines thickness={thick} color={INK} />}
    </mesh>
  )
}

/* ---------- 포즈: 캐릭터 시트의 6동작 ---------- */
// 어깨(s) · 팔꿈치(e) 회전 [x, y, z]. 캐릭터의 왼팔(+x 쪽) 기준이고 오른팔은 좌우를 뒤집는다.
// 팔은 아래(-y)로 늘어져 있다: x를 음수로 하면 앞으로, z를 양수로 하면 바깥으로 든다.
const IDLE = { s: [0.05, 0, 0.12], e: [-0.25, 0, 0] }
export const POSES = {
  idle: { L: IDLE, R: IDLE, head: [0, 0, 0], mood: 'smile' },
  point: { L: IDLE, R: { s: [-0.25, 0, 0.55], e: [-0.3, 0, 2.2] }, finger: 'R', head: [0, 0, 0.06], mood: 'grin' },
  crossed: { L: { s: [-0.55, 0, 0.12], e: [-0.2, 0.2, -1.75] }, R: { s: [-0.6, 0, 0.12], e: [-0.2, 0.2, -1.6] }, head: [0, 0, 0], mood: 'angry' },
  open: { L: { s: [0.05, 0, 0.75], e: [-0.9, 0, -0.35] }, R: { s: [0.05, 0, 0.75], e: [-0.9, 0, -0.35] }, head: [0, 0, 0], mood: 'open' },
  think: { L: { s: [-0.5, 0, 0.12], e: [-0.2, 0.2, -1.65] }, R: { s: [-0.35, 0, -0.05], e: [-2.5, 0, -0.35] }, head: [0.08, 0, -0.1], mood: 'think' },
  cheer: { L: { s: [0, 0, 1.35], e: [0, 0, 1.55] }, R: { s: [0, 0, 1.35], e: [0, 0, 1.55] }, head: [-0.08, 0, 0], mood: 'joy' },
  sad: { L: { s: [-0.12, 0, 0.04], e: [-0.15, 0, 0] }, R: { s: [-0.12, 0, 0.04], e: [-0.15, 0, 0] }, head: [0.3, 0, 0.05], mood: 'sad' },
}
export const POSE_NAMES = { idle: '기본', point: '설명', crossed: '팔짱', open: '반가움', think: '고민', cheer: '신남', sad: '시무룩' }
const mirror = ([x, y, z]) => [x, -y, -z]

/* ---------- 얼굴 ---------- */
// eyes: 'big'(흰자 있는 큰 눈) · 'lash'(속눈썹 있는 까만 눈) · 'dot'(안경 속 작은 눈)
function Eye({ x, style, mood, blinkRef, brow }) {
  const s = Math.sign(x)
  const closed = mood === 'joy'
  return (
    <group position={[x, 0.02, 0.3]}>
      {closed ? (
        <mesh position={[0, 0, 0.01]}>
          <torusGeometry args={[0.045, 0.012, 6, 14, Math.PI]} />
          <Toon color={INK} />
        </mesh>
      ) : (
        <group ref={blinkRef}>
          {style === 'big' && (
            <mesh scale={[1, 1.15, 0.4]}>
              <sphereGeometry args={[0.072, 16, 12]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          )}
          <mesh position={[style === 'big' ? s * -0.008 : 0, style === 'big' ? -0.005 : 0, 0.026]} scale={[0.85, 1.1, 0.4]}>
            <sphereGeometry args={[style === 'big' ? 0.042 : style === 'lash' ? 0.05 : 0.032, 14, 10]} />
            <meshBasicMaterial color="#15141A" />
          </mesh>
          <mesh position={[s * 0.012 - 0.006, 0.018, 0.05]}>
            <sphereGeometry args={[style === 'dot' ? 0.009 : 0.014, 8, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {style === 'lash' && (
            <mesh position={[s * 0.05, 0.035, 0.03]} rotation={[0, 0, s * -0.6]}>
              <capsuleGeometry args={[0.008, 0.03, 2, 4]} />
              <meshBasicMaterial color="#15141A" />
            </mesh>
          )}
        </group>
      )}
      {/* 눈썹: 화나면 안쪽이 내려가고, 슬프면 안쪽이 올라간다 */}
      <mesh
        position={[s * 0.005, mood === 'angry' ? 0.075 : 0.088, 0.02]}
        rotation={[0, 0, Math.PI / 2 + s * (mood === 'angry' ? 0.45 : mood === 'sad' ? -0.4 : mood === 'think' && s > 0 ? -0.25 : -0.08)]}
      >
        <capsuleGeometry args={[0.016, 0.07, 2, 6]} />
        <meshBasicMaterial color={brow} />
      </mesh>
    </group>
  )
}

function Mouth({ mood }) {
  if (mood === 'open' || mood === 'joy' || mood === 'grin') {
    return (
      <group position={[0, -0.11, 0.305]} rotation={[-0.15, 0, 0]}>
        <mesh scale={[1.25, mood === 'grin' ? 0.65 : 0.85, 0.35]}>
          <sphereGeometry args={[0.055, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshBasicMaterial color="#7A2232" />
        </mesh>
        <mesh position={[0, -0.025, 0.006]} scale={[1, 0.45, 0.3]}>
          <sphereGeometry args={[0.038, 10, 8]} />
          <meshBasicMaterial color="#E9727C" />
        </mesh>
        <mesh position={[0, -0.002, 0.012]} scale={[1.2, 0.18, 0.2]}>
          <sphereGeometry args={[0.05, 10, 6]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
    )
  }
  const frown = mood === 'angry' || mood === 'sad'
  return (
    <mesh position={[mood === 'think' ? 0.03 : 0, frown ? -0.13 : -0.1, 0.31]} rotation={[0, 0, frown ? 0 : Math.PI]}>
      <torusGeometry args={[frown ? 0.035 : 0.05, 0.011, 6, 14, Math.PI]} />
      <meshBasicMaterial color="#5A2A2A" />
    </mesh>
  )
}

function Glasses() {
  return (
    <group position={[0, 0.02, 0.32]}>
      {[-0.115, 0.115].map((x) => (
        <group key={x} position={[x, 0, 0]} scale={[1.25, 0.85, 1]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.078, 0.018, 4, 4]} />
            <meshBasicMaterial color="#15141A" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.05, 0.015, 0.015]} />
        <meshBasicMaterial color="#15141A" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.24, 0.02, -0.21]} rotation={[0, s * 0.2, 0]}>
          <boxGeometry args={[0.015, 0.015, 0.22]} />
          <meshBasicMaterial color="#15141A" />
        </mesh>
      ))}
    </group>
  )
}

function Head({ face, mood, Hair, blink }) {
  const { eyes = 'big', glasses, brow = '#6B3A22', cheeks, jaw = 1 } = face
  return (
    <group>
      <P color={SKIN} scale={[jaw, 1.02, 0.95]}>
        <sphereGeometry args={[0.34, 32, 24]} />
      </P>
      {[-1, 1].map((s) => (
        <P key={s} color={SKIN} position={[s * 0.33, -0.01, 0]} scale={[0.55, 1, 0.8]} thick={0.012}>
          <sphereGeometry args={[0.075, 12, 10]} />
        </P>
      ))}
      <mesh position={[0, -0.03, 0.33]}>
        <sphereGeometry args={[0.032, 10, 8]} />
        <Toon color="#EBA987" />
      </mesh>
      {cheeks && [-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.19, -0.06, 0.27]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshBasicMaterial color="#F4A3A8" transparent opacity={0.7} />
        </mesh>
      ))}
      {[-0.12, 0.12].map((x, i) => (
        <Eye key={x} x={x} style={eyes} mood={mood} brow={brow} blinkRef={blink[i]} />
      ))}
      {glasses && <Glasses />}
      <Mouth mood={mood} />
      <Hair />
    </group>
  )
}

/* ---------- 팔 ---------- */
function Arm({ side, pose, jacket, trim, puffy, finger, armRef }) {
  const p = side > 0 ? pose.L : pose.R
  const s = side > 0 ? p.s : mirror(p.s)
  const e = side > 0 ? p.e : mirror(p.e)
  const r = puffy ? 0.105 : 0.09
  return (
    <group ref={armRef} position={[side * 0.34, 1.6, 0]} rotation={s}>
      <P color={jacket} position={[0, -0.19, 0]}>
        <capsuleGeometry args={[r, 0.26, 6, 12]} />
      </P>
      <group position={[0, -0.39, 0]} rotation={e}>
        <P color={jacket} position={[0, -0.15, 0]}>
          <capsuleGeometry args={[r * 0.95, 0.22, 6, 12]} />
        </P>
        <P color={trim} position={[0, -0.32, 0]} thick={0.012}>
          <cylinderGeometry args={[r * 0.95, r * 0.9, 0.07, 14]} />
        </P>
        <group position={[0, -0.43, 0]}>
          <P color={SKIN} scale={[0.85, 1.1, 0.65]} thick={0.012}>
            <sphereGeometry args={[0.085, 14, 12]} />
          </P>
          <P color={SKIN} position={[side * -0.06, 0.02, 0.03]} scale={[0.7, 1, 0.7]} thick={0.01}>
            <sphereGeometry args={[0.035, 8, 8]} />
          </P>
          {finger && (
            <P color={SKIN} position={[0, -0.11, 0]} thick={0.01}>
              <capsuleGeometry args={[0.022, 0.08, 4, 8]} />
            </P>
          )}
        </group>
      </group>
    </group>
  )
}

/* ---------- 사람 캐릭터 ---------- */
// look: { jacket, trim, pants, shoes, build: 'slim' | 'stocky', puffy, badge, face, Hair }
export function Human({ look, pose = 'idle', mood, animate = true }) {
  const P0 = POSES[pose] || POSES.idle
  const m = mood || P0.mood
  const { jacket, trim, pants = '#3D4A66', shoes = '#24232A', build = 'slim', puffy, badge = '#F7D21C', face = {}, Hair } = look
  const w = build === 'stocky' ? 1.18 : 1
  const torso = useRef()
  const head = useRef()
  const arms = [useRef(), useRef()]
  const blink = [useRef(), useRef()]
  const seed = useMemo(() => Math.random() * 10, [])

  useFrame((st) => {
    if (!animate) return
    const t = st.clock.elapsedTime + seed
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 2.2) * 0.012
    if (head.current) {
      head.current.rotation.x = P0.head[0] + Math.sin(t * 1.1) * 0.03
      head.current.rotation.z = P0.head[2] + Math.sin(t * 0.7) * 0.03
    }
    if (pose === 'idle') arms.forEach((a, i) => { if (a.current) a.current.rotation.x = 0.05 + Math.sin(t * 2.2 + i) * 0.04 })
    const b = t % 4.2 < 0.12 ? 0.1 : 1 // 4초마다 눈 깜빡
    blink.forEach((r) => { if (r.current) r.current.scale.y = b })
  })

  return (
    <group>
      {/* 신발 · 다리 */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.14 * w, 0, 0]}>
          <P color={shoes} position={[0, 0.09, 0.07]} rotation={[Math.PI / 2, 0, 0]} scale={[1.1, 1, 0.75]}>
            <capsuleGeometry args={[0.11, 0.18, 6, 12]} />
          </P>
          <P color={pants} position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.1 * w, 0.095 * w, 0.84, 14]} />
          </P>
        </group>
      ))}
      <P color={pants} position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.25 * w, 0.24 * w, 0.14, 18]} />
      </P>
      {/* 점퍼 */}
      <group ref={torso} position={[0, 1.08, 0]}>
        <P color={jacket} position={[0, 0.33, 0]} scale={[w, 1, 0.78]}>
          <capsuleGeometry args={[0.3, 0.3, 8, 20]} />
        </P>
        <P color={trim} position={[0, 0.03, 0]} scale={[w, 1, 0.8]} thick={0.012}>
          <cylinderGeometry args={[0.31, 0.3, 0.09, 22]} />
        </P>
        <P color={trim} position={[0, 0.68, 0.02]} thick={0.012}>
          <cylinderGeometry args={[0.12, 0.17, 0.1, 16, 1, true]} />
        </P>
        <mesh position={[0, 0.34, 0.235]}>
          <boxGeometry args={[0.012, 0.55, 0.01]} />
          <meshBasicMaterial color={INK} transparent opacity={0.45} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.17 * w, 0.17, 0.22]} rotation={[0, 0, s * 0.5]}>
            <boxGeometry args={[0.11, 0.018, 0.01]} />
            <meshBasicMaterial color={trim} />
          </mesh>
        ))}
        {badge && (
          <group position={[0.14 * w, 0.5, 0.23]}>
            <mesh>
              <boxGeometry args={[0.05, 0.09, 0.012]} />
              <meshBasicMaterial color={badge} />
            </mesh>
            <mesh position={[0.025, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.012, 14, 1, false, 0, Math.PI]} />
              <meshBasicMaterial color={badge} />
            </mesh>
          </group>
        )}
      </group>
      <P color={SKIN} position={[0, 1.8, 0]} thick={0.01}>
        <cylinderGeometry args={[0.07, 0.08, 0.14, 12]} />
      </P>
      {[-1, 1].map((s, i) => (
        <Arm key={s} side={s * w} pose={P0} jacket={jacket} trim={trim} puffy={puffy} finger={P0.finger === (s > 0 ? 'L' : 'R')} armRef={arms[i]} />
      ))}
      <group ref={head} position={[0, 2.12, 0]}>
        <group position={[0, -0.12, 0]}>
          <group position={[0, 0.12, 0]}>
            <Head face={face} mood={m} Hair={Hair} blink={blink} />
          </group>
        </group>
      </group>
    </group>
  )
}

// 머리 위쪽을 덮는 반구 (머리카락 기본형)
export function HairCap({ color, r = 0.36, tilt = -0.35, y = 0.03, z = -0.03, depth = 0.58 }) {
  return (
    <P color={color} position={[0, y, z]} rotation={[tilt, 0, 0]}>
      <sphereGeometry args={[r, 28, 16, 0, Math.PI * 2, 0, Math.PI * depth]} />
    </P>
  )
}

// 끝이 뾰족한 머리 뭉치. dir 방향(구면 각도)으로 뻗는다.
export function Spike({ color, at, rot, r = 0.09, h = 0.3 }) {
  return (
    <P color={color} position={at} rotation={rot} thick={0.014}>
      <coneGeometry args={[r, h, 10]} />
    </P>
  )
}
