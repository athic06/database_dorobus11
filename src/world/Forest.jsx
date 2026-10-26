import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { TREES, LAMPS, DISTRICTS, PLACES, roadDistance, seeded, groundHeight, STORY_CLEARINGS } from './layout.js'

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
function leaf(a, b, width, color) {
  const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b)
  const g = new THREE.BufferGeometry()
  const len = from.distanceTo(to)
  g.setAttribute('position', new THREE.Float32BufferAttribute([
    0,0,0, -width,len*0.45,0, 0,len*0.5,0.12, width,len*0.45,0, 0,len,0,
  ], 3))
  g.setIndex([0,1,2,0,2,3,1,4,2,2,4,3])
  g.computeVertexNormals()
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, to.sub(from).normalize()))
  g.translate(...a)
  return tint(g, color, 0.14)
}
function broadleaf() {
  const wood = [], foliage = []
  wood.push(branch([0,0,0],[0.35,7.8,0],0.46,0.21),branch([0.35,7.8,0],[-0.3,12,0.4],0.21,0.07))
  for (let i=0;i<5;i++) {
    const a=i*Math.PI*2/5
    wood.push(branch([Math.cos(a)*1.25,0.05,Math.sin(a)*1.25],[0,1.6,0],0.11,0.27))
  }
  for(let i=0;i<7;i++) {
    const a=i*2.4, r=i===6?0:2.3, center=[Math.cos(a)*r,9+i*0.48,Math.sin(a)*r]
    wood.push(branch([0.2,5.4+i*0.45,0],center,0.18,0.055))
    const g = new THREE.SphereGeometry(1, 10, 7), p = g.attributes.position
    for(let j=0;j<p.count;j++) {
      const x=p.getX(j),y=p.getY(j),z=p.getZ(j)
      const ripple=1+0.12*Math.sin(x*9+y*5)*Math.cos(z*8-y*4)
      p.setXYZ(j,x*ripple,y*ripple,z*ripple)
    }
    g.scale(2.8+(i%2)*0.6,1.6,2.6).translate(...center); g.computeVertexNormals()
    foliage.push(tint(g, ['#6E9865','#789D6B','#537D55'][i%3],0.3,i+8))
  }
  return { wood: join(wood), foliage: join(foliage) }
}
function palm() {
  const wood=[],foliage=[]
  const trunk=t=>[Math.sin(t*1.5)*0.8,t*12,Math.sin(t*2)*0.25]
  for(let i=0;i<5;i++)wood.push(branch(trunk(i/5),trunk((i+1)/5),0.27-i*0.02,0.25-i*0.02,'#8D8061'))
  const top=trunk(1)
  for(let i=0;i<8;i++) {
    const a=i*Math.PI*2/8
    const curve=t=>[top[0]+Math.cos(a)*t*5.5,12+Math.sin(t*Math.PI)*1.6-t*t*2.3,top[2]+Math.sin(a)*t*5.5]
    for(let j=0;j<5;j++) {
      wood.push(branch(curve(j/5),curve((j+1)/5),0.045,0.025,'#798651'))
      for(const side of [-1,1]) {
        const t=(j+0.5)/5,p=curve(t),w=Math.sin(t*Math.PI)*1.4+0.2
        foliage.push(leaf(p,[p[0]+Math.cos(a+side*1.2)*w,p[1]-0.5,p[2]+Math.sin(a+side*1.2)*w],0.15,'#709558'))
      }
    }
  }
  return {wood:join(wood),foliage:join(foliage)}
}

// 멀리 있는 나무용 간단한 모델: 같은 실루엣을 삼각형 몇백 개로
function broadleafFar() {
  const wood=[branch([0,0,0],[0.3,9,0],0.46,0.15)], foliage=[]
  for(const [x,y,z,s,c] of [[0,10.6,0,3.3,'#6E9865'],[2.1,9.4,1.2,2.6,'#789D6B'],[-2,9.6,-1,2.6,'#537D55'],[0.4,12.4,-0.6,2.3,'#789D6B']]) {
    const g=new THREE.IcosahedronGeometry(1,0)
    g.scale(s,s*0.62,s).translate(x,y,z)
    foliage.push(tint(g,c,0.25,Math.abs(Math.round(x*10+y))+1))
  }
  return { wood: join(wood), foliage: join(foliage) }
}
function palmFar() {
  const wood=[branch([0,0,0],[0.8,12,0.2],0.27,0.18,'#8D8061')], foliage=[]
  for(let i=0;i<6;i++) {
    const a=i*Math.PI*2/6
    const g=new THREE.ConeGeometry(0.9,5.2,3).rotateZ(-Math.PI/2+0.35).rotateY(-a).translate(0.8+Math.cos(a)*2.5,11.6,0.2+Math.sin(a)*2.5)
    foliage.push(tint(g,'#709558',0.2,i+3))
  }
  return { wood: join(wood), foliage: join(foliage) }
}
function shrubFar() {
  return join([tint(new THREE.IcosahedronGeometry(1,0).scale(1.2,0.9,1.15).translate(0,0.55,0),'#5C7C46',0.3,9)])
}

function shrubGeometry() {
  const parts=[]
  for(let i=0;i<4;i++) {
    const a=i*2.4,g=new THREE.SphereGeometry(1,8,5)
    g.scale(0.95,0.8+i*0.1,0.9).translate(Math.cos(a)*0.5,0.5,Math.sin(a)*0.5)
    parts.push(tint(g,['#5C7C46','#748C51','#476C45','#7C915C'][i],0.3,i+50))
  }
  return join(parts)
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
// 카메라와의 거리로 나무를 나눠 그린다. 가까운 나무(near 안)는 정밀 모델, 그 바깥(far 안)은 간단한 모델,
// 더 먼 나무는 안개에 가려 안 보이므로 그리지 않는다. 카메라가 6m 넘게 움직였을 때만 다시 고른다.
// 종류마다 그리기 호출이 정밀 1번 + 간단 1번뿐이라, 구역마다 따로 그리던 방식보다 훨씬 가볍다.
const NEAR = 70, FAR = 230
function LodInstances({ items, hi, lo, material, shadows = true, near = NEAR, far = FAR }) {
  const hiRef = useRef(), loRef = useRef(), last = useRef({ x: 1e9, z: 1e9 })
  const data = useMemo(() => {
    const obj = new THREE.Object3D(), color = new THREE.Color()
    const matrices = new Float32Array(items.length * 16), colors = new Float32Array(items.length * 3)
    items.forEach((it, i) => {
      obj.position.set(it.x, it.y || 0, it.z); obj.rotation.set(0, it.r || 0, 0); obj.scale.setScalar(it.s || 1); obj.updateMatrix()
      obj.matrix.toArray(matrices, i * 16)
      color.setRGB(0.75 + it.c * 0.25, 0.83 + it.c * 0.17, 0.75 + it.c * 0.25).toArray(colors, i * 3)
    })
    return { matrices, colors }
  }, [items])
  useLayoutEffect(() => {
    for (const m of [hiRef.current, loRef.current]) {
      if (!m) continue
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(items.length * 3), 3)
      m.count = 0
    }
    last.current = { x: 1e9, z: 1e9 }
  }, [items])
  useFrame(({ camera }) => {
    const c = camera.position
    if (Math.hypot(c.x - last.current.x, c.z - last.current.z) < 6) return
    last.current = { x: c.x, z: c.z }
    const h = hiRef.current, l = loRef.current
    let nh = 0, nl = 0
    for (let i = 0; i < items.length; i++) {
      const it = items[i], d = (it.x - c.x) ** 2 + (it.z - c.z) ** 2
      const target = d < near * near ? h : l && d < far * far ? l : null
      if (!target) continue
      const k = target === h ? nh++ : nl++
      target.instanceMatrix.array.set(data.matrices.subarray(i * 16, i * 16 + 16), k * 16)
      target.instanceColor.array.set(data.colors.subarray(i * 3, i * 3 + 3), k * 3)
    }
    for (const [m, n] of [[h, nh], [l, nl]]) {
      if (!m) continue
      m.count = n
      // 버퍼 전체가 아니라 실제로 쓰는 앞부분만 올린다
      for (const [attr, size] of [[m.instanceMatrix, 16], [m.instanceColor, 3]]) {
        attr.clearUpdateRanges()
        attr.addUpdateRange(0, Math.max(1, n) * size)
        attr.needsUpdate = true
      }
    }
  })
  return <>
    <instancedMesh ref={hiRef} args={[hi, material, items.length]} castShadow={shadows} receiveShadow frustumCulled={false} />
    {lo && <instancedMesh ref={loRef} args={[lo, material, items.length]} frustumCulled={false} />}
  </>
}

export function Forest() {
  const time=useMemo(()=>({value:0}),[])
  useFrame((_,dt)=>{time.value+=dt})
  const assets=useMemo(()=>{
    const broad=broadleaf(), palms=palm(), bushes=shrubGeometry()
    const broadFar=broadleafFar(), palmsFar=palmFar(), bushesFar=shrubFar()
    const bark=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1})
    const green=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:0.88})
    green.onBeforeCompile=shader=>{
      shader.uniforms.forestTime=time
      shader.vertexShader='uniform float forestTime;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        float phase = instanceMatrix[3].x * 0.1 + instanceMatrix[3].z * 0.16;
        transformed.x += sin(forestTime * 0.7 + phase + position.y * 0.3) * max(position.y - 5.0, 0.0) * 0.012;`)
    }
    return {broad,palms,bushes,broadFar,palmsFar,bushesFar,bark,green}
  },[time])
  const broad=useMemo(()=>TREES.filter(t=>t.c>0.18),[])
  const palms=useMemo(()=>TREES.filter(t=>t.c<=0.18),[])
  const bushes=useMemo(()=>{
    const rnd=seeded(74),out=TREES.filter((t,i)=>i%3===0).map(t=>({...t,s:1.2+t.c*0.8}))
    for(const d of DISTRICTS) {
      const [cx,,cz]=PLACES[d.id].pos
      for(let i=0;i<52;i++) {
        const a=i*Math.PI*2/52,r=d.radius+2.4+rnd()*1.2,x=cx+Math.sin(a)*r,z=cz+Math.cos(a)*r
        if(roadDistance(x,z)<5.3||Math.hypot(x-d.gate[0],z-d.gate[2])<7||STORY_CLEARINGS.some(([sx,sz])=>Math.hypot(x-sx,z-sz)<5))continue
        out.push({x,z,y:groundHeight(x,z),s:0.9+rnd()*0.6,c:rnd(),r:a})
      }
    }
    return out
  },[])
  useEffect(()=>()=>{for(const set of [assets.broad,assets.palms,assets.broadFar,assets.palmsFar])Object.values(set).forEach(g=>g.dispose());assets.bushes.dispose();assets.bushesFar.dispose();assets.bark.dispose();assets.green.dispose()},[assets])
  return <group>
    <LodInstances items={broad} hi={assets.broad.wood} lo={assets.broadFar.wood} material={assets.bark} />
    <LodInstances items={broad} hi={assets.broad.foliage} lo={assets.broadFar.foliage} material={assets.green} />
    <LodInstances items={palms} hi={assets.palms.wood} lo={assets.palmsFar.wood} material={assets.bark} />
    <LodInstances items={palms} hi={assets.palms.foliage} lo={assets.palmsFar.foliage} material={assets.green} />
    <LodInstances items={bushes} hi={assets.bushes} lo={assets.bushesFar} material={assets.green} shadows={false} near={60} far={170} />
  </group>
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
