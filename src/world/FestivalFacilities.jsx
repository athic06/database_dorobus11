import { Suspense, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { PLACES } from './layout.js'
import { Label } from './Landmarks.jsx'

const ROOT = `${import.meta.env.BASE_URL}models/festival/`
const UP = new THREE.Vector3(0, 1, 0)
const TAU = Math.PI * 2

function Model({ model, scale = 1, ...props }) {
  const { scene } = useGLTF(`${ROOT}${model}.glb`)
  const { object, offset } = useMemo(() => {
    const object = scene.clone(true)
    const bounds = new THREE.Box3().setFromObject(object)
    const offset = bounds.getCenter(new THREE.Vector3()).negate()
    offset.y = -bounds.min.y
    object.traverse(node => {
      if (node.isMesh) node.castShadow = node.receiveShadow = true
    })
    return { object, offset }
  }, [scene])
  return <group {...props} scale={scale}><primitive object={object} position={offset} /></group>
}

function Ground({ size, color = '#b6a58a' }) {
  return <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={size} /><meshStandardMaterial color={color} roughness={0.95} />
  </mesh>
}

function Support({ from, to, thickness = 1 }) {
  const delta = new THREE.Vector3(...to).sub(new THREE.Vector3(...from))
  const length = delta.length()
  const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, delta.normalize())
  return <Model model="coaster/support-large" position={from} quaternion={quaternion} scale={[thickness, length, thickness]} />
}

function Viking({ repaired }) {
  const arm = useRef()
  const disk = useRef()
  useFrame(({ clock }) => {
    const time = repaired ? clock.elapsedTime * 0.28 : 0
    arm.current.rotation.z = Math.sin(time * TAU) * 0.74
    disk.current.rotation.y = time * TAU * 0.86
  })
  return (
    <group position={PLACES.viking.pos}>
      <Ground size={[24, 21]} color="#ada391" />
      {[-1, 1].flatMap(side => [-1, 1].map(front => (
        <Support key={`${side}:${front}`} from={[side * 6, 0, front * 5.7]} to={[side * 1.7, 13, front * 4.9]} thickness={2.6} />
      )))}
      <mesh position={[0, 13, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.58, 10.5, 18]} /><meshStandardMaterial color="#daaa61" metalness={0.42} />
      </mesh>
      <group ref={arm} position={[0, 13, 0]}>
        <Support from={[0, -10.5, 0]} to={[0, 0.5, 0]} thickness={2.3} />
        <group ref={disk} position={[0, -10.5, 0]}>
          <mesh castShadow receiveShadow><cylinderGeometry args={[3.75, 3.2, 0.55, 48]} /><meshStandardMaterial color="#227879" roughness={0.4} /></mesh>
          <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.68, 0.11, 8, 48]} /><meshStandardMaterial color="#ffca6c" emissive="#a85f1e" emissiveIntensity={0.35} />
          </mesh>
          {Array.from({ length: 8 }, (_, index) => {
            const angle = index * TAU / 8
            return <Model key={index} model="furniture/chairDesk" position={[Math.sin(angle) * 2.82, 0.28, Math.cos(angle) * 2.82]} rotation={[0, angle, 0]} scale={2.45} />
          })}
          <Model model="factory/box-large" position={[-1.35, -0.53, 0]} scale={0.92} />
        </group>
      </group>
      {[-7.5, -4.5, 4.5, 7.5].map(x => <Model key={x} model="coaster/station-fence" position={[x, 0.1, 8.8]} scale={2} />)}
      <Label y={15} distance={27}>회전 바이킹 · 이클립스</Label>
    </group>
  )
}

function FoodCourt({ repaired }) {
  const burger = useRef()
  useFrame(({ clock }) => {
    const fraction = repaired ? (clock.elapsedTime * 0.18) % 1 : 0
    burger.current.position.x = -3.3 + fraction * 6.6
  })
  return (
    <group position={PLACES.food.pos}>
      <Ground size={[22, 17]} />
      <Model model="coaster/stall-food" position={[-4, 0.1, 2]} scale={4} />
      <Model model="coaster/stall-food" position={[2, 0.1, 2]} scale={4} />
      <Model model="coaster/stall-drinks" position={[7, 0.1, 1]} scale={3.4} />
      {[-7.6, -3.7, 2, 6.2].map(x => (
        <group key={x} position={[x, 0.1, -5.5]}>
          <Model model="furniture/tableRound" scale={2.3} />
          <Model model="furniture/chairDesk" position={[0, 0, -1.03]} scale={1.65} />
          <Model model="furniture/chairDesk" position={[0, 0, 1.03]} rotation={[0, Math.PI, 0]} scale={1.65} />
        </group>
      ))}
      <Model model="factory/conveyor-long-sides" position={[0.4, 0.1, -1.8]} scale={3.3} />
      <group ref={burger} position={[-3.3, 1.47, -1.8]}><Model model="food/burger-cheese" scale={2} /></group>
      <Label y={7.4} distance={28}>푸드코트 · 축제 버거</Label>
    </group>
  )
}

function SafariTransport({ repaired }) {
  const van = useRef()
  const cargo = useRef()
  useFrame(({ clock }) => {
    const fraction = repaired ? (clock.elapsedTime * 0.15) % 1 : 0
    van.current.position.z = 13 - fraction * 5
    cargo.current.position.x = repaired ? -12 + fraction * 4 : -6
  })
  return (
    <group position={PLACES.safari.pos}>
      {[-13, -9.5, 8].map(x => <Model key={x} model="car/van" position={[x, 0.07, 13]} scale={1.6} />)}
      <group ref={van} position={[-6, 0.07, 13]} rotation={[0, Math.PI, 0]}>
        <Model model="car/delivery-flat" scale={1.6} />
        {!repaired && <Model model="factory/box-large" position={[0, 0.95, -1.1]} />}
        <Label y={3} distance={17}>3호차</Label>
      </group>
      {repaired && <Model model="factory/conveyor-long-sides" position={[-10, 0.09, 8]} scale={2.7} />}
      <group ref={cargo} position={[-6, 1.22, 8]} visible={repaired}><Model model="factory/box-large" /></group>
    </group>
  )
}

function ParadeStage({ repaired, deliveryReady }) {
  const truck = useRef()
  useFrame(({ clock }) => {
    const fraction = repaired ? (clock.elapsedTime * 0.08) % 1 : 0
    truck.current.position.x = 6 - 12 * fraction
  })
  return (
    <group position={PLACES.parade.pos}>
      <Ground size={[22, 24]} color="#b9a184" />
      <mesh position={[0, 0.09, 4.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 4.2]} /><meshStandardMaterial color="#766955" roughness={1} />
      </mesh>
      <mesh position={[0, 0.46, -4]} receiveShadow castShadow>
        <boxGeometry args={[12, 0.82, 7.5]} /><meshStandardMaterial color="#5d5747" roughness={0.88} />
      </mesh>
      {[-5.9, 5.9].map(x => <Support key={x} from={[x, 0, -6.5]} to={[x, 7, -6.5]} thickness={1.55} />)}
      <Support from={[-6, 6.85, -6.5]} to={[6, 6.85, -6.5]} thickness={1.25} />
      {[-4, 0, 4].map(x => <Model key={x} model="holiday/lights-colored" position={[x, 5.85, -6.2]} scale={3.65} />)}
      {repaired && <pointLight position={[0, 4.3, -3.7]} color="#ffd289" distance={13} intensity={30} />}
      <group ref={truck} position={[6, 0.08, 4.5]} rotation={[0, -Math.PI / 2, 0]}>
        <Model model="car/delivery-flat" scale={1.9} />
        <Model model="holiday/present-a-cube" position={[0, 1.1, -1.2]} scale={1.8} />
      </group>
      {!repaired && <Model model="factory/box-large" position={[-2.3, 0.1, 4.5]} scale={2} />}
      {deliveryReady && <Model model="factory/conveyor-long-sides" position={[-5, 0.09, 0.1]} scale={2.6} />}
      <Label y={7.8} distance={28}>{repaired ? '도로랜드 축제 · 개막!' : '축제 무대 · 퍼레이드'}</Label>
    </group>
  )
}

export default function FestivalFacilities({ records }) {
  return (
    <>
      <Suspense fallback={null}><Viking repaired={records.viking} /></Suspense>
      <Suspense fallback={null}><FoodCourt repaired={records.food} /></Suspense>
      <Suspense fallback={null}><SafariTransport repaired={records.safari} /></Suspense>
      <Suspense fallback={null}><ParadeStage repaired={records.parade} deliveryReady={records.delivery} /></Suspense>
    </>
  )
}
