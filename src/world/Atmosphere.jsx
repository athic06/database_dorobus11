import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { seeded } from './layout.js'

/* ---------------- 하늘: 위는 짙고 지평선은 옅은 그라데이션 돔 ---------------- */
export function SkyDome({ top = '#5FB2F2', horizon = '#D8EEFF', radius = 480 }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() } },
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
          varying vec3 vDir;
          void main() {
            float h = clamp(vDir.y, 0.0, 1.0);
            gl_FragColor = vec4(mix(uHorizon, uTop, pow(h, 0.55)), 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [],
  )
  mat.uniforms.uTop.value.set(top)
  mat.uniforms.uHorizon.value.set(horizon)
  const ref = useRef()
  // 돔이 카메라를 따라다녀 끝이 보이지 않게 한다
  useFrame(({ camera }) => ref.current && ref.current.position.copy(camera.position))
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
  const refs = useRef([])
  useFrame((_, dt) => {
    clouds.forEach((c, i) => {
      c.x += c.v * dt
      if (c.x > span + 40) c.x = -span - 40
      const g = refs.current[i]
      if (g) g.position.x = c.x
    })
  })
  return (
    <group>
      {clouds.map((c, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)} position={[c.x, c.y, c.z]} scale={c.s}>
          {c.puffs.map(([x, y, z, r], j) => (
            <mesh key={j} position={[x, y, z]} scale={[1, 0.72, 1]}>
              <icosahedronGeometry args={[r, 1]} />
              <meshStandardMaterial color={dim ? '#D9DDE6' : '#FFFFFF'} emissive={dim ? '#7C8597' : '#DDEBFF'} emissiveIntensity={0.35} flatShading roughness={1} fog={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
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
      <pointLight position={[0, -4.8, 0]} color="#FFB35C" intensity={6} distance={6} />
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
export function PostFX({ bloom = 0.6 }) {
  return (
    <EffectComposer multisampling={4} disableNormalPass>
      <Bloom mipmapBlur intensity={bloom} luminanceThreshold={0.95} luminanceSmoothing={0.2} radius={0.7} />
      <Vignette offset={0.32} darkness={0.42} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
