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
  { key: 'harmoniaRestored', label: '하모니아 멜로디 복원' },
  { key: 'lightsFixed', label: '광장 조명 복구' },
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
export const SCENES = [
  { id: 'license', label: '운전면허증 받기', before: 'licenseGot', to: '/myroom', tag: '시연 ①' },
  { id: 'cave', label: '동굴 탐험 (일기장)', before: 'diaryFound', to: '/cave' },
  { id: 'caveExit', label: '동굴 출구 찾기', before: 'caveCleared', to: '/cave' },
  { id: 'xylo', label: '멈춘 하모니아, 자일로 대화', before: 'plazaOpen', to: '/world', from: 'myroom' },
  { id: 'melody', label: '하모니아 멜로디 복원', before: 'harmoniaRestored', to: '/plaza' },
  { id: 'lights', label: '광장 조명 복구', before: 'lightsFixed', to: '/plaza', tag: '시연 ②' },
  { id: 'facility', label: '방문객 요청 시설 설치', before: 'facilities', to: '/plaza' },
  { id: 'shop', label: '상점 재개장 준비', before: 'shopReopened', to: '/world', from: 'plaza' },
  { id: 'cubes', label: '회전목마 옆 큐브 사건', before: 'cubesFound', to: '/world', from: 'carousel' },
  { id: 'signs', label: '회전목마 안내판 정리', before: 'signsDone', to: '/world', from: 'carousel' },
  { id: 'parts', label: '보이드 부품 모으기', before: 'parts', to: '/world', from: 'myroom' },
  { id: 'assembly', label: '보이드 조립 (연구실)', before: 'voidBuilt', to: '/world', from: 'myroom' },
  { id: 'after', label: '메인 스토리 완료 후', before: null, to: '/' },
]
