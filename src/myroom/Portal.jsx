import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { ROOM_HALF } from './Room.jsx'

// 오른쪽 벽에 붙은 상점 포탈. 위치는 MyRoom에서 근접 판정에 같이 쓴다.
export const PORTAL_POS = [ROOM_HALF - 0.12, 1.6, -4]

export default function Portal({ active, onClick }) {
  const ring = useRef()
  const inner = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ring.current.material.emissiveIntensity = 2.2 + Math.sin(t * 3) * 0.6 + (active ? 1.5 : 0)
    inner.current.material.opacity = 0.75 + Math.sin(t * 2) * 0.1
    inner.current.rotation.z = t * 0.4
  })

  return (
    <group
      position={PORTAL_POS}
      rotation={[0, -Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation()
        // 시점을 돌리려고 드래그한 경우는 클릭으로 치지 않는다
        if (e.delta > 6) return
        onClick()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <group scale={[1, 1.4, 1]}>
        <mesh ref={ring}>
          <torusGeometry args={[0.9, 0.07, 16, 64]} />
          <meshStandardMaterial color="#3d7bff" emissive="#2f6bff" toneMapped={false} />
        </mesh>
        <mesh ref={inner} position={[0, 0, -0.01]}>
          <circleGeometry args={[0.88, 48]} />
          <meshBasicMaterial color="#0d2a7a" transparent />
        </mesh>
      </group>
      <pointLight color="#4d8dff" intensity={active ? 14 : 7} distance={6} position={[0, 0, 0.8]} />
      <Html position={[0, 2.1, 0]} center zIndexRange={[1, 0]}>
        <div className="portal-label">상점 포탈</div>
      </Html>
    </group>
  )
}
