import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { seeded } from './layout.js'

/* ---------------- 하늘: 위는 짙고 지평선은 옅은 그라데이션 돔 ---------------- */
export function SkyDome({ top = '#5594B4', horizon = '#DCE8E6', radius = 480 }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uTime: { value: 0 } },
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p.xyww;
          }`,
        fragmentShader: `
          uniform vec3 uTop;
          uniform vec3 uHorizon;
          uniform float uTime;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
          float noise(vec2 p) { vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
          varying vec3 vDir;
          void main() {
            vec3 dir = normalize(vDir);
            float h = clamp(dir.y, 0.0, 1.0);
            vec3 col = mix(uHorizon, uTop, pow(h, 0.62));
            float sun = max(dot(dir, normalize(vec3(0.6, 1.0, 0.4))), 0.0);
            col += vec3(1.0, 0.78, 0.49) * (pow(sun, 18.0) * 0.16 + pow(sun, 700.0) * 0.65);
            vec2 uv = dir.xz / max(dir.y + 0.18, 0.08) * 3.0 + vec2(uTime * 0.003, 0.0);
            float cloud = noise(uv) * 0.55 + noise(uv * 2.1) * 0.28 + noise(uv * 4.2) * 0.17;
            float veil = smoothstep(0.58, 0.83, cloud) * smoothstep(0.08, 0.28, h) * 0.4;
            col = mix(col, uHorizon * 1.12, veil);
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [],
  )
  useEffect(() => () => mat.dispose(), [mat])
  mat.uniforms.uTop.value.set(top)
  mat.uniforms.uHorizon.value.set(horizon)
  const ref = useRef()
  // 돔이 카메라를 따라다녀 끝이 보이지 않게 한다
  useFrame(({ camera, clock }) => { if (ref.current) ref.current.position.copy(camera.position); mat.uniforms.uTime.value = clock.elapsedTime })
  return (
    <mesh ref={ref} material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[radius, 32, 16]} />
    </mesh>
  )
}

/* ---------------- 구름: 솜뭉치 몇 개를 묶어 천천히 흘려보낸다 ---------------- */
export function Clouds({ count = 16, span = 260, dim = false }) {
  const clouds = useMemo(() => {
    const rnd = seeded(31)
    return Array.from({ length: count }).map(() => ({
      x: (rnd() * 2 - 1) * span,
      y: 48 + rnd() * 30,
      z: (rnd() * 2 - 1) * span,
      s: 0.8 + rnd() * 1.1,
      v: 0.8 + rnd() * 1.4,
      puffs: Array.from({ length: 4 + Math.floor(rnd() * 3) }).map((_, i) => [i * 3.4 - 6 + rnd() * 1.5, rnd() * 1.8, (rnd() - 0.5) * 3, 2.6 + rnd() * 2.2]),
    }))
  }, [count, span])
  // 구름 솜뭉치 전부를 그리기 호출 한 번으로 그린다 (매 프레임 위치만 옮긴다)
  const puffs = useMemo(() => clouds.flatMap((c, ci) => c.puffs.map((p) => ({ ci, p }))), [clouds])
  const ref = useRef()
  const o = useMemo(() => new THREE.Object3D(), [])
  useFrame((_, dt) => {
    clouds.forEach((c) => {
      c.x += c.v * dt
      if (c.x > span + 40) c.x = -span - 40
    })
    puffs.forEach(({ ci, p: [x, y, z, r] }, i) => {
      const c = clouds[ci]
      o.position.set(c.x + x * c.s, c.y + y * c.s, c.z + z * c.s)
      o.scale.set(r * c.s, r * c.s * 0.72, r * c.s)
      o.updateMatrix()
      ref.current.setMatrixAt(i, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, puffs.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 16, 10]} />
      <meshStandardMaterial color={dim ? '#D9DDE6' : '#FFFFFF'} emissive={dim ? '#7C8597' : '#DDEBFF'} emissiveIntensity={0.35} roughness={1} fog={false} />
    </instancedMesh>
  )
}

/* ---------------- 새 떼: 날갯짓하며 큰 원을 그린다 ---------------- */
function Bird({ phase }) {
  const l = useRef()
  const r = useRef()
  useFrame(({ clock }) => {
    const f = Math.sin(clock.elapsedTime * 9 + phase) * 0.7
    if (l.current) l.current.rotation.z = f
    if (r.current) r.current.rotation.z = -f
  })
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.22, 0.18, 0.7]} />
        <meshStandardMaterial color="#3A3F4B" />
      </mesh>
      <group ref={l}>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.04, 0.4]} />
          <meshStandardMaterial color="#3A3F4B" />
        </mesh>
      </group>
      <group ref={r}>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[1.1, 0.04, 0.4]} />
          <meshStandardMaterial color="#3A3F4B" />
        </mesh>
      </group>
    </group>
  )
}

export function Birds({ flocks = [[-30, 34, 20, 60, 0.12], [60, 40, -60, 45, -0.09], [-90, 30, -40, 35, 0.15]] }) {
  const refs = useRef([])
  useFrame(({ clock }) => {
    flocks.forEach(([cx, y, cz, rad, w], i) => {
      const g = refs.current[i]
      if (!g) return
      const a = clock.elapsedTime * w
      g.position.set(cx + Math.cos(a) * rad, y + Math.sin(a * 3) * 1.5, cz + Math.sin(a) * rad)
      g.rotation.y = -a + (w > 0 ? Math.PI : 0)
    })
  })
  const shape = [[0, 0, 0], [1.6, 0.3, -1.4], [-1.6, 0.2, -1.4], [3, 0.5, -2.8], [-3.1, 0.4, -2.7]]
  return (
    <group>
      {flocks.map((_, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)}>
          {shape.map((p, j) => (
            <group key={j} position={p}>
              <Bird phase={j * 1.3 + i} />
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ---------------- 열기구: 하늘에서 천천히 오르내린다 ---------------- */
function Balloon({ colors, position, phase }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.25 + phase
    ref.current.position.set(position[0] + Math.sin(t * 0.7) * 8, position[1] + Math.sin(t) * 3, position[2] + Math.cos(t * 0.5) * 6)
    ref.current.rotation.y = t * 0.3
  })
  return (
    <group ref={ref}>
      {colors.map((c, i) => (
        <mesh key={i} rotation={[0, (i / colors.length) * Math.PI * 2, 0]} scale={[1, 1.15, 1]} castShadow>
          <sphereGeometry args={[4, 24, 16, 0, (Math.PI * 2) / colors.length]} />
          <meshStandardMaterial color={c} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, -4.6, 0]}>
        <cylinderGeometry args={[1.8, 0.9, 1.6, 16, 1, true]} />
        <meshStandardMaterial color={colors[0]} side={THREE.DoubleSide} />
      </mesh>
      {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, -6.3, z]}>
          <cylinderGeometry args={[0.03, 0.03, 2, 4]} />
          <meshStandardMaterial color="#5B4632" />
        </mesh>
      ))}
      <mesh position={[0, -7.6, 0]} castShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#A0754A" />
      </mesh>
    </group>
  )
}

export function Balloons() {
  return (
    <group>
      <Balloon colors={['#FF6B6B', '#FFD45E', '#FF6B6B', '#FFD45E', '#FF6B6B', '#FFD45E']} position={[-70, 46, 30]} phase={0} />
      <Balloon colors={['#5B8CFF', '#FFFFFF', '#5B8CFF', '#FFFFFF', '#5B8CFF', '#FFFFFF']} position={[90, 54, 60]} phase={2} />
      <Balloon colors={['#8BD17C', '#FFB35C', '#B79CFF', '#8BD17C', '#FFB35C', '#B79CFF']} position={[20, 62, -90]} phase={4} />
    </group>
  )
}

/* ---------------- 반짝임: 하모니아 주변 금빛 입자 ---------------- */
export function Glitter({ position, scale = [30, 12, 30], color = '#FFE08A', count = 60, size = 6 }) {
  return <Sparkles position={position} scale={scale} count={count} size={size} speed={0.4} color={color} opacity={0.9} />
}

/* ---------------- 후처리: 빛 번짐, 가장자리 어둡게, 톤 매핑 ---------------- */
// 개발 서버 전용: 한 프레임의 그리기 호출 수와 삼각형 수를 window.__perf()로 본다
export function PerfProbe() {
  const gl = useThree((st) => st.gl)
  const scene = useThree((st) => st.scene)
  const last = useRef({ calls: 0, triangles: 0 })
  useEffect(() => {
    if (!import.meta.env.DEV) return
    gl.info.autoReset = false
    window.__perf = () => ({ ...last.current, programs: gl.info.programs?.length, geometries: gl.info.memory.geometries })
    window.__scene = scene
    return () => { gl.info.autoReset = true; delete window.__perf }
  }, [gl])
  useFrame(() => {
    if (!import.meta.env.DEV) return
    last.current = { calls: gl.info.render.calls, triangles: gl.info.render.triangles }
    gl.info.reset()
  }, -1)
  return null
}

export function PostFX({ bloom = 0.6, lite = false }) {
  return (
    <>
    {import.meta.env.DEV && <PerfProbe />}
    <EffectComposer multisampling={lite ? 0 : 2} disableNormalPass>
      {!lite && <Bloom mipmapBlur intensity={bloom} luminanceThreshold={0.95} luminanceSmoothing={0.2} radius={0.7} />}
      <Vignette offset={0.25} darkness={0.22} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
    </>
  )
}
