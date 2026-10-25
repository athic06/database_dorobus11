// 도로버스 수업 목록 (SPARK 1년차 · AWAKE 2년차, 레벨마다 12주 프로젝트)과 수업별 도로랜드 월드 미션.
// 수업은 3개월마다 바뀐다. 도로랜드 쪽은 이 파일의 데이터만 바꿔 끼우면 되도록,
// 월드 미션도 화면 코드가 아니라 문제 데이터(steps)로 적는다. 문제 형식은 missions/CourseMission.jsx 참고.
//
// steps 형식
//   { type: 'choose', q, options: [{ label, ok, why }] }        보기 하나 고르기
//   { type: 'order',  q, items: [정답 순서...], hints: [...] }    순서대로 누르기 (화면에는 섞어서 보여 줌)
//   { type: 'pick',   q, items: [{ label, icon, ok }] }          맞는 것을 모두 고르기
//   { type: 'table',  q, actions: [...], rows: [{ label, answer }] }  상황마다 알맞은 동작 고르기

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
    world: {
      place: 'sign', pos: [24, 0, 40], rot: -1.6, npc: { label: '신인 매니저', color: '#E57E9A', hair: '#2B2A30' },
      title: '네이티 데뷔 무대 준비',
      ask: '전광판에 네이티 데뷔 티저를 띄워야 해! 수업에서 배운 대로 노래부터 영상까지 같이 준비해 줄래?',
      steps: [
        {
          type: 'choose', q: '초음파 피아노: 손을 센서에 가까이 댈수록 높은 음이 나게 하려면?',
          options: [
            { label: '거리가 짧을수록 높은 음을 낸다', ok: true },
            { label: '거리가 짧을수록 낮은 음을 낸다', why: '반대예요. 가까울수록 높게 해야 해요.' },
            { label: '거리와 상관없이 같은 음을 낸다', why: '그러면 센서를 쓰는 의미가 없어요.' },
          ],
        },
        {
          type: 'order', q: '데뷔 티저 MV를 만드는 순서대로 눌러요.',
          items: ['곡 콘셉트 정하기', 'AI로 작곡하기', '초음파 피아노로 연주 녹음', '영상 편집해 MV 완성'],
          hints: ['무슨 노래를 만들지부터 정해요.', '콘셉트에 맞는 곡을 AI로 만들어요.', '곡이 있어야 연주할 수 있어요.', '소리가 다 준비되면 영상에 입혀요.'],
        },
        {
          type: 'choose', q: 'AI로 만든 곡을 전광판에 공개할 때 알맞은 것은?',
          options: [
            { label: 'AI 도구로 만들었다고 함께 밝힌다', ok: true },
            { label: '내가 처음부터 다 작곡했다고 소개한다', why: 'AI가 도운 부분은 솔직하게 밝혀야 해요.' },
            { label: '유명 가수 노래를 AI로 똑같이 따라 만든다', why: '다른 사람의 창작물을 베끼면 안 돼요.' },
          ],
        },
      ],
      thanks: '전광판에 네이티 티저가 떴어! 벌써 팬클럽이 생겼대. 고마워!',
    },
  },
  {
    id: 'l2', level: 2, track: 'spark', icon: '🌐',
    project: '메타버스 월드 아키텍처',
    mission: '나만의 가상 세계를 짓고 친구를 초대하라!',
    summary: '3D 월드를 직접 건축하고 2D 허브 광장과 연결해 누구나 들어와 노는 메타버스를 배포한다',
    skills: ['3D 공간 설계', '물리 인터랙션', '월드 배포'],
    tools: ['제페토 빌드잇', '젭(ZEP)'],
    kit: null, account: '구글', result: '배포된 제페토 3D 월드 + ZEP 허브 광장',
    world: {
      place: 'harmonia', pos: [7, 0, 22], rot: -2.6, npc: { label: '월드 건축가', color: '#4E8BFF', hat: '#F5C451' },
      title: '허브 광장 포털 잇기',
      ask: '하모니아 광장을 친구들이 모이는 허브로 만들고 싶어. 각 월드로 가는 포털을 제대로 이어 줄래?',
      steps: [
        {
          type: 'table', q: '친구가 가고 싶은 곳에 맞는 포털을 골라요.',
          actions: ['🎡 놀이공원 월드', '🏫 학교 월드', '🌲 숲 탐험 월드'],
          rows: [
            { label: '"관람차를 타고 싶어!"', answer: '🎡 놀이공원 월드' },
            { label: '"동물이랑 나무를 보고 싶어"', answer: '🌲 숲 탐험 월드' },
            { label: '"교실에서 퀴즈 대회 하자"', answer: '🏫 학교 월드' },
          ],
        },
        {
          type: 'order', q: '메타버스 월드를 만들어 배포하는 순서대로 눌러요.',
          items: ['공간 스케치하기', '3D 블록으로 건축', '물리와 인터랙션 넣기', '테스트 플레이', '링크로 배포하기'],
          hints: ['머릿속 공간을 먼저 그려 봐요.', '스케치대로 지어요.', '건물이 있어야 움직임을 넣죠.', '배포 전에 직접 놀아 봐요.', '마지막에 친구에게 공유해요.'],
        },
        {
          type: 'choose', q: '처음 온 친구가 허브 광장에서 길을 잃지 않게 하려면?',
          options: [
            { label: '포털마다 이름표와 목적지 그림을 붙인다', ok: true },
            { label: '포털을 전부 똑같은 모양으로 만든다', why: '어디로 가는지 구분이 안 돼요.' },
            { label: '포털을 숨겨서 찾는 재미를 준다', why: '허브는 쉽게 찾아가는 곳이어야 해요.' },
          ],
        },
      ],
      thanks: '포털이 반짝반짝 이어졌어! 이제 친구들이 길을 잃지 않겠다.',
    },
  },
  {
    id: 'l3', level: 3, track: 'spark', icon: '🌍',
    project: '지구 지킴이 비밀경찰',
    mission: '환경 오염과 에너지 빌런을 체포하라!',
    summary: '빛을 감지하는 스마트 무드등을 만들고 SDGs 메시지를 포스터와 웹툰에 담아 세상에 알린다',
    skills: ['조도센서 회로', '시각 디자인', '스토리텔링'],
    tools: ['캔바(Canva)', '투닝(Tooning)'],
    kit: '스마트 무드등', account: '구글', result: '스마트 무드등 + 인포그래픽 + 4컷 환경 웹툰',
    world: {
      place: 'ferris', pos: [-40, 0, -15], rot: 0.8, npc: { label: '에너지 탐정', color: '#3E8E5A', hat: '#2B2F3A' },
      title: '에너지 빌런 체포 작전',
      ask: '관람차 주변에서 전기가 새고 있어! 범인을 잡고, 꼭 필요할 때만 켜지는 무드등을 달아 줘.',
      steps: [
        {
          type: 'pick', q: '에너지를 낭비하는 빌런을 모두 골라요.',
          items: [
            { label: '한낮에 켜진 가로등', icon: '💡', ok: true },
            { label: '아무도 없는 방의 에어컨', icon: '❄️', ok: true },
            { label: '안 쓰는데 꽂혀 있는 충전기', icon: '🔌', ok: true },
            { label: '관람차의 태양광 패널', icon: '☀️' },
            { label: '꺼져 있는 TV', icon: '📺' },
            { label: '세워 둔 자전거', icon: '🚲' },
          ],
        },
        {
          type: 'table', q: '조도센서 무드등: 상황마다 무드등이 어떻게 해야 할까요?',
          actions: ['켜기', '끄기'],
          rows: [
            { label: '🌙 밤이 되어 어두워졌다', answer: '켜기' },
            { label: '☀️ 아침이 되어 밝아졌다', answer: '끄기' },
            { label: '⛅ 흐린 낮이지만 충분히 밝다', answer: '끄기' },
          ],
        },
        {
          type: 'choose', q: '이번 작전을 인포그래픽으로 알릴 때 가장 잘 맞는 SDGs 목표는?',
          options: [
            { label: '7번 모두를 위한 깨끗한 에너지', ok: true },
            { label: '2번 기아 종식', why: '먹거리 문제에 관한 목표예요.' },
            { label: '16번 평화와 정의', why: '이번 작전은 에너지 절약이 주제예요.' },
          ],
        },
      ],
      thanks: '빌런 체포 완료! 무드등 덕분에 밤에만 불이 켜져서 전기가 절약돼.',
    },
  },
  {
    id: 'l4', level: 4, track: 'spark', icon: '🦿',
    project: '도로랜드 AI 로봇 연구소',
    mission: '축제의 인력난과 안전 문제를 로봇으로 해결하라!',
    summary: '두 발로 걷는 워킹로봇을 조립하고 AI로 조사·기획해 공식 로봇 개발 제안서를 완성해 발표한다',
    skills: ['링크 기구학', 'AI 리서치', '제안서 설계'],
    tools: ['Lilys AI', 'Gamma'],
    kit: '워킹로봇', account: '구글', result: '워킹로봇 실물 + 로봇 개발 제안 웹 슬라이드',
    world: {
      place: 'lab', pos: [35, 0, 40], rot: 1.4, npc: { label: '로봇 연구원', color: '#F2F4F8', hat: '#4E8BFF' },
      title: '축제 도우미 워킹로봇',
      ask: '도로랜드 축제에 일손이 부족해. 걸어 다니며 돕는 로봇을 만들어 제안하고 싶은데 도와줄래?',
      steps: [
        {
          type: 'order', q: '두 발 로봇이 한 걸음 걷는 순서대로 눌러요.',
          items: ['무게를 왼발로 옮기기', '오른발 들어 앞으로', '오른발 내려놓기', '무게를 오른발로 옮기기'],
          hints: ['발을 들기 전에 반대쪽 발로 버텨요.', '무게가 옮겨진 뒤 발을 들어요.', '앞으로 낸 발을 땅에 놓아요.', '놓은 발로 무게를 옮겨야 다음 걸음을 걸어요.'],
        },
        {
          type: 'choose', q: '모터 하나로 다리를 앞뒤로 번갈아 움직이게 하는 장치는?',
          options: [
            { label: '크랭크와 링크', ok: true },
            { label: '스피커와 마이크', why: '소리를 내고 듣는 장치예요.' },
            { label: '조도센서', why: '빛을 감지하는 센서예요.' },
          ],
        },
        {
          type: 'choose', q: '로봇 개발 제안서를 쓰기 전에 AI 리서치로 먼저 할 일은?',
          options: [
            { label: '축제에서 사람이 가장 부족한 일이 무엇인지 조사한다', ok: true },
            { label: '로봇 이름부터 멋지게 정한다', why: '해결할 문제를 먼저 알아야 해요.' },
            { label: '가장 비싼 부품부터 고른다', why: '문제를 알아야 필요한 부품도 정할 수 있어요.' },
          ],
        },
      ],
      thanks: '제안서 통과! 축제 날 워킹로봇이 길 안내를 맡게 됐어.',
    },
  },
  {
    id: 'l5', level: 5, track: 'awake', icon: '🏎️',
    project: '도로랜드 스피드 팩토리',
    mission: '미래형 AI 자율주행 서킷을 건설하라!',
    summary: '내가 그린 서킷을 머신러닝 브레인이 스스로 완주하도록 가상 시뮬레이션과 실물 자동차를 함께 완성한다',
    skills: ['머신러닝 지도학습', '적외선 센서', '조건문 알고리즘'],
    tools: ['티처블머신', '엔트리'],
    kit: 'IR 자동차', account: '구글, 네이버', result: '실물 IR 자동차 + 자율주행 서킷 프로그램',
    world: {
      place: 'coaster', pos: [36, 0, 2], rot: -0.6, npc: { label: '서킷 감독', color: '#E2574C', hat: '#2B2F3A' },
      title: '자율주행 서킷 완주',
      ask: '롤러코스터 옆에 자율주행 서킷을 깔았어. IR 자동차가 스스로 완주하도록 두뇌를 만들어 줘!',
      steps: [
        {
          type: 'table', q: '바닥의 검은 선을 따라가는 IR 자동차: 센서 상황마다 어떻게 움직일까요?',
          actions: ['직진', '왼쪽으로 돌기', '오른쪽으로 돌기'],
          rows: [
            { label: '왼쪽 센서만 검은 선을 봄', answer: '왼쪽으로 돌기' },
            { label: '오른쪽 센서만 검은 선을 봄', answer: '오른쪽으로 돌기' },
            { label: '두 센서 모두 선 사이(흰 바닥)', answer: '직진' },
          ],
        },
        {
          type: 'choose', q: '머신러닝 지도학습으로 핸들 방향을 배우게 하려면 어떤 데이터가 필요할까요?',
          options: [
            { label: '트랙 사진과 그때 핸들 방향 정답', ok: true },
            { label: '트랙 사진만 잔뜩', why: '지도학습은 정답(라벨)이 함께 있어야 해요.' },
            { label: '자동차 색깔 목록', why: '주행과 상관없는 데이터예요.' },
          ],
        },
      ],
      thanks: '한 바퀴 완주! 사람이 운전하지 않았는데도 코스를 벗어나지 않았어.',
    },
  },
  {
    id: 'l6', level: 6, track: 'awake', icon: '🚀',
    project: '도로랜드 테크 스타트업',
    mission: '앱을 런칭하고 장애를 복구하라!',
    summary: 'AI로 앱을 개발해 깃허브에 기록하고, 오류를 되돌리고 자동 배포 파이프라인까지 구축한다',
    skills: ['프롬프트 엔지니어링', '버전 관리', 'CI/CD 배포'],
    tools: ['구글 AI 스튜디오', '깃허브', 'Vercel'],
    kit: null, account: '구글, GitHub', result: '배포된 웹앱 URL + QR + 깃허브 커밋 이력',
    world: {
      place: 'shop', pos: [-17, 0, 31], rot: -2.2, npc: { label: '스타트업 CTO', color: '#6B5BD6', hair: '#2B2A30' },
      title: '상점 주문 앱 장애 복구',
      ask: '큰일이야! 오후 2시 5분부터 상점 주문 앱이 멈췄어. 커밋 기록을 보고 고쳐 줄래?',
      steps: [
        {
          type: 'choose', q: '커밋 기록이에요. 앱이 멈춘 원인으로 가장 의심되는 커밋은? (장애 시작 14:05)',
          options: [
            { label: '13:40 메뉴 사진 바꾸기', why: '이후에도 앱은 잘 돌았어요.' },
            { label: '14:02 주문 버튼 코드 정리', ok: true },
            { label: '14:20 장애 안내 문구 추가', why: '장애가 난 뒤에 올린 커밋이에요.' },
          ],
        },
        {
          type: 'order', q: '장애를 복구하는 순서대로 눌러요.',
          items: ['문제 커밋 찾기', 'git revert로 되돌리기', '테스트 통과 확인', '자동 배포로 다시 올리기'],
          hints: ['원인부터 찾아요.', '찾은 커밋을 되돌려요.', '되돌린 코드가 잘 되는지 확인해요.', '확인이 끝나면 배포해요.'],
        },
        {
          type: 'choose', q: '팀원이 보기 좋은 커밋 메시지는?',
          options: [
            { label: '주문 버튼이 눌리지 않는 문제 수정', ok: true },
            { label: '수정', why: '무엇을 고쳤는지 알 수 없어요.' },
            { label: 'ㅁㄴㅇㄹ', why: '다른 사람이 읽을 수 없어요.' },
          ],
        },
      ],
      thanks: '주문이 다시 들어온다! 커밋 기록 덕분에 금방 고쳤어.',
    },
  },
  {
    id: 'l7', level: 7, track: 'awake', icon: '📊',
    project: '공공데이터로 만드는 도로랜드',
    mission: '살아 있는 데이터로 웹서비스를 만들어라!',
    summary: '공공데이터 API를 받아 직접 만든 웹페이지에 띄우고 실시간으로 갱신되는 나만의 대시보드를 배포한다',
    skills: ['API·JSON 구조', 'HTML/CSS/JS', '웹 배포'],
    tools: ['공공데이터포털', 'Antigravity', 'Netlify'],
    kit: 'LCD 교구', account: '공공데이터포털 (휴대폰 인증)', result: '실시간 데이터 대시보드 웹서비스 + QR',
    world: {
      place: 'safari', pos: [-60, 0, -32], rot: 0.9, npc: { label: '환경 관리인', color: '#8B9A5B', hat: '#C9A15B' },
      title: '사파리 대기질 대시보드',
      ask: '동물들 산책 시간을 정하려면 미세먼지를 알아야 해. 공공데이터로 대기질 대시보드를 만들어 줘!',
      steps: [
        {
          type: 'choose', q: 'API가 보낸 JSON: { "station": "도로랜드", "pm10": 82, "grade": "나쁨" } 미세먼지 수치를 화면에 띄우려면?',
          options: [
            { label: 'data.pm10', ok: true },
            { label: 'data.station', why: '측정소 이름이에요.' },
            { label: 'data["도로랜드"]', why: '"도로랜드"는 값이지 이름(키)이 아니에요.' },
          ],
        },
        {
          type: 'table', q: '미세먼지 수치에 맞는 등급을 골라요. (0~30 좋음, 31~80 보통, 81 이상 나쁨)',
          actions: ['😊 좋음', '🙂 보통', '😷 나쁨'],
          rows: [
            { label: 'PM10 25', answer: '😊 좋음' },
            { label: 'PM10 64', answer: '🙂 보통' },
            { label: 'PM10 82', answer: '😷 나쁨' },
          ],
        },
        {
          type: 'choose', q: '1시간마다 바뀌는 데이터를 대시보드에 늘 최신으로 보여 주려면?',
          options: [
            { label: '정해진 시간마다 API를 다시 불러온다', ok: true },
            { label: '처음 받은 값을 계속 보여 준다', why: '그러면 몇 시간 전 값이 그대로 남아요.' },
            { label: '사람이 매시간 숫자를 손으로 고친다', why: '자동으로 갱신하는 게 API를 쓰는 이유예요.' },
          ],
        },
      ],
      thanks: '대시보드 완성! 미세먼지가 나쁜 날엔 동물 산책을 미루기로 했어.',
    },
  },
  {
    id: 'l8', level: 8, track: 'awake', icon: '🎬',
    project: '3D 그래픽스 스튜디오 디렉터',
    mission: '가상 놀이공원을 짓고 카메라를 돌려라!',
    summary: '놀이기구를 직접 모델링하고 빛과 재질을 입힌 뒤 애니메이션과 시네마틱 연출로 한 편의 필름을 완성한다',
    skills: ['3D 모델링', '조명 공학', '키프레임 애니메이션'],
    tools: ['블렌더', 'Meshy.ai'],
    kit: null, account: '구글', result: '3D 놀이공원 포트폴리오 필름(.mp4)',
    world: {
      place: 'carousel', pos: [-26, 0, 61], rot: -2.4, npc: { label: '영상 감독', color: '#2B2F3A', hat: '#E2574C' },
      title: '회전목마 시네마틱 촬영',
      ask: '회전목마를 주인공으로 짧은 필름을 찍을 거야. 조명이랑 카메라 연출을 도와줄래?',
      steps: [
        {
          type: 'table', q: '3점 조명: 각 조명이 하는 일을 골라요.',
          actions: ['키 라이트', '필 라이트', '백 라이트'],
          rows: [
            { label: '가장 밝게, 주인공을 정면 옆에서 비춘다', answer: '키 라이트' },
            { label: '반대쪽 그림자를 부드럽게 채운다', answer: '필 라이트' },
            { label: '뒤에서 비춰 윤곽선을 살린다', answer: '백 라이트' },
          ],
        },
        {
          type: 'order', q: '키프레임 애니메이션 필름을 만드는 순서대로 눌러요.',
          items: ['시작 자세 키프레임', '끝 자세 키프레임', '중간 움직임 다듬기', '카메라 경로 정하기', '렌더링해 mp4로 저장'],
          hints: ['처음 모습부터 찍어요.', '도착할 모습을 정해요.', '두 키프레임 사이를 자연스럽게 다듬어요.', '움직임이 정해지면 카메라를 움직여요.', '마지막에 영상으로 뽑아요.'],
        },
        {
          type: 'choose', q: '반짝이는 금속 기둥 느낌을 내려면 재질을 어떻게 할까요?',
          options: [
            { label: '메탈릭은 높게, 거칠기는 낮게', ok: true },
            { label: '메탈릭은 낮게, 거칠기는 높게', why: '그러면 흙이나 나무처럼 보여요.' },
            { label: '색만 회색으로 바꾼다', why: '색만으로는 금속 반사가 생기지 않아요.' },
          ],
        },
      ],
      thanks: '컷! 회전목마가 영화 주인공처럼 나왔어. 시사회 때 꼭 와!',
    },
  },
]

export const COURSE_REWARD = { cell: 100, stamps: 1 }
export const courseOf = (id) => COURSES.find((c) => c.id === id) || null
// 월드에 나오는 수업 미션: 지금 수강 중인 수업 하나
export const activeCourse = (p) => courseOf(p.course)
export const courseDone = (p, id) => (p.courseDone || []).includes(id)
