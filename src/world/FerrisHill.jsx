import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FERRIS_HILL } from './layout.js'

// 관람차 언덕: 돌로 쌓은 둥근 축대(높이 H) 위 평지에 관람차가 서 있고, 동쪽(+x)으로 속이 꽉 찬 돌계단이 나 있다.
// (예전의 흙 비탈은 그늘져서 아래가 뚫린 것처럼 보여, 분명히 채워진 축대로 바꿨다)
// 높이 규칙(걸을 때 발밑 높이, 막힌 비탈)은 layout.js의 walkHeight, walkBlocked와 맞춘다.
const { x: HX, z: HZ, top: TOP, base: BASE, h: H, stairHalf: SH, steps: STEPS } = FERRIS_HILL
const TREAD = (BASE - TOP) / STEPS

function Batch({ items, color, geometry, ...mat }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    items.forEach((it, i) => {
      o.position.set(...it.pos)
      o.rotation.set(...(it.rot || [0, 0, 0]))
      o.scale.set(...it.scale)
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [items])
  return (
    <instancedMesh ref={ref} args={[geometry, null, items.length]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.85} {...mat} />
    </instancedMesh>
  )
}

const BOX = new THREE.BoxGeometry(1, 1, 1)
const CYL = new THREE.CylinderGeometry(1, 1, 1, 10)

export default function FerrisHill() {
  // 축대 돌 텍스처 (숲 바위와 같은 그림). 불러오는 동안 화면이 멈추지 않게 비동기로 읽는다.
  const stone = useMemo(() => {
    const t = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}models/forest/rocks.jpg`)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(10, 1.2)
    return t
  }, [])

  const parts = useMemo(() => {
    const steps = []
    const cheeks = []
    const posts = []
    const rails = []
    for (let i = 0; i < STEPS; i++) {
      const d = BASE - (i + 0.5) * TREAD // 언덕 중심에서 이 칸까지 거리
      const y = (i + 1) * (H / STEPS)
      steps.push({ pos: [d, y / 2, 0], scale: [TREAD + 0.02, y, SH * 2] })
    }
    // 계단 양옆 돌벽과 난간
    for (const side of [-1, 1]) {
      const z = side * (SH + 0.18)
      const ang = Math.atan2(H, BASE - TOP)
      for (let i = 0; i < STEPS; i++) {
        const d = BASE - (i + 0.5) * TREAD
        const y = (i + 1) * (H / STEPS) + 0.18
        cheeks.push({ pos: [d, y / 2, z], scale: [TREAD + 0.02, y, 0.36] })
      }
      for (let i = 0; i <= 4; i++) {
        const d = BASE - (i / 4) * (BASE - TOP)
        const y = Math.min(H, ((BASE - d) / (BASE - TOP)) * H)
        posts.push({ pos: [d, y + 0.75, z], scale: [0.06, 1.0, 0.06] })
      }
      rails.push({ pos: [(BASE + TOP) / 2, H / 2 + 1.2, z], rot: [0, 0, -ang], scale: [Math.hypot(BASE - TOP, H), 0.07, 0.07] })
    }
    // 꼭대기 가장자리 난간 (계단 입구는 비운다)
    const ring = []
    const ringRails = []
    const N = 40
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      const px = Math.cos(a) * (TOP - 0.25)
      const pz = Math.sin(a) * (TOP - 0.25)
      if (px > 0 && Math.abs(pz) < SH + 0.4) continue
      ring.push({ pos: [px, H + 0.5, pz], scale: [0.05, 1.0, 0.05] })
      const b = ((i + 1) / N) * Math.PI * 2
      const qx = Math.cos(b) * (TOP - 0.25)
      const qz = Math.sin(b) * (TOP - 0.25)
      if (qx > 0 && Math.abs(qz) < SH + 0.4) continue
      ringRails.push({ pos: [(px + qx) / 2, H + 0.95, (pz + qz) / 2], rot: [0, -Math.atan2(qz - pz, qx - px), 0], scale: [Math.hypot(qx - px, qz - pz), 0.06, 0.06] })
    }
    return { steps, cheeks, posts, rails, ring, ringRails }
  }, [])

  return (
    <group position={[HX, 0, HZ]}>
      {/* 돌 축대: 옆면 + 위 테두리 갓돌 */}
      <mesh position={[0, H / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[TOP, TOP + 0.35, H, 48, 1, true]} />
        <meshStandardMaterial map={stone} color="#C9C2B2" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, H + 0.035, 0]} receiveShadow>
        <ringGeometry args={[TOP - 0.45, TOP + 0.05, 48]} />
        <meshStandardMaterial color="#B9B09A" roughness={0.9} />
      </mesh>
      {/* 축대 아래 풀숲 띠: 땅과 만나는 선을 자연스럽게 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]} receiveShadow>
        <ringGeometry args={[TOP + 0.3, TOP + 1.6, 48]} />
        <meshStandardMaterial color="#5F7F4C" roughness={1} />
      </mesh>
      {/* 꼭대기 돌바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, H + 0.02, 0]} receiveShadow>
        <circleGeometry args={[TOP - 0.1, 48]} />
        <meshStandardMaterial color="#CFC5A7" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, H + 0.03, 0]}>
        <ringGeometry args={[TOP - 0.9, TOP - 0.75, 64]} />
        <meshStandardMaterial color="#9E946F" roughness={1} />
      </mesh>
      <Batch items={parts.steps} color="#BDB29A" geometry={BOX} />
      <Batch items={parts.cheeks} color="#8C8570" geometry={BOX} />
      <Batch items={parts.posts} color="#5E4E38" geometry={CYL} />
      <Batch items={parts.rails} color="#A08A62" geometry={BOX} />
      <Batch items={parts.ring} color="#5E4E38" geometry={CYL} />
      <Batch items={parts.ringRails} color="#A08A62" geometry={BOX} />
      {/* 계단 아래 디딤돌 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BASE + 1.4, 0.07, 0]} receiveShadow>
        <planeGeometry args={[2.8, SH * 2 + 0.8]} />
        <meshStandardMaterial color="#BDB29A" roughness={0.95} />
      </mesh>
    </group>
  )
}
