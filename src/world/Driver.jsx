import { groundHeight } from './layout.js'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Vehicle from './Vehicles.jsx'
import { vehicleOf } from '../game/routine.js'
import { viewOffset } from '../myroom/Robot.jsx'

const MAX_SPEED = 16
const MAX_REVERSE = 6
const ACCEL = 14
const BRAKE = 24
const DRAG = 5
const STEER = 2.1
const CAR_RADIUS = 1.7
const NO_KEYS = { forward: false, back: false, left: false, right: false }

const camGoal = new THREE.Vector3()
const look = new THREE.Vector3()
const off = new THREE.Vector3()

// 모바일 로봇 자동차 조작: W/S 가속·후진, A/D 방향. 카메라는 차 뒤를 따라가고 드래그로 둘러볼 수 있다.
// parked: 차에서 내려 걷는 동안. 차는 그 자리에 세워 두고, 카메라와 햇빛 그림자는 followRef(걷는 캐릭터)를 따라간다.
export default function Driver({ posRef, headingRef, keys, view, colliders, half, frozen, cameraControlled = false, onMove, vehicle = 'car', parked = false, followRef }) {
  const top = MAX_SPEED * vehicleOf(vehicle).speed
  const car = useRef()
  const wheels = [useRef(), useRef(), useRef(), useRef()]
  const speed = useRef(0)
  const { camera, scene } = useThree()
  const sun = useRef()

  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__car = { teleport: (x, z, h = headingRef.current) => { posRef.current.set(x, 0, z); headingRef.current = h }, where: () => [posRef.current.x, posRef.current.z, headingRef.current] }
    return () => delete window.__car
  }, [posRef, headingRef])

  useEffect(() => {
    if (sun.current) scene.add(sun.current.target)
  }, [scene])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    if (parked) {
      speed.current = 0
      car.current.position.copy(posRef.current)
      car.current.rotation.y = headingRef.current
      const f = followRef?.current || posRef.current
      if (sun.current) {
        sun.current.position.set(f.x + 30, 50, f.z + 20)
        sun.current.target.position.set(f.x, 0, f.z)
      }
      return
    }
    const k = frozen ? NO_KEYS : keys.current
    let v = frozen ? 0 : speed.current
    if (k.forward) v += (v < 0 ? BRAKE : ACCEL) * dt
    else if (k.back) v -= (v > 0 ? BRAKE : ACCEL) * dt
    else v -= Math.sign(v) * Math.min(Math.abs(v), DRAG * dt)
    v = THREE.MathUtils.clamp(v, -MAX_REVERSE, top)

    // A는 항상 차 앞이 왼쪽, D는 오른쪽으로 돈다. 후진이나 브레이크 중에도 뒤집히지 않게 속도 방향은 곱하지 않는다(아이들 기준 조작)
    const steer = (k.left ? 1 : 0) - (k.right ? 1 : 0)
    if (steer && Math.abs(v) > 0.2) {
      headingRef.current += steer * STEER * dt * Math.min(1, Math.abs(v) / 4)
    }
    const h = headingRef.current
    const p = posRef.current
    p.x += Math.sin(h) * v * dt
    p.z += Math.cos(h) * v * dt

    // 장애물과 경계
    for (const [cx, cz, r] of colliders) {
      const dx = p.x - cx
      const dz = p.z - cz
      const d = Math.hypot(dx, dz)
      const min = r + CAR_RADIUS
      if (d < min && d > 0.0001) {
        p.x = cx + (dx / d) * min
        p.z = cz + (dz / d) * min
        v *= 0.4
      }
    }
    const lim = half - 3
    if (Math.abs(p.x) > lim || Math.abs(p.z) > lim) v *= 0.4
    p.x = THREE.MathUtils.clamp(p.x, -lim, lim)
    p.z = THREE.MathUtils.clamp(p.z, -lim, lim)
    speed.current = v

    p.y = groundHeight(p.x,p.z)
    car.current.position.copy(p)
    car.current.rotation.y = h
    car.current.rotation.z = THREE.MathUtils.lerp(car.current.rotation.z, -steer * Math.min(1, Math.abs(v) / top) * 0.06, 0.1)
    wheels.forEach((w) => w.current && (w.current.rotation.x += (v * dt) / 0.55))

    // 달리는 동안에는 둘러보던 시점이 천천히 차 뒤쪽으로 돌아온다
    // 운전 키를 누르면 돌려 둔 시점이 빠르게 차 뒤로 돌아온다(차 앞에서 보면 좌우가 거울처럼 뒤집혀 보이므로)
    const vw = view.current
    const driving = k.forward || k.back || k.left || k.right
    vw.yaw = Math.atan2(Math.sin(vw.yaw), Math.cos(vw.yaw)) // 한 바퀴 넘게 돌려 둔 각도는 가까운 쪽으로 돌아오게
    if (driving) vw.yaw *= 1 - Math.min(1, dt * 6)
    else if (Math.abs(v) > 2) vw.yaw *= 1 - Math.min(1, dt * 1.2)
    const camView = { yaw: h + Math.PI + vw.yaw, pitch: vw.pitch, dist: vw.dist }
    camGoal.copy(p).add(viewOffset(camView, off))
    camGoal.y = Math.max(camGoal.y, groundHeight(camGoal.x,camGoal.z) + 1.4)
    if (!cameraControlled) camera.position.lerp(camGoal, 1 - Math.pow(0.001, dt))
    look.set(p.x, p.y + 2, p.z)
    if (!cameraControlled) camera.lookAt(look)

    if (sun.current) {
      sun.current.position.set(p.x + 30, 50, p.z + 20)
      sun.current.target.position.set(p.x, 0, p.z)
    }
    onMove?.(p, h, v)
  })

  return (
    <>
      <directionalLight
        ref={sun}
        intensity={2.1}
        color="#FFF0D9"
        shadow-bias={-0.00015}
        shadow-normalBias={0.035}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-far={140}
      />
      <Vehicle ref={car} id={vehicle} wheelRefs={wheels} />
    </>
  )
}

export { CAR_RADIUS }
