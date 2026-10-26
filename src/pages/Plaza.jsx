import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, Stars } from '@react-three/drei'
import { QuestPanel } from '../components/Routine.jsx'
import { storyDone } from '../game/progress.js'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import Robot, { viewOffset } from '../myroom/Robot.jsx'
import ViewControls from '../myroom/ViewControls.jsx'
import PlazaScene, { PLAZA_RADIUS, SPOTS } from '../plaza/PlazaScene.jsx'
import MelodyMission from '../missions/MelodyMission.jsx'
import LightsMission from '../missions/LightsMission.jsx'
import FacilityMission from '../missions/FacilityMission.jsx'
import HomeworkMission from '../missions/HomeworkMission.jsx'
import { HOMEWORK, pendingHomework } from '../game/homework.js'
import DialogBox from '../components/DialogBox.jsx'
import RoomHud from '../components/RoomHud.jsx'
import ParkPanel from '../components/ParkPanel.jsx'
import { parkOpen } from '../game/park.js'
import { useKeyboard } from '../myroom/useKeyboard.js'
import { useProximity } from '../game/useProximity.js'
import { FACILITY_GOAL } from '../game/progress.js'
import { PostFX, Glitter } from '../world/Atmosphere.jsx'
import { useStore } from '../store.jsx'

const INTRO = [
  { text: '(광장 안은 조용하다. 상점 쪽 길도, 놀이기구도 모두 멈춰 있다.)' },
  { who: '자일로', text: '하모니아는 음악을 에너지로 바꿔 도로랜드 전체를 움직여요. 노래만 되살리면 다시 움직일 거예요.' },
  { who: '자일로', text: '어디 보자, 여기 악보가… 어? 하모니아의 노래 악보가 없어요! 분명 보관해 뒀는데.' },
  { who: '제로', text: '나는 그 조용하고 따뜻한 멜로디가 아직 기억나!' },
  { who: '리코', text: '아니야, 도로랜드 음악은 신나고 에너지가 넘쳤다고!' },
  { who: '제로', text: '기억은 달라도 들었던 노래는 같았을 거야. 각자의 기억을 모으면 원래 멜로디를 되살릴 수 있지 않을까?' },
  { who: '리코', text: '좋아. 악보대로 가 보자!' },
]
// 공식 스토리: 사라진 악보 → 기억으로 멜로디 복원 → 하모니아 수리 완료 (하모니아가 도로랜드 전체 전력을 맡는다)
// 조명 미션은 '하모니아는 고쳐졌지만 광장 전등 연결만 끊겨 있었다'로 잇고, 불이 켜지면 방문객이 돌아와 요청을 한다
const RESTORED = [
  { text: '(하모니아가 다시 노래하기 시작한다. 하모니아 수리 완료! 도로랜드 곳곳에 전력이 돌아온다.)' },
  { who: '자일로', text: '그거 좋은데요! 하모니아가 도로랜드 전체에 전기를 보내 주니까 관람차도, 롤러코스터도 다시 돌아가요.' },
  { who: '리코', text: '그런데 광장만 아직 깜깜해. 하모니아가 멈출 때 광장 전등 연결이 끊겼나 봐.' },
  { who: '자일로', text: '조명 제어반에서 전등을 다시 연결하고, 언제 켜지고 꺼질지 조건을 정해 줘야겠어요.' },
]
const LIT = [
  { text: '(해가 지자 광장 전등이 하나둘 켜진다. 음악과 불빛을 보고 사람들이 광장으로 돌아온다.)' },
  { who: '방문객', text: '광장에 불이 다시 켜졌네! 그런데… 앉을 곳도, 물 마실 곳도 없잖아?' },
  { who: '자일로', text: '하모니아가 멈춰 있는 동안 광장 시설을 모두 치워 뒀거든요. 방문객들이 원하는 시설을 하나씩 다시 놓아 볼까요?' },
  { who: '제로', text: '좋아! 방문객 요청부터 들어 보자.' },
]
const AFTER_FACILITIES = [
  { who: '자일로', text: '광장이 다시 북적이네요. 상점 주인도 돌아왔대요! 광장 서쪽 상점에 가서 재개장 준비를 도와줄래요?' },
]
const LORE = [
  '하모니아가 멈춘 건 이번이 처음이 아니란다. 아주 오래전에도 한 번 조용해진 적이 있었지.',
  '도로랜드가 생기기 전, 여긴 나무와 풀이 무성한 숲이었어. 숲의 소리가 꼭 노래 같았단다.',
  '일기장? 숲을 지키며 무언가를 늘 기록하던 사람이 있었던 것 같구나.',
  '회전목마 옆의 오래된 돌 구조물 말이야. 하모니아가 힘차게 노래하면 열린다는 소문이 있었지.',
]

// 광장 일일 퀘스트 게시판 (정문 오른쪽)
const BOARD_POS = [4.8, 0, 10.6]
function QuestBoardModel() {
  return (
    <group position={BOARD_POS} rotation={[0, -0.4, 0]}>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.9, 0]} castShadow><boxGeometry args={[0.12, 1.8, 0.12]} /><meshStandardMaterial color="#8B6A4A" /></mesh>
      ))}
      <mesh position={[0, 1.7, 0.02]} castShadow><boxGeometry args={[1.8, 1.1, 0.1]} /><meshStandardMaterial color="#C99A6B" /></mesh>
      {[[-0.45, 1.85], [0.4, 1.75], [-0.1, 1.5]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.08]}><planeGeometry args={[0.5, 0.35]} /><meshStandardMaterial color={['#FFF7E6', '#E4EBFA', '#FCEBD2'][i]} /></mesh>
      ))}
      <Html position={[0, 2.7, 0]} center zIndexRange={[1, 0]}><div className="portal-label">📋 일일 퀘스트</div></Html>
    </group>
  )
}

export default function Plaza() {
  const navigate = useNavigate()
  const { user, progress, setProgress } = useStore()
  const posRef = useRef(new THREE.Vector3(0, 0, 10.5))
  const targetRef = useRef(null)
  const view = useRef({ yaw: 0, pitch: 0.62, dist: 10 })
  const [dialog, setDialog] = useState(null)
  const [mission, setMission] = useState(null)
  const [bubble, setBubble] = useState('')
  const facilitiesDone = progress.facilities.length >= FACILITY_GOAL
  const homework = pendingHomework(progress)

  const say = (lines, onDone) => setDialog({ lines, onDone: onDone || (() => setDialog(null)) })

  const { near, nearRef, onMove } = useProximity([
    { id: 'stand', pos: SPOTS.stand, radius: 2.4 },
    { id: 'panel', pos: SPOTS.panel, radius: 2.4, hidden: !progress.harmoniaRestored },
    { id: 'visitor', pos: SPOTS.visitor, radius: 2.4, hidden: !progress.lightsFixed || facilitiesDone },
    { id: 'elder', pos: SPOTS.elder, radius: 2.4, hidden: !progress.harmoniaRestored },
    { id: 'gate', pos: SPOTS.gate, radius: 2 },
    { id: 'helper', pos: SPOTS.helper, radius: 2.6, hidden: !homework },
    { id: 'board', pos: BOARD_POS, radius: 2.6, hidden: !storyDone(progress) },
  ])

  useEffect(() => {
    if (!progress.plazaOpen) navigate('/world', { replace: true })
    else if (!progress.harmoniaRestored) say(INTRO)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!bubble) return
    const id = setTimeout(() => setBubble(''), 5000)
    return () => clearTimeout(id)
  }, [bubble])

  const interact = (id) => {
    if (id === 'gate') return navigate('/world', { state: { from: 'plaza' } })
    if (id === 'stand') {
      if (!progress.harmoniaRestored) setMission('melody')
      else say([{ text: '(악보대에 우리가 되살린 멜로디가 놓여 있다.)' }])
    }
    if (id === 'panel') {
      if (!progress.lightsFixed) setMission('lights')
      else say([{ text: '(조명 제어반: 만약 어두우면 → 조명 켜기. 정상 작동 중)' }])
    }
    if (id === 'visitor') setMission('facility')
    if (id === 'board') setMission('quest')
    if (id === 'helper') say([{ who: HOMEWORK[homework].who, text: '저기… 혹시 도와줄 수 있어요?' }, { who: '제로', text: '수업에서 배운 걸 써 볼 기회야!' }], () => { setDialog(null); setMission('homework') })
    if (id === 'elder') {
      const i = Math.min(progress.facilities.length, LORE.length - 1)
      say([{ who: '오래된 방문객', text: LORE[i] }])
    }
  }

  const [showPark, setShowPark] = useState(false)
  const busy = !!dialog || !!mission || showPark
  const keys = useKeyboard((code) => {
    if (code === 'KeyE' && !busy && nearRef.current) interact(nearRef.current)
  })

  const PROMPTS = {
    stand: progress.harmoniaRestored ? '악보대 보기' : '악보대 · 멜로디 복원',
    panel: progress.lightsFixed ? '조명 제어반 보기' : '조명 제어반 · 광장 전등 연결',
    visitor: '방문객 요청 듣기',
    elder: '오래된 방문객과 이야기하기',
    gate: '광장 나가기',
    helper: '수업 과제 · 도움이 필요한 NPC 돕기',
    board: '📋 일일 퀘스트 게시판',
  }
  const lit = progress.harmoniaRestored && progress.lightsFixed
  const sky = !progress.harmoniaRestored ? '#59607A' : lit ? '#2E3A63' : '#3A4466'
  const start = posRef.current.clone().add(viewOffset(view.current))

  return (
    <div className="room-page">
      <Canvas shadows="soft" camera={{ position: [start.x, start.y, start.z], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={[sky]} />
        <fog attach="fog" args={[sky, 30, 70]} />
        <hemisphereLight args={['#c9d4ff', '#4a5a3a', lit ? 0.45 : 0.6]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[-10, 18, 12]} intensity={0.7} castShadow shadow-mapSize={[1024, 1024]} />
        <ViewControls view={view} />
        <PlazaScene progress={progress} helper={homework} />
        {storyDone(progress) && <QuestBoardModel />}
        <Robot
          posRef={posRef}
          targetRef={targetRef}
          keys={keys}
          view={view}
          name={user.name}
          bubble={bubble}
          onMove={onMove}
          bounds={{ radius: PLAZA_RADIUS }}
          colliders={[[0, 0, 4.3]]}
          frozen={busy}
        />
        <Stars radius={90} depth={30} count={1500} factor={3} fade speed={0.6} />
        {lit && <Glitter position={[0, 6, 0]} scale={[26, 10, 26]} count={70} />}
        <PostFX bloom={lit ? 0.5 : 0.35} />
      </Canvas>

      <RoomHud title={<>하모니아 광장 <small className="space-role">친구들이 모이는 공연·시설 광장 · 일일 퀘스트</small></>} backTo="/world" backLabel="← 도로랜드" onChat={setBubble} />
      {parkOpen(progress) && !busy && (
        <div className="hud room-side">
          <button className="side-btn park-btn" onClick={() => setShowPark(true)}>🎡 테마파크 운영</button>
        </div>
      )}
      {showPark && <ParkPanel onClose={() => setShowPark(false)} />}
      {near && !busy && (
        <button className="hud prompt" onClick={() => interact(near)}>E · {PROMPTS[near]}</button>
      )}
      {dialog && <DialogBox lines={dialog.lines} onDone={dialog.onDone} />}

      {mission === 'melody' && (
        <MelodyMission
          onClose={() => setMission(null)}
          onClear={() => {
            setMission(null)
            setProgress({ harmoniaRestored: true })
            say(RESTORED)
          }}
        />
      )}
      {mission === 'lights' && (
        <LightsMission
          onClose={() => setMission(null)}
          onClear={() => {
            setMission(null)
            setProgress({ lightsFixed: true })
            say(LIT)
          }}
        />
      )}
      {mission === 'quest' && <QuestPanel onClose={() => setMission(null)} />}
      {mission === 'homework' && homework && (
        <HomeworkMission
          flag={homework}
          onClose={() => setMission(null)}
          onClear={(hw) => {
            setMission(null)
            say([{ who: hw.who, text: hw.thanks }, { text: `(수업 과제 완료! CELL +${hw.reward} · 대시보드 수업 카드에서 확인할 수 있어요)` }])
          }}
        />
      )}
      {mission === 'facility' && (
        <FacilityMission
          onClose={() => setMission(null)}
          onClear={() => {
            setMission(null)
            say(AFTER_FACILITIES)
          }}
        />
      )}
    </div>
  )
}
