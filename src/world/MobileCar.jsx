import { forwardRef } from 'react'

// 스토리 영상의 "모바일 로봇" 자동차: 베이지색 각진 차체, 지붕 난간, 지붕 위 회색 카메라,
// 청록색 둥근 전조등, 세로 그릴, 큰 검은 바퀴와 베이지 휠. 앞쪽이 +z.
const BODY = '#F2C9A0'
const BODY_LIGHT = '#F7D9B8'
const TRIM = '#D9A982'
const GLASS = '#D6F1F3'
const DARK = '#3A3D45'
const TEAL = '#4FBFA8'

function Wheel({ position, spinRef }) {
  return (
    <group position={position}>
      <group ref={spinRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.45, 24]} />
          <meshStandardMaterial color="#26282E" roughness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.34, 0.34, 0.47, 20]} />
          <meshStandardMaterial color="#E8C99A" />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[(i * Math.PI) / 3, 0, 0]} position={[Math.sign(position[0]) * 0.24, 0, 0]}>
            <boxGeometry args={[0.02, 0.6, 0.07]} />
            <meshStandardMaterial color="#9C7A55" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

const MobileCar = forwardRef(function MobileCar({ wheelRefs = [], headlightsOn = true }, ref) {
  return (
    <group ref={ref}>
      {/* 아래 차체 · 범퍼 */}
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.9, 3.2]} />
        <meshStandardMaterial color={BODY} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.62, 1.68]} castShadow>
        <boxGeometry args={[2.1, 0.32, 0.32]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      <mesh position={[0, 0.62, -1.66]}>
        <boxGeometry args={[2.05, 0.28, 0.25]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      {/* 보닛 */}
      <mesh position={[0, 1.47, 1.05]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[1.96, 0.18, 1.1]} />
        <meshStandardMaterial color={BODY_LIGHT} />
      </mesh>
      {/* 객실 */}
      <mesh position={[0, 1.95, -0.45]} castShadow>
        <boxGeometry args={[1.94, 1.05, 2.25]} />
        <meshStandardMaterial color={BODY_LIGHT} roughness={0.6} />
      </mesh>
      {/* 앞유리 · 옆창 */}
      <mesh position={[0, 2.0, 0.69]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[1.66, 0.72, 0.04]} />
        <meshStandardMaterial color={GLASS} emissive="#bfeff5" emissiveIntensity={0.25} roughness={0.1} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.98, 2.05, -0.05]}>
            <boxGeometry args={[0.04, 0.6, 0.85]} />
            <meshStandardMaterial color={GLASS} emissive="#bfeff5" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[s * 0.98, 2.05, -1.05]}>
            <boxGeometry args={[0.04, 0.6, 0.75]} />
            <meshStandardMaterial color={GLASS} emissive="#bfeff5" emissiveIntensity={0.2} />
          </mesh>
          {/* 사이드 미러 */}
          <mesh position={[s * 1.18, 1.62, 0.62]}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#F5E6D3" />
          </mesh>
          <mesh position={[s * 1.06, 1.62, 0.62]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
            <meshStandardMaterial color={TRIM} />
          </mesh>
          {/* 문 손잡이 */}
          <mesh position={[s * 1.01, 1.3, 0.1]}>
            <boxGeometry args={[0.04, 0.06, 0.3]} />
            <meshStandardMaterial color="#8B6A4A" />
          </mesh>
        </group>
      ))}
      {/* 그릴 */}
      {[-0.45, -0.27, -0.09, 0.09, 0.27, 0.45].map((x) => (
        <mesh key={x} position={[x, 1.02, 1.61]}>
          <boxGeometry args={[0.06, 0.42, 0.02]} />
          <meshStandardMaterial color="#2B2F3A" />
        </mesh>
      ))}
      {/* 청록 전조등 */}
      {[-0.72, 0.72].map((x) => (
        <group key={x} position={[x, 1.05, 1.61]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.06, 20]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
          <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
            <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={headlightsOn ? 1.2 : 0.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* 지붕 난간 */}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 2.62, -0.45]}>
          <boxGeometry args={[0.06, 0.06, 2.1]} />
          <meshStandardMaterial color={BODY} />
        </mesh>
      ))}
      {[0.6, -1.5].map((z) => (
        <mesh key={z} position={[0, 2.62, z]}>
          <boxGeometry args={[1.86, 0.06, 0.06]} />
          <meshStandardMaterial color={BODY} />
        </mesh>
      ))}
      {[-0.9, 0.9].flatMap((x) => [0.5, -0.1, -0.7, -1.4].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 2.54, z]}>
          <boxGeometry args={[0.05, 0.16, 0.05]} />
          <meshStandardMaterial color={BODY} />
        </mesh>
      )))}
      {/* 지붕 위 카메라 */}
      <mesh position={[0, 2.55, -0.35]}>
        <boxGeometry args={[0.8, 0.12, 0.7]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh position={[0, 2.9, -0.35]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 10]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh position={[0, 3.25, -0.3]} castShadow>
        <boxGeometry args={[1.15, 0.24, 0.75]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh position={[0, 3.25, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
        <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={1} toneMapped={false} />
      </mesh>
      {/* 바퀴 */}
      <Wheel position={[-1.08, 0.55, 1.05]} spinRef={wheelRefs[0]} />
      <Wheel position={[1.08, 0.55, 1.05]} spinRef={wheelRefs[1]} />
      <Wheel position={[-1.08, 0.55, -1.05]} spinRef={wheelRefs[2]} />
      <Wheel position={[1.08, 0.55, -1.05]} spinRef={wheelRefs[3]} />
    </group>
  )
})

export default MobileCar
