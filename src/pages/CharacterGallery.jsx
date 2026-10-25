import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { CodexSilhouette, Naty, Riko, TealGuy, VoidBot, Xylo, Zero } from '../world/Characters.jsx'
import { POSE_NAMES } from '../world/Toon.jsx'

// 캐릭터 3D 모형을 한눈에 비교하는 페이지 (#/dev/characters).
// 포즈 버튼으로 캐릭터 시트의 동작을 바꾸고, 이름 버튼으로 한 캐릭터를 가까이 본다.
const CAST = [
  { id: 'zero', name: '제로', x: -6, C: Zero },
  { id: 'riko', name: '리코', x: -3.6, C: Riko },
  { id: 'xylo', name: '자일로', x: -1.2, C: Xylo },
  { id: 'teal', name: '???', x: 1.2, C: TealGuy },
  { id: 'void', name: '보이드', x: 3.5 },
  { id: 'codex', name: '코덱스', x: 5.6 },
  { id: 'naty', name: '네이티', x: 7.6 },
]

function CameraRig({ focus, controls }) {
  const { camera } = useThree()
  useEffect(() => {
    const c = CAST.find((x) => x.id === focus)
    const [x, y, z, ty] = c ? [c.x, 2.1, 4.2, 1.6] : [0.8, 2.4, 15, 1.3]
    camera.position.set(x, y, z)
    controls.current?.target.set(c ? c.x : 0.8, ty, 0)
    controls.current?.update()
  }, [focus, camera, controls])
  return null
}

export default function CharacterGallery() {
  const [pose, setPose] = useState('idle')
  const [focus, setFocus] = useState(null)
  const controls = useRef()
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#EEF1F6' }}>
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 2, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <b style={{ marginRight: 8 }}>캐릭터 3D 모형</b>
        {Object.entries(POSE_NAMES).map(([id, name]) => (
          <button key={id} className={pose === id ? 'chip on' : 'chip'} aria-pressed={pose === id} onClick={() => setPose(id)}>{name}</button>
        ))}
        <span style={{ width: 12 }} />
        <button className={!focus ? 'chip on' : 'chip'} aria-pressed={!focus} onClick={() => setFocus(null)}>전체</button>
        {CAST.map((c) => (
          <button key={c.id} className={focus === c.id ? 'chip on' : 'chip'} aria-pressed={focus === c.id} onClick={() => setFocus(c.id)}>{c.name}</button>
        ))}
        <small style={{ color: '#6a7385' }}>드래그로 돌려 보기 · 휠로 확대</small>
      </div>
      <Canvas shadows camera={{ position: [0.8, 2.4, 15], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={['#EEF1F6']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 8, 6]} intensity={1.3} castShadow />
        <OrbitControls ref={controls} target={[0.8, 1.3, 0]} />
        <CameraRig focus={focus} controls={controls} />
        {CAST.filter((c) => c.C).map(({ id, x, C }) => <C key={id} position={[x, 0, 0]} pose={pose} />)}
        <VoidBot position={[3.5, 0, 0]} happy={pose === 'cheer' || pose === 'open'} />
        <CodexSilhouette position={[5.6, 0, 0]} revealed />
        <Naty position={[7.6, 1.2, 0]} label="네이티" />
        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={30} blur={2} far={4} />
      </Canvas>
    </div>
  )
}
