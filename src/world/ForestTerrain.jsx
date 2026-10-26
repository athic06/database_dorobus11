import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { ROAD_JOINTS, ROUTE_PATHS, groundHeight } from './layout.js'

export function Ground({ size }) {
  const geo=useMemo(()=>{
    const g=new THREE.PlaneGeometry(size,size,160,160),p=g.attributes.position
    const colors=new Float32Array(p.count*3),c=new THREE.Color(),deep=new THREE.Color('#536746'),light=new THREE.Color('#7F8C5B'),earth=new THREE.Color('#776B50')
    for(let i=0;i<p.count;i++) {
      const x=p.getX(i),z=-p.getY(i),height=groundHeight(x,z)
      p.setZ(i,height)
      const n=(Math.sin(x*0.12+Math.sin(z*0.06)*2)*Math.cos(z*0.13)+1)*0.5
      c.copy(deep).lerp(light,n*0.65).lerp(earth,Math.max(0,Math.sin(x*0.035+z*0.04))*0.3)
      c.toArray(colors,i*3)
    }
    g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.computeVertexNormals();return g
  },[size])
  useEffect(()=>()=>geo.dispose(),[geo])
  return <mesh rotation={[-Math.PI/2,0,0]} geometry={geo} receiveShadow><meshStandardMaterial vertexColors roughness={1} /></mesh>
}
function pathRibbon(width,y) {
  const vertices=[],indices=[],uv=[]
  ROUTE_PATHS.forEach(path=>{
    const base=vertices.length/3;let distance=0
    path.forEach((p,i)=>{
      const prev=path[Math.max(0,i-1)],next=path[Math.min(path.length-1,i+1)],dx=next[0]-prev[0],dz=next[2]-prev[2],len=Math.hypot(dx,dz)
      if(i)distance+=Math.hypot(p[0]-prev[0],p[2]-prev[2])
      for(const side of [-1,1]) {vertices.push(p[0]-dz/len*width*side,y,p[2]+dx/len*width*side);uv.push(side===-1?0:1,distance/4)}
      if(i<path.length-1){const k=base+i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2)}
    })
  })
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g
}
export function Roads() {
  const edge=useMemo(()=>pathRibbon(3.35,0.045),[]),path=useMemo(()=>pathRibbon(2.8,0.06),[])
  const material=useMemo(()=>{
    const mat=new THREE.MeshStandardMaterial({color:'#B9AA87',roughness:0.95})
    mat.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec3 pathPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npathPosition=(modelMatrix*vec4(position,1.0)).xyz;')
      shader.fragmentShader='varying vec3 pathPosition;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float grain=fract(sin(dot(floor(pathPosition.xz*22.0),vec2(12.9898,78.233)))*43758.5453);
        diffuseColor.rgb *= 0.92+grain*0.16;`)
    };return mat
  },[])
  useEffect(()=>()=>{edge.dispose();path.dispose();material.dispose()},[edge,path,material])
  const edgeMat=useMemo(()=>new THREE.MeshStandardMaterial({color:'#82765A',roughness:1}),[])
  const discs=(r,y)=>mergeGeometries(ROAD_JOINTS.map(p=>new THREE.CircleGeometry(r,32).rotateX(-Math.PI/2).translate(p[0],y,p[2])))
  const joints=useMemo(()=>({edge:discs(3.35,0.046),path:discs(2.8,0.061)}),[])
  useEffect(()=>()=>{joints.edge.dispose();joints.path.dispose()},[joints])
  return <group>
    <mesh geometry={edge} material={edgeMat} receiveShadow />
    <mesh geometry={path} material={material} receiveShadow />
    {/* 길이 만나는 곳은 둥글게 덮어 각진 이음매가 보이지 않게 한다 */}
    <mesh geometry={joints.edge} material={edgeMat} receiveShadow />
    <mesh geometry={joints.path} material={material} receiveShadow />
  </group>
}
// 먼 산: 겹마다 산 18개를 하나의 도형으로 합쳐 그리기 호출을 3번으로 줄인다
export function Horizon({ half }) {
  const layers=useMemo(()=>[0,1,2].map(layer=>mergeGeometries(Array.from({length:18},(_,i)=>{
    const angle=i*Math.PI*2/18,rad=half+50+layer*45,height=24+Math.sin(i*2.3+layer)*12+layer*9
    return new THREE.SphereGeometry(1,20,12).scale(65,height,55).translate(Math.cos(angle)*rad,-6,Math.sin(angle)*rad)
  }))),[half])
  useEffect(()=>()=>layers.forEach(g=>g.dispose()),[layers])
  return <group>{layers.map((g,layer)=><mesh key={layer} geometry={g} frustumCulled={false}><meshStandardMaterial color={['#456755','#628275','#91A99B'][layer]} roughness={1} /></mesh>)}</group>
}
