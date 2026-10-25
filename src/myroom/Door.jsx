import { Html } from '@react-three/drei'
import { ROOM_HALF } from './Room.jsx'

export const DOOR_POS = [-5, 0, -ROOM_HALF + 0.8]

// 뒤쪽 벽의 외출 문. 챕터 0에서는 잠겨 있다.
export default function Door({ locked }) {
  return (
    <group position={[DOOR_POS[0], 0, -ROOM_HALF + 0.06]}>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2, 3.3, 0.12]} />
        <meshStandardMaterial color="#5B3A22" />
      </mesh>
      <mesh position={[0, 1.55, 0.05]}>
        <boxGeometry args={[1.7, 3.05, 0.1]} />
        <meshStandardMaterial color={locked ? '#9C7A5B' : '#C99A6B'} />
      </mesh>
      <mesh position={[0.6, 1.5, 0.14]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#F5C451" metalness={0.6} roughness={0.3} />
      </mesh>
      <Html position={[0, 3.7, 0]} center zIndexRange={[1, 0]}>
        <div className="portal-label">{locked ? '외출 문 · 잠김' : '외출 문'}</div>
      </Html>
    </group>
  )
}
