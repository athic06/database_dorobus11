import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FERRIS_HILL } from './layout.js'

// 관람차 언덕: 둥근 흙 언덕 위 평지에 관람차가 서 있고, 동쪽(+x)으로 돌계단이 나 있다.
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
  // 언덕 단면: 꼭대기 평지 → 부드럽게 내려가는 비탈
  const mound = useMemo(() => {
    const pts = [new THREE.Vector2(0, H)]
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      const r = TOP + (BASE + 0.6 - TOP) * t
      const k = t * t * (3 - 2 * t)
      pts.push(new THREE.Vector2(r, H * (1 - k)))
    }
    return new THREE.LatheGeometry(pts, 64)
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
      const len = BASE - TOP + 0.6
      const ang = Math.atan2(H, BASE - TOP)
      cheeks.push({ pos: [(BASE + TOP) / 2, H / 2, z], rot: [0, 0, -ang], scale: [Math.hypot(len, H), 0.5, 0.36] })
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
      <mesh geometry={mound} receiveShadow castShadow>
        <meshStandardMaterial color="#6F8B55" roughness={1} />
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
