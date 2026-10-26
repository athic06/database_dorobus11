import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// 동물 모델 (public/models/animals, 출처와 라이선스는 같은 폴더 CREDITS.txt)
// 모델마다 원래 크기와 바라보는 방향이 달라서, 키(height)와 방향(yaw)을 맞춰 앞쪽이 +z가 되게 놓는다.
const BASE = `${import.meta.env.BASE_URL}models/animals/`
const KINDS = {
  giraffe: { file: 'giraffe.glb', height: 5.4, yaw: Math.PI / 2 },
  elephant: { file: 'elephant.glb', height: 3.3, yaw: -Math.PI / 2 },
  lion: { file: 'lion.glb', height: 1.5, yaw: 0 },
  duck: { file: 'duck.glb', height: 1.3, yaw: -Math.PI / 2 },
}
Object.values(KINDS).forEach((k) => useGLTF.preload(BASE + k.file))

function Model({ kind }) {
  const k = KINDS[kind]
  const { scene } = useGLTF(BASE + k.file)
  const object = useMemo(() => {
    // 같은 모델을 여러 마리 세워도 도형과 재질은 함께 쓴다 (clone은 메시만 복사)
    const o = scene.clone(true)
    const box = new THREE.Box3().setFromObject(o)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = k.height / size.y
    o.scale.setScalar(s)
    o.position.set(-center.x * s, -box.min.y * s, -center.z * s)
    o.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })
    const turn = new THREE.Group()
    turn.rotation.y = k.yaw
    turn.add(o)
    return turn
  }, [scene, k])
  return <primitive object={object} />
}

// position, rotation(앞쪽 기준 y 회전), scale(1이면 기본 키)
export function Animal({ kind, position, rotation = 0, scale = 1 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <Suspense fallback={null}>
        <Model kind={kind} />
      </Suspense>
    </group>
  )
}
