import { useEffect, useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { PLACES, PARK_EDGES, DISTRICTS } from './layout.js'

function Batch({ items, color, cylinder = false }) {
  const ref=useRef()
  useLayoutEffect(()=>{
    const o=new THREE.Object3D()
    items.forEach((p,i)=>{o.position.set(...p.pos);o.rotation.set(...(p.rot||[0,0,0]));o.scale.set(...p.scale);o.updateMatrix();ref.current.setMatrixAt(i,o.matrix)})
    ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere()
  },[items])
  return <instancedMesh ref={ref} args={[null,null,items.length]} castShadow receiveShadow>
    {cylinder?<cylinderGeometry args={[1,1,1,10]}/>:<boxGeometry/>}
    <meshStandardMaterial color={color} roughness={0.8}/>
  </instancedMesh>
}
function Sign({ title, subtitle }) {
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=320
    const c=canvas.getContext('2d');c.fillStyle='#243E32';c.fillRect(0,0,1024,320)
    c.strokeStyle='#B8AE82';c.lineWidth=3;c.strokeRect(18,18,988,284)
    c.textAlign='center';c.fillStyle='#F2E8CA';c.font='600 76px "Malgun Gothic", sans-serif';c.fillText(title,512,147)
    c.fillStyle='#BCC6A0';c.font='24px sans-serif';c.fillText(subtitle,512,225)
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t
  },[title,subtitle])
  useEffect(()=>()=>texture.dispose(),[texture])
  return <mesh position={[0,3.65,0.15]}><planeGeometry args={[5.5,1.7]}/><meshStandardMaterial map={texture} roughness={0.7}/></mesh>
}
function Gate({ id, position, rotation }) {
  const posts=useMemo(()=>[-3.2,3.2].map(x=>({pos:[x,2,0],scale:[0.3,4,0.3]})),[])
  const roof=useMemo(()=>Array.from({length:13},(_,i)=>({pos:[-3.4+i*0.56,4.55,0],scale:[0.16,0.16,1.8]})),[])
  return <group position={position} rotation={[0,rotation,0]}>
    <Batch items={posts} color="#7E6B4C"/>
    <Batch items={[{pos:[0,4.35,0],scale:[7,0.28,0.35]},{pos:[0,3.65,0.05],scale:[5.7,1.85,0.17]}]} color="#746044"/>
    <Batch items={roof} color="#A68B5C"/>
    <Sign title={PLACES[id].name} subtitle={id==='carousel'?'WOODLAND GARDEN · 01':id==='ferris'?'CANOPY OBSERVATORY · 02':'RIVER EXPEDITION · 03'}/>
  </group>
}
export default function ParkDistricts() {
  const structure=useMemo(()=>{
    const posts=[],rails=[],benches=[],feet=[],stones=[]
    for(const edge of PARK_EDGES) {
      posts.push({pos:[edge.x,0.56,edge.z],scale:[0.1,1.12,0.1]})
      if(edge.next) {
        const dx=edge.next[0]-edge.x,dz=edge.next[1]-edge.z,len=Math.hypot(dx,dz)
        for(const y of [0.45,0.92])rails.push({pos:[edge.x+dx/2,y,edge.z+dz/2],rot:[0,-Math.atan2(dz,dx),0],scale:[len,0.07,0.07]})
      }
    }
    for(const d of DISTRICTS) {
      const [x,,z]=PLACES[d.id].pos
      for(const [dx,dz] of d.benches) {
        benches.push({pos:[x+dx,0.56,z+dz],scale:[2.5,0.14,0.75]},{pos:[x+dx,1,z+dz-0.32],scale:[2.5,0.65,0.1]})
        for(const side of [-0.9,0.9])feet.push({pos:[x+dx+side,0.25,z+dz],scale:[0.14,0.5,0.6]})
      }
      // Low masonry edges anchor the ride to a landscaped courtyard.
      for(let i=0;i<54;i++) {
        const a=i*Math.PI*2/54
        if(Math.sin(a)>-0.55&&Math.cos(a)>0.1)continue
        stones.push({pos:[x+Math.sin(a)*(d.radius-0.4),0.17,z+Math.cos(a)*(d.radius-0.4)],rot:[0,a,0],scale:[0.8,0.34,0.5]})
      }
    }
    return {posts,rails,benches,feet,stones}
  },[])
  return <group>
    {DISTRICTS.map(d=><group key={d.id} position={PLACES[d.id].pos}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.075,0]} receiveShadow><circleGeometry args={[d.radius,96]}/><meshStandardMaterial color={d.id==='coaster'?'#928D72':'#B8AD8F'} roughness={0.95}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.08,0]} receiveShadow><ringGeometry args={[d.radius-0.8,d.radius-0.66,96]}/><meshStandardMaterial color="#706E50" roughness={1}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.085,0]} receiveShadow><ringGeometry args={[d.radius-2.1,d.radius-2,96]}/><meshStandardMaterial color="#CFC5A7" roughness={1}/></mesh>
    </group>)}
    <Batch items={structure.posts} color="#806E50" cylinder/>
    <Batch items={structure.rails} color="#A29370"/>
    <Batch items={structure.benches} color="#A08A62"/>
    <Batch items={structure.feet} color="#3C5342"/>
    <Batch items={structure.stones} color="#6F7460"/>
    {DISTRICTS.map(d=><Gate key={d.id} id={d.id} position={d.gate} rotation={d.rotation}/>)}
  </group>
}
