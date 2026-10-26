import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Promenade from './Promenade.jsx'
import { ForestLamps } from './Forest.jsx'
import MegaForest from './MegaForest.jsx'
import { Ground, Roads, Horizon } from './ForestTerrain.jsx'
import ParkDistricts from './ParkDistricts.jsx'
import { LAKE, RIVER, groundHeight, isOpenGround, seeded } from './layout.js'

/* ---------------- 물: 흐르는 물결 무늬와 가장자리 거품 ---------------- */
const WATER_VERT = `
  varying vec2 vUv;
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const WATER_FRAG = `
  uniform float uTime;
  uniform float uRound;
  uniform float uFlow;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  varying vec2 vUv;
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  void main() {
    float edge = uRound > 0.5 ? length(vUv - 0.5) * 2.0 : abs(vUv.x - 0.5) * 2.0;
    vec3 col = mix(uDeep, uShallow, smoothstep(0.35, 1.0, edge));
    // 물결 반짝임: 두 방향의 사인 무늬가 겹치는 곳만 밝게
    float w1 = sin(vWorld.x * 0.9 + vWorld.z * 0.35 + uTime * 1.3 - vWorld.z * uFlow);
    float w2 = sin(vWorld.z * 0.7 - vWorld.x * 0.4 - uTime * (1.1 + uFlow * 2.0));
    float glint = smoothstep(0.82, 1.0, w1 * w2);
    col += glint * 0.35;
    // 가장자리 거품
    float foam = smoothstep(0.86, 0.97, edge + 0.04 * sin(uTime * 2.0 + vWorld.x + vWorld.z));
    col = mix(col, vec3(0.95, 0.98, 1.0), foam * 0.8);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

function useWaterMaterial(round, flow) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: WATER_VERT,
        fragmentShader: WATER_FRAG,
        fog: true,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTime: { value: 0 },
            uRound: { value: round ? 1 : 0 },
            uFlow: { value: flow },
            uDeep: { value: new THREE.Color('#348F9E') },
            uShallow: { value: new THREE.Color('#9BCDC8') },
          },
        ]),
      }),
    [round, flow],
  )
  useFrame((_, dt) => (mat.uniforms.uTime.value += dt))
  return mat
}

export function Water({ round = false, flow = 0, ...props }) {
  const mat = useWaterMaterial(round, flow)
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat} {...props}>
      {round ? <circleGeometry args={[1, 48]} /> : <planeGeometry args={[1, 1, 1, 1]} />}
    </mesh>
  )
}

/* ---------------- 바닥: 위치마다 살짝 다른 잔디색 ---------------- */
/* ---------------- 강, 강둑, 다리 ---------------- */
function River() {
  const { x, z, width, length } = RIVER
  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[x + s * (width / 2 + 1), 0.015, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[3, length]} />
          <meshStandardMaterial color="#E6D3A3" roughness={1} />
        </mesh>
      ))}
      <Water position={[x, 0.04, z]} scale={[width, length, 1]} flow={0.35} />
    </group>
  )
}

// 길이 강을 건너는 곳의 나무다리. 자동차가 높이 0에서 달리므로 상판은 낮게 깐다.
export function Bridge({ position, angle, length = 26 }) {
  const rails = [-2.9, 2.9]
  return (
    <group position={position} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.2, 5.8]} />
        <meshStandardMaterial color="#C99C6B" />
      </mesh>
      {Array.from({ length: 13 }).map((_, i) => (
        <mesh key={i} position={[-length / 2 + 1 + i * ((length - 2) / 12), 0.17, 0]} receiveShadow>
          <boxGeometry args={[1.2, 0.06, 5.6]} />
          <meshStandardMaterial color={i % 2 ? '#B98A5A' : '#D3A776'} />
        </mesh>
      ))}
      {rails.map((r) => (
        <group key={r}>
          <mesh position={[0, 1.05, r]} castShadow>
            <boxGeometry args={[length, 0.14, 0.14]} />
            <meshStandardMaterial color="#F4F0E6" />
          </mesh>
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh key={i} position={[-length / 2 + 1 + i * ((length - 2) / 6), 0.6, r]} castShadow>
              <boxGeometry args={[0.2, 0.9, 0.2]} />
              <meshStandardMaterial color="#F4F0E6" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ---------------- 잔디 장식: 듬성듬성한 꽃, 돌 ---------------- */
function scatter(count, seed, half, test, tries = 12) {
  const rnd = seeded(seed)
  const out = []
  for (let i = 0; i < count * tries && out.length < count; i++) {
    const x = (rnd() * 2 - 1) * half
    const z = (rnd() * 2 - 1) * half
    if (!test(x, z)) continue
    out.push({ x, z, a: rnd(), b: rnd(), c: rnd() })
  }
  return out
}

function Instanced({ items, place, color, geometry, material, castShadow }) {
  const ref = useRef()
  useEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const v = new THREE.Vector3()
    const s = new THREE.Vector3()
    const col = new THREE.Color()
    items.forEach((it, i) => {
      const { pos, rot = [0, 0, 0], scale } = place(it)
      q.setFromEuler(e.set(...rot))
      m.compose(v.set(...pos), q, s.set(...scale))
      ref.current.setMatrixAt(i, m)
      if (color) ref.current.setColorAt(i, col.set(color(it)))
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [items, place, color])
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={castShadow} receiveShadow />
}

const FLOWER_COLORS = ['#FF8FB1', '#FFD45E', '#FFFFFF', '#B79CFF', '#FF9E5E', '#7FC8FF']

function Decor({ half }) {
  const flowers = useMemo(() => scatter(500, 11, half, (x, z) => isOpenGround(x, z, 4)), [half])

  const petalGeo = useMemo(() => new THREE.IcosahedronGeometry(0.2, 0), [])
  const stemGeo = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4).translate(0, 0.25, 0), [])
  const flowerMat = useMemo(() => new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.6 }), [])
  const stemMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4E9A43' }), [])

  const placePetal = useMemo(() => (f) => ({ pos: [f.x, groundHeight(f.x,f.z) + 0.52, f.z], rot: [f.a, f.b, 0], scale: [1, 0.7, 1] }), [])
  const placeStem = useMemo(() => (f) => ({ pos: [f.x, groundHeight(f.x,f.z), f.z], scale: [1, 1, 1] }), [])
  const colorPetal = useMemo(() => (f) => FLOWER_COLORS[Math.floor(f.c * FLOWER_COLORS.length)], [])

  return (
    <group>
      <Instanced items={flowers} place={placeStem} geometry={stemGeo} material={stemMat} />
      <Instanced items={flowers} place={placePetal} color={colorPetal} geometry={petalGeo} material={flowerMat} />
    </group>
  )
}

/* ---------------- 지형 전체 ---------------- */
export default function Terrain({ roads, half, night = false }) {
  return (
    <group>
      <Ground size={half * 2 + 180} />
      <Promenade />
      <Roads roads={roads} />
      <River />
      {roads.map(([a, b], i) => {
        // 강을 가로지르는 길에는 다리를 놓는다
        if ((a[0] - RIVER.x) * (b[0] - RIVER.x) >= 0) return null
        const t = (RIVER.x - a[0]) / (b[0] - a[0])
        if (Math.abs(a[2] + (b[2] - a[2]) * t - RIVER.z) > RIVER.length / 2) return null
        return <Bridge key={i} position={[RIVER.x, 0, a[2] + (b[2] - a[2]) * t]} angle={-Math.atan2(b[2] - a[2], b[0] - a[0])} />
      })}
      <group position={[LAKE[0], 0, LAKE[1]]}>
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[LAKE[2] + 2.4, 48]} />
          <meshStandardMaterial color="#E6D3A3" roughness={1} />
        </mesh>
        <Water round position={[0, 0.045, 0]} scale={[LAKE[2], LAKE[2], 1]} />
      </group>
      <Suspense fallback={null}>
        <MegaForest />
      </Suspense>
      <ParkDistricts />
      <Decor half={half - 2} />
      <ForestLamps night={night} />
      <Horizon half={half} />
    </group>
  )
}
