import { forwardRef } from 'react'
import MobileCar from './MobileCar.jsx'

// 탈것 분류: 출석·퀘스트 스탬프와 출석판 보상으로 얻는 탈것들. 모두 앞쪽이 +z, 바퀴 ref 4개를 받는다.
function Wheel({ position, spinRef, r = 0.5, w = 0.4, rim = '#E8C99A' }) {
  return (
    <group position={position}>
      <group ref={spinRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[r, r, w, 20]} />
          <meshStandardMaterial color="#26282E" roughness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r * 0.6, r * 0.6, w + 0.02, 16]} />
          <meshStandardMaterial color={rim} />
        </mesh>
      </group>
    </group>
  )
}

const Scooter = forwardRef(function Scooter({ wheelRefs = [] }, ref) {
  return (
    <group ref={ref}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.9, 0.35, 2.6]} />
        <meshStandardMaterial color="#4FBFA8" />
      </mesh>
      <mesh position={[0, 1.35, -0.5]} castShadow>
        <boxGeometry args={[0.8, 0.3, 1.1]} />
        <meshStandardMaterial color="#3A3D45" />
      </mesh>
      <mesh position={[0, 1.6, 1.05]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.6, 8]} />
        <meshStandardMaterial color="#C9CDD6" />
      </mesh>
      <mesh position={[0, 2.35, 1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
        <meshStandardMaterial color="#3A3D45" />
      </mesh>
      <mesh position={[0, 1.2, 1.25]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#FFF3B0" emissive="#FFE066" emissiveIntensity={0.8} />
      </mesh>
      <Wheel position={[0, 0.5, 1.05]} spinRef={wheelRefs[0]} />
      <Wheel position={[0, 0.5, -1.05]} spinRef={wheelRefs[2]} />
    </group>
  )
})

const Bus = forwardRef(function Bus({ wheelRefs = [] }, ref) {
  return (
    <group ref={ref}>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 2.1, 4.4]} />
        <meshStandardMaterial color="#F5C451" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.16, 2.05, 0]}>
          <boxGeometry args={[0.02, 0.7, 3.6]} />
          <meshStandardMaterial color="#D6F1F3" />
        </mesh>
      ))}
      <mesh position={[0, 2.05, 2.21]}>
        <boxGeometry args={[2, 0.8, 0.02]} />
        <meshStandardMaterial color="#D6F1F3" />
      </mesh>
      <mesh position={[0, 0.9, 2.21]}>
        <boxGeometry args={[2.3, 0.3, 0.05]} />
        <meshStandardMaterial color="#2F6BFF" />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[2.1, 0.2, 4]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <Wheel position={[-1.12, 0.5, 1.4]} spinRef={wheelRefs[0]} />
      <Wheel position={[1.12, 0.5, 1.4]} spinRef={wheelRefs[1]} />
      <Wheel position={[-1.12, 0.5, -1.4]} spinRef={wheelRefs[2]} />
      <Wheel position={[1.12, 0.5, -1.4]} spinRef={wheelRefs[3]} />
    </group>
  )
})

const Kart = forwardRef(function Kart({ wheelRefs = [] }, ref) {
  return (
    <group ref={ref}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.8, 0.45, 3]} />
        <meshStandardMaterial color="#E2574C" />
      </mesh>
      <mesh position={[0, 0.95, 1.3]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[1.4, 0.2, 0.8]} />
        <meshStandardMaterial color="#F7F3EA" />
      </mesh>
      <mesh position={[0, 1.2, -0.4]} castShadow>
        <boxGeometry args={[0.9, 0.6, 0.8]} />
        <meshStandardMaterial color="#3A3D45" />
      </mesh>
      <mesh position={[0, 1.1, -1.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 0.6, 12]} />
        <meshStandardMaterial color="#9AA3B5" metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.1, -1.9]}>
        <sphereGeometry args={[0.25, 10, 10]} />
        <meshStandardMaterial color="#FFB347" emissive="#FF8A00" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.6, -1.3]}>
        <boxGeometry args={[1.9, 0.08, 0.5]} />
        <meshStandardMaterial color="#3A3D45" />
      </mesh>
      <Wheel position={[-1, 0.45, 1]} spinRef={wheelRefs[0]} r={0.45} />
      <Wheel position={[1, 0.45, 1]} spinRef={wheelRefs[1]} r={0.45} />
      <Wheel position={[-1, 0.45, -1]} spinRef={wheelRefs[2]} r={0.45} />
      <Wheel position={[1, 0.45, -1]} spinRef={wheelRefs[3]} r={0.45} />
    </group>
  )
})

const Pumpkin = forwardRef(function Pumpkin({ wheelRefs = [] }, ref) {
  return (
    <group ref={ref}>
      <mesh position={[0, 1.9, 0]} scale={[1.2, 1, 1.35]} castShadow>
        <sphereGeometry args={[1.25, 20, 16]} />
        <meshStandardMaterial color="#F08A3E" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.5, 8]} />
        <meshStandardMaterial color="#4CAF6E" />
      </mesh>
      <mesh position={[0, 1.9, 1.62]}>
        <boxGeometry args={[0.9, 0.7, 0.05]} />
        <meshStandardMaterial color="#FFE7A3" emissive="#FFC94D" emissiveIntensity={0.6} />
      </mesh>
      <Wheel position={[-1.25, 0.6, 1.1]} spinRef={wheelRefs[0]} r={0.6} w={0.2} rim="#F5C451" />
      <Wheel position={[1.25, 0.6, 1.1]} spinRef={wheelRefs[1]} r={0.6} w={0.2} rim="#F5C451" />
      <Wheel position={[-1.25, 0.6, -1.1]} spinRef={wheelRefs[2]} r={0.6} w={0.2} rim="#F5C451" />
      <Wheel position={[1.25, 0.6, -1.1]} spinRef={wheelRefs[3]} r={0.6} w={0.2} rim="#F5C451" />
    </group>
  )
})

const Sled = forwardRef(function Sled({ wheelRefs = [] }, ref) {
  return (
    <group ref={ref}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 3]} />
        <meshStandardMaterial color="#4E8BFF" />
      </mesh>
      <mesh position={[0, 1.3, -1.2]}>
        <boxGeometry args={[1.8, 0.8, 0.3]} />
        <meshStandardMaterial color="#E9F2FF" />
      </mesh>
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.35, 0]}>
          <boxGeometry args={[0.12, 0.12, 3.4]} />
          <meshStandardMaterial color="#C9CDD6" metalness={0.6} />
        </mesh>
      ))}
      <Wheel position={[-0.8, 0.3, 1]} spinRef={wheelRefs[0]} r={0.3} w={0.15} />
      <Wheel position={[0.8, 0.3, 1]} spinRef={wheelRefs[1]} r={0.3} w={0.15} />
    </group>
  )
})

const Train = forwardRef(function Train({ wheelRefs = [] }, ref) {
  return (
    <group ref={ref}>
      <mesh position={[0, 1.2, 0.4]} castShadow>
        <boxGeometry args={[1.8, 1.4, 3.2]} />
        <meshStandardMaterial color="#2E7D4F" />
      </mesh>
      <mesh position={[0, 2.3, -0.6]} castShadow>
        <boxGeometry args={[1.8, 1, 1.4]} />
        <meshStandardMaterial color="#B23A3A" />
      </mesh>
      <mesh position={[0, 2.4, 1.4]}>
        <coneGeometry args={[0.6, 1.4, 10]} />
        <meshStandardMaterial color="#4CAF6E" />
      </mesh>
      <mesh position={[0, 3.2, 1.4]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color="#F5C451" emissive="#F5C451" emissiveIntensity={1} />
      </mesh>
      <Wheel position={[-0.95, 0.45, 1.1]} spinRef={wheelRefs[0]} r={0.45} />
      <Wheel position={[0.95, 0.45, 1.1]} spinRef={wheelRefs[1]} r={0.45} />
      <Wheel position={[-0.95, 0.45, -1]} spinRef={wheelRefs[2]} r={0.45} />
      <Wheel position={[0.95, 0.45, -1]} spinRef={wheelRefs[3]} r={0.45} />
    </group>
  )
})

const MODELS = { car: MobileCar, scooter: Scooter, bus: Bus, kart: Kart, pumpkin: Pumpkin, sled: Sled, tree: Train }

const Vehicle = forwardRef(function Vehicle({ id = 'car', wheelRefs }, ref) {
  const M = MODELS[id] || MobileCar
  return <M ref={ref} wheelRefs={wheelRefs} />
})

export default Vehicle
