import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LAKE, LAMPS, RIVER, TREES, isOpenGround, seeded } from './layout.js'

// 나무, 풀이 바람에 흔들리도록 쓰는 공용 시간 값
export const windTime = { value: 0 }

// MeshStandardMaterial에 바람 흔들림을 붙인다. amp가 클수록 끝이 많이 흔들린다(높이에 비례).
function sway(material, amp) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windTime
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 swayAt = instanceMatrix[3].xyz;
      #else
        vec3 swayAt = vec3(0.0);
      #endif
      float swayK = sin(uTime * 1.7 + swayAt.x * 0.31 + swayAt.z * 0.23) + 0.4 * sin(uTime * 3.1 + swayAt.z * 0.5);
      transformed.x += swayK * ${amp.toFixed(3)} * max(position.y, 0.0);
      transformed.z += swayK * ${(amp * 0.5).toFixed(3)} * max(position.y, 0.0);`,
    )
  }
  material.customProgramCacheKey = () => `sway-${amp}`
  return material
}

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
            uDeep: { value: new THREE.Color('#3E9FD3') },
            uShallow: { value: new THREE.Color('#8ED8EE') },
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
function Ground({ size }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, 140, 140)
    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const a = new THREE.Color('#9FCD82')
    const b = new THREE.Color('#B7DB92')
    const c = new THREE.Color('#8CC274')
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const n1 = Math.sin(x * 0.045) * Math.cos(y * 0.05) * 0.5 + 0.5
      const n2 = Math.sin(x * 0.13 + y * 0.09) * 0.5 + 0.5
      tmp.copy(a).lerp(b, n1 * 0.8).lerp(c, n2 * 0.35)
      tmp.toArray(colors, i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [size])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={geo}>
      <meshStandardMaterial vertexColors roughness={1} />
    </mesh>
  )
}

/* ---------------- 길: 연석 테두리 + 흙길, 이음매는 둥글게 ---------------- */
function Roads({ roads }) {
  const joints = useMemo(() => {
    const seen = new Map()
    roads.forEach(([a, b]) => [a, b].forEach((p) => seen.set(p.join(','), p)))
    return [...seen.values()]
  }, [roads])
  return (
    <group>
      {roads.map(([a, b], i) => {
        const dx = b[0] - a[0]
        const dz = b[2] - a[2]
        const len = Math.hypot(dx, dz)
        const mid = [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2]
        const rot = [-Math.PI / 2, 0, -Math.atan2(dz, dx)]
        return (
          <group key={i}>
            <mesh position={[mid[0], 0.02, mid[2]]} rotation={rot} receiveShadow>
              <planeGeometry args={[len, 6.4]} />
              <meshStandardMaterial color="#D2BC8E" roughness={1} />
            </mesh>
            <mesh position={[mid[0], 0.03, mid[2]]} rotation={rot} receiveShadow>
              <planeGeometry args={[len, 5]} />
              <meshStandardMaterial color="#EEDCB4" roughness={1} />
            </mesh>
            {/* 가운데 점선 */}
            <mesh position={[mid[0], 0.035, mid[2]]} rotation={rot}>
              <planeGeometry args={[Math.max(0, len - 6), 0.18]} />
              <meshStandardMaterial color="#FFF6E2" transparent opacity={0.7} />
            </mesh>
          </group>
        )
      })}
      {joints.map((p, i) => (
        <group key={i} position={[p[0], 0, p[2]]}>
          <mesh position={[0, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[3.2, 28]} />
            <meshStandardMaterial color="#D2BC8E" roughness={1} />
          </mesh>
          <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[2.5, 28]} />
            <meshStandardMaterial color="#EEDCB4" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

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

/* ---------------- 나무: 둥근 활엽수 + 뾰족한 침엽수 ---------------- */
function Trees() {
  const round = useMemo(() => TREES.filter((t) => t.c >= 0.28), [])
  const pine = useMemo(() => TREES.filter((t) => t.c < 0.28), [])
  const refs = { trunkR: useRef(), crownR: useRef(), topR: useRef(), trunkP: useRef(), coneP: useRef(), cone2P: useRef() }
  const crownMat = useMemo(() => sway(new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), 0.02), [])
  const pineMat = useMemo(() => sway(new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), 0.015), [])

  useEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const v = new THREE.Vector3()
    const sc = new THREE.Vector3()
    const col = new THREE.Color()
    const greens = ['#6DBB5E', '#5BAA52', '#7CC46A', '#89C25C', '#4E9E4C']
    const set = (ref, i, x, y, z, s, sy = s, r = 0) => {
      q.setFromAxisAngle(v.set(0, 1, 0), r)
      m.compose(v.set(x, y, z), q, sc.set(s, sy, s))
      ref.current.setMatrixAt(i, m)
    }
    round.forEach((t, i) => {
      set(refs.trunkR, i, t.x, 1.2 * t.s, t.z, t.s)
      set(refs.crownR, i, t.x, 3.5 * t.s, t.z, t.s * 1.05, t.s * 0.95, t.r)
      set(refs.topR, i, t.x + 0.5 * t.s, 4.6 * t.s, t.z - 0.3 * t.s, t.s * 0.7, t.s * 0.7, t.r)
      const g = greens[Math.floor(t.c * 97) % greens.length]
      refs.crownR.current.setColorAt(i, col.set(g))
      refs.topR.current.setColorAt(i, col.set(g).offsetHSL(0, 0, 0.06))
    })
    pine.forEach((t, i) => {
      set(refs.trunkP, i, t.x, 0.9 * t.s, t.z, t.s * 0.8)
      set(refs.coneP, i, t.x, 3 * t.s, t.z, t.s, t.s, t.r)
      set(refs.cone2P, i, t.x, 4.6 * t.s, t.z, t.s * 0.72, t.s * 0.8, t.r)
      refs.coneP.current.setColorAt(i, col.set(t.c < 0.14 ? '#3F8A55' : '#4C9A5E'))
      refs.cone2P.current.setColorAt(i, col.set(t.c < 0.14 ? '#4A9A60' : '#5BAA6A'))
    })
    Object.values(refs).forEach((r) => {
      r.current.instanceMatrix.needsUpdate = true
      if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, pine])

  return (
    <group>
      <instancedMesh ref={refs.trunkR} args={[null, null, round.length]} castShadow>
        <cylinderGeometry args={[0.22, 0.36, 2.4, 7]} />
        <meshStandardMaterial color="#8B6A4A" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={refs.crownR} args={[null, null, round.length]} castShadow receiveShadow material={crownMat}>
        <icosahedronGeometry args={[1.9, 1]} />
      </instancedMesh>
      <instancedMesh ref={refs.topR} args={[null, null, round.length]} castShadow material={crownMat}>
        <icosahedronGeometry args={[1.6, 1]} />
      </instancedMesh>
      <instancedMesh ref={refs.trunkP} args={[null, null, pine.length]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.8, 6]} />
        <meshStandardMaterial color="#7A5B3E" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={refs.coneP} args={[null, null, pine.length]} castShadow material={pineMat}>
        <coneGeometry args={[1.9, 3.6, 8]} />
      </instancedMesh>
      <instancedMesh ref={refs.cone2P} args={[null, null, pine.length]} castShadow material={pineMat}>
        <coneGeometry args={[1.5, 2.8, 8]} />
      </instancedMesh>
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
  const rocks = useMemo(() => scatter(110, 23, half, (x, z) => isOpenGround(x, z, 5)), [half])

  const petalGeo = useMemo(() => new THREE.IcosahedronGeometry(0.2, 0), [])
  const stemGeo = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4).translate(0, 0.25, 0), [])
  const flowerMat = useMemo(() => new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.6 }), [])
  const stemMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4E9A43' }), [])
  const rockGeo = useMemo(() => new THREE.DodecahedronGeometry(0.8, 0), [])
  const rockMat = useMemo(() => new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1 }), [])

  const placePetal = useMemo(() => (f) => ({ pos: [f.x, 0.52, f.z], rot: [f.a, f.b, 0], scale: [1, 0.7, 1] }), [])
  const placeStem = useMemo(() => (f) => ({ pos: [f.x, 0, f.z], scale: [1, 1, 1] }), [])
  const colorPetal = useMemo(() => (f) => FLOWER_COLORS[Math.floor(f.c * FLOWER_COLORS.length)], [])
  const placeRock = useMemo(() => (r) => ({ pos: [r.x, 0.15, r.z], rot: [r.a, r.b * 6, r.c], scale: [0.6 + r.a * 1.4, 0.4 + r.b * 0.6, 0.6 + r.c * 1.2] }), [])
  const colorRock = useMemo(() => (r) => (r.c > 0.5 ? '#B8B4AC' : '#A29D94'), [])

  return (
    <group>
      <Instanced items={flowers} place={placeStem} geometry={stemGeo} material={stemMat} />
      <Instanced items={flowers} place={placePetal} color={colorPetal} geometry={petalGeo} material={flowerMat} />
      <Instanced items={rocks} place={placeRock} color={colorRock} geometry={rockGeo} material={rockMat} castShadow />
    </group>
  )
}

/* ---------------- 가로등: 밤이나 하모니아가 멈췄을 때 더 밝게 ---------------- */
function Lamps({ night }) {
  const poleGeo = useMemo(() => new THREE.CylinderGeometry(0.09, 0.13, 3.6, 6).translate(0, 1.8, 0), [])
  const armGeo = useMemo(() => new THREE.BoxGeometry(0.08, 0.08, 0.7).translate(0, 3.55, 0.3), [])
  const bulbGeo = useMemo(() => new THREE.SphereGeometry(0.26, 12, 10).translate(0, 3.45, 0.62), [])
  const poleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3E4A5C', metalness: 0.4, roughness: 0.5 }), [])
  const bulbMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFF4D0', emissive: '#FFD27A' }), [])
  bulbMat.emissiveIntensity = night ? 4 : 1.2
  const place = useMemo(() => (l) => ({ pos: [l.x, 0, l.z], rot: [0, Math.atan2(-l.x, -l.z), 0], scale: [1, 1, 1] }), [])
  return (
    <group>
      <Instanced items={LAMPS} place={place} geometry={poleGeo} material={poleMat} castShadow />
      <Instanced items={LAMPS} place={place} geometry={armGeo} material={poleMat} />
      <Instanced items={LAMPS} place={place} geometry={bulbGeo} material={bulbMat} />
    </group>
  )
}

/* ---------------- 바깥 언덕과 먼 산 ---------------- */
function Horizon({ half }) {
  const hills = useMemo(() => {
    const rnd = seeded(5)
    // 네모난 월드 경계를 따라 둘러싼다 (모서리의 명소를 가리지 않게)
    const out = []
    const n = 14
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * 2 - 1
        const edge = half + 20 + rnd() * 6
        const along = t * (half + 20)
        const [x, z] = side === 0 ? [along, -edge] : side === 1 ? [edge, along] : side === 2 ? [-along, edge] : [-edge, -along]
        out.push({ x, z, s: 16 + rnd() * 10, h: 0.35 + rnd() * 0.25 })
      }
    }
    return out
  }, [half])
  const peaks = useMemo(() => {
    const rnd = seeded(9)
    return Array.from({ length: 30 }).map((_, i) => {
      const a = (i / 30) * Math.PI * 2 + rnd() * 0.15
      return { a, r: half * 1.45 + 40 + rnd() * 40, w: 34 + rnd() * 26, h: 40 + rnd() * 45 }
    })
  }, [half])
  return (
    <group>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.x, 0, h.z]} scale={[1, h.h, 1]} receiveShadow>
          <sphereGeometry args={[h.s, 18, 12]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#8CC274' : i % 3 === 1 ? '#7DB767' : '#95C97A'} flatShading />
        </mesh>
      ))}
      {peaks.map((p, i) => (
        <group key={i} position={[Math.cos(p.a) * p.r, 0, Math.sin(p.a) * p.r]}>
          <mesh>
            <coneGeometry args={[p.w, p.h, 7]} />
            <meshStandardMaterial color={i % 2 ? '#8FA9B8' : '#9DB5C2'} flatShading />
          </mesh>
          <mesh position={[0, p.h * 0.36, 0]}>
            <coneGeometry args={[p.w * 0.29, p.h * 0.29, 7]} />
            <meshStandardMaterial color="#F6FAFF" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------------- 지형 전체 ---------------- */
export default function Terrain({ roads, half, night = false }) {
  useFrame((_, dt) => (windTime.value += dt))
  return (
    <group>
      <Ground size={half * 2 + 180} />
      <Roads roads={roads} />
      <River />
      {roads.map(([a, b], i) => {
        // 강을 가로지르는 길에는 다리를 놓는다
        if ((a[0] - RIVER.x) * (b[0] - RIVER.x) >= 0) return null
        const t = (RIVER.x - a[0]) / (b[0] - a[0])
        return <Bridge key={i} position={[RIVER.x, 0, a[2] + (b[2] - a[2]) * t]} angle={-Math.atan2(b[2] - a[2], b[0] - a[0])} />
      })}
      <group position={[LAKE[0], 0, LAKE[1]]}>
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[LAKE[2] + 2.4, 48]} />
          <meshStandardMaterial color="#E6D3A3" roughness={1} />
        </mesh>
        <Water round position={[0, 0.045, 0]} scale={[LAKE[2], LAKE[2], 1]} />
      </group>
      <Trees />
      <Decor half={half - 2} />
      <Lamps night={night} />
      <Horizon half={half} />
    </group>
  )
}
