import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// 챕터 1: 출발 점검을 마치면 자동차 옆 받침대 위에 나타나는 모바일 로봇 운전면허증
export const LICENSE_POS = [2.2, 0, 2.9]

function useCardTexture(name) {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 320
    const g = c.getContext('2d')
    g.fillStyle = '#EAF3FF'
    g.fillRect(0, 0, 512, 320)
    g.fillStyle = '#2F6BFF'
    g.fillRect(0, 0, 512, 70)
    g.fillStyle = '#fff'
    g.font = 'bold 34px sans-serif'
    g.fillText('도로랜드 운전면허증', 24, 48)
    // 사진 칸: 초록 로봇 얼굴
    g.fillStyle = '#D6E4F5'
    g.fillRect(24, 96, 140, 176)
    g.fillStyle = '#5BBF8A'
    g.beginPath()
    g.arc(94, 176, 50, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#1E2A3A'
    g.beginPath()
    g.arc(76, 172, 8, 0, Math.PI * 2)
    g.arc(112, 172, 8, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#5BBF8A'
    g.fillRect(90, 108, 8, 22)
    g.fillStyle = '#1E2A3A'
    g.font = 'bold 34px sans-serif'
    g.fillText(name, 188, 130)
    g.font = '24px sans-serif'
    g.fillStyle = '#4A5568'
    g.fillText('모바일 로봇 1종', 188, 176)
    g.fillText('자동차 수리 통과', 188, 214)
    g.fillStyle = '#F5C451'
    g.beginPath()
    g.arc(440, 254, 34, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#fff'
    g.font = 'bold 30px sans-serif'
    g.fillText('D', 430, 265)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [name])
}

export default function License({ name }) {
  const card = useRef()
  const tex = useCardTexture(name)
  useFrame((s, dt) => {
    if (!card.current) return
    card.current.rotation.y += dt * 0.9
    card.current.position.y = 1.75 + Math.sin(s.clock.elapsedTime * 2) * 0.08
  })
  return (
    <group position={LICENSE_POS}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.45, 0.9, 20]} />
        <meshStandardMaterial color="#F7F3EA" />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 20]} />
        <meshStandardMaterial color="#F5C451" metalness={0.4} />
      </mesh>
      <group ref={card} position={[0, 1.75, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.12, 0.7, 0.03]} />
          {[0, 1, 2, 3].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color="#2F6BFF" />)}
          <meshStandardMaterial attach="material-4" map={tex} />
          <meshStandardMaterial attach="material-5" map={tex} />
        </mesh>
      </group>
      <pointLight position={[0, 1.8, 0.6]} color="#9CC2FF" intensity={2} distance={3} />
      <Html position={[0, 2.6, 0]} center zIndexRange={[1, 0]}>
        <div className="portal-label">🪪 운전면허증</div>
      </Html>
    </group>
  )
}
