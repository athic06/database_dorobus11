import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { DISTRICTS, PLACES, STORY_CLEARINGS, TREES, groundHeight, isOpenGround, roadDistance, seeded } from './layout.js'

// 숲: Quaternius Stylized Nature MegaKit(CC0, public/models/forest).
// 나무 모델이 정교해서(그루당 삼각형 1,600~4,000개) 카메라 가까이(NEAR)만 진짜 모델로 그리고,
// 그 바깥(FAR까지)은 같은 나무를 처음에 한 번 찍어 만든 그림판(빌보드)을 카메라 쪽으로 돌려 세운다.
// 안개 너머(FAR 밖)는 그리지 않는다. 카메라가 6m 넘게 움직였을 때만 다시 고른다.
const NEAR = 35
const FAR = 190
const BASE = `${import.meta.env.BASE_URL}models/forest/`

const BROADLEAF = ['CommonTree_3', 'CommonTree_4', 'CommonTree_5']
const CONIFER = ['Pine_2', 'Pine_4', 'Pine_5']
const BUSHES = ['Bush_Common', 'Bush_Common_Flowers']
const ROCKS = ['Rock_Medium_1', 'Rock_Medium_2', 'Rock_Medium_3']
;[...BROADLEAF, ...CONIFER, ...BUSHES, ...ROCKS].forEach((n) => useGLTF.preload(`${BASE}${n}.glb`))

// 바람: 잎 재질의 꼭짓점을 높이에 비례해 살짝 흔든다
const wind = { value: 0 }
function addSway(material, amp) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWind = wind
    shader.vertexShader = 'uniform float uWind;\n' + shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 swayAt = instanceMatrix[3].xyz;
      #else
        vec3 swayAt = vec3(0.0);
      #endif
      float swayK = sin(uWind * 1.3 + swayAt.x * 0.21 + swayAt.z * 0.17) * 0.7 + sin(uWind * 2.7 + swayAt.z * 0.4) * 0.3;
      transformed.x += swayK * ${amp.toFixed(3)} * max(position.y - 1.5, 0.0);
      transformed.z += swayK * ${(amp * 0.6).toFixed(3)} * max(position.y - 1.5, 0.0);`,
    )
  }
  material.customProgramCacheKey = () => `sway${amp}`
}

// 재질 이름(모델에 들어 있음) → 공용 재질. 텍스처는 모든 모델이 같이 쓴다.
// 화면이 다시 그려져도 같은 재질을 쓰도록 처음 한 번만 만들어 모듈에 보관한다.
let sharedMaterials = null
function useMaterials() {
  const tex = useTexture({ bark: `${BASE}bark.jpg`, rocks: `${BASE}rocks.jpg`, leaves: `${BASE}leaves.png`, pine: `${BASE}pine.png`, bush: `${BASE}bush.png`, flowers: `${BASE}flowers.png` })
  if (sharedMaterials) return sharedMaterials
  sharedMaterials = (() => {
    for (const t of Object.values(tex)) {
      t.flipY = false // glTF 텍스처 좌표 기준
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
      t.needsUpdate = true
    }
    tex.bark.wrapS = tex.bark.wrapT = THREE.RepeatWrapping
    const leaf = (map, amp) => {
      const m = new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85 })
      addSway(m, amp)
      return m
    }
    return {
      Bark_NormalTree: new THREE.MeshStandardMaterial({ map: tex.bark, roughness: 0.95 }),
      Leaves_NormalTree: leaf(tex.leaves, 0.012),
      Leaves_Pine: leaf(tex.pine, 0.008),
      Leaves_TwistedTree: leaf(tex.bush, 0.02),
      Flowers: leaf(tex.flowers, 0.02),
      Rocks: new THREE.MeshStandardMaterial({ map: tex.rocks, roughness: 1 }),
    }
  })()
  return sharedMaterials
}

// GLB → [{ geometry, material }] (모델 안의 위치는 도형에 미리 반영)
function useParts(name, materials) {
  const { scene } = useGLTF(`${BASE}${name}.glb`)
  return useMemo(() => {
    const parts = []
    scene.updateMatrixWorld(true)
    scene.traverse((o) => {
      if (!o.isMesh) return
      const geometry = o.geometry.clone().applyMatrix4(o.matrixWorld)
      geometry.computeBoundingBox()
      parts.push({ geometry, material: materials[o.material.name] || materials.Bark_NormalTree })
    })
    return parts
  }, [scene, materials])
}

// 나무를 옆에서 한 번 찍어 그림판 텍스처를 만든다 (먼 나무용)
function useImpostor(parts) {
  const gl = useThree((s) => s.gl)
  return useMemo(() => {
    const box = new THREE.Box3()
    parts.forEach((p) => box.union(p.geometry.boundingBox))
    const width = Math.max(box.max.x - box.min.x, box.max.z - box.min.z)
    const height = box.max.y
    const scene = new THREE.Scene()
    scene.add(new THREE.HemisphereLight('#DDF0FF', '#38503D', 1.4))
    const sun = new THREE.DirectionalLight('#FFF0D9', 2.4)
    sun.position.set(3, 6, 5)
    scene.add(sun)
    parts.forEach((p) => scene.add(new THREE.Mesh(p.geometry, p.material)))
    const cam = new THREE.OrthographicCamera(-width / 2, width / 2, height, 0, -50, 50)
    cam.position.set(0, 0, 10)
    cam.lookAt(0, 0, 0)
    const rt = new THREE.WebGLRenderTarget(256, Math.round((256 * height) / width), { samples: 4 })
    const prevTarget = gl.getRenderTarget()
    const prevClear = gl.getClearColor(new THREE.Color())
    const prevAlpha = gl.getClearAlpha()
    gl.setRenderTarget(rt)
    gl.setClearColor(0x000000, 0)
    gl.clear()
    gl.render(scene, cam)
    gl.setRenderTarget(prevTarget)
    gl.setClearColor(prevClear, prevAlpha)
    const material = new THREE.MeshBasicMaterial({ map: rt.texture, alphaTest: 0.5, transparent: false })
    // 인스턴스 위치에 서서 항상 카메라 쪽을 보는 판 (위아래로는 기울지 않는다)
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `vec3 ip = instanceMatrix[3].xyz;
        float sc = length(instanceMatrix[0].xyz);
        vec3 toCam = cameraPosition - ip;
        toCam.y = 0.0;
        toCam = normalize(toCam);
        vec3 side = vec3(toCam.z, 0.0, -toCam.x);
        vec3 wp = ip + side * transformed.x * sc + vec3(0.0, transformed.y * sc, 0.0);
        vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
        gl_Position = projectionMatrix * mvPosition;`,
      )
    }
    material.customProgramCacheKey = () => 'billboard'
    const geometry = new THREE.PlaneGeometry(width, height).translate(0, height / 2, 0)
    return { geometry, material }
  }, [parts, gl])
}

function useItemData(items, scale) {
  return useMemo(() => {
    const o = new THREE.Object3D()
    const c = new THREE.Color()
    const matrices = new Float32Array(items.length * 16)
    const colors = new Float32Array(items.length * 3)
    items.forEach((it, i) => {
      o.position.set(it.x, it.y || 0, it.z)
      o.rotation.set(0, it.r || 0, 0)
      o.scale.setScalar((it.s || 1) * scale)
      o.updateMatrix()
      o.matrix.toArray(matrices, i * 16)
      const v = 0.88 + (it.c || 0) * 0.18
      c.setRGB(v, v, v).toArray(colors, i * 3)
    })
    return { matrices, colors }
  }, [items, scale])
}

// 거리별로 인스턴스를 채운다. near: 진짜 모델(조각마다 한 묶음), far: 그림판 한 묶음
function useDistanceFill(items, data, nearMeshes, farMesh, near, far) {
  const last = useRef({ x: 1e9, z: 1e9 })
  useFrame(({ camera }) => {
    // 처음 보는 메시는 색 버퍼를 달고 비운 뒤, 이번 프레임에 바로 채운다
    for (const m of [...nearMeshes.current, farMesh?.current]) {
      if (!m || m.userData.filled === data) continue
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(items.length * 3), 3)
      m.count = 0
      m.userData.filled = data
      last.current = { x: 1e9, z: 1e9 }
    }
    const cam = camera.position
    if (Math.hypot(cam.x - last.current.x, cam.z - last.current.z) < 6) return
    last.current = { x: cam.x, z: cam.z }
    const put = (m, k, i) => {
      m.instanceMatrix.array.set(data.matrices.subarray(i * 16, i * 16 + 16), k * 16)
      m.instanceColor.array.set(data.colors.subarray(i * 3, i * 3 + 3), k * 3)
    }
    let nn = 0
    let nf = 0
    for (let i = 0; i < items.length; i++) {
      const d = (items[i].x - cam.x) ** 2 + (items[i].z - cam.z) ** 2
      if (d < near * near) {
        for (const m of nearMeshes.current) m && put(m, nn, i)
        nn++
      } else if (farMesh && d < far * far) {
        put(farMesh.current, nf++, i)
      }
    }
    const done = (m, n) => {
      m.count = n
      for (const [attr, size] of [[m.instanceMatrix, 16], [m.instanceColor, 3]]) {
        attr.clearUpdateRanges()
        attr.addUpdateRange(0, Math.max(1, n) * size)
        attr.needsUpdate = true
      }
    }
    for (const m of nearMeshes.current) m && done(m, nn)
    if (farMesh?.current) done(farMesh.current, nf)
  })
}

function Trees({ name, items, materials, scale }) {
  const parts = useParts(name, materials)
  const impostor = useImpostor(parts)
  const data = useItemData(items, scale)
  const nearMeshes = useRef([])
  const farMesh = useRef()
  useDistanceFill(items, data, nearMeshes, farMesh, NEAR, FAR)
  return (
    <>
      {parts.map((p, i) => (
        <instancedMesh key={i} ref={(el) => (nearMeshes.current[i] = el)} args={[p.geometry, p.material, items.length]} castShadow receiveShadow frustumCulled={false} />
      ))}
      <instancedMesh ref={farMesh} args={[impostor.geometry, impostor.material, items.length]} frustumCulled={false} />
    </>
  )
}

// 덤불, 바위: 작아서 그림판 없이 가까운 것만 그린다
function Small({ name, items, materials, scale, near }) {
  const parts = useParts(name, materials)
  const data = useItemData(items, scale)
  const nearMeshes = useRef([])
  useDistanceFill(items, data, nearMeshes, null, near, near)
  return parts.map((p, i) => (
    <instancedMesh key={i} ref={(el) => (nearMeshes.current[i] = el)} args={[p.geometry, p.material, items.length]} receiveShadow frustumCulled={false} />
  ))
}

function split(items, names) {
  const out = Object.fromEntries(names.map((n) => [n, []]))
  items.forEach((it, i) => out[names[Math.floor((it.c * 997 + i * 0.37) % names.length)]].push(it))
  return out
}

export default function MegaForest() {
  const materials = useMaterials()
  useFrame((_, dt) => (wind.value += dt))
  const trees = useMemo(() => {
    const broad = TREES.filter((t) => t.c > 0.3)
    const pine = TREES.filter((t) => t.c <= 0.3)
    return { ...split(broad, BROADLEAF), ...split(pine, CONIFER) }
  }, [])
  const bushes = useMemo(() => {
    const rnd = seeded(74)
    const out = TREES.filter((_, i) => i % 3 === 0).map((t) => ({ x: t.x + 2.4, z: t.z + 1.5, y: groundHeight(t.x + 2.4, t.z + 1.5), r: t.r, s: 0.8 + t.c * 0.5, c: t.c }))
    for (const d of DISTRICTS) {
      const [cx, , cz] = PLACES[d.id].pos
      for (let i = 0; i < 40; i++) {
        const a = (i * Math.PI * 2) / 40
        const r = d.radius + 2.4 + rnd() * 1.2
        const x = cx + Math.sin(a) * r
        const z = cz + Math.cos(a) * r
        if (roadDistance(x, z) < 5.3 || Math.hypot(x - d.gate[0], z - d.gate[2]) < 7 || STORY_CLEARINGS.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 5)) continue
        out.push({ x, z, y: groundHeight(x, z), s: 0.8 + rnd() * 0.4, c: rnd(), r: a })
      }
    }
    return split(out, BUSHES)
  }, [])
  const rocks = useMemo(() => {
    const rnd = seeded(23)
    const out = []
    for (let i = 0; i < 1500 && out.length < 120; i++) {
      const x = (rnd() * 2 - 1) * 200
      const z = (rnd() * 2 - 1) * 200
      if (!isOpenGround(x, z, 5)) continue
      out.push({ x, z, y: groundHeight(x, z) - 0.2, r: rnd() * 6.28, s: 0.5 + rnd() * 0.7, c: rnd() })
    }
    return split(out, ROCKS)
  }, [])
  return (
    <group>
      {/* 모델 높이가 7~10m라 1.15배 × 나무마다 0.8~1.5배 */}
      {[...BROADLEAF, ...CONIFER].map((n) => <Trees key={n} name={n} items={trees[n]} materials={materials} scale={1.15} />)}
      {BUSHES.map((n) => <Small key={n} name={n} items={bushes[n]} materials={materials} scale={1.2} near={110} />)}
      {ROCKS.map((n) => <Small key={n} name={n} items={rocks[n]} materials={materials} scale={1} near={150} />)}
    </group>
  )
}
