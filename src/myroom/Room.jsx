import { useMemo } from 'react'
import * as THREE from 'three'

export const ROOM_HALF = 10

// 이미지 파일 없이 나무 판자 벽 텍스처를 캔버스로 그린다.
function useWoodTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 512
    const g = c.getContext('2d')
    const plank = 64
    for (let x = 0; x < c.width; x += plank) {
      const shade = 45 + Math.random() * 25
      g.fillStyle = `hsl(25, 42%, ${shade * 0.45}%)`
      g.fillRect(x, 0, plank, c.height)
      for (let i = 0; i < 14; i++) {
        g.strokeStyle = `rgba(20, 10, 4, ${0.15 + Math.random() * 0.25})`
        g.lineWidth = 1 + Math.random() * 1.5
        const gx = x + 6 + Math.random() * (plank - 12)
        g.beginPath()
        g.moveTo(gx, 0)
        g.bezierCurveTo(gx + 6, 170, gx - 6, 340, gx + 3, 512)
        g.stroke()
      }
      for (let i = 0; i < 2; i++) {
        g.fillStyle = 'rgba(15, 8, 3, 0.55)'
        g.beginPath()
        g.ellipse(x + 10 + Math.random() * 44, Math.random() * 512, 3, 2, 0, 0, Math.PI * 2)
        g.fill()
      }
      g.fillStyle = 'rgba(10, 5, 2, 0.8)'
      g.fillRect(x, 0, 3, c.height)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 1)
    return tex
  }, [])
}

export default function Room() {
  const wood = useWoodTexture()
  const size = ROOM_HALF * 2
  const wallH = 8

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#D2945A" roughness={0.95} />
      </mesh>
      {/* 벽 4개는 모두 방 안쪽만 그린다. 카메라가 벽 밖으로 나가면 그 벽은 뒷면이라 보이지 않아 시야를 가리지 않는다. */}
      {[
        [[0, wallH / 2, -ROOM_HALF], 0],
        [[ROOM_HALF, wallH / 2, 0], -Math.PI / 2],
        [[0, wallH / 2, ROOM_HALF], Math.PI],
        [[-ROOM_HALF, wallH / 2, 0], Math.PI / 2],
      ].map(([pos, rot]) => (
        <mesh key={rot} position={pos} rotation={[0, rot, 0]} receiveShadow>
          <planeGeometry args={[size, wallH]} />
          <meshStandardMaterial map={wood} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
