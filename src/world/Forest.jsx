// 길가 가로등 (나무와 숲은 KenneyForest.jsx)
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { LAMPS, seeded, groundHeight } from './layout.js'

const UP = new THREE.Vector3(0, 1, 0)
function tint(geometry, color, variation = 0, seed = 1) {
  const rnd = seeded(seed), base = new THREE.Color(color), c = new THREE.Color()
  const colors = new Float32Array(geometry.attributes.position.count * 3)
  for (let i = 0; i < colors.length / 3; i++) {
    c.copy(base).multiplyScalar(1 - variation * 0.5 + rnd() * variation).toArray(colors, i * 3)
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}
function join(parts) {
  const pieces = parts.map(g => { const n = g.index ? g.toNonIndexed() : g.clone(); n.deleteAttribute('uv'); g.dispose(); return n })
  const result = mergeGeometries(pieces)
  pieces.forEach(g => g.dispose())
  result.computeBoundingSphere()
  return result
}
function branch(a, b, r1, r2, color = '#73634A') {
  const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), delta = to.clone().sub(from)
  const g = new THREE.CylinderGeometry(r2, r1, delta.length(), 6, 1)
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, delta.normalize()))
  g.translate(...from.add(to).multiplyScalar(0.5).toArray())
  return tint(g, color, 0.2)
}
function Instances({ geometry, material, items, shadows = true }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const obj=new THREE.Object3D(), color=new THREE.Color()
    items.forEach((it,i)=>{
      obj.position.set(it.x,it.y||0,it.z); obj.rotation.set(0,it.r||0,0); obj.scale.setScalar(it.s||1); obj.updateMatrix()
      ref.current.setMatrixAt(i,obj.matrix)
      ref.current.setColorAt(i,color.setRGB(0.75+it.c*0.25,0.83+it.c*0.17,0.75+it.c*0.25))
    })
    ref.current.instanceMatrix.needsUpdate=true
    ref.current.instanceColor.needsUpdate=true
    ref.current.computeBoundingSphere()
  },[items])
  return <instancedMesh ref={ref} args={[geometry,material,items.length]} castShadow={shadows} receiveShadow />
}
export function ForestLamps({ night }) {
  const assets=useMemo(()=>{
    const wood=[],metal=[],glass=[]
    wood.push(branch([0,0,0],[0,3.7,0],0.17,0.12,'#8C7656'))
    metal.push(branch([0,0,0],[0,0.45,0],0.23,0.23,'#35493E'),branch([0,3.6,0],[0,3.6,0.85],0.06,0.06,'#35493E'),branch([0,3.1,0.85],[0,3.65,0.85],0.035,0.035,'#35493E'))
    const roof=tint(new THREE.ConeGeometry(0.43,0.25,4).rotateY(Math.PI/4).translate(0,3.2,0.85),'#35493E')
    metal.push(roof)
    metal.push(tint(new THREE.BoxGeometry(0.48,0.09,0.48).translate(0,2.61,0.85),'#35493E'))
    for(const x of [-0.21,0.21])for(const z of [-0.21,0.21])metal.push(branch([x,2.65,0.85+z],[x,3.08,0.85+z],0.025,0.025,'#35493E'))
    glass.push(tint(new THREE.BoxGeometry(0.32,0.38,0.32).translate(0,2.86,0.85),'#FFE2AA'))
    return {wood:join(wood),metal:join(metal),glass:join(glass),woodMat:new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.9}),metalMat:new THREE.MeshStandardMaterial({vertexColors:true,metalness:0.45,roughness:0.45}),lightMat:new THREE.MeshStandardMaterial({color:'#FFE3AC',emissive:'#FFD093',roughness:0.4})}
  },[])
  const items=useMemo(()=>LAMPS.map(l=>({...l,y:groundHeight(l.x,l.z),s:1,c:1})),[])
  assets.lightMat.emissiveIntensity=night?2.5:0.65
  useEffect(()=>()=>{for(const item of Object.values(assets))item.dispose()},[assets])
  return <group><Instances items={items} geometry={assets.wood} material={assets.woodMat} /><Instances items={items} geometry={assets.metal} material={assets.metalMat} /><Instances items={items} geometry={assets.glass} material={assets.lightMat} shadows={false} /></group>
}
