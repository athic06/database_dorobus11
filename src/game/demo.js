// 발표 시연용: 스토리 단계를 순서대로 적어 두고, 원하는 장면으로 건너뛰거나 지금 단계를 바로 완료한다.
// 시연 중 미션이 막히거나 오류가 나도 다음 장면으로 넘어갈 수 있게 하기 위한 것 (시연 계정에만 보임).
import { FACILITY_GOAL, VOID_PARTS } from './progress.js'

const today = () => new Date().toISOString().slice(0, 10)

// key: 진행 상태 값, done: 이 단계를 완료로 만드는 값, isDone: 완료 판단(없으면 p[key])
export const STEPS = [
  { key: 'classDone', label: '첫 수업 듣기' },
  { key: 'introSeen', label: '자일로에게 지도와 자동차 받기' },
  { key: 'carCheckDone', label: '자동차 출발 점검' },
  { key: 'licenseGot', label: '운전면허증 받기', done: () => ({ licenseGot: true, licenseDate: today() }) },
  { key: 'diaryFound', label: '동굴에서 일기장 찾기', done: () => ({ caveIntroSeen: true, diaryFound: true }) },
  { key: 'caveCleared', label: '동굴 출구 찾기' },
  { key: 'plazaOpen', label: '자일로에게 광장 문 열어 달라고 하기' },
  { key: 'harmoniaRestored', label: '멜로디 복원, 하모니아 수리' },
  { key: 'lightsFixed', label: '광장 전등 연결' },
  {
    key: 'facilities', label: `방문객 요청 시설 ${FACILITY_GOAL}개 설치`,
    done: (p) => ({ facilities: [...new Set([...(p.facilities || []), 'bench', 'fountain', 'photo'])] }),
    isDone: (p) => (p.facilities || []).length >= FACILITY_GOAL,
  },
  { key: 'shopReopened', label: '상점 재개장 준비' },
  { key: 'cubesFound', label: '회전목마 옆 큐브 사건' },
  { key: 'rescueLessonDone', label: '강사님 수업으로 리코 구출' },
  { key: 'rikoBack', label: '돌아온 리코 만나기' },
  { key: 'signsDone', label: '회전목마 주변 안내판 정리' },
  { key: 'letterSeen', label: '코덱스의 편지 읽기' },
  { key: 'voidStarted', label: '자일로에게 설계도 보여 주기' },
  {
    key: 'parts', label: `보이드 부품 ${VOID_PARTS.length}개 모으기`,
    done: () => ({ parts: VOID_PARTS.map((x) => x.id) }),
    isDone: (p) => (p.parts || []).length >= VOID_PARTS.length,
  },
  { key: 'voidBuilt', label: '보이드 조립과 작동 시험' },
  { key: 'codexMet', label: '코덱스와 만나기 (메인 스토리 완료)' },
]

const stepDone = (s, p) => (s.isDone ? s.isDone(p) : !!p[s.key])
const stepPatch = (s, p) => (s.done ? s.done(p) : { [s.key]: true })

// 아직 끝나지 않은 첫 단계 (없으면 스토리 완료)
export const nextStep = (p) => STEPS.find((s) => !stepDone(s, p)) || null
export const completePatch = (p) => {
  const s = nextStep(p)
  return s ? stepPatch(s, p) : null
}

// before 단계 직전까지 모두 끝낸 상태 (before가 없으면 전부 완료)
export function stateBefore(before) {
  const end = before ? STEPS.findIndex((s) => s.key === before) : STEPS.length
  return STEPS.slice(0, end).reduce((acc, s) => ({ ...acc, ...stepPatch(s, acc) }), { facilities: [], parts: [] })
}

// 바로 가기 장면. to: 이동할 화면, from: 월드에서 나타날 위치 (World.jsx의 SPAWNS)
// recap: 장면으로 넘어가기 전에 보여 주는 '지금까지의 이야기' 대사 (갑자기 미션부터 시작하지 않도록)
export const SCENES = [
  {
    id: 'license', label: '운전면허증 받기', before: 'licenseGot', to: '/myroom', tag: '시연 ①',
    recap: [
      { text: '(첫 수업을 마치자, 도로랜드에서 초대장이 날아왔다.)' },
      { who: '자일로', text: '어서 오세요, 도로랜드에! 이 넓은 곳을 걸어 다닐 순 없겠죠? 모바일 로봇 자동차를 준비했어요.' },
      { who: '리코', text: '조립도 출발 점검도 끝냈어! 이제 출발만 하면 돼.' },
      { who: '자일로', text: '잠깐! 면허증 없이 운전하면 안 되죠. 자동차 옆 받침대에 운전면허증을 놓아 뒀어요.' },
    ],
  },
  {
    id: 'cave', label: '동굴 탐험 (일기장)', before: 'diaryFound', to: '/cave',
    recap: [
      { text: '(운전면허증을 받고, 지도에 그려진 낯선 문양을 따라 북동쪽 산으로 달렸다.)' },
      { who: '리코', text: '문양이 가리키던 곳이 바로 이 동굴이야.' },
      { who: '제로', text: '저 안쪽에 파란 불빛이 보여… 따라가 보자!' },
    ],
  },
  {
    id: 'caveExit', label: '동굴 출구 찾기', before: 'caveCleared', to: '/cave',
    recap: [
      { text: '(동굴 깊은 곳에서 낡은 일기장과 열쇠를 찾았다. 그 순간 동굴이 흔들리며 들어온 길이 막혀 버렸다!)' },
      { who: '리코', text: '일기장에 "멜로디가 사라지면 모든 것은 멈춘다"라고 적혀 있어…' },
      { who: '제로', text: '일단 나가자! 지도 표지판을 보고 다른 출구를 찾아야 해.' },
    ],
  },
  {
    id: 'xylo', label: '멈춘 하모니아, 자일로 대화', before: 'plazaOpen', to: '/world', from: 'myroom',
    recap: [
      { text: '(겨우 동굴을 빠져나오자, 도로랜드 전체에 울리던 음악이 뚝 끊겨 있었다.)' },
      { who: '리코', text: '하모니아가 멈췄어! 놀이기구도 가로등도 전부 멈춰 버렸어.' },
      { who: '제로', text: '자일로에게 가 보자. 마이룸 앞에 있을 거야.' },
    ],
  },
  {
    id: 'melody', label: '멜로디 복원, 하모니아 수리', before: 'harmoniaRestored', to: '/plaza',
    recap: [
      { text: '(자일로가 하모니아 광장 문을 열어 주었다.)' },
      { who: '자일로', text: '하모니아는 음악을 에너지로 바꿔 도로랜드 전체에 전기를 보내는 장치예요. 그런데 악보가 사라졌어요!' },
      { who: '리코', text: '그럼 우리가 기억하는 멜로디를 모아서 되살리자. 그러면 하모니아도 다시 고칠 수 있어!' },
    ],
  },
  {
    id: 'lights', label: '광장 전등 연결', before: 'lightsFixed', to: '/plaza', tag: '시연 ②',
    recap: [
      { text: '(동굴에서 찾은 일기장의 경고대로, 멜로디가 사라지자 도로랜드 전체가 멈춰 있었다.)' },
      { text: '(악보마저 사라졌지만, 모두의 기억을 모아 멜로디를 되살렸다. 하모니아 수리 완료! 도로랜드에 다시 전력이 돌아왔다.)' },
      { who: '제로', text: '놀이기구가 다시 돌아간다! 그런데 광장만 아직 깜깜해.' },
      { who: '리코', text: '광장 전등 연결이 끊겼나 봐. 조명 제어반에서 다시 잇고, 어두울 때 켜지도록 조건을 만들자!' },
    ],
  },
  {
    id: 'facility', label: '방문객 요청 시설 설치', before: 'facilities', to: '/plaza',
    recap: [
      { text: '(광장 전등이 켜지자 음악과 불빛을 보고 방문객들이 하나둘 돌아왔다.)' },
      { who: '자일로', text: '하모니아가 멈춰 있는 동안 광장 시설을 모두 치워 뒀거든요. 방문객들이 원하는 시설을 다시 놓아 볼까요?' },
    ],
  },
  {
    id: 'shop', label: '상점 재개장 준비', before: 'shopReopened', to: '/world', from: 'plaza',
    recap: [
      { text: '(벤치, 분수, 포토존이 생기자 광장이 북적이기 시작했다.)' },
      { who: '리코', text: '이제 문 닫은 상점도 다시 열 수 있겠어. 광장 서쪽 상점으로 가 보자!' },
    ],
  },
  {
    id: 'cubes', label: '회전목마 옆 큐브 사건', before: 'cubesFound', to: '/world', from: 'carousel',
    recap: [
      { text: '(상점이 다시 문을 열던 그때, 회전목마 쪽에서 덜컹! 하고 무언가 움직이는 소리가 들렸다.)' },
      { who: '리코', text: '회전목마 옆 오래된 돌 구조물이 열렸어! 가 보자!' },
    ],
  },
  {
    id: 'signs', label: '회전목마 안내판 정리', before: 'signsDone', to: '/world', from: 'carousel',
    recap: [
      { text: '(큐브 속으로 사라졌던 리코를 강사님 수업 「시그널 브레이크」로 구해 냈다.)' },
      { who: '리코', text: '구해 줘서 고마워! 그런데 큐브 소동 때문에 회전목마 주변 안내판이 엉망이 됐대.' },
      { who: '자일로', text: '방문객들이 길을 헤매고 있어요. 안내판을 시설 이름과 방향에 맞게 정리해 줄래요?' },
    ],
  },
  {
    id: 'parts', label: '보이드 부품 모으기', before: 'parts', to: '/world', from: 'myroom',
    recap: [
      { text: '(회전목마에서 코덱스의 편지를, 리코는 나무 상자를 찾았다. 상자 속에는 작은 로봇 설계도가 들어 있었다.)' },
      { who: '자일로', text: '몸통에 V.I.D라고 적힌 로봇이네요. 부품만 있으면 만들 수 있어요!' },
      { who: '제로', text: '도로랜드 곳곳에서 부품을 모으자. 미니맵의 주황 점이야!' },
    ],
  },
  {
    id: 'assembly', label: '보이드 조립 (연구실)', before: 'voidBuilt', to: '/world', from: 'myroom',
    recap: [
      { text: '(도로랜드 곳곳을 달려 보이드 부품 다섯 개를 모두 모았다.)' },
      { who: '자일로', text: '연구실로 와요! 같이 조립해서 작동 시험을 해 봐요.' },
    ],
  },
  {
    id: 'after', label: '메인 스토리 완료 후', before: null, to: '/',
    recap: [
      { text: '(보이드를 깨우고, 숲의 수호자 코덱스를 만났다. 메인 스토리 완료!)' },
      { who: '제로', text: '이제 도로랜드에서 매일 할 일이 생겼어. 오늘의 루트부터 확인해 보자!' },
    ],
  },
]
export const sceneOf = (id) => SCENES.find((s) => s.id === id)
