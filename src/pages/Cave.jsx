import { useEffect, useRef, useState } from 'react'
import { PostFX } from '../world/Atmosphere.jsx'
import { Canvas, useFrame } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import Robot, { viewOffset } from '../myroom/Robot.jsx'
import ViewControls from '../myroom/ViewControls.jsx'
import CaveScene, { CAVE_BOUNDS, DIARY_POS, ENTRANCE_POS, EXIT_POS, SIGN_POS } from '../cave/CaveScene.jsx'
import CaveExitMission from '../missions/CaveExitMission.jsx'
import { Naty } from '../world/Characters.jsx'
import DialogBox from '../components/DialogBox.jsx'
import RoomHud from '../components/RoomHud.jsx'
import { useKeyboard } from '../myroom/useKeyboard.js'
import { useProximity } from '../game/useProximity.js'
import { useStore } from '../store.jsx'

const INTRO = [
  { text: '(지도의 문양이 가리키는 곳에 도착했다. 커다란 동굴이다.)' },
  { who: '리코', text: '아주 어두컴컴하네… 손전등 챙겨 오길 잘했어!' },
  { text: '(붉은빛의 작은 무언가가 동굴 안쪽에서 깜빡인다.)' },
  { who: '제로', text: '저건… 네이티? 따라오라는 듯이 움직여. 네이티를 따라가 보자!' },
]
const DIARY = [
  { who: '리코', text: '이렇게 깊은 곳에 왜 이런 게…? 이건, 일기장이야.' },
  { text: '(이름 없는 낡은 일기장. 첫 장에는 밝게 웃고 있는 사람들이 그려져 있다.)' },
  { text: '(뒷장으로 넘길수록 그림이 바뀐다. 슬퍼하는 사람들, 메말라 가는 땅, 그리고 무시무시한 건설 기계들.)' },
  { who: '제로', text: '여기 울고 있는 사람 옆에 이상한 기계들이 보여. 무슨 일이 있었던 거지?' },
  { who: '일기장', text: '"모든 생명은 연결되어 있다. 그러나 그 연결을 이어주는 멜로디가 사라지면 모든 것은 멈추고 말 것이다."' },
  { who: '리코', text: '멜로디…? 하모니아 얘기일까?' },
  { text: '(일기장 뒤표지 안쪽에 작고 낡은 열쇠 하나가 붙어 있다. 일단 챙겨 두었다.)' },
  { text: '(쿠르릉…! 동굴이 흔들리더니 들어온 길이 무너졌다. 네이티도 사라졌다.)' },
  { who: '리코', text: '으악! 입구가 막혔어!' },
  { who: '제로', text: '저기 지도 표지판이 있어. 지도를 보고 다른 출구를 찾아보자!' },
]
const BLOCKED = [{ who: '리코', text: '돌이 무너져서 막혔어! 지도 표지판에서 다른 출구를 찾자.' }]
const OUTRO = [
  { text: '(동굴 밖으로 나오자 눈이 부시다.)' },
  { who: '리코', text: '휴, 나왔다! …어? 왜 이렇게 조용하지?' },
  { who: '제로', text: '하모니아 음악이… 안 들려. 관람차도, 롤러코스터도 멈췄어!' },
  { who: '리코', text: '일기장에 적힌 그대로야. 멜로디가 사라지면 모든 것이 멈춘다고…' },
  { who: '???', text: '너희에게 하모니아의 음악은 어울리지 않는다. 도로랜드의 음악은 여기서 끝이다.' },
  { who: '제로', text: '방금 그 목소리… 도대체 누구지? 일단 자일로에게 가 보자!' },
]

// 로봇을 따라다니는 손전등 불빛
function Lantern({ posRef }) {
  const light = useRef()
  useFrame(() => light.current.position.set(posRef.current.x, 2.2, posRef.current.z))
  return <pointLight ref={light} color="#FFE7B0" intensity={10} distance={9} castShadow={false} />
}

export default function Cave() {
  const navigate = useNavigate()
  const { user, progress, setProgress } = useStore()
  const posRef = useRef(new THREE.Vector3(0, 0, 8.5))
  const targetRef = useRef(null)
  const view = useRef({ yaw: 0, pitch: 0.62, dist: 10 })
  const [dialog, setDialog] = useState(null)
  const [mission, setMission] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [bubble, setBubble] = useState('')

  const { near, nearRef, onMove } = useProximity([
    { id: 'diary', pos: DIARY_POS, hidden: progress.diaryFound },
    { id: 'sign', pos: SIGN_POS, hidden: !progress.diaryFound || progress.caveCleared },
    { id: 'entrance', pos: ENTRANCE_POS, radius: 2 },
    { id: 'exit', pos: EXIT_POS, hidden: !progress.caveCleared },
  ])

  const say = (lines, onDone) => setDialog({ lines, onDone: onDone || (() => setDialog(null)) })

  useEffect(() => {
    if (!progress.carCheckDone) navigate('/world', { replace: true })
    else if (!progress.caveIntroSeen) say(INTRO, () => { setProgress({ caveIntroSeen: true }); setDialog(null) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!bubble) return
    const id = setTimeout(() => setBubble(''), 5000)
    return () => clearTimeout(id)
  }, [bubble])

  const interact = (id) => {
    if (id === 'diary') say(DIARY, () => { setProgress({ diaryFound: true }); setDialog(null) })
    if (id === 'sign') setMission(true)
    if (id === 'entrance') {
      if (progress.diaryFound) say(BLOCKED)
      else navigate('/world', { state: { from: 'cave' } })
    }
    if (id === 'exit') navigate('/world', { state: { from: 'cave' } })
  }

  const busy = !!dialog || mission || cleared
  const keys = useKeyboard((code) => {
    if (code === 'KeyE' && !busy && nearRef.current) interact(nearRef.current)
  })

  const PROMPTS = {
    diary: '반짝이는 물건 줍기',
    sign: '지도 표지판 보기 · 출구 찾기',
    entrance: progress.diaryFound ? '무너진 입구' : '동굴 나가기',
    exit: '동굴 밖으로',
  }
  const start = posRef.current.clone().add(viewOffset(view.current))

  return (
    <div className="room-page">
      <Canvas shadows="soft" camera={{ position: [start.x, start.y, start.z], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#0b0a0f']} />
        <fog attach="fog" args={['#0b0a0f', 14, 34]} />
        <ambientLight intensity={0.28} />
        <hemisphereLight args={['#6b7a99', '#1a120c', 0.35]} />
        <ViewControls view={view} />
        <CaveScene diaryFound={progress.diaryFound} caveCleared={progress.caveCleared} />
        <Lantern posRef={posRef} />
        {!progress.diaryFound && <Naty position={[-1.2, 1.4, -5.5]} color="red" scale={0.8} />}
        <Robot
          posRef={posRef}
          targetRef={targetRef}
          keys={keys}
          view={view}
          name={user.name}
          bubble={bubble}
          onMove={onMove}
          bounds={CAVE_BOUNDS}
          frozen={busy}
        />
        <PostFX bloom={1.1} />
      </Canvas>

      <RoomHud title="동굴" backTo="/world" backLabel="← 도로랜드" onChat={setBubble} />

      {near && !busy && (
        <button className="hud prompt" onClick={() => interact(near)}>E · {PROMPTS[near]}</button>
      )}
      {dialog && <DialogBox lines={dialog.lines} onDone={dialog.onDone} />}
      {mission && (
        <CaveExitMission
          onClose={() => setMission(false)}
          onClear={() => {
            setMission(false)
            say(OUTRO, () => {
              setDialog(null)
              setProgress({ caveCleared: true })
              setCleared(true)
            })
          }}
        />
      )}
      {cleared && (
        <div className="modal-bg">
          <div className="chapter-clear">
            <span className="cc-eyebrow">CHAPTER 2 CLEAR</span>
            <h2>멈춰버린 하모니아</h2>
            <p>동굴에서 낡은 일기장을 찾고 출구를 빠져나왔어요. 그런데 도로랜드를 울리던 하모니아의 음악이 멈춰 버렸어요.</p>
            <p className="cc-next">챕터 3 · 하모니아 광장 — 마이룸 앞의 자일로를 찾아가요</p>
            <div className="cc-actions">
              <button className="btn-ghost" onClick={() => navigate('/')}>대시보드</button>
              <button className="btn-primary" onClick={() => navigate('/world', { state: { from: 'cave' } })}>도로랜드로 나가기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
