import { Outskirts } from '../world/Scenery.jsx'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { FerrisWheel, RollerCoaster, Carousel } from '../world/Rides.jsx'
import { Harmonia, MyRoomHouse, Shop, Lab, Storage, Safari, CaveMountain, CubeVault, Signboard } from '../world/Landmarks.jsx'
import { SkyDome, Clouds, PostFX } from '../world/Atmosphere.jsx'
import Terrain from '../world/Terrain.jsx'
import FestivalFacilities from '../world/FestivalFacilities.jsx'
import { ALL_ROAD_SEGMENTS, PLACES, WORLD_HALF } from '../world/layout.js'
import { useSceneEntry, sceneShot, EntryCamera, EntryOverlay } from '../world/SceneEntry.jsx'

const views = { carousel: [10, 7, 18], ferris: [20, 9, 3], coaster: [-24, 12, 9], viking: [-12, 8.5, 20], food: [-10, 7, -21], parade: [2, 8, 21], overview: [125, 120, 155], walk: [0, 4.6, 22], entrance: [3, 3.8, 17] }
const FESTIVAL_PREVIEW = { viking: true, food: true, safari: true, parade: true }
function FrameProbe({ report }) {
  const sample=useRef({seconds:0,frames:0})
  useFrame((_,delta)=>{
    if(delta>0.5)return
    sample.current.seconds+=delta;sample.current.frames++
    if(sample.current.seconds>2) {report(Math.round(sample.current.frames/sample.current.seconds));sample.current={seconds:0,frames:0}}
  })
  return null
}
function Inspect({ selected, entry }) {
  const controls = useRef()
  const target = selected === 'overview' ? [0, 0, 0] : selected === 'walk' ? [0, 0, 35] : selected === 'entrance' ? [-30, 0, 64] : PLACES[selected].pos
  const last = useRef(null)
  useFrame(({ camera }) => {
    if (last.current === selected || !controls.current || entry.active) return
    last.current = selected
    camera.position.set(...target.map((v, i) => v + views[selected][i]))
    controls.current.target.set(target[0], { ferris: 12, coaster: 6, viking: 6.5, walk: 2 }[selected] ?? 3, target[2])
    controls.current.update()
  })
  return <OrbitControls ref={controls} enabled={!entry.active} maxPolarAngle={Math.PI / 2 - 0.02} minDistance={5} maxDistance={420} />
}
export default function WorldPreview() {
  const [selected, select] = useState('carousel'), [stopped, stop] = useState(false), [mission, showMission] = useState(false)
  const [fps,setFps]=useState(null)
  const entry = useSceneEntry(mission)
  return <div className="room-page world">
    <Canvas shadows camera={{ position: [-22, 9, 65], far: 800, fov: 50 }} dpr={[1, 1.5]}>
      <SkyDome top={stopped ? '#8E99AE' : '#5594B4'} horizon="#DCE8E6" />
      <fog attach="fog" args={['#DCE8E6', 55, 260]} />
      <hemisphereLight args={['#DDF0FF', '#38503D', 0.85]} /><ambientLight intensity={0.32} />
      <directionalLight position={[-10, 70, 55]} intensity={2.1} color="#FFF0D9" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-90} shadow-camera-right={90} shadow-camera-top={90} shadow-camera-bottom={-90} shadow-camera-far={220} shadow-normalBias={0.08} />
      <Terrain roads={ALL_ROAD_SEGMENTS} half={WORLD_HALF} night={stopped} />
      <MyRoomHouse /><Shop state="open" /><Lab open /><Storage /><Safari /><CaveMountain open /><CubeVault open={false} cubes={false} /><Signboard stopped={stopped} /><Outskirts />
      <Clouds dim={stopped} /><Harmonia stopped={stopped} /><FerrisWheel stopped={stopped} /><RollerCoaster stopped={stopped} /><Carousel stopped={stopped} locked={false} />
      <FestivalFacilities records={stopped ? {} : FESTIVAL_PREVIEW} />
      <Inspect selected={selected} entry={entry} /><EntryCamera entry={entry} /><PostFX bloom={0.28} /><FrameProbe report={setFps}/>
    </Canvas>
    <div className="hud hud-top"><span className="room-title">도로랜드 · 그래픽 미리보기</span>
      {Object.entries({ carousel: '회전목마', ferris: '관람차', coaster: '롤러코스터', viking: '바이킹', food: '푸드코트', parade: '축제 무대', overview: '맵 전체', walk: '숲길', entrance: '입구' }).map(([id, label]) => <button key={id} className="license-btn" disabled={entry.active} onClick={() => select(id)}>{label}</button>)}
      <button className="license-btn" onClick={() => stop(!stopped)}>{stopped ? '운행 재개' : '정지 상태'}</button>
      <button className="license-btn" disabled={entry.active || !PLACES[selected]} onClick={() => entry.enter(sceneShot(PLACES[selected].pos, PLACES[selected].name, views[selected], selected === 'ferris' ? 10 : 3), () => showMission(true))}>입장 연출</button>
    </div>
    <div className="hud hint">드래그로 회전 · 휠로 확대 · 저장 데이터 변경 없음 <output aria-label="미리보기 프레임">{fps ? ` · ${fps} FPS` : ''}</output></div>
    <EntryOverlay entry={entry} />
    {mission && <div className="modal-bg"><div className="mission" role="dialog" aria-label="입장 연출 확인"><h2>{PLACES[selected].name}</h2><p>장소별 카메라 전환 완료</p><button className="btn-primary" onClick={() => showMission(false)}>탐험 시점으로 돌아가기</button></div></div>}
  </div>
}
