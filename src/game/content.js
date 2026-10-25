// 도로랜드 범용 콘텐츠 라이브러리.
// 특정 수업에 묶지 않고 개념(순서, 조건, 반복, 변수, 센서, 데이터, AI)별로 문제를 만들어 둔다.
// 수업(선생님)은 이 라이브러리에서 골라 과제로 낸다 → game/courses.js ASSIGN. 수업이 3개월마다 바뀌어도 문제는 그대로 쓴다.
//
// kind: 'quiz'  — 내 수업 과제 화면에서 바로 푸는 문제 (q, options, answer, code?)
//       'world' — 도로랜드 월드의 NPC에게 가서 푸는 문제. steps 형식은 missions/ContentMission.jsx 참고
//                 { type: 'choose' | 'order' | 'pick' | 'table', ... }

export const CONCEPTS = {
  sequence: '순서', condition: '조건', loop: '반복', variable: '변수', sensor: '센서', data: '데이터', ai: 'AI', sort: '분류',
}

export const CONTENT = {
  /* ---------- 일반 문제 (퀴즈) ---------- */
  'q-loop-star': {
    kind: 'quiz', concept: 'loop', title: '반복문으로 별 삼각형 출력하기',
    desc: '아래 모양이 그대로 나오도록 반복문을 짠다고 생각해 봐요.',
    code: '*\n**\n***\n****\n*****',
    q: '5줄짜리 별 삼각형에서 i번째 줄에는 별을 몇 개 찍어야 할까요?',
    options: ['항상 5개', 'i개', 'i + 1개'], answer: 1,
  },
  'q-condition': {
    kind: 'quiz', concept: 'condition', title: '조건문 기초',
    desc: '만약 ~라면 / 아니면 구조를 읽어 봐요.',
    code: '만약 비가 오면 → 우산 챙기기\n아니면 → 모자 쓰기',
    q: '맑은 날에는 무엇을 할까요?',
    options: ['우산 챙기기', '모자 쓰기', '둘 다 하기'], answer: 1,
  },
  'q-sequence': {
    kind: 'quiz', concept: 'sequence', title: '순서대로 명령하기',
    desc: '컴퓨터는 적힌 순서대로만 움직여요.',
    code: '라면 끓이기: ? → 면 넣기 → 3분 기다리기 → 그릇에 담기',
    q: '맨 처음 ?에 들어갈 명령은?',
    options: ['물 끓이기', '그릇 씻기', '불 끄기'], answer: 0,
  },
  'q-variable': {
    kind: 'quiz', concept: 'variable', title: '변수와 값 바꾸기',
    desc: '변수는 값을 담아 두는 상자예요.',
    code: '점수 = 3\n점수 = 점수 + 2',
    q: '마지막에 점수에는 얼마가 들어 있을까요?',
    options: ['3', '2', '5'], answer: 2,
  },
  'q-sensor': {
    kind: 'quiz', concept: 'sensor', title: '센서로 입력 받기',
    desc: '센서는 주변을 재서 컴퓨터에 알려 주는 입력 장치예요.',
    q: '주변이 밝은지 어두운지 재는 센서는?',
    options: ['조도센서', '초음파 센서', '온도 센서'], answer: 0,
  },
  'q-data': {
    kind: 'quiz', concept: 'data', title: 'JSON 데이터 읽기',
    desc: '인터넷에서 받아 오는 데이터는 이름(키)과 값으로 되어 있어요.',
    code: '{ "place": "도로랜드", "temp": 21 }',
    q: '기온 값을 꺼내려면 어떤 키를 써야 할까요?',
    options: ['place', 'temp', '21'], answer: 1,
  },
  'q-ai': {
    kind: 'quiz', concept: 'ai', title: 'AI 학습 데이터',
    desc: 'AI는 예시와 정답을 보고 배워요(지도학습).',
    q: '고양이 사진을 알아보는 AI를 가르치려면 어떤 데이터가 필요할까요?',
    options: ['고양이 사진만 많이', '사진과 "고양이 / 아님" 정답', '사진 파일 이름만'], answer: 1,
  },

  /* ---------- 도로랜드 문제 (월드 NPC) ---------- */
  'w-condition': {
    kind: 'world', concept: 'condition', title: '사파리 동물 감지 규칙',
    desc: '사파리 사육사가 도로랜드 차가 동물 앞에서 안전하게 멈추는 규칙을 부탁해요.',
    place: 'safari', pos: [-60, 0, -32], rot: 0.9, npc: { label: '사파리 사육사', color: '#8B9A5B', hat: '#C9A15B' },
    ask: '사파리를 지나는 차가 동물 가까이에서는 꼭 멈추게 하고 싶어. 상황마다 어떻게 움직일지 정해 줄래?',
    steps: [
      {
        type: 'table', q: '상황마다 차가 할 일을 골라요. (만약 동물이 가까우면 → 멈추기, 아니면 → 달리기)',
        actions: ['멈추기', '달리기'],
        rows: [
          { label: '🦁 사자가 바로 앞에 있다', answer: '멈추기' },
          { label: '🌿 길에 아무도 없다', answer: '달리기' },
          { label: '🦒 기린이 옆에 서 있다', answer: '멈추기' },
        ],
      },
      {
        type: 'choose', q: '이 규칙을 조건문으로 바르게 쓴 것은?',
        options: [
          { label: '만약 동물이 가까우면 멈추기, 아니면 달리기', ok: true },
          { label: '만약 동물이 가까우면 달리기, 아니면 멈추기', why: '반대예요. 동물이 가까울 때 멈춰야 해요.' },
          { label: '항상 달리기', why: '조건 없이 달리면 동물과 부딪힐 수 있어요.' },
        ],
      },
    ],
    thanks: '이제 동물들이 안심하고 쉴 수 있겠어. 고마워!',
  },
  'w-sequence': {
    kind: 'world', concept: 'sequence', title: '관람차 점검 순서',
    desc: '관람차 기술자가 안전 점검을 순서대로 도와 달라고 해요.',
    place: 'ferris', pos: [-40, 0, -15], rot: 0.8, npc: { label: '관람차 기술자', color: '#4E8BFF', hat: '#F5C451' },
    ask: '관람차를 점검해야 하는데 순서가 헷갈려. 안전하게 하려면 어떤 순서로 해야 할까?',
    steps: [
      {
        type: 'order', q: '안전 점검 순서대로 눌러요.',
        items: ['전원 끄기', '먼지 닦기', '전선 연결 확인', '전원 켜고 시험 운행'],
        hints: ['점검 전에 먼저 전원을 꺼야 안전해요.', '깨끗하게 닦은 다음 살펴봐요.', '선이 잘 이어졌는지 확인해요.', '모두 확인한 뒤 마지막에 켜요.'],
      },
      {
        type: 'choose', q: '순서를 바꿔서 "전원 켜기"를 맨 앞에 두면 어떻게 될까요?',
        options: [
          { label: '움직이는 기계를 만지게 되어 위험하다', ok: true },
          { label: '아무 차이가 없다', why: '명령은 순서가 바뀌면 결과도 달라져요.' },
          { label: '더 빨리 끝난다', why: '빨라도 위험하면 안 돼요.' },
        ],
      },
    ],
    thanks: '점검 완료! 오늘도 관람차가 안전하게 돌 수 있어.',
  },
  'w-loop': {
    kind: 'world', concept: 'loop', title: '회전목마 반복 공연',
    desc: '공연 감독이 회전목마 공연 동작을 짧은 코드로 줄여 달라고 해요.',
    place: 'carousel', pos: [-26, 0, 61], rot: -2.4, npc: { label: '공연 감독', color: '#2B2F3A', hat: '#E2574C' },
    ask: '회전목마 말들이 "한 칸 앞으로, 점프"를 8번 해야 해. 명령을 16줄이나 쓰기엔 너무 길어!',
    steps: [
      {
        type: 'choose', q: '같은 동작 8번을 가장 짧게 쓴 코드는?',
        options: [
          { label: '8번 반복 { 한 칸 앞으로, 점프 }', ok: true },
          { label: '한 칸 앞으로, 점프 (한 번만)', why: '한 번만 하고 끝나요.' },
          { label: '16번 반복 { 한 칸 앞으로, 점프 }', why: '16번이면 두 배로 공연해요.' },
        ],
      },
      {
        type: 'table', q: '반복 횟수에 따라 말이 몇 칸 갈까요? (한 번에 한 칸)',
        actions: ['3칸', '5칸', '8칸'],
        rows: [
          { label: '3번 반복', answer: '3칸' },
          { label: '8번 반복', answer: '8칸' },
          { label: '5번 반복', answer: '5칸' },
        ],
      },
    ],
    thanks: '코드가 짧아지니 공연 준비가 금방 끝났어!',
  },
  'w-sort': {
    kind: 'world', concept: 'sort', title: '상점 물건 분류',
    desc: '상점 주인이 섞인 물건을 종류별로 나눠 달라고 해요.',
    place: 'shop', pos: [-17, 0, 31], rot: -2.2, npc: { label: '상점 주인', color: '#F08A3E', hat: '#E2574C' },
    ask: '새로 들어온 물건이 뒤섞였어. 학용품 진열대에 놓을 것만 골라 줄래?',
    steps: [
      {
        type: 'pick', q: '학용품만 모두 골라요.',
        items: [
          { label: '연필', icon: '✏️', ok: true },
          { label: '지우개', icon: '🧽', ok: true },
          { label: '공책', icon: '📒', ok: true },
          { label: '사과', icon: '🍎' },
          { label: '양말', icon: '🧦' },
          { label: '컵', icon: '🥤' },
        ],
      },
      {
        type: 'choose', q: '물건을 분류하는 기준으로 가장 알맞은 것은?',
        options: [
          { label: '쓰임새(무엇에 쓰는지)', ok: true },
          { label: '들어온 시간', why: '시간으로는 무슨 물건인지 알 수 없어요.' },
          { label: '아무렇게나', why: '기준이 있어야 찾기 쉬워요.' },
        ],
      },
    ],
    thanks: '진열대가 깔끔해졌어! 손님들이 물건을 금방 찾겠다.',
  },
  'w-data': {
    kind: 'world', concept: 'data', title: '전광판 데이터 읽기',
    desc: '전광판 관리자가 받아 온 날씨 데이터를 화면에 띄워 달라고 해요.',
    place: 'sign', pos: [24, 0, 40], rot: -1.6, npc: { label: '전광판 관리자', color: '#4E8BFF', hair: '#2B2A30' },
    ask: '날씨 데이터를 받아 왔는데 전광판에 뭘 띄워야 할지 모르겠어. 도와줄래?',
    steps: [
      {
        type: 'choose', q: '받은 데이터: { "place": "도로랜드", "pm10": 82, "grade": "나쁨" } 미세먼지 수치를 띄우려면?',
        options: [
          { label: 'data.pm10', ok: true },
          { label: 'data.place', why: '장소 이름이에요.' },
          { label: 'data["도로랜드"]', why: '"도로랜드"는 값이지 키가 아니에요.' },
        ],
      },
      {
        type: 'table', q: '수치에 맞는 등급을 골라요. (0~30 좋음, 31~80 보통, 81 이상 나쁨)',
        actions: ['😊 좋음', '🙂 보통', '😷 나쁨'],
        rows: [
          { label: 'PM10 25', answer: '😊 좋음' },
          { label: 'PM10 64', answer: '🙂 보통' },
          { label: 'PM10 82', answer: '😷 나쁨' },
        ],
      },
    ],
    thanks: '전광판에 오늘 미세먼지가 떴어! 다들 마스크를 챙기겠지?',
  },
  'w-ai': {
    kind: 'world', concept: 'ai', title: '사진 분류 AI 학습',
    desc: '연구실 연구원이 동물 사진을 알아보는 AI를 함께 가르치자고 해요.',
    place: 'lab', pos: [35, 0, 40], rot: 1.4, npc: { label: '로봇 연구원', color: '#F2F4F8', hat: '#4E8BFF' },
    ask: '보이드가 사파리 동물을 알아보게 하고 싶어. 학습 데이터를 같이 만들어 줄래?',
    steps: [
      {
        type: 'table', q: '사진마다 알맞은 정답(라벨)을 붙여요.',
        actions: ['사자', '기린', '코끼리'],
        rows: [
          { label: '🦁 갈기가 있는 동물 사진', answer: '사자' },
          { label: '🦒 목이 긴 동물 사진', answer: '기린' },
          { label: '🐘 코가 긴 동물 사진', answer: '코끼리' },
        ],
      },
      {
        type: 'choose', q: 'AI가 더 잘 맞히게 하려면?',
        options: [
          { label: '여러 각도의 사진과 정답을 더 많이 모은다', ok: true },
          { label: '사진 한 장만 계속 보여 준다', why: '한 장만 보면 다른 사진은 못 알아봐요.' },
          { label: '정답을 일부러 틀리게 붙인다', why: '틀린 정답을 배우면 틀리게 맞혀요.' },
        ],
      },
    ],
    thanks: '보이드가 사자를 알아봤어! 데이터가 좋으니 AI도 똑똑해지네.',
  },
}

export const CONTENT_REWARD = { quiz: { cell: 50 }, world: { cell: 100, stamps: 1 } }
export const contentOf = (id) => (CONTENT[id] ? { id, ...CONTENT[id] } : null)
export const contentDone = (p, id) => (p.contentDone || []).includes(id)
// 월드에 나오는 도로랜드 문제: 내 수업 과제에서 「도로랜드에서 하기」를 누른 문제 하나
export const activeWorldTask = (p) => contentOf(p.worldTask)
