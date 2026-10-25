import { Html } from '@react-three/drei'
import MobileCar from '../world/MobileCar.jsx'

export const CAR_POS = [4.5, 0, 4.5]

// 챕터 1에서 자일로에게 받는 모바일 로봇 자동차 (월드에서 타는 것과 같은 모형)
export default function Car({ checked }) {
  return (
    <group position={CAR_POS} rotation={[0, -Math.PI / 1.4, 0]}>
      <group scale={0.75}>
        <MobileCar headlightsOn={checked} />
      </group>
      <Html position={[0, 3.2, 0]} center zIndexRange={[1, 0]}>
        <div className="portal-label">{checked ? '모바일 로봇 · 점검 완료' : '모바일 로봇'}</div>
      </Html>
    </group>
  )
}
