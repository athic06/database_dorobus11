import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { PROMENADE_SITES } from './layout.js'

// One draw call per material across all four gardens.
function GardenParts({ items, color, round = false }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const object = new THREE.Object3D()
    items.forEach((item, i) => {
      object.position.set(...item[0]); object.scale.set(...item[1]); object.updateMatrix()
      ref.current.setMatrixAt(i, object.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={ref} args={[null, null, items.length]} castShadow receiveShadow>
    {round ? <sphereGeometry args={[1, 16, 10]} /> : <boxGeometry />}
    <meshStandardMaterial color={color} roughness={0.6} />
  </instancedMesh>
}
export default function Promenade() {
  const pieces = useMemo(() => {
    const posts = [], slats = [], seats = [], leaves = [], flowers = []
    for (const [x,,z] of PROMENADE_SITES) {
      for (const dx of [-4,4]) for (const dz of [-3,3]) posts.push([[x+dx,1.8,z+dz],[0.22,3.6,0.22]])
      for (const dz of [-3,3]) posts.push([[x,3.5,z+dz],[8.5,0.3,0.2]])
      for (let i=0;i<13;i++) slats.push([[x-4+i*2/3,3.7,z],[0.15,0.2,7]])
      for (const dx of [-3,3]) {
        seats.push([[x+dx,0.7,z],[0.9,0.18,2.6]],[[x+dx,1.05,z-1.2],[0.9,0.8,0.12]])
        for (const dz of [-0.9,0.9]) posts.push([[x+dx,0.32,z+dz],[0.65,0.64,0.15]])
      }
      for (let i=0;i<28;i++) {
        const a=i*Math.PI*2/28
        // Keep the north and south entries clear.
        if (Math.abs(Math.cos(a))<0.3) continue
        leaves.push([[x+Math.cos(a)*8.4,0.38,z+Math.sin(a)*8.4],[1.05,0.55,1.05]])
        flowers.push([[x+Math.cos(a)*8.4,0.84,z+Math.sin(a)*8.4],[0.22,0.14,0.22]])
      }
    }
    return { posts, slats, seats, leaves, flowers }
  }, [])
  return <group>
    {PROMENADE_SITES.map((pos,i) => <group position={pos} key={i}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.025,0]} receiveShadow><circleGeometry args={[10,64]} /><meshStandardMaterial color="#DCD7C9" roughness={0.95} /></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.035,0]}><ringGeometry args={[9.5,9.65,64]} /><meshStandardMaterial color="#A9AA96" /></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.04,0]}><ringGeometry args={[5.9,6,64]} /><meshStandardMaterial color="#BAA574" /></mesh>
    </group>)}
    <GardenParts items={pieces.posts} color="#35676A" />
    <GardenParts items={pieces.slats} color="#D2B78A" />
    <GardenParts items={pieces.seats} color="#B39670" />
    <GardenParts items={pieces.leaves} color="#688D70" round />
    <GardenParts items={pieces.flowers} color="#EDD4BD" round />
  </group>
}
