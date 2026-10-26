import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// 움직이지 않는 조각들을 재질(색·질감)별로 하나의 도형으로 합쳐, 그리기 호출을 크게 줄인다.
// 예: 관람차 기둥·받침·울타리처럼 수십 개로 나뉜 조각이 재질 몇 개 수만큼의 묶음이 된다.
// - 움직이는 부분(회전하는 바퀴, 차량 등)은 그 그룹에 userData={{ dynamic: true }}를 달면 건너뛴다.
// - 이미 묶어 그리는 InstancedMesh, 이름표(Html)는 그대로 둔다.
// - deps가 바뀌면(멈춤 상태 등 모양이 바뀔 때) 원래 조각으로 되돌렸다가 다시 합친다.
const KEEP = ['position', 'normal', 'uv']

function materialKey(m) {
  return [
    m.type, m.color?.getHexString(), m.emissive?.getHexString(), m.emissiveIntensity, m.roughness, m.metalness,
    m.transparent, m.opacity, m.side, m.flatShading, m.map?.uuid, m.toneMapped, m.vertexColors, m.alphaTest, m.depthWrite,
  ].join('|')
}

export default function MergeStatic({ children, deps = [] }) {
  const root = useRef()
  useLayoutEffect(() => {
    const g = root.current
    g.updateMatrixWorld(true)
    const inv = new THREE.Matrix4().copy(g.matrixWorld).invert()
    const buckets = new Map()
    const hidden = []
    const m4 = new THREE.Matrix4()
    const visit = (o) => {
      if (o.userData.dynamic || o.userData.merged) return
      if (o.isMesh && !o.isInstancedMesh && o.visible && !Array.isArray(o.material) && o.geometry?.attributes.position) {
        const key = materialKey(o.material)
        if (!buckets.has(key)) buckets.set(key, { material: o.material, geos: [], cast: false, receive: false })
        const b = buckets.get(key)
        let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()
        for (const name of Object.keys(geo.attributes)) if (!KEEP.includes(name)) geo.deleteAttribute(name)
        if (!geo.attributes.normal) geo.computeVertexNormals()
        if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2))
        geo.applyMatrix4(m4.multiplyMatrices(inv, o.matrixWorld))
        b.geos.push(geo)
        b.cast ||= o.castShadow
        b.receive ||= o.receiveShadow
        hidden.push(o)
      }
      for (const c of o.children) visit(c)
    }
    for (const c of g.children) visit(c)
    const added = []
    for (const b of buckets.values()) {
      // 조각이 하나뿐이면 합쳐도 이득이 없으니 그대로 둔다
      if (b.geos.length < 2) {
        b.geos.forEach((x) => x.dispose())
        continue
      }
      const merged = mergeGeometries(b.geos)
      b.geos.forEach((x) => x.dispose())
      if (!merged) continue
      merged.computeBoundingSphere()
      const mesh = new THREE.Mesh(merged, b.material)
      mesh.castShadow = b.cast
      mesh.receiveShadow = b.receive
      mesh.userData.merged = true
      g.add(mesh)
      added.push(mesh)
    }
    // 합쳐진 조각만 숨긴다
    const mergedKeys = new Set([...buckets.entries()].filter(([, b]) => b.geos.length >= 2).map(([k]) => k))
    const hid = hidden.filter((o) => mergedKeys.has(materialKey(o.material)))
    hid.forEach((o) => (o.visible = false))
    return () => {
      hid.forEach((o) => (o.visible = true))
      added.forEach((m) => {
        g.remove(m)
        m.geometry.dispose()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return <group ref={root}>{children}</group>
}
