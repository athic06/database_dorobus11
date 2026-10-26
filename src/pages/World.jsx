import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useLocation, useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import ViewControls from '../myroom/ViewControls.jsx'
import Driver from '../world/Driver.jsx'
import Minimap, { toMap } from '../world/Minimap.jsx'
import { Xylo, Naty, CodexSilhouette, Person } from '../world/Characters.jsx'
import {
  Harmonia, FerrisWheel, RollerCoaster, Carousel, CubeVault, Signboard, MyRoomHouse, Shop, Lab, Storage, Safari, CaveMountain,
} from '../world/Landmarks.jsx'
import Terrain from '../world/Terrain.jsx'
import { Outskirts } from '../world/Scenery.jsx'
import { Balloons, Birds, Clouds, Glitter, PostFX, SkyDome } from '../world/Atmosphere.jsx'
import { ALL_COLLIDERS, PLACES, ROADS, VAULT, WORLD_HALF } from '../world/layout.js'
import ShopRestockMission from '../missions/ShopRestockMission.jsx'
import SignMission from '../missions/SignMission.jsx'
import { PART_MISSIONS } from '../missions/PartMissions.jsx'
import VoidAssemblyMission from '../missions/VoidAssemblyMission.jsx'
import FutureAnswer from '../components/FutureAnswer.jsx'
import { PART_SPOTS, PartSpot, PartBeacon, VoidFollower, FaultMarker } from '../world/Ch5Props.jsx'
import ContentMission from '../missions/ContentMission.jsx'
import { CONTENT_REWARD, activeWorldTask, contentDone } from '../game/content.js'
import FixMission from '../missions/FixMission.jsx'
import VoidChat from '../components/VoidChat.jsx'
import { BREAKABLE, pendingFaults } from '../game/daily.js'
import DialogBox from '../components/DialogBox.jsx'
import QuestTracker from '../components/QuestTracker.jsx'
import { CellPill } from '../components/Header.jsx'
import LicenseCard from '../components/LicenseCard.jsx'
import ParkPanel from '../components/ParkPanel.jsx'
import { QuestPanel, VehiclePanel, currentVehicle } from '../components/Routine.jsx'
import { levelOf, parkOpen } from '../game/park.js'
import { useKeyboard } from '../myroom/useKeyboard.js'
import { useProximity } from '../game/useProximity.js'
import { FACILITY_GOAL, VOID_PARTS, harmoniaStopped, rikoMissing, storyDone } from '../game/progress.js'
import { useStore } from '../store.jsx'

const ROAD_SEGMENTS = ROADS.map(([a, b]) => [PLACES[a].pos, PLACES[b].pos])
const XYLO_POS = [7, 0, 52]
const NATY_POS = [-6, 3, 24]
const CODEX_POS = [-26.5, 0, 51.5] // 회전목마 오른편, 안내판 정리 지점에서 정면
// 어디서 나왔는지에 따라 시작 위치 [x, z, 바라보는 방향]. 방향 π = 북쪽(하모니아 쪽), 0 = 남쪽
const SPAWNS = { myroom: [0, 54, Math.PI], cave: [44, -56, 0], plaza: [0, 22, 0], carousel: [-34, 63, Math.PI] }

// 상호작용 지점: 각 장소의 입구 앞
// 바깥쪽 명소: 둘러보기 대화만 있다
const SCENIC = [
  { id: 'lake', pos: [-83, 0, 72], radius: 6 },
  { id: 'garden', pos: [-102, 0, -5], radius: 6 },
  { id: 'windmill', pos: [106, 0, -27], radius: 6 },
  { id: 'station', pos: [34, 0, 108], radius: 6 },
  { id: 'observatory', pos: [-5, 0, -114], radius: 6 },
  { id: 'camp', pos: [-99, 0, -97], radius: 6 },
]
const SCENIC_LINES = {
  lake: () => [
    { text: '(오리배 세 척이 호수 위를 느릿느릿 떠다닌다. 연꽃 사이로 물결이 반짝인다.)' },
    { who: '제로', text: '하모니아 음악이 여기까지 들려! 벤치에 앉아서 쉬어 가도 좋겠다.' },
  ],
  garden: () => [
    { text: '(분수 둘레로 여섯 가지 색 꽃밭이 피어 있다. 나비들이 꽃 사이를 날아다닌다.)' },
    { who: '리코', text: '꽃밭 색이 무지개 순서랑 비슷해! 누가 규칙을 정해서 심었나 봐.' },
  ],
  windmill: () => [
    { text: '(바람을 받은 풍차 날개가 천천히 돈다. 언덕 아래로 금빛 밀밭이 펼쳐진다.)' },
    { who: '제로', text: '바람의 힘으로 돌아가는 거야. 이것도 에너지를 바꾸는 장치구나!' },
  ],
  station: () => [
    { text: '(칙칙폭폭, 꼬마 기차가 역 둘레를 돌며 하얀 연기를 뿜는다.)' },
    { who: '리코', text: '기차는 늘 같은 길을 반복해서 돌아. 꼭 반복문 같지 않아?' },
  ],
  observatory: () => [
    { text: '(둥근 지붕 사이로 망원경이 하늘을 천천히 훑는다. 꼭대기에서 보랏빛 고리가 빛난다.)' },
    { who: '제로', text: '밤이 되면 여기서 도로랜드 전체가 다 보인대!' },
  ],
  camp: () => [
    { text: '(모닥불이 타닥타닥 타오르고, 텐트 주변으로 반딧불이 떠다닌다.)' },
    { who: '리코', text: '불멍 하기 딱 좋은 곳이네. 잠깐 쉬었다 가자.' },
  ],
}

const SPOTS = [
  { id: 'myroom', pos: [0, 0, 65], radius: 5 },
  { id: 'xylo', pos: XYLO_POS, radius: 5 },
  { id: 'harmonia', pos: [0, 0, 20], radius: 5.5 },
  { id: 'sign', pos: [18.5, 0, 38], radius: 5 },
  { id: 'shop', pos: [-24, 0, 28], radius: 5 },
  { id: 'carousel', pos: [-34, 0, 57], radius: 5.5 },
  { id: 'vault', pos: VAULT.front, radius: 3 },
  { id: 'lab', pos: [42, 0, 42], radius: 5 },
  { id: 'ferris', pos: [-43, 0, -6], radius: 5 },
  { id: 'coaster', pos: [34, 0, -6], radius: 5 },
  { id: 'safari', pos: [-52, 0, -34], radius: 6 },
  { id: 'storage', pos: [-74, 0, 19], radius: 5 },
  { id: 'cave', pos: [44, 0, -63], radius: 5 },
  { id: 'naty', pos: NATY_POS, radius: 4 },
  ...SCENIC,
]

// 챕터 3 끝: 상점 재개장 뒤 회전목마 옆 오래된 구조물이 열린다
const VAULT_OPENED = [
  { text: '(하모니아의 노래가 힘차게 울리자, 회전목마 옆 오래된 돌 구조물이 덜컹거리며 움직였다.)' },
  { who: '제로', text: '저기 봐! 구조물 안에 숨겨진 공간이 열렸어!' },
]
const CUBES = [
  { text: '(숨겨진 공간 안에 파랗게 빛나는 큐브 3개가 떠 있다.)' },
  { who: '회전목마 관리인', text: '저건… 나도 처음 보는구나. 회전목마 옆 이 돌 구조물은 하모니아가 힘차게 노래하면 열린다는 소문만 있었지.' },
  { who: '제로', text: '이건 그냥 큐브가 아니야. 누군가 남긴 흔적 같아.' },
  { text: '(첫 번째 큐브에 손을 얹자, 드넓고 푸른 숲에서 요정 같은 생명체들이 행복하게 뛰노는 장면이 펼쳐진다.)' },
  { who: '리코', text: '우와… 너무 평화롭고 따뜻한 모습이야.' },
  { text: '(두 번째 큐브. 시끄러운 건설 기계 사이로, 안전모를 쓰고 설계도를 든 남자가 숲의 생명체들을 내쫓고 있다.)' },
  { who: '리코', text: '이 사람은 누구지? 왜 이렇게 내보내는 거야? …어, 제로! 손이 큐브에서 안 떨어져!' },
  { text: '(큐브가 거세게 흔들리며 강한 빛을 뿜어낸다—)' },
  { who: '제로', text: '리코, 당장 손 떼! …리코?! 리코가 큐브 안으로 들어가 버렸어!' },
  { who: '자일로', text: '위험해요! 제로, 큐브에서 떨어져요! 도로랜드의 이런 물체에는 함부로 손대면 안 돼요.' },
  { who: '자일로', text: '조사팀, 회전목마로 빨리 와 주세요. 이 근처는 통제합니다. …제로, 이제 돌아가죠.' },
]
// 챕터 4: 리코가 돌아오고 나무 상자를 연다 (스토리 영상 챕터 3)
const RIKO_BACK = [
  { text: '(강사님 수업 「시그널 브레이크」에서 과거의 기억 속 단서를 모두 찾아냈다.)' },
  { text: '(회전목마 옆 숨겨진 공간. 마지막 큐브가 파란빛을 뿜으며 사라지고, 그 자리에 리코가 돌아와 있었다!)' },
  { who: '제로', text: '리코! 괜찮아?' },
  { who: '리코', text: '휴, 나는 괜찮아. 구해 줘서 고마워. 큐브 안은 시간이 멈춘 것처럼 조용했어. 우리가 지나온 순간들이 계속 보였어.' },
  { who: '리코', text: '그리고 큐브 안에서 누군가 이 나무 상자를 주고 갔어. 일기장 그림 속 사람이랑 비슷했던 것 같아.' },
  { who: '제로', text: '자물쇠가 달려 있네… 혹시 일기장에 있던 열쇠?' },
  { text: '(일기장의 열쇠를 꽂자, 기다렸다는 듯 상자가 스르륵 열렸다.)' },
  { text: '(상자 안에는 아주 오래된 사진들, 익숙한 문양이 그려진 낡은 종이, 「코덱스 1길」 표지판 사진, 하모니아 설계도, 그리고 사라졌던 하모니아의 악보가 들어 있다.)' },
  { who: '리코', text: '사진 속 사람들… 처음 보는데 어쩐지 낯설지 않아.' },
  { who: '자일로', text: '모두 무사해서 다행이에요. 큐브도 사라졌으니 통제를 풀게요.' },
  { who: '자일로', text: '그런데 큐브 소동 때문에 회전목마 주변 안내판이 다 뒤섞였대요. 방문객들이 길을 헤매고 있어요. 정리를 부탁해도 될까요?' },
]
const LETTER = [
  { text: '(해 질 녘, 회전목마가 천천히 돈다. 기둥에 낯선 봉투가 꽂혀 있다. 동굴 입구와 같은 문양의 인장이 찍혀 있다.)' },
  { who: '편지', text: '"제로, 리코. 너희가 생각하는 도로랜드의 미래는 어떤 모습이지? 만약 나와 생각이 같다면 다시 나를 만나게 될 거야."' },
  { who: '리코', text: '받는 사람도 보내는 사람도 없어… 누가 남긴 걸까?' },
  { who: '제로', text: '꽤 멋진 질문이네. 우리가 꿈꾸는 도로랜드의 미래라… 그럼 만들어 보자!' },
  { text: '(그때, 공기가 파르르 떨리더니 지직거리는 노이즈와 함께 누군가의 실루엣이 나타났다.)' },
  { who: '???', text: '모든 생명은 연결되어 있다. 그러나 그 연결을 이어주는 멜로디가 사라지면 모든 것은 멈추고 말 것이다.' },
  { who: '???', text: '그래, 이제 진실과 마주할 때다. 진짜 이야기는 이제부터니까.' },
  { text: '(실루엣은 아무 소리 없이 사라졌다.)' },
]

// 챕터 5: 보이드 구조 작전
const VOID_INTRO = [
  { who: '제로', text: '자일로! 나무 상자 안에 이상한 설계도도 있었어요.' },
  { text: '(설계도에는 작은 로봇이 그려져 있다. 몸통에 V.I.D라고 적혀 있다.)' },
  { who: '자일로', text: '흥미롭네요. 단순한 로봇 같아 보이진 않는데… 이건 딱 봐도 제 전문 분야군요!' },
  { who: '자일로', text: '…그런데 어디서 본 것 같기도 하고요. (잠시 머뭇거린다)' },
  { who: '리코', text: '그러고 보니 도로랜드 곳곳에 이상하게 놓여 있던 부품들이 있었어!' },
  { who: '제로', text: '그 부품들을 모으면 이 로봇을 다시 만들 수 있지 않을까? 편지를 보낸 사람을 만날 단서가 될지도 몰라.' },
  { who: '자일로', text: '좋아요. 부품 5개를 모아 오면 연구실에서 같이 조립해 봐요. 부품마다 주변 사람들 도움이 필요할 거예요. 미니맵의 주황 점을 찾아봐요!' },
]
const VOID_BORN = [
  { text: '(보이드의 눈에 청록색 불이 들어오더니, 스르륵 일어나 몸통의 V.I.D 글자가 빛난다.)' },
  { who: '제로', text: '움직인다! 너를 뭐라고 부르면 좋을까? V.I.D… 보이드! 보이드라고 부를게.' },
  { who: '자일로', text: '수많은 로봇을 봤지만 이런 로봇은 처음 보네요. 덕분에 두근거리는 시간을 보냈어요.' },
  { text: '(그런데 자일로가 다가가자 보이드는 꼼짝도 하지 않는다. 제로와 리코 앞에서만 움직이는 것 같다.)' },
  { text: '(보이드가 갑자기 북서쪽 숲을 가리키며 삐빅 소리를 낸다.)' },
  { who: '리코', text: '저쪽은… 오래된 창고 방향이야! 보이드가 뭔가 알려 주려는 것 같아. 가 보자!' },
]
const CODEX_1 = [
  { text: '(오래된 창고 앞에서 보이드가 멈춰 서서 삐빅 소리를 낸다.)' },
  { text: '(숲에서 지팡이를 든 누군가가 천천히 걸어 나온다. 지팡이 끝에서 익숙한 문양이 빛난다.)' },
  { who: '???', text: '드디어 제대로 만나게 되었구나. 그동안 내가 누군지 무척이나 궁금했겠지.' },
  { who: '???', text: '편지에 대한 답을 직접 듣고 싶구나. 너희가 생각하는 도로랜드의 미래는 어떤 모습이지?' },
]
const codex2 = (answer) => [
  { who: '코덱스', text: `「${answer}」… 너희가 그리는 도로랜드의 미래, 꽤 마음에 드는군.` },
  { who: '코덱스', text: '내 이름은 코덱스. 도로랜드가 세워지기 아주 오래전부터 이 땅과 자연을 지켜 온 수호자다.' },
  { who: '코덱스', text: '너희가 도로랜드 곳곳에서 보았던 그 문양은 우리 가문을 나타내는 문양이지. 동굴에도, 편지의 인장에도 있었을 거다.' },
  { who: '코덱스', text: '우리가 오랫동안 지켜 온 평화는 허무하게도 누군가가 와서 다 망쳐 버렸어. 일기장의 그림도, 큐브 속 장면도 모두 그날의 기억이다.' },
  { who: '리코', text: '그럼 큐브에서 본, 안전모를 쓰고 설계도를 든 그 사람은…?' },
  { who: '코덱스', text: '너희라면 내 말을 믿어 줄 것 같군. 자, 준비가 되었나? 나와 함께 진실을 보러 가자.' },
]
const CODEX_MEET_POS = [-71, 0, 18.5]

export default function World() {
  const navigate = useNavigate()
  const { user, progress, setProgress, addCell, track } = useStore()
  const p = progress
  const faults = storyDone(p) ? pendingFaults(user.id, p.work) : []
  const [chat, setChat] = useState(false)
  const stopped = harmoniaStopped(p)
  const caveOpen = p.carCheckDone
  const facilitiesDone = p.facilities.length >= FACILITY_GOAL
  const shopState = p.shopReopened ? 'open' : facilitiesDone ? 'ready' : 'closed'
  const location = useLocation()
  const spawn = p.rescueLessonDone && !p.rikoBack ? SPAWNS.carousel : SPAWNS[location.state?.from] || SPAWNS.myroom
  const posRef = useRef(new THREE.Vector3(spawn[0], 0, spawn[1]))
  const headingRef = useRef(spawn[2])
  const view = useRef({ yaw: 0, pitch: 0.5, dist: 14 })
  const carMark = useRef()
  const [dialog, setDialog] = useState(null)
  const [mission, setMission] = useState(null)
  const [codex, setCodex] = useState(false) // 'silhouette' | 'revealed' | false
  const [cleared, setCleared] = useState(false) // 'ch3' | 'ch4' | 'ch5' | false
  const [asking, setAsking] = useState(false)
  const [showLicense, setShowLicense] = useState(false)
  const [showPark, setShowPark] = useState(false)
  const [routinePanel, setRoutinePanel] = useState(null) // 'vehicle' | 'quest'
  const partsDone = p.parts.length >= VOID_PARTS.length
  const partIds = p.voidStarted ? VOID_PARTS.map((x) => x.id).filter((id) => !p.parts.includes(id)) : []
  // 수강 중인 수업의 연계 미션 NPC (내 수업에서 고른 수업 하나)
  // 내 수업 과제에서 「도로랜드에서 하기」를 누른 도로랜드 문제 (범용 콘텐츠). 그 NPC가 ❗로 나타난다
  const task = activeWorldTask(p)
  const taskCleared = task && contentDone(p, task.id)

  // 리코가 큐브 속에 있는 동안에는 리코 대사를 뺀다
  const say = (lines, onDone) => {
    const shown = rikoMissing(p) ? lines.filter((l) => l.who !== '리코') : lines
    setDialog({ lines: shown.length ? shown : [{ text: '(조용하다…)' }], onDone: onDone || (() => setDialog(null)) })
  }

  const { near, nearRef, onMove: onNear } = useProximity([
    ...SPOTS,
    ...VOID_PARTS.map((x) => ({ id: `part-${x.id}`, pos: PART_SPOTS[x.id].pos, radius: 4.5, hidden: !partIds.includes(x.id) })),
    { id: 'task', pos: task ? task.pos : [0, 0, 0], radius: 4.5, hidden: !task },
  ])
  // 일일 퀘스트(탐험의 날): 명소 근처에 가면 방문으로 기록한다
  useEffect(() => {
    if (near && PLACES[near]) track('place', near, 'unique')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near])
  const colliders = [...ALL_COLLIDERS, ...partIds.map((id) => [PART_SPOTS[id].pos[0], PART_SPOTS[id].pos[2], 1])]

  // 자동차 점검(챕터 1)을 마치기 전에는 월드로 나올 수 없다
  useEffect(() => {
    if (!p.carCheckDone) navigate('/myroom', { replace: true })
  }, [p.carCheckDone, navigate])

  // 챕터 4: 수업에서 리코를 구한 뒤 처음 나오면 리코가 돌아온다
  useEffect(() => {
    if (p.rescueLessonDone && !p.rikoBack) {
      setDialog({ lines: RIKO_BACK, onDone: () => { setDialog(null); setProgress({ rikoBack: true }) } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const LINES = {
    xylo: () => {
      if (!p.diaryFound)
        return [
          { who: '자일로', text: '모바일 로봇 운전 실력이 제법인데요? 그거 좋은데요!' },
          { who: '자일로', text: '지도에 처음 보는 문양이 하나 있었죠. 북동쪽 산에 있는 동굴이에요.' },
          { who: '리코', text: '도로랜드에서 한 번도 본 적 없는 문양이라니… 얼른 가 보자!' },
        ]
      if (!p.caveCleared) return [{ who: '자일로', text: '동굴에서 무언가 찾았나요? 조심해서 다녀와요.' }]
      if (!p.plazaOpen)
        return [
          { who: '자일로', text: '큰일이에요! 하모니아가 멈추면서 도로랜드의 모든 시스템이 멈춰 버렸어요.' },
          { who: '자일로', text: '하모니아는 도로랜드 중심에서 음악을 에너지로 바꿔 시스템 전체를 작동시키는 장치예요. 단순한 기계가 아니라 이곳을 움직이는 핵심 그 자체죠.' },
          { who: '리코', text: '동굴에서 이상한 목소리도 들었어요. "도로랜드의 음악은 여기서 끝이다"라고…' },
          { who: '자일로', text: '누군가 일부러…? 아니, 지금은 하모니아를 고치는 게 먼저예요. 광장 문을 열어 둘게요. 여러분이 직접 그 음악을 되살려 주세요!' },
        ]
      if (!p.harmoniaRestored) return [{ who: '자일로', text: '광장 문은 열어 뒀어요. 하모니아 앞 악보대부터 확인해 봐요.' }]
      if (!p.cubesFound) return [{ who: '자일로', text: '하모니아가 다시 노래하니 정말 그거 좋은데요! 광장 일도 잘 부탁해요.' }]
      if (!p.rikoBack)
        return [
          { who: '자일로', text: '정체불명의 큐브는 위험해요. 조사팀이 현장을 통제하고 있으니 가까이 가면 안 돼요.' },
          { who: '제로', text: '리코가 큐브 안에 있다고요… (강사님 수업에서 리코를 구할 방법을 찾아야 해.)' },
        ]
      if (!p.signsDone) return [{ who: '자일로', text: '회전목마 주변 안내판 정리를 부탁해요. 방문객들이 길을 헤매고 있거든요.' }]
      if (!p.letterSeen) return [{ who: '자일로', text: '회전목마 쪽은 어때요?' }]
      if (!p.voidStarted) return VOID_INTRO
      if (!partsDone) return [{ who: '자일로', text: `부품은 몇 개 모았어요? 지금 ${p.parts.length}개네요. 미니맵의 주황 점을 찾아봐요!` }]
      if (!p.voidBuilt) return [{ who: '자일로', text: '부품을 다 모았군요! 연구실로 와요. 같이 조립해 봐요.' }]
      if (!p.codexMet) return [{ who: '자일로', text: '보이드가 자꾸 숲 쪽을 가리키네요… 조심해서 다녀와요.' }]
      return [
        { who: '자일로', text: '골칫거리였던 큐브가 사라져서 정말 다행이에요.' },
        { who: '자일로', text: '도로랜드의 시간 중에는 또렷하게 기억되는 시간도 있고, 아무 말 없이 조용히 잊혀지는 시간도 있겠죠.' },
      ]
    },
    harmonia: () =>
      stopped
        ? [
            { text: '(하모니아가 조용하다. 광장의 불빛도 모두 꺼졌다.)' },
            { who: '리코', text: '일기장에 적힌 문장대로야… "멜로디가 사라지면 모든 것은 멈춘다."' },
            { who: '제로', text: '광장 문이 잠겨 있어. 자일로에게 가 보자!' },
          ]
        : [
            { who: '제로', text: '하모니아에서 음악이 흘러나와! 도로랜드 한가운데의 커다란 악기래.' },
            { who: '리코', text: '음악이 흐르는 동안 놀이기구도 가로등도 계속 움직인대. 광장은 아직 들어갈 수 없어.' },
          ],
    sign: () =>
      stopped
        ? [{ text: '(전광판에 빨간 글씨로 SYSTEM STOP이 깜빡이고 있다.)' }]
        : [
            { text: '(대형 전광판에 WELCOME TO DOROLAND가 흐른다.)' },
            { who: '리코', text: '작은 LED 점들이 모여서 글자를 만드는 도트 매트릭스야.' },
          ],
    shop: () =>
      shopState === 'open'
        ? [{ who: '상점 주인', text: '어서 와! 너희 덕분에 다시 문을 열었단다. 가구는 마이룸의 상점 포탈에서도 살 수 있어.' }]
        : [{ text: '(문이 닫혀 있다. "재개장 준비 중")' }, { who: '제로', text: '광장에 사람들이 돌아오면 다시 열지도 몰라.' }],
    carousel: () =>
      p.signsDone
        ? [{ text: '(회전목마가 평화롭게 돈다. 새 안내판 덕분에 방문객들이 길을 잘 찾는다.)' }]
        : p.cubesFound
          ? [{ text: '(조사팀이 회전목마 주변을 통제하고 있다.)' }, { who: '제로', text: '…리코.' }]
          : p.shopReopened
            ? [{ who: '제로', text: '아까 그 소리, 회전목마 옆 돌 구조물에서 난 것 같아!' }]
            : [{ who: '리코', text: '회전목마 주변은 나중에 둘러보자.' }],
    vault: () =>
      !p.shopReopened
        ? [{ text: '(오래된 돌 구조물이다. 동굴 입구에서 본 것과 같은 문양이 새겨져 있다.)' }, { who: '리코', text: '꽉 닫혀 있어. 언젠가 열리려나?' }]
        : p.cubesFound && !p.rikoBack
          ? [{ text: '(조사팀이 숨겨진 공간을 통제하고 있다. 큐브가 희미하게 빛난다.)' }]
          : [{ text: '(큐브가 있던 자리는 텅 비어 있다.)' }],
    lab: () =>
      p.voidBuilt
        ? [{ who: '자일로', text: '보이드 정말 귀엽죠? 기계라면 언제든 저를 찾아요!' }]
        : p.voidStarted
          ? [{ who: '자일로', text: `부품을 다 모으면 여기서 조립해요. (지금 ${p.parts.length}/${VOID_PARTS.length})` }]
          : [{ who: '리코', text: '연구실이네. 여기는 다음에 와볼까?' }],
    ferris: () => [
      { who: '자일로', text: '저 관람차는 빙글빙글 돌면서 태양광을 모아 숲의 나무와 식물에게 빛과 물을 줘요.' },
      ...(stopped ? [{ who: '리코', text: '그런데 지금은 관람차도 멈췄어…' }] : []),
    ],
    coaster: () => [
      { who: '자일로', text: '롤러코스터가 움직이는 힘으로 강물을 맑게 정화하고 있죠. 기술과 자연이 서로 돕는 거예요.' },
      ...(stopped ? [{ who: '제로', text: '롤러코스터도 멈춰 버렸네.' }] : []),
    ],
    safari: () => [
      { text: '(기린, 코끼리, 사자가 사파리에서 쉬고 있다.)' },
      { who: '제로', text: '동물들도 우리 차가 신기한가 봐. 조심조심 지나가자!' },
    ],
    storage: () => [
      { text: '(숲속 깊은 곳의 오래된 창고. 거미줄 사이로 오래된 가족사진 액자가 보인다.)' },
      { who: '리코', text: p.rikoBack ? '이 사진… 나무 상자 속 사진과 같은 사람들이야!' : '사진 속 사람들 옷차림을 보니 아주 옛날 사진 같아. 도로랜드가 생기기 전일까?' },
    ],
    cave: () => [{ who: '리코', text: '동굴은 자동차 점검을 마쳐야 갈 수 있어!' }],
    naty: () => [
      { text: '(푸른빛의 작은 무언가가 반짝인다. 사람들은 파란 반딧불이라고 부른다.)' },
      { who: '제로', text: '저건… 네이티? 앗, 휙 사라졌어!' },
    ],
    ...SCENIC_LINES,
  }

  const interact = (id) => {
    if (faults.includes(id)) return setMission(`fix-${id}`)
    if (id === 'myroom') return navigate('/myroom')
    if (id === 'cave' && caveOpen) return navigate('/cave')
    if (id === 'harmonia' && p.plazaOpen) {
      return navigate('/plaza')
    }
    if (id === 'xylo' && p.caveCleared && !p.plazaOpen) {
      return say(LINES.xylo(), () => { setDialog(null); setProgress({ plazaOpen: true }) })
    }
    if (id === 'shop' && shopState === 'ready') return setMission('shop')
    if (id === 'carousel' && p.rikoBack && !p.signsDone) return setMission('signs')
    if (id === 'vault' && p.shopReopened && !p.cubesFound) {
      return say([...VAULT_OPENED, ...CUBES], () => {
        setDialog(null)
        setProgress({ cubesFound: true })
        setCleared('ch3')
      })
    }
    if (id === 'xylo' && p.letterSeen && !p.voidStarted) {
      return say(VOID_INTRO, () => { setDialog(null); setProgress({ voidStarted: true }) })
    }
    if (id === 'task') {
      if (taskCleared) return say([{ who: task.npc.label, text: task.thanks }])
      return say([{ who: task.npc.label, text: task.ask }, { who: '제로', text: '수업에서 낸 과제야. 배운 걸 써먹어 보자!' }], () => { setDialog(null); setMission('task') })
    }
    if (id.startsWith('part-')) return setMission(id)
    if (id === 'lab' && partsDone && !p.voidBuilt) return setMission('assembly')
    if (id === 'storage' && p.voidBuilt && !p.codexMet) {
      setCodex('revealed')
      return say(CODEX_1, () => { setDialog(null); setAsking(true) })
    }
    say(LINES[id]())
  }

  const busy = !!dialog || !!mission || !!cleared || asking || chat || showLicense || showPark || !!routinePanel
  const keys = useKeyboard((code) => {
    if (code === 'KeyE' && !busy && nearRef.current) interact(nearRef.current)
  })

  const onMove = (pos, h) => {
    onNear(pos)
    if (carMark.current) {
      carMark.current.setAttribute('transform', `translate(${toMap(pos.x)} ${toMap(pos.z)}) rotate(${180 - (h * 180) / Math.PI})`)
    }
  }

  const PROMPTS = {
    myroom: '마이룸 들어가기',
    xylo: '자일로와 이야기하기',
    harmonia: p.plazaOpen ? '하모니아 광장 들어가기' : '하모니아 살펴보기',
    sign: '전광판 보기',
    shop: shopState === 'ready' ? '상점 · 재개장 준비 돕기' : '상점',
    carousel: p.rikoBack && !p.signsDone ? '회전목마 · 안내판 정리' : parkOpen(p) ? `회전목마 · Lv.${levelOf(p, 'carousel')}` : '회전목마',
    vault: p.shopReopened && !p.cubesFound ? '숨겨진 공간 들어가기' : '오래된 구조물 살펴보기',
    lab: partsDone && !p.voidBuilt ? '연구실 · 보이드 조립' : '연구실',
    'part-sensor': '사파리 사육사 · 부품',
    'part-battery': '관람차 기술자 · 부품',
    'part-motor': '롤러코스터 정비사 · 부품',
    'part-wheel': '바위 틈의 바퀴 · 부품',
    'part-antenna': '길 잃은 방문객 · 부품',
    ferris: parkOpen(p) ? `관람차 · Lv.${levelOf(p, 'ferris')}` : '관람차',
    coaster: parkOpen(p) ? `롤러코스터 · Lv.${levelOf(p, 'coaster')}` : '롤러코스터',
    safari: '사파리 둘러보기',
    storage: p.voidBuilt && !p.codexMet ? '오래된 창고 · 보이드가 가리킨 곳' : '오래된 창고',
    cave: caveOpen ? '동굴 들어가기' : '동굴',
    naty: '반짝이는 무언가',
    ...Object.fromEntries(SCENIC.map((s) => [s.id, `${PLACES[s.id].name} 둘러보기`])),
    task: task ? (taskCleared ? `${task.npc.label}와 이야기하기` : `${task.npc.label} · 과제 「${task.title}」`) : '',
  }

  const openIds = [
    'myroom', 'safari',
    ...(caveOpen ? ['cave'] : []),
    ...(p.plazaOpen ? ['harmonia'] : []),
    ...(shopState !== 'closed' ? ['shop'] : []),
    ...(p.shopReopened ? ['carousel'] : []),
    ...(p.voidStarted ? ['lab'] : []),
    ...(p.voidBuilt ? ['storage'] : []),
    ...SCENIC.map((s) => s.id),
  ]
  const markers = [
    ...partIds.map((id) => ({ x: PART_SPOTS[id].pos[0], z: PART_SPOTS[id].pos[2] })),
    ...faults.map((id) => ({ x: BREAKABLE[id].pos[0], z: BREAKABLE[id].pos[2], color: '#E2574C' })),
    ...(task && !taskCleared ? [{ x: task.pos[0], z: task.pos[2], color: '#2F7BFF' }] : []),
  ]
  const promptFor = (id) => (faults.includes(id) ? `${BREAKABLE[id].name} 고장 수리하기` : PROMPTS[id])
  const dusk = p.signsDone && !p.letterSeen
  const sky = stopped ? '#C7CEDB' : dusk ? '#F6D3B0' : '#D8EEFF'
  const skyTop = stopped ? '#8E99AE' : dusk ? '#E58A6A' : '#5FB2F2'

  return (
    <div className="room-page world">
      <Canvas shadows="soft" camera={{ position: [spawn[0], 8, spawn[1] - Math.cos(spawn[2]) * 12], fov: 55, far: 700 }} dpr={[1, 1.75]}>
        <color attach="background" args={[sky]} />
        <fog attach="fog" args={[sky, 110, 330]} />
        <SkyDome top={skyTop} horizon={sky} />
        <hemisphereLight args={[stopped ? '#D6DCE8' : dusk ? '#FFE2C4' : '#DDF0FF', '#7DB767', 0.8]} />
        <ambientLight intensity={stopped ? 0.35 : 0.5} />
        <ViewControls view={view} />
        <Terrain roads={ROAD_SEGMENTS} half={WORLD_HALF} night={stopped || dusk} />
        <Outskirts />
        <Clouds dim={stopped} />
        {!stopped && <Birds />}
        {!stopped && <Balloons />}
        {!stopped && <Glitter position={[0, 8, 0]} />}
        <MyRoomHouse />
        <Harmonia stopped={stopped} gateOpen={p.plazaOpen} />
        <Signboard stopped={stopped || faults.includes('sign')} />
        <FerrisWheel stopped={stopped || faults.includes('ferris')} />
        <RollerCoaster stopped={stopped || faults.includes('coaster')} />
        <Carousel stopped={stopped || faults.includes('carousel')} locked={!p.shopReopened} />
        <CubeVault open={p.shopReopened} cubes={p.shopReopened && !p.cubesFound} />
        <Shop state={shopState} />
        <Lab open={p.voidStarted} />
        {partIds.map((id) => <PartSpot key={id} id={id} />)}
        {task && (
          <group position={task.pos}>
            <Person position={[0, 0, 0]} rotation={task.rot} color={task.npc.color} hat={task.npc.hat} hair={task.npc.hair} label={`${taskCleared ? '' : '❗ '}${task.npc.label}`} />
            {!taskCleared && <PartBeacon color="#7FB4FF" glow="#2F7BFF" />}
          </group>
        )}
        {p.voidBuilt && <VoidFollower posRef={posRef} headingRef={headingRef} />}
        {faults.map((id) => <FaultMarker key={id} position={BREAKABLE[id].pos} name={BREAKABLE[id].name} />)}
        <Storage />
        <Safari />
        <CaveMountain open={caveOpen} />
        <Xylo position={XYLO_POS} rotation={-2.4} />
        <Naty position={NATY_POS} label="?" />
        {codex === 'silhouette' && <CodexSilhouette position={CODEX_POS} rotation={-0.4} />}
        {codex === 'revealed' && <CodexSilhouette position={CODEX_MEET_POS} rotation={0.9} revealed />}
        <Driver
          posRef={posRef}
          headingRef={headingRef}
          keys={keys}
          view={view}
          colliders={colliders}
          half={WORLD_HALF}
          frozen={busy}
          onMove={onMove}
          vehicle={currentVehicle(p)}
        />
        <PostFX bloom={stopped ? 0.35 : 0.6} />
      </Canvas>

      <div className="hud hud-top">
        <button className="back" onClick={() => navigate('/myroom')}>← 마이룸</button>
        <span className="room-title">도로랜드 메인 광장 <small className="space-role">탈것으로 달리며 탐험 · 업무 · 부품 찾기</small></span>
        <span className="grow" />
        <button className="license-btn" onClick={() => setRoutinePanel('vehicle')}>🚗 탈것</button>
        {storyDone(p) && <button className="license-btn" onClick={() => setRoutinePanel('quest')}>📋 퀘스트</button>}
        {parkOpen(p) && <button className="license-btn" onClick={() => setShowPark(true)}>🎡 운영</button>}
        <button className="license-btn" onClick={() => setShowLicense(true)} title="운전면허증 보기">🪪 면허증</button>
        <CellPill />
      </div>
      {showLicense && <LicenseCard onClose={() => setShowLicense(false)} />}
      {showPark && <ParkPanel onClose={() => setShowPark(false)} />}
      {routinePanel === 'vehicle' && <VehiclePanel onClose={() => setRoutinePanel(null)} />}
      {routinePanel === 'quest' && <QuestPanel onClose={() => setRoutinePanel(null)} />}
      <div className="hud hud-quest">
        <QuestTracker />
        {p.voidStarted && !p.voidBuilt && (
          <div className="parts-hud" aria-label="보이드 부품">
            {VOID_PARTS.map((x) => (
              <span key={x.id} className={p.parts.includes(x.id) ? 'got' : ''} title={`${x.name} · ${x.where}`}>{x.icon}</span>
            ))}
          </div>
        )}
      </div>
      <div className="hud hud-minimap">
        <Minimap ref={carMark} openIds={openIds} markers={markers} />
        {p.voidBuilt && <button className="void-btn" onClick={() => setChat(true)}>🤖 보이드와 대화</button>}
        {faults.length > 0 && <p className="fault-note">오늘의 업무 · 고장 {faults.length}곳 (미니맵 빨간 점)</p>}
      </div>
      {chat && <VoidChat onClose={() => setChat(false)} />}
      {mission?.startsWith('fix-') && (
        <FixMission
          id={mission.slice(4)}
          onClose={() => setMission(null)}
          onFixed={() => {
            setMission(null)
            say([{ who: '자일로', text: '수리 완료! 덕분에 방문객들이 안심하고 탈 수 있겠어요. 그거 좋은데요!' }])
          }}
        />
      )}
      <div className="hud hint">W/S 앞·뒤 · A/D 방향 · 마우스 드래그로 둘러보기 · 휠 확대/축소 · E 상호작용</div>
      {near && !busy && (
        <button className="hud prompt" onClick={() => interact(near)}>E · {promptFor(near)}</button>
      )}
      {dialog && <DialogBox lines={dialog.lines} onDone={dialog.onDone} />}

      {mission === 'shop' && (
        <ShopRestockMission
          onClose={() => setMission(null)}
          onClear={() => {
            setMission(null)
            setProgress({ shopReopened: true })
            say([
              { text: '(상점에 불이 켜지고 방문객들이 하나둘 들어간다.)' },
              { text: '(그때, 회전목마 쪽에서 덜컹! 하고 무언가 움직이는 소리가 들렸다.)' },
              { who: '리코', text: '방금 그 소리 뭐지? 회전목마로 가 보자!' },
            ])
          }}
        />
      )}
      {mission === 'signs' && (
        <SignMission
          onClose={() => setMission(null)}
          onClear={() => {
            setMission(null)
            setProgress({ signsDone: true })
            setCodex('silhouette')
            setDialog({
              lines: LETTER,
              onDone: () => {
                setDialog(null)
                setCodex(false)
                setProgress({ letterSeen: true })
                setCleared('ch4')
              },
            })
          }}
        />
      )}
      {mission?.startsWith('part-') && (() => {
        const M = PART_MISSIONS[mission.slice(5)]
        return (
          <M
            onClose={() => setMission(null)}
            onClear={(id) => {
              setMission(null)
              const parts = [...p.parts, id]
              setProgress({ parts })
              const name = VOID_PARTS.find((x) => x.id === id).name
              say([
                { text: `(${name} 획득! 보이드 부품 ${parts.length}/${VOID_PARTS.length})` },
                ...(parts.length >= VOID_PARTS.length ? [{ who: '제로', text: '부품을 다 모았어! 연구실로 가서 자일로랑 조립하자!' }] : []),
              ])
            }}
          />
        )
      })()}
      {mission === 'task' && task && (
        <ContentMission
          item={task}
          onClose={() => setMission(null)}
          onClear={() => {
            setMission(null)
            const reward = CONTENT_REWARD.world
            addCell(reward.cell)
            setProgress({ contentDone: [...(p.contentDone || []), task.id], stamps: (p.stamps || 0) + reward.stamps })
            say([
              { who: task.npc.label, text: task.thanks },
              { text: `(과제 완료! CELL +${reward.cell}, 탈것 스탬프 +${reward.stamps}. 내 수업 과제 목록에도 완료로 표시돼요)` },
            ])
          }}
        />
      )}
      {mission === 'assembly' && (
        <VoidAssemblyMission
          onClose={() => setMission(null)}
          onClear={() => {
            setMission(null)
            setProgress({ voidBuilt: true })
            say(VOID_BORN)
          }}
        />
      )}
      {asking && (
        <FutureAnswer
          onSubmit={(answer) => {
            setAsking(false)
            setProgress({ futureAnswer: answer })
            setDialog({
              lines: codex2(answer),
              onDone: () => {
                setDialog(null)
                setCodex(false)
                setProgress({ codexMet: true })
                setCleared('ch5')
              },
            })
          }}
        />
      )}
      {cleared === 'ch5' && (
        <div className="modal-bg">
          <div className="chapter-clear">
            <span className="cc-eyebrow">CHAPTER 5 CLEAR · 메인 스토리 완료</span>
            <h2>보이드 구조 작전</h2>
            <p>도로랜드 곳곳에서 부품을 모아 보이드를 완성하고, 마침내 숲의 수호자 코덱스를 만났어요.</p>
            {p.futureAnswer && <blockquote className="future-quote">내가 꿈꾸는 도로랜드: “{p.futureAnswer}”</blockquote>}
            <p className="cc-next">진짜 이야기는 이제부터 — 코덱스와 함께 보러 갈 진실은 다음 이야기에서</p>
            <div className="cc-actions">
              <button className="btn-ghost" onClick={() => navigate('/')}>대시보드</button>
              <button className="btn-primary" onClick={() => setCleared(false)}>보이드와 도로랜드 둘러보기</button>
            </div>
          </div>
        </div>
      )}
      {cleared === 'ch3' && (
        <div className="modal-bg">
          <div className="chapter-clear">
            <span className="cc-eyebrow">CHAPTER 3 CLEAR</span>
            <h2>신비한 큐브</h2>
            <p>하모니아의 멜로디를 되살리고 광장에 다시 사람들을 불러 모았어요. 그런데 회전목마 옆 숨겨진 공간의 큐브가 보여 준 과거의 장면 속으로 리코가 빨려 들어가 버렸어요.</p>
            <p className="cc-next">챕터 4 · 잊혀진 시간 속으로 — 대시보드 「오늘의 수업」의 강사님 수업 「시그널 브레이크」에서 리코를 구해요</p>
            <div className="cc-actions">
              <button className="btn-ghost" onClick={() => setCleared(false)}>도로랜드 둘러보기</button>
              <button className="btn-primary" onClick={() => navigate('/')}>대시보드로</button>
            </div>
          </div>
        </div>
      )}
      {cleared === 'ch4' && (
        <div className="modal-bg">
          <div className="chapter-clear">
            <span className="cc-eyebrow">CHAPTER 4 CLEAR</span>
            <h2>잊혀진 시간 속으로</h2>
            <p>리코를 무사히 구하고, 나무 상자 속 오래된 사진과 하모니아의 악보를 찾았어요. 그리고 누군가 도로랜드의 미래를 묻는 편지를 남겼어요.</p>
            <p className="cc-next">챕터 5 · 보이드 구조 작전 — 자일로에게 나무 상자 속 설계도를 보여 줘요</p>
            <div className="cc-actions">
              <button className="btn-ghost" onClick={() => navigate('/')}>대시보드</button>
              <button className="btn-primary" onClick={() => setCleared(false)}>도로랜드 둘러보기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
