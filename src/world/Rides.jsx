import { createCoasterTrack } from './rideGeometry.js'
import { Water } from './Terrain.jsx'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FERRIS_HILL, PLACES } from './layout.js'
import FerrisHill from './FerrisHill.jsx'
import { Label } from './Landmarks.jsx'
import MergeStatic from './MergeStatic.jsx'

const TAU = Math.PI * 2
const CAR_P = new THREE.Vector3() // 롤러코스터 차량 위치 계산용 (매 프레임 새로 만들지 않게)
const CAR_T = new THREE.Vector3()
const IVORY = '#F2E9D8', TEAL = '#276B70', GOLD = '#C9A364', INK = '#253B48'
const paint = { metalness: 0.32, roughness: 0.3 }

// Repeated structural parts share a draw call, including their shadow pass.
export function Parts({ items, color = IVORY, shape = 'box', glow = 0, ...props }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const obj = new THREE.Object3D()
    items.forEach((p, i) => {
      obj.position.set(...p.pos)
      obj.rotation.set(...(p.rot || [0, 0, 0]))
      obj.quaternion.copy(p.quat || obj.quaternion)
      obj.scale.set(...(p.scale || [1, 1, 1]))
      obj.updateMatrix()
      ref.current.setMatrixAt(i, obj.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={ref} args={[null, null, items.length]} castShadow={!glow} receiveShadow {...props}>
    {shape === 'sphere' ? <sphereGeometry args={[1, 12, 8]} /> : shape === 'cylinder' ? <cylinderGeometry args={[1, 1, 1, 12]} /> : <boxGeometry />}
    <meshStandardMaterial color={color} {...paint} emissive={color} emissiveIntensity={glow} />
  </instancedMesh>
}

export function beam(a, b, radius = 0.1) {
  const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b)
  const delta = to.clone().sub(from)
  return { pos: from.add(to).multiplyScalar(0.5).toArray(), scale: [radius, delta.length(), radius], quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()) }
}
function Ring({ radius, tube = 0.08, color = GOLD, ...props }) {
  return <mesh {...props}><torusGeometry args={[radius, tube, 10, 96]} /><meshStandardMaterial color={color} {...paint} /></mesh>
}
function Drum({ radius, height, color = IVORY, ...props }) {
  return <mesh castShadow receiveShadow {...props}><cylinderGeometry args={[radius, radius, height, 64]} /><meshStandardMaterial color={color} {...paint} /></mesh>
}
function Orb({ color = IVORY, ...props }) {
  return <mesh castShadow {...props}><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={color} {...paint} /></mesh>
}
function Box({ size, color = IVORY, ...props }) {
  return <mesh castShadow receiveShadow {...props}><boxGeometry args={size} /><meshStandardMaterial color={color} {...paint} /></mesh>
}

export function FerrisWheel({ stopped }) {
  const wheel = useRef(), cabins = useRef([])
  const radius = 10, height = 13.5, count = 12
  const structure = useMemo(() => {
    const legs = [], spokes = [], braces = [], bulbs = []
    for (const z of [-1.7, 1.7]) {
      for (const x of [-3.1, 3.1]) legs.push(beam([x, 0.4, z * 1.5], [0, height, z], 0.24))
      for (let i = 0; i < count; i++) {
        const a = i * TAU / count
        spokes.push(beam([0, 0, z * 0.6], [Math.cos(a) * radius, Math.sin(a) * radius, z * 0.6], 0.065))
        braces.push(beam([Math.cos(a) * radius, Math.sin(a) * radius, -1.02], [Math.cos(a + TAU / count) * radius, Math.sin(a + TAU / count) * radius, 1.02], 0.05))
      }
    }
    for (let i = 0; i < 96; i++) {
      const a = i * TAU / 96
      bulbs.push({ pos: [Math.cos(a) * radius, Math.sin(a) * radius, 1.16], scale: [0.075, 0.075, 0.075] })
    }
    return { legs, spokes, braces, bulbs }
  }, [])
  useFrame((_, delta) => {
    if (!stopped) wheel.current.rotation.z += Math.min(delta, 0.05) * 0.085
    cabins.current.forEach(c => { if (c) c.rotation.z = -wheel.current.rotation.z })
  })
  return <>
  <FerrisHill />
  <group position={[PLACES.ferris.pos[0], FERRIS_HILL.h, PLACES.ferris.pos[2]]} rotation={[0, Math.PI / 2, 0]}>
    <Drum radius={4.1} height={0.22} position={[0, 0.11, 0]} color="#DED8CA" />
    <Parts items={structure.legs} shape="cylinder" color={TEAL} />
    <Parts items={[-1, 1].flatMap(x => [-1, 1].map(z => ({ pos: [x * 3.1, 0.28, z * 2.55], scale: [1.1, 0.56, 1.1] })))} color={IVORY} />
    <Parts items={[beam([0, height, -2], [0, height, 2], 0.52)]} shape="cylinder" color={GOLD} />
    <group position={[0, height, 0]} ref={wheel} userData={{ dynamic: true }}>
      <MergeStatic>
      {[-1.02, 1.02].map(z => <group key={z}>
        <Ring radius={radius} tube={0.16} position={[0, 0, z]} color={IVORY} />
        <Ring radius={radius - 0.45} tube={0.06} position={[0, 0, z]} />
        <Ring radius={1.15} tube={0.18} position={[0, 0, z]} color={TEAL} />
      </group>)}
      <Parts items={structure.spokes} shape="cylinder" color={IVORY} />
      <Parts items={structure.braces} shape="cylinder" color={GOLD} />
      <Parts items={structure.bulbs} shape="sphere" color="#FFE4AE" glow={stopped ? 0 : 2} />
      {Array.from({ length: count }, (_, i) => {
        const a = i * TAU / count, c = [TEAL, '#C57160', '#4D7894', GOLD][i % 4]
        return <group key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]} ref={el => cabins.current[i] = el} userData={{ dynamic: true }}><MergeStatic>
          <Parts items={[beam([0, 0, 0], [0, -0.7, 0], 0.065)]} shape="cylinder" color={GOLD} />
          <group position={[0, -1.55, 0]}>
            <Drum radius={0.84} height={0.65} position={[0, -0.4, 0]} color={c} />
            <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.76, 0.8, 0.65, 12]} /><meshStandardMaterial color="#A5D2D8" metalness={0.45} roughness={0.18} transparent opacity={0.55} depthWrite={false} /></mesh>
            <Drum radius={0.91} height={0.16} position={[0, 0.63, 0]} color={c} />
            <Parts items={[-0.22, 0.22].flatMap(x => [-0.22, 0.22].map(z => ({ pos: [x, 0.73, z], scale: [0.4, 0.025, 0.4] })))} color="#294E6C" />
            <Parts items={Array.from({ length: 6 }, (_, j) => { const b = j * TAU / 6; return beam([Math.cos(b) * 0.78, -0.12, Math.sin(b) * 0.78], [Math.cos(b) * 0.78, 0.61, Math.sin(b) * 0.78], 0.035) })} shape="cylinder" color={IVORY} />
            <Ring radius={0.85} tube={0.035} position={[0, -0.7, 0]} rotation={[Math.PI / 2, 0, 0]} />
          </group>
        </MergeStatic></group>
      })}
      </MergeStatic>
    </group>
    <Label y={26}>관람차 · 태양광 발전</Label>
  </group>
  </>
}

function TrackTube({ curve, radius, color }) {
  return <mesh castShadow><tubeGeometry args={[curve, 240, radius, 8, true]} /><meshStandardMaterial color={color} {...paint} /></mesh>
}
export function RollerCoaster({ stopped }) {
  const cars = useRef([]), progress = useRef(0)
  const track = useMemo(() => {
    const center = createCoasterTrack(), ties = [], supports = [], feet = []
    const sample = (t, side) => {
      const p = center.getPointAt(t), tangent = center.getTangentAt(t)
      return p.add(new THREE.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(side))
    }
    const rails = [-0.62, 0.62].map(side => new THREE.CatmullRomCurve3(Array.from({ length: 180 }, (_, i) => sample(i / 180, side)), true, 'centripetal'))
    for (let i = 0; i < 110; i++) ties.push(beam(sample(i / 110, -0.85).toArray(), sample(i / 110, 0.85).toArray(), 0.07))
    for (let i = 0; i < 18; i++) {
      const p = center.getPointAt(i / 18)
      supports.push(beam([p.x, 0.3, p.z], [p.x, p.y - 0.18, p.z], 0.14))
      feet.push({ pos: [p.x, 0.16, p.z], scale: [0.75, 0.32, 0.75] })
      if (i % 3 === 0) supports.push(beam([p.x + 1.2, 0.3, p.z], [p.x, p.y * 0.7, p.z], 0.08))
    }
    return { center, rails, ties, supports, feet }
  }, [])
  useFrame((_, dt) => {
    if (!stopped) progress.current = (progress.current + Math.min(dt, 0.05) * 0.045) % 1
    cars.current.forEach((car, i) => {
      if (!car) return
      const t = (progress.current - i * 0.022 + 1) % 1
      const p = track.center.getPointAt(t, CAR_P), tangent = track.center.getTangentAt(t, CAR_T)
      car.position.copy(p)
      car.position.y += 0.48
      car.lookAt(p.x + tangent.x, p.y + 0.48 + tangent.y, p.z + tangent.z)
    })
  })
  return <group position={PLACES.coaster.pos}>
    <Water round position={[0, 0.105, 0]} scale={[8.5, 8.5, 1]} />
    <Ring radius={8.65} tube={0.15} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} color={IVORY} />
    {track.rails.map((curve, i) => <TrackTube key={i} curve={curve} radius={0.12} color={TEAL} />)}
    <Parts items={track.ties} shape="cylinder" color={GOLD} />
    <Parts items={track.supports} shape="cylinder" color={IVORY} />
    <Parts items={track.feet} color="#B7B9B1" />
    {[0, 1, 2].map(i => <group key={i} ref={el => cars.current[i] = el} userData={{ dynamic: true }}>
      <Box size={[1.3, 0.36, 1.8]} color={i === 0 ? '#C57160' : TEAL} />
      <Orb position={[0, 0.1, 0.77]} scale={[0.65, 0.38, 0.28]} color={i === 0 ? '#C57160' : TEAL} />
      {[-0.57, 0.57].map(x => <Box key={x} position={[x, 0.36, 0]} size={[0.16, 0.5, 1.55]} color={IVORY} />)}
      <Box position={[0, 0.38, -0.57]} size={[1.02, 0.6, 0.2]} color={INK} />
      <Box position={[0, 0.17, -0.1]} size={[0.95, 0.13, 0.85]} color={INK} />
      <Parts items={[beam([-0.48, 0.64, 0.25], [0.48, 0.64, 0.25], 0.045)]} shape="cylinder" color={GOLD} />
      <Parts items={[-0.64, 0.64].flatMap(x => [-0.55, 0.55].map(z => ({ pos: [x, -0.22, z], rot: [0, 0, Math.PI / 2], scale: [0.2, 0.12, 0.2] })))} shape="cylinder" color={INK} />
    </group>)}
    <Label y={18.5}>롤러코스터 · 강물 정화</Label>
  </group>
}

function Horse({ color }) {
  return <group>
    <Orb scale={[0.3, 0.4, 0.74]} color={color} />
    <Orb position={[0, 0.48, 0.47]} rotation={[0.35, 0, 0]} scale={[0.23, 0.58, 0.25]} color={color} />
    <Orb position={[0, 0.89, 0.69]} scale={[0.23, 0.25, 0.43]} color={color} />
    <Orb position={[0, 0.79, 0.99]} scale={[0.22, 0.18, 0.2]} color="#D4B9A0" />
    <Orb position={[0, 0.5, 0.3]} scale={[0.26, 0.55, 0.12]} color={GOLD} />
    <Orb position={[0, 0.35, -0.13]} scale={[0.34, 0.12, 0.36]} color={TEAL} />
    <Orb position={[0, -0.05, -0.8]} rotation={[-0.6, 0, 0]} scale={[0.13, 0.53, 0.13]} color={GOLD} />
    {[-1, 1].map(s => <group key={s}>
      <Orb position={[s * 0.13, 1.15, 0.62]} scale={[0.07, 0.2, 0.08]} color={color} />
      <Orb position={[s * 0.22, 0.96, 0.77]} scale={[0.035, 0.045, 0.035]} color={INK} />
    </group>)}
    <Parts items={[-1, 1].flatMap(s => [
      beam([s * 0.2, -0.15, 0.4], [s * 0.23, -0.52, 0.63], 0.095),
      beam([s * 0.23, -0.52, 0.63], [s * 0.23, -0.81, 0.42], 0.07),
      beam([s * 0.2, -0.1, -0.48], [s * 0.23, -0.43, -0.7], 0.1),
      beam([s * 0.23, -0.43, -0.7], [s * 0.23, -0.86, -0.61], 0.07),
    ])} shape="cylinder" color={color} />
    <Parts items={[-0.23, 0.23].flatMap(x => [0.42, -0.61].map(z => ({ pos: [x, -0.85, z], scale: [0.18, 0.13, 0.24] })))} color={GOLD} />
  </group>
}

export function Carousel({ stopped, locked = true, lit = !stopped }) {
  const spin = useRef(), horses = useRef([])
  const details = useMemo(() => {
    const bulbs = [], columns = []
    for (let i = 0; i < 64; i++) {
      const a = i * TAU / 64
      bulbs.push({ pos: [Math.cos(a) * 6.3, 5.9, Math.sin(a) * 6.3], scale: [0.065, 0.065, 0.065] })
    }
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8
      columns.push(beam([Math.cos(a) * 5.6, 0.6, Math.sin(a) * 5.6], [Math.cos(a) * 5.6, 5.9, Math.sin(a) * 5.6], 0.1))
    }
    return { bulbs, columns }
  }, [])
  const phase = useRef(0)
  useFrame((_, dt) => {
    if (stopped) return
    phase.current += Math.min(dt, 0.05)
    spin.current.rotation.y = phase.current * 0.24
    horses.current.forEach((h, i) => { if (h) h.position.y = 2 + Math.sin(phase.current * 1.6 + i * 1.2) * 0.28 })
  })
  return <group position={PLACES.carousel.pos}>
    <Drum radius={6.15} height={0.28} position={[0, 0.14, 0]} color={TEAL} />
    <Drum radius={5.95} height={0.24} position={[0, 0.4, 0]} />
    <Ring radius={5.98} position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} tube={0.045} />
    <Drum radius={0.85} height={5.3} position={[0, 3.15, 0]} color={TEAL} />
    {[0.7, 1.1, 4.9, 5.5].map(y => <Ring key={y} radius={0.87} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} />)}
    <Parts items={details.columns} shape="cylinder" color={GOLD} />
    <group ref={spin} userData={{ dynamic: true }}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = i * TAU / 8
        return <group key={i} position={[Math.cos(a) * 4.15, 0, Math.sin(a) * 4.15]} rotation={[0, -a, 0]}>
          <Parts items={[beam([0, 0.55, 0], [0, 5.7, 0], 0.045)]} shape="cylinder" color={GOLD} />
          <group ref={el => horses.current[i] = el} position={[0, 2, 0]} userData={{ dynamic: true }}><MergeStatic><Horse color={[IVORY, '#DCC5AA', '#BDCFCF', '#DFBDB4'][i % 4]} /></MergeStatic></group>
        </group>
      })}
    </group>
    <Drum radius={6.35} height={0.6} position={[0, 6.05, 0]} color={TEAL} />
    {[5.75, 6.35].map(y => <Ring key={y} radius={6.36} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} />)}
    {Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[0, 7.25, 0]} castShadow>
      <coneGeometry args={[6.4, 1.9, 6, 1, true, i * TAU / 16, TAU / 16]} />
      <meshStandardMaterial color={i % 2 ? IVORY : '#BB7361'} {...paint} side={THREE.DoubleSide} />
    </mesh>)}
    <Parts items={details.bulbs} shape="sphere" color="#FFE8B5" glow={lit ? 2 : 0} />
    <Drum radius={0.18} height={0.7} position={[0, 8.4, 0]} color={GOLD} />
    <Orb position={[0, 8.85, 0]} scale={[0.28, 0.28, 0.28]} color={GOLD} />
    <Label y={10.5} locked={locked}>회전목마</Label>
  </group>
}
