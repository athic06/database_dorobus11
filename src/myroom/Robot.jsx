import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ROOM_HALF } from './Room.jsx'

const SPEED = 4.2
const JUMP_V = 6.2 // 스페이스 점프 처음 속도
const GRAVITY = 19
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
export default function Robot({ posRef, targetRef, keys, view, name, bubble, onMove, bounds = ROOM_BOUNDS, colliders = [], frozen = false, seated = false, face = null }) {
  const group = useRef()
  const body = useRef()
  const { camera } = useThree()

  // 개발 서버에서만: 콘솔에서 window.__robot.teleport(x, z)로 위치 이동 (배포 빌드에는 없음)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__robot = { teleport: (x, z) => posRef.current.set(x, 0, z) }
    return () => delete window.__robot
  }, [posRef])

  const jump = useRef({ y: 0, v: 0 })

  useFrame((state, dt) => {
    const k = frozen ? NO_KEYS : keys.current
    // 스페이스: 땅에 있을 때만 뛰어오른다
    const j = jump.current
    if (k.jump && j.y === 0 && !seated) j.v = JUMP_V
    if (j.v || j.y) {
      j.v -= GRAVITY * Math.min(dt, 0.05)
      j.y += j.v * Math.min(dt, 0.05)
      if (j.y <= 0) {
        j.y = 0
        j.v = 0
      }
    }
    if (frozen) targetRef.current = null
    const sx = (k.right ? 1 : 0) - (k.left ? 1 : 0)
    const sy = (k.forward ? 1 : 0) - (k.back ? 1 : 0)
    move.set(0, 0, 0)

    if (sx || sy) {
      // W는 카메라가 바라보는 방향, D는 화면 오른쪽
      const { yaw } = view.current
      forward.set(-Math.sin(yaw), 0, -Math.cos(yaw))
      right.set(Math.cos(yaw), 0, -Math.sin(yaw))
      targetRef.current = null
      move.addScaledVector(right, sx).addScaledVector(forward, sy)
    } else if (targetRef.current) {
      move.subVectors(targetRef.current, posRef.current).setY(0)
      if (move.length() < 0.12) {
        targetRef.current = null
        move.set(0, 0, 0)
      }
    }

    const moving = move.lengthSq() > 0
    if (moving) {
      move.normalize()
      group.current.rotation.y = lerpAngle(group.current.rotation.y, Math.atan2(move.x, move.z), 1 - Math.pow(0.0001, dt))
      posRef.current.addScaledVector(move, SPEED * Math.min(dt, 0.1))
      const p = posRef.current
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
    }
    group.current.position.copy(posRef.current)
    if (face !== null) group.current.rotation.y = lerpAngle(group.current.rotation.y, face, 1 - Math.pow(0.001, dt))
    group.current.position.y = (seated ? 0.45 : 0) + j.y
    const t = state.clock.elapsedTime
    body.current.position.y = j.y ? 0 : moving ? Math.abs(Math.sin(t * 12)) * 0.08 : Math.sin(t * 2) * 0.02
    // 공중에서는 몸이 살짝 늘어난다
    body.current.scale.y = THREE.MathUtils.lerp(body.current.scale.y, j.y ? 1 + Math.min(Math.abs(j.v) * 0.015, 0.1) : 1, 0.3)

    camGoal.copy(posRef.current).add(viewOffset(view.current, look))
    camera.position.lerp(camGoal, 1 - Math.pow(0.0005, dt))
    look.copy(posRef.current).setY(0.9)
    camera.lookAt(look)

    onMove?.(posRef.current)
  })

  const green = '#6CC395'
  const dark = '#3E9A6C'

  return (
    <group ref={group}>
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
        <mesh position={[-0.38, 0.75, 0]} rotation={[0, 0, 0.2]} castShadow>
          <capsuleGeometry args={[0.05, 0.25, 4, 8]} />
          <meshStandardMaterial color={dark} />
        </mesh>
        <mesh position={[0.38, 0.75, 0]} rotation={[0, 0, -0.2]} castShadow>
          <capsuleGeometry args={[0.05, 0.25, 4, 8]} />
          <meshStandardMaterial color={dark} />
        </mesh>
      </group>
      {/* 다리 */}
      <mesh position={[-0.13, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.24, 8]} />
        <meshStandardMaterial color={dark} />
      </mesh>
      <mesh position={[0.13, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.24, 8]} />
        <meshStandardMaterial color={dark} />
      </mesh>

      <Html position={[0, 2.25, 0]} center zIndexRange={[1, 0]}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {bubble && <div className="bubble">{bubble}</div>}
          <div className="nametag">{name}</div>
        </div>
      </Html>
    </group>
  )
}
