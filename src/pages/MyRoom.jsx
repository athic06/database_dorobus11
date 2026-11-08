import { useSceneEntry, sceneShot, EntryCamera, EntryOverlay } from '../world/SceneEntry.jsx'
import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useLocation, useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import Room from '../myroom/Room.jsx'
import Robot, { INITIAL_VIEW, viewOffset } from '../myroom/Robot.jsx'
import ViewControls from '../myroom/ViewControls.jsx'
import Portal, { PORTAL_POS } from '../myroom/Portal.jsx'
import Door, { DOOR_POS } from '../myroom/Door.jsx'
import Car, { CAR_POS } from '../myroom/Car.jsx'
import { PianoSofa, OwnedFurniture, ComputerDesk } from '../myroom/Furniture.jsx'
import ComputerScreen from '../components/ComputerScreen.jsx'
import ShopModal from '../myroom/ShopModal.jsx'
import { CarRepairField } from './Repair.jsx'
import DialogBox from '../components/DialogBox.jsx'
import RoomHud from '../components/RoomHud.jsx'
import { useKeyboard } from '../myroom/useKeyboard.js'
import { useProximity } from '../game/useProximity.js'
import { PostFX } from '../world/Atmosphere.jsx'
import { useStore } from '../store.jsx'
import { hasLicense, storyDone } from '../game/progress.js'
import License, { LICENSE_POS } from '../myroom/License.jsx'
import LicenseCard from '../components/LicenseCard.jsx'
import PianoGame from '../minigames/PianoGame.jsx'
import TreasureEditor from '../minigames/TreasureEditor.jsx'
import FixMission from '../missions/FixMission.jsx'
import GoalCard from '../components/GoalCard.jsx'
import ParkPanel from '../components/ParkPanel.jsx'
import { ROOM_AWAY_DAYS, daysSince, today } from '../game/daily.js'

const INTRO_LINES = [
  { who: '자일로', text: '드디어 오셨군요! 어서 오세요, 도로랜드에. 전 총책임자 자일로라고 합니다.' },
  { who: '자일로', text: '도로랜드는 기술과 자연이 조화롭게 어우러지는 곳이에요. 자, 받으세요. 도로랜드 지도입니다.' },
  { who: '제로', text: '어? 지도에 처음 보는 문양이 하나 그려져 있어요.' },
  { who: '자일로', text: '이 넓은 곳을 걸어 다닐 순 없겠죠? 선물로 모바일 로봇 자동차를 준비했어요. 단, 조립과 점검은 100% 셀프!' },
  { who: '리코', text: '완성!! 그런데 오래 창고에 있던 차라 똑바로 안 간대. 자동차 앞에서 E를 눌러 같이 고쳐 보자!' },
  { who: '자일로', text: '자동차를 고치면 운전면허증을 드릴게요. 면허증이 있어야 도로랜드를 달릴 수 있어요.' },
]
const NEED_CHECK_LINES = [
  { who: '리코', text: '잠깐! 운전면허증이 있어야 나갈 수 있어. 자동차를 고치면 자일로가 면허증을 준대. 자동차 앞에서 E!' },
]
const LICENSE_DONE_LINES = [
  { who: '자일로', text: '이제 정식 모바일 로봇 운전자예요. 면허증은 도로랜드에서 🪪 버튼으로 언제든 볼 수 있어요.' },
  { who: '리코', text: '지도의 이상한 문양은 북동쪽 산의 동굴을 가리키고 있어. 문으로 나가서 가 보자!' },
]
const NEED_LICENSE_LINES = [
  { who: '리코', text: '잠깐! 면허증을 안 챙겼어. 자동차 옆 받침대에 있어!' },
]

const SOFA_POS = [-6.5, 0, 6]
// 컴퓨터 책상 (왼쪽 벽). 의자에 앉으면 로봇이 모니터(-x)를 본다
const DESK_POS = [-9.25, 0, 0.2]
const CHAIR_POS = [-8.1, 0, 0.2]

const PROMPTS = {
  sofa: '피아노 소파 · 미니게임으로 전환',
  desk: '컴퓨터 책상 · 앉아서 미니게임',

  license: '운전면허증 챙기기',
  portal: '상점 입장',
  door: '외출하기',
  car: '자동차 고치기',
}

export default function MyRoom() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, owned, progress, setProgress } = useStore()
  // 상점 공간에서 돌아오면 포탈 앞에서 시작한다
  const posRef = useRef(new THREE.Vector3(...(location.state?.from === 'store' ? [7.6, 0, -4] : [0, 0, 2])))
  const targetRef = useRef(null)
  const view = useRef({ ...INITIAL_VIEW })
  // 다른 화면의 "다음 행동" 버튼으로 들어오면 그 창을 바로 연다 (상점 · 셀 숨기기 · 테마파크)
  const [panel, setPanel] = useState(() => {
    const want = location.state?.panel
    if (want === 'editor') return storyDone(progress) ? 'editor' : null
    return ['shop', 'park'].includes(want) ? want : null
  }) // 'shop' | 'mission'
  const [dialog, setDialog] = useState(null) // { lines, onDone }
  const [bubble, setBubble] = useState('')

  const carVisible = progress.introSeen
  const needLicense = progress.carCheckDone && !hasLicense(progress)
  const { near, nearRef, onMove } = useProximity([
    { id: 'portal', pos: [PORTAL_POS[0] - 0.2, 0, PORTAL_POS[2]] },
    { id: 'door', pos: DOOR_POS },
    { id: 'car', pos: CAR_POS, radius: 2.6, hidden: !carVisible },
    { id: 'sofa', pos: SOFA_POS, radius: 2.8 },
    { id: 'desk', pos: CHAIR_POS, radius: 1.9 },
    { id: 'license', pos: LICENSE_POS, radius: 1.8, hidden: !needLicense },
  ])

  const say = (lines, onDone) => setDialog({ lines, onDone })

  // 챕터 1 시작: 마이룸에 처음 들어오면 바로 지도와 자동차를 받는다(수업과 연결하지 않음).
  useEffect(() => {
    if (!progress.introSeen && !dialog) {
      say(INTRO_LINES, () => {
        setProgress({ introSeen: true })
        setDialog(null)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.introSeen])

  // 스토리 이후 A: 오래 비웠다 돌아오면 소파 피아노가 고장 나 있다
  useEffect(() => {
    if (!storyDone(progress)) return
    const away = daysSince(progress.roomVisit)
    const broke = progress.roomVisit && away >= ROOM_AWAY_DAYS && !progress.sofaBroken
    setProgress({ roomVisit: today(), ...(broke ? { sofaBroken: true } : {}) })
    if (broke)
      say(
        [
          { text: '(오랜만에 돌아온 마이룸. 소파 피아노 쪽에서 삐걱, 이상한 소리가 난다.)' },
          { who: '제로', text: `${away}일 동안 비웠더니… 보이드가 심심했는지 건반을 만지다가 고장 냈나 봐!` },
          { who: '리코', text: '소파 피아노 앞에서 E를 눌러 고쳐 보자.' },
        ],
        () => setDialog(null),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const executeInteraction = (id) => {
    if (id === 'portal') navigate('/store')
    if (id === 'desk') {
      posRef.current.set(...CHAIR_POS)
      setPanel('computer')
    }
    if (id === 'sofa') setPanel(progress.sofaBroken ? 'fix-sofa' : 'piano')
    if (id === 'door') {
      if (!progress.carCheckDone) say(NEED_CHECK_LINES, () => setDialog(null))
      else if (needLicense) say(NEED_LICENSE_LINES, () => setDialog(null))
      else navigate('/world', { state: { from: 'myroom' } })
    }
    if (id === 'license') {
      setProgress({ licenseGot: true, licenseDate: today() })
      setPanel('license')
    }
    if (id === 'car') {
      if (!progress.carCheckDone) setPanel('mission')
      else say([{ who: '리코', text: '자동차는 고쳤고 면허증도 받았어! 문으로 나가면 도로랜드를 달릴 수 있어.' }], () => setDialog(null))
    }
  }

  const entry = useSceneEntry(!!dialog || !!panel)
  // 카메라 연출은 다른 공간에 들어갈 때만 (상점, 도로랜드). 나머지는 바로 실행한다.
  const interact = (id) => {
    if (entry.active) return
    const leaves = id === 'portal' || (id === 'door' && progress.carCheckDone && !needLicense)
    if (!leaves) return executeInteraction(id)
    const pos = { portal: PORTAL_POS, door: DOOR_POS, car: CAR_POS, license: LICENSE_POS, sofa: SOFA_POS, desk: DESK_POS }[id] || posRef.current.toArray()
    const offset = id === 'desk' ? [4, 2.6, 2] : id === 'portal' ? [-4, 3, 4] : [3, 3, 5]
    entry.enter(sceneShot(pos, PROMPTS[id] || '마이룸', offset, id === 'car' ? 0.9 : 1.5), () => executeInteraction(id))
  }
  const busy = entry.active || !!dialog || !!panel
  const keys = useKeyboard((code) => {
    if (code === 'KeyE' && !busy && nearRef.current) interact(nearRef.current)
  }, panel !== 'computer')

  useEffect(() => {
    if (!bubble) return
    const id = setTimeout(() => setBubble(''), 5000)
    return () => clearTimeout(id)
  }, [bubble])

  const start = posRef.current.clone().add(viewOffset(view.current))
  const promptText =
    near === 'car' && progress.carCheckDone ? '자동차 살펴보기' : near === 'car' ? '자동차 고치기' : near === 'sofa' && progress.sofaBroken ? '소파 피아노 · 고장 수리' : PROMPTS[near]

  // 자동차 수리 미션(고장 수사대 방식). 다 고치면 운전면허증
  if (panel === 'mission') return (
    <CarRepairField
      onClose={() => setPanel(null)}
      onClear={() => {
        setProgress({ carCheckDone: true, licenseGot: true, licenseDate: today() })
        setPanel('license')
      }}
    />
  )

  if (panel === 'computer') return (
    <ComputerScreen
      onClose={() => { setPanel(null); posRef.current.set(CHAIR_POS[0] + 1.2, 0, CHAIR_POS[2]) }}
      onPiano={() => setPanel('piano')}
    />
  )

  return (
    <div className="room-page">
      <Canvas shadows="soft" camera={{ position: [start.x, start.y, start.z], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#1b1410']} />
        <ambientLight intensity={0.75} />
        <hemisphereLight args={['#fff4e6', '#5a3a22', 0.5]} />
        <directionalLight
          position={[-6, 12, 8]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
        />
        {!entry.active && <ViewControls view={view} />}
        <Room />
        <Door locked={!progress.carCheckDone} />
        <PianoSofa position={SOFA_POS} rotation={[0, Math.PI / 4, 0]} />
        <ComputerDesk position={DESK_POS} />
        <OwnedFurniture owned={owned} />
        {carVisible && <Car checked={progress.carCheckDone} />}
        {needLicense && <License name={user.name} />}
        <Portal active={near === 'portal'} onClick={() => (near === 'portal' && !busy ? interact('portal') : null)} />
        <Robot
          posRef={posRef}
          targetRef={targetRef}
          keys={keys}
          view={view}
          name={user.name}
          bubble={bubble}
          onMove={onMove}
          frozen={busy}
          cameraControlled={entry.active}
        />
        <PostFX bloom={0.5} />
        <EntryCamera entry={entry} />
      </Canvas>
      <EntryOverlay entry={entry} />

      <RoomHud title={`${user.name}의 마이룸`} onChat={setBubble} />

      {near && !busy && (
        <button className="hud prompt" onClick={() => interact(near)}>E · {promptText}</button>
      )}

      {dialog && <DialogBox lines={dialog.lines} onDone={dialog.onDone} />}
      {!busy && (
        <div className="hud room-side">
          <GoalCard onOpenShop={() => setPanel('shop')} onOpenPark={() => setPanel('park')} />
          <button className="side-btn park-btn" onClick={() => setPanel('park')}>🎡 테마파크 운영</button>
          {storyDone(progress) && <button className="side-btn make-game" onClick={() => setPanel('editor')}>🎮 셀 숨기기</button>}
        </div>
      )}
      {panel === 'park' && <ParkPanel onClose={() => setPanel(null)} onOpenShop={() => setPanel('shop')} />}
      {panel === 'shop' && <ShopModal onClose={() => setPanel(null)} />}
      {panel === 'piano' && <PianoGame onClose={() => setPanel(null)} />}
      {panel === 'editor' && <TreasureEditor onClose={() => setPanel(null)} onOpenShop={() => setPanel('shop')} />}
      {panel === 'license' && (
        <LicenseCard
          fresh
          onClose={() => {
            setPanel(null)
            say(LICENSE_DONE_LINES, () => setDialog(null))
          }}
        />
      )}
      {panel === 'fix-sofa' && <FixMission id="sofa" onClose={() => setPanel(null)} onFixed={() => setPanel(null)} />}
    </div>
  )
}
