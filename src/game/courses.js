// 도로버스 수업 목록 (SPARK 1년차, AWAKE 2년차, 레벨마다 12주 프로젝트).
// 과제 문제는 수업마다 따로 만들지 않고 범용 콘텐츠 라이브러리(game/content.js)에서 골라 쓴다 (아래 ASSIGN).
// 수업은 3개월마다 바뀌므로, 바뀌면 이 파일의 수업 정보와 ASSIGN만 고친다.

export const TRACKS = {
  spark: { name: 'SPARK', year: '1년차', color: '#E08A2E' },
  awake: { name: 'AWAKE', year: '2년차', color: '#2F6FB5' },
}

export const COURSES = [
  {
    id: 'l1', level: 1, track: 'spark', icon: '🎤',
    project: 'AI K-POP 프로듀싱 작전',
    mission: '신인 아이돌 「네이티」를 데뷔시켜라!',
    summary: 'AI로 작곡하고 직접 만든 초음파 피아노로 연주해 나만의 데뷔곡과 뮤직비디오를 완성한다',
    skills: ['생성형 AI 작곡', '초음파 센서', '영상 편집'],
    tools: ['Suno', 'ChatGPT', 'AiSAC', 'VREW'],
    kit: '초음파 피아노', account: '구글', result: 'K-POP 음원 + 데뷔 티저 MV',
  },
  {
    id: 'l2', level: 2, track: 'spark', icon: '🌐',
    project: '메타버스 월드 아키텍처',
    mission: '나만의 가상 세계를 짓고 친구를 초대하라!',
    summary: '3D 월드를 직접 건축하고 2D 허브 광장과 연결해 누구나 들어와 노는 메타버스를 배포한다',
    skills: ['3D 공간 설계', '물리 인터랙션', '월드 배포'],
    tools: ['제페토 빌드잇', '젭(ZEP)'],
    kit: null, account: '구글', result: '배포된 제페토 3D 월드 + ZEP 허브 광장',
  },
  {
    id: 'l3', level: 3, track: 'spark', icon: '🌍',
    project: '지구 지킴이 비밀경찰',
    mission: '환경 오염과 에너지 빌런을 체포하라!',
    summary: '빛을 감지하는 스마트 무드등을 만들고 SDGs 메시지를 포스터와 웹툰에 담아 세상에 알린다',
    skills: ['조도센서 회로', '시각 디자인', '스토리텔링'],
    tools: ['캔바(Canva)', '투닝(Tooning)'],
    kit: '스마트 무드등', account: '구글', result: '스마트 무드등 + 인포그래픽 + 4컷 환경 웹툰',
  },
  {
    id: 'l4', level: 4, track: 'spark', icon: '🦿',
    project: '도로랜드 AI 로봇 연구소',
    mission: '축제의 인력난과 안전 문제를 로봇으로 해결하라!',
    summary: '두 발로 걷는 워킹로봇을 조립하고 AI로 조사·기획해 공식 로봇 개발 제안서를 완성해 발표한다',
    skills: ['링크 기구학', 'AI 리서치', '제안서 설계'],
    tools: ['Lilys AI', 'Gamma'],
    kit: '워킹로봇', account: '구글', result: '워킹로봇 실물 + 로봇 개발 제안 웹 슬라이드',
  },
  {
    id: 'l5', level: 5, track: 'awake', icon: '🏎️',
    project: '도로랜드 스피드 팩토리',
    mission: '미래형 AI 자율주행 서킷을 건설하라!',
    summary: '내가 그린 서킷을 머신러닝 브레인이 스스로 완주하도록 가상 시뮬레이션과 실물 자동차를 함께 완성한다',
    skills: ['머신러닝 지도학습', '적외선 센서', '조건문 알고리즘'],
    tools: ['티처블머신', '엔트리'],
    kit: 'IR 자동차', account: '구글, 네이버', result: '실물 IR 자동차 + 자율주행 서킷 프로그램',
  },
  {
    id: 'l6', level: 6, track: 'awake', icon: '🚀',
    project: '도로랜드 테크 스타트업',
    mission: '앱을 런칭하고 장애를 복구하라!',
    summary: 'AI로 앱을 개발해 깃허브에 기록하고, 오류를 되돌리고 자동 배포 파이프라인까지 구축한다',
    skills: ['프롬프트 엔지니어링', '버전 관리', 'CI/CD 배포'],
    tools: ['구글 AI 스튜디오', '깃허브', 'Vercel'],
    kit: null, account: '구글, GitHub', result: '배포된 웹앱 URL + QR + 깃허브 커밋 이력',
  },
  {
    id: 'l7', level: 7, track: 'awake', icon: '📊',
    project: '공공데이터로 만드는 도로랜드',
    mission: '살아 있는 데이터로 웹서비스를 만들어라!',
    summary: '공공데이터 API를 받아 직접 만든 웹페이지에 띄우고 실시간으로 갱신되는 나만의 대시보드를 배포한다',
    skills: ['API·JSON 구조', 'HTML/CSS/JS', '웹 배포'],
    tools: ['공공데이터포털', 'Antigravity', 'Netlify'],
    kit: 'LCD 교구', account: '공공데이터포털 (휴대폰 인증)', result: '실시간 데이터 대시보드 웹서비스 + QR',
  },
  {
    id: 'l8', level: 8, track: 'awake', icon: '🎬',
    project: '3D 그래픽스 스튜디오 디렉터',
    mission: '가상 놀이공원을 짓고 카메라를 돌려라!',
    summary: '놀이기구를 직접 모델링하고 빛과 재질을 입힌 뒤 애니메이션과 시네마틱 연출로 한 편의 필름을 완성한다',
    skills: ['3D 모델링', '조명 공학', '키프레임 애니메이션'],
    tools: ['블렌더', 'Meshy.ai'],
    kit: null, account: '구글', result: '3D 놀이공원 포트폴리오 필름(.mp4)',
  },
]

export const courseOf = (id) => COURSES.find((c) => c.id === id) || null

/* ---------------- 수업 상세 ---------------- */
// 실제 도로버스 '내 수업' 화면처럼 수업마다 담당 선생님, 수강 인원을 둔다.
export const CLASS_INFO = {
  l1: { teacher: '도로버스 하모 선생님', members: 18, start: '2026.09.01' },
  l2: { teacher: '도로버스 빌드 선생님', members: 22, start: '2026.09.01' },
  l3: { teacher: '도로버스 그린 선생님', members: 16, start: '2026.09.01' },
  l4: { teacher: '도로버스 로보 선생님', members: 20, start: '2026.09.01' },
  l5: { teacher: '도로버스 스피드 선생님', members: 14, start: '2026.09.01' },
  l6: { teacher: '도로버스 런치 선생님', members: 12, start: '2026.09.01' },
  l7: { teacher: '도로버스 데이터 선생님', members: 15, start: '2026.09.01' },
  l8: { teacher: '도로버스 무비 선생님', members: 11, start: '2026.09.01' },
}

// 수업(선생님)이 범용 콘텐츠 라이브러리(game/content.js)에서 고른 과제.
// 수업이 바뀌면 여기서 고르는 문제 id만 바꾼다. 같은 문제를 여러 수업이 함께 쓸 수 있다.
export const ASSIGN = {
  l1: [['q-sensor', '2026.10.20'], ['q-ai', '2026.10.22'], ['w-sequence', '2026.10.24']],
  l2: [['q-sequence', '2026.10.20'], ['q-condition', '2026.10.22'], ['w-loop', '2026.10.24']],
  l3: [['q-sensor', '2026.10.20'], ['q-condition', '2026.10.22'], ['w-condition', '2026.10.24']],
  l4: [['q-sequence', '2026.10.20'], ['q-ai', '2026.10.22'], ['w-sequence', '2026.10.24']],
  l5: [['q-ai', '2026.10.20'], ['q-condition', '2026.10.22'], ['w-condition', '2026.10.24']],
  l6: [['q-variable', '2026.10.20'], ['q-loop-star', '2026.10.22'], ['w-sort', '2026.10.24']],
  l7: [['q-data', '2026.10.20'], ['q-variable', '2026.10.22'], ['w-data', '2026.10.24']],
  l8: [['q-sequence', '2026.10.20'], ['q-loop-star', '2026.10.22'], ['w-ai', '2026.10.24']],
}
