import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ROOM_HALF } from './Room.jsx'
import RobotRig, { useMotions } from './RobotRig.jsx'

const SPEED = 4.2
const WALK_FACTOR = 0.35 // Shift를 누르고 있으면 천천히 걷는다
const ACCEL = 12 // 출발할 때 목표 속도까지 따라붙는 빠르기
const DECEL = 16 // 멈출 때
const JUMP_V = 6.2 // 스페이스 점프 처음 속도
const GRAVITY = 19
const JUMP_BUFFER = 0.15 // 착지 직전에 누른 점프도 받아 준다(초)
const SEAT_LIFT = 0.3 // 앉은 자세에서 몸을 의자 높이까지 올린다 (Mixamo 몸체)
const LIMIT = ROOM_HALF - 0.7
const ROOM_BOUNDS = { minX: -LIMIT, maxX: LIMIT, minZ: -LIMIT, maxZ: LIMIT }
const NO_KEYS = { forward: false, back: false, left: false, right: false }

// 카메라 시점: 로봇을 중심으로 yaw(좌우 회전)·pitch(위아래 각도)·dist(거리)로 둘러본다.
// 처음에는 방 모서리를 대각선으로 내려다보는 각도.
export const INITIAL_VIEW = { yaw: -Math.PI / 4, pitch: 0.65, dist: 12.4 }

export function viewOffset(view, out = new THREE.Vector3()) {
  const h = Math.cos(view.pitch) * view.dist
  return out.set(Math.sin(view.yaw) * h, Math.sin(view.pitch) * view.dist, Math.cos(view.yaw) * h)
}

const move = new THREE.Vector3()
const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const camGoal = new THREE.Vector3()
const look = new THREE.Vector3()

function lerpAngle(a, b, t) {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

// frozen: 대사·미션 창이 떠 있는 동안 움직이지 않게 한다.
// seated: 의자에 앉은 자세(몸을 낮춤), face: 바라볼 방향(라디안, 앉아 있을 때 책상 쪽)
// heightAt(x, z): 발밑 높이(계단, 언덕), blocked(x, z): 걸어서 못 들어가는 곳, speed: 걷는 속도
export default function Robot({ posRef, targetRef, keys, view, name, bubble, onMove, bounds = ROOM_BOUNDS, colliders = [], frozen = false, cameraControlled = false, seated = false, face = null, heightAt = null, blocked = null, speed = SPEED }) {
  const group = useRef()
  const motions = useMotions()
  const ground = useRef(heightAt ? heightAt(posRef.current.x, posRef.current.z) : 0)
  const vel = useRef(new THREE.Vector3()) // 지금 움직이는 속도 (가속·감속을 부드럽게)
  const jump = useRef({ y: 0, v: 0, held: false, pressedAt: -1 })
  // 몸체 애니메이션이 읽는 상태
  const anim = useRef({ speed: 0, air: false, vy: 0, seated: false, landedAt: -10, jumpedAt: -10, waveUntil: 0, stride: 0 })
  const { camera, clock } = useThree()

  // 개발 서버에서만: 콘솔에서 window.__robot.teleport(x, z)로 위치 이동 (배포 빌드에는 없음)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__robot = { teleport: (x, z) => posRef.current.set(x, 0, z), where: () => [...posRef.current.toArray(), ground.current], anim: () => ({ ...anim.current }) }
    return () => delete window.__robot
  }, [posRef])

  // 말풍선을 띄우면 손을 흔든다
  useEffect(() => {
    if (bubble) anim.current.waveUntil = clock.elapsedTime + 1.8
  }, [bubble, clock])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const now = state.clock.elapsedTime
    const k = frozen ? NO_KEYS : keys.current
    const a = anim.current

    // 스페이스: 누른 순간을 기억해 두었다가 땅에 있으면 뛰어오른다
    const j = jump.current
    if (k.jump && !j.held) j.pressedAt = now
    j.held = !!k.jump
    if (j.y === 0 && !seated && now - j.pressedAt < JUMP_BUFFER) {
      j.v = JUMP_V
      j.pressedAt = -1
      a.jumpedAt = now
    }
    if (j.v || j.y) {
      j.v -= GRAVITY * dt
      j.y += j.v * dt
      if (j.y <= 0) {
        j.y = 0
        j.v = 0
        a.landedAt = now
      }
    }

    if (frozen) targetRef.current = null
    const sx = (k.right ? 1 : 0) - (k.left ? 1 : 0)
    const sy = (k.forward ? 1 : 0) - (k.back ? 1 : 0)
    move.set(0, 0, 0)
    let top = k.walk ? speed * WALK_FACTOR : speed

    if (sx || sy) {
      // W는 카메라가 바라보는 방향, D는 화면 오른쪽
      const { yaw } = view.current
      forward.set(-Math.sin(yaw), 0, -Math.cos(yaw))
      right.set(Math.cos(yaw), 0, -Math.sin(yaw))
      targetRef.current = null
      move.addScaledVector(right, sx).addScaledVector(forward, sy)
    } else if (targetRef.current) {
      move.subVectors(targetRef.current, posRef.current).setY(0)
      const d = move.length()
      if (d < 0.12) {
        targetRef.current = null
        move.set(0, 0, 0)
      } else {
        top = Math.min(top, d * 5) // 클릭한 곳에 다가가면 속도를 줄여 멈춘다
      }
    }
    if (seated) move.set(0, 0, 0)

    const wants = move.lengthSq() > 0
    if (wants) {
      move.normalize()
      group.current.rotation.y = lerpAngle(group.current.rotation.y, Math.atan2(move.x, move.z), 1 - Math.pow(0.0001, dt))
    }
    // 바로 최고 속도로 튀어 나가지 않고 짧게 가속·감속한다
    const v = vel.current
    move.multiplyScalar(top)
    v.lerp(move, 1 - Math.exp(-dt * (wants ? ACCEL : DECEL)))
    if (!wants && v.lengthSq() < 0.0004) v.set(0, 0, 0)

    const p = posRef.current
    const px = p.x
    const pz = p.z
    if (v.lengthSq() > 0) {
      p.addScaledVector(v, dt)
      if (bounds.radius) {
        // 원형 공간(광장)
        const d = Math.hypot(p.x, p.z)
        if (d > bounds.radius) p.multiplyScalar(bounds.radius / d)
      } else {
        p.x = THREE.MathUtils.clamp(p.x, bounds.minX, bounds.maxX)
        p.z = THREE.MathUtils.clamp(p.z, bounds.minZ, bounds.maxZ)
      }
      // 지나갈 수 없는 물체 [x, z, 반지름]
      for (const [cx, cz, r] of colliders) {
        const dx = p.x - cx
        const dz = p.z - cz
        const d = Math.hypot(dx, dz)
        if (d < r && d > 0.0001) {
          p.x = cx + (dx / d) * r
          p.z = cz + (dz / d) * r
        }
      }
      // 막힌 곳(언덕 비탈 등): 한 축씩 되돌려 벽을 따라 미끄러지게 한다
      if (blocked?.(p.x, p.z)) {
        const nx = p.x
        p.x = px
        if (blocked(p.x, p.z)) {
          p.x = nx
          p.z = pz
          if (blocked(p.x, p.z)) p.x = px
        }
      }
    }
    // 실제로 움직인 거리로 속도를 잰다: 벽에 막혀 있으면 제자리에서 걷지 않는다
    const moved = Math.hypot(p.x - px, p.z - pz) / Math.max(dt, 1e-4)
    a.speed += (moved - a.speed) * Math.min(1, dt * 20)
    a.stride += moved * dt * 2.4
    a.air = j.y > 0
    a.vy = j.v
    a.seated = seated

    // 계단을 오르내릴 때 한 칸씩 툭 끊기지 않게 부드럽게 따라간다
    const g = heightAt ? heightAt(p.x, p.z) : 0
    ground.current += (g - ground.current) * Math.min(1, dt * 14)
    group.current.position.copy(p)
    if (face !== null) group.current.rotation.y = lerpAngle(group.current.rotation.y, face, 1 - Math.pow(0.001, dt))
    group.current.position.y = ground.current + (seated ? (motions ? SEAT_LIFT : 0.45) : 0) + j.y

    camGoal.copy(p).add(viewOffset(view.current, look))
    camGoal.y += ground.current
    if (!cameraControlled) camera.position.lerp(camGoal, 1 - Math.pow(0.0005, dt))
    look.copy(p).setY(ground.current + 0.9)
    if (!cameraControlled) camera.lookAt(look)

    onMove?.(p)
  })

  return (
    <group ref={group}>
      {motions ? <RobotRig data={motions} anim={anim} /> : <ClassicBody anim={anim} />}
      <Html position={[0, 2.25, 0]} center zIndexRange={[1, 0]}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {bubble && <div className="bubble">{bubble}</div>}
          <div className="nametag">{name}</div>
        </div>
      </Html>
    </group>
  )
}

// 모션 파일을 불러오기 전(또는 못 불러왔을 때) 보여 주는 원래 로봇. 다리·팔을 코드로 흔든다.
function ClassicBody({ anim }) {
  const body = useRef()
  const legs = [useRef(), useRef()]
  const arms = [useRef(), useRef()]

  useFrame((state, dt) => {
    const s = anim.current
    const t = state.clock.elapsedTime
    const walking = s.speed > 0.3 && !s.air && !s.seated
    const ph = s.stride
    const swing = walking ? Math.sin(ph) * 0.65 : 0
    const ease = 1 - Math.pow(0.0001, dt)
    legs.forEach((l, i) => {
      const goal = s.air ? (i ? -0.35 : 0.45) : s.seated ? -1.4 : i ? -swing : swing
      l.current.rotation.x = THREE.MathUtils.lerp(l.current.rotation.x, goal, walking ? 1 : ease)
    })
    arms.forEach((a, i) => {
      const goal = s.air ? -0.9 : i ? swing * 0.8 : -swing * 0.8
      a.current.rotation.x = THREE.MathUtils.lerp(a.current.rotation.x, goal, walking ? 1 : ease)
    })
    body.current.position.y = s.air ? 0 : walking ? Math.abs(Math.cos(ph)) * 0.04 : Math.sin(t * 2) * 0.015
    body.current.rotation.x = THREE.MathUtils.lerp(body.current.rotation.x, walking ? 0.08 : 0, ease)
  })

  const green = '#6CC395'
  const dark = '#3E9A6C'
  return (
    <>
      <group ref={body}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <capsuleGeometry args={[0.32, 0.6, 8, 20]} />
          <meshStandardMaterial color={green} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <torusGeometry args={[0.33, 0.05, 10, 32]} />
          <meshStandardMaterial color={dark} />
        </mesh>
        <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.33, 0.03, 10, 32]} />
          <meshStandardMaterial color={dark} />
        </mesh>
        {/* 눈 */}
        <mesh position={[-0.12, 1.12, 0.28]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#1b2a22" />
        </mesh>
        <mesh position={[0.12, 1.12, 0.28]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#1b2a22" />
        </mesh>
        {/* 안테나 */}
        <mesh position={[0, 1.55, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 6]} />
          <meshStandardMaterial color={dark} />
        </mesh>
        <mesh position={[0, 1.74, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#2BD36B" emissive="#2BD36B" emissiveIntensity={0.6} />
        </mesh>
        {/* 팔 */}
        {[-1, 1].map((s, i) => (
          <group key={s} position={[s * 0.36, 0.9, 0]} rotation={[0, 0, s * -0.2]}>
            <group ref={arms[i]}>
              <mesh position={[0, -0.16, 0]} castShadow>
                <capsuleGeometry args={[0.05, 0.25, 4, 8]} />
                <meshStandardMaterial color={dark} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
      {/* 다리 */}
      {[-1, 1].map((s, i) => (
        <group key={s} ref={legs[i]} position={[s * 0.13, 0.3, 0]}>
          <mesh position={[0, -0.13, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.065, 0.26, 8]} />
            <meshStandardMaterial color={dark} />
          </mesh>
          <mesh position={[0, -0.27, 0.05]} castShadow>
            <boxGeometry args={[0.13, 0.07, 0.22]} />
            <meshStandardMaterial color={dark} />
          </mesh>
        </group>
      ))}
    </>
  )
}
