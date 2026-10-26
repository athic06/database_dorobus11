import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { useEffect, useState } from 'react'
import DailyRoute from '../components/DailyRoute.jsx'
import StateBanner from '../components/StateBanner.jsx'
import { useStore } from '../store.jsx'
import { CHAPTER_TITLES, chapterOf, continuePath, objectiveOf, storyDone } from '../game/progress.js'
import { ASSIGN } from '../game/courses.js'
import { contentDone } from '../game/content.js'
import { BREAKABLE, artworkVisitors, pendingFaults } from '../game/daily.js'
import ArtworkPanel from '../components/ArtworkPanel.jsx'
import VoidChat from '../components/VoidChat.jsx'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function WeeklyChart() {
  return (
    <svg viewBox="0 0 320 150" className="chart" role="img" aria-label="이번 주 학습 현황: 모두 0">
      <line x1="290" y1="20" x2="290" y2="120" stroke="#D9DEE7" />
      <line x1="0" y1="120" x2="290" y2="120" stroke="#E6E9EF" />
      <text x="304" y="24" className="axis">1</text>
      <text x="304" y="124" className="axis">0</text>
      {DAYS.map((d, i) => (
        <text key={d} x={22 + i * 41} y="142" className="axis" textAnchor="middle">{d}</text>
      ))}
    </svg>
  )
}

function Spirit() {
  return (
    <div className="spirit" aria-hidden="true">
      <span className="eye" />
      <span className="eye" />
    </div>
  )
}

// 스토리 이후: 매일 돌아올 이유를 만드는 상시 콘텐츠 (A · B · D · E · G · H)
function AfterStory() {
  const navigate = useNavigate()
  const { user, progress, skipStory } = useStore()
  const [panel, setPanel] = useState(null)
  const done = storyDone(progress)
  const faults = pendingFaults(user.id, progress.work)
  const fc = progress.facilities.length
  const visitors = progress.artworks.reduce((s, a) => s + artworkVisitors(a, fc), 0)

  if (!done) {
    return (
      <section className="card after locked">
        <div>
          <span className="eyebrow-s">스토리 이후 · 도로랜드의 일상</span>
          <h3>메인 스토리를 마치면 열려요</h3>
          <p>오늘의 고장 수리 업무, 내 작품 전시, 보이드와 대화, 코딩 챌린지 랭킹, 친구 방 미니게임이 기다리고 있어요.</p>
        </div>
        <button className="btn-ghost" onClick={skipStory}>체험용 · 스토리 완료 상태로 바꾸기</button>
      </section>
    )
  }

  const CARDS = [
    {
      tag: 'A', title: '오늘의 업무', icon: '🛠️',
      body: faults.length ? `고장 ${faults.length}곳 · ${faults.map((f) => BREAKABLE[f].name).join(', ')}` : '오늘 업무 완료! 내일 또 고장이 생길지도 몰라요',
      action: faults.length ? '도로랜드로 출동' : '도로랜드 가기', go: () => navigate('/world', { state: { from: 'myroom' } }),
    },
    {
      tag: 'B', title: '내 작품 전시', icon: '🖼️',
      body: progress.artworks.length ? `광장 부스 ${progress.artworks.length}개 · 누적 방문객 ${visitors.toLocaleString()}명` : '수업 작품을 광장 부스에 전시해 봐요',
      action: '작품 관리', go: () => setPanel('art'),
    },
    {
      tag: 'D', title: '보이드와 대화', icon: '🤖',
      body: `성격: ${{ kind: '다정한', brave: '씩씩한', silly: '엉뚱한' }[progress.robotPersona]} · 대화 ${Math.floor(progress.robotChat.length / 2)}번`,
      action: '말 걸기', go: () => setPanel('chat'),
    },
    {
      tag: 'E', title: '코딩 챌린지', icon: '🏆',
      body: Object.keys(progress.bestBlocks).length ? `기록 ${Object.keys(progress.bestBlocks).length}/3단계 · 최소 블록에 도전!` : '보이드를 최소 블록으로 움직여 랭킹에 올라 봐요',
      action: '도전하기', go: () => navigate('/play'),
    },
    {
      tag: 'G · H', title: '마이룸 미니게임', icon: '🎮',
      body: progress.minigame ? `「${progress.minigame.title}」 플레이 ${progress.minigame.plays} · ❤️ ${progress.minigame.likes}` : '가구로 보물찾기를 만들고 친구 방에 놀러 가요',
      action: '마이룸 가기', go: () => navigate('/myroom'),
    },
  ]

  return (
    <section className="after">
      <div className="after-head">
        <span className="eyebrow-s">스토리 이후 · 도로랜드의 일상</span>
        <span className="small">메인 스토리 완료 🎉 매일 새로운 일이 생겨요</span>
      </div>
      <div className="after-grid">
        {CARDS.map((c) => (
          <article key={c.title} className="card after-card">
            <span className="after-tag">{c.tag}</span>
            <span className="after-ic" aria-hidden="true">{c.icon}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <button className="btn-primary" onClick={c.go}>{c.action}</button>
          </article>
        ))}
      </div>
      {panel === 'art' && <ArtworkPanel onClose={() => setPanel(null)} />}
      {panel === 'chat' && <VoidChat onClose={() => setPanel(null)} />}
    </section>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, progress, setProgress, checkIn } = useStore()
  const [notice, setNotice] = useState('')
  // 오늘 첫 접속이면 출석 도장 (탈것 스탬프 +1)
  useEffect(() => { checkIn() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const chapter = chapterOf(progress)
  const next = continuePath(progress)
  // 챕터 4부터는 강사님이 진행하는 「시그널 브레이크」 수업이 오늘의 수업이 된다
  const lesson = progress.cubesFound
    ? {
        title: '2차시 · 시그널 브레이크: 리코 구출 작전',
        desc: '머지 큐브와 웹으로 과거의 기억 속 단서를 찾아 큐브에 갇힌 리코를 구해요.',
        teacher: true,
        done: progress.rescueLessonDone,
        flag: 'rescueLessonDone',
        notice: '리코를 구했어요! 도로랜드로 나가면 돌아온 리코를 만날 수 있어요.',
      }
    : {
        title: '1차시 · 블록코딩 첫걸음',
        desc: '순서대로 명령을 쌓아 로봇을 움직여 봐요.',
        done: progress.classDone,
        flag: 'classDone',
        notice: '첫 수업을 들었어요! 챕터 1이 열렸어요. 마이룸에서 자일로가 기다리고 있어요.',
      }

  return (
    <div className="page">
      <Header />
      <main className="container dash">
        <section className="hero">
          <div className="online"><span className="dot" />접속중</div>
          <p className="hello">안녕하세요,</p>
          <h1>{user.name}님 <span className="wave">👋</span></h1>
          <p className="sub">오늘의 수업과 미션이 준비되어 있어요.</p>
          <Spirit />
          <div className="hero-stats">
            <button className="stat" onClick={() => navigate('/courses')}>
              <strong>{progress.course ? 1 : 0}<small>개</small></strong>
              <span>수강 중인 수업 ›</span>
            </button>
            <button className="stat" onClick={() => navigate('/courses')}>
              <strong>{progress.course ? ASSIGN[progress.course].filter(([id]) => !contentDone(progress, id)).length : 0}<small>개</small></strong>
              <span>제출해야 할 과제 ›</span>
            </button>
          </div>
        </section>

        <section className="card weekly">
          <h3>이번 주 학습 현황</h3>
          <WeeklyChart />
          <h3>이번 주 진도율</h3>
          <div className="progress">
            <ul className="legend">
              <li><i style={{ background: '#8DB6FF' }} />완료</li>
              <li><i style={{ background: '#B9E3FF' }} />진행중</li>
              <li><i style={{ background: '#D4D7DD' }} />대기중</li>
            </ul>
            <strong className="pct">0<small>%</small></strong>
          </div>
        </section>

        <StateBanner />

        <button className="card feature">
          <span className="feature-icon island" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="56" height="56">
              <ellipse cx="32" cy="46" rx="26" ry="9" fill="#9C7A55" />
              <ellipse cx="32" cy="42" rx="26" ry="9" fill="#7CC36E" />
              <path d="M32 10a9 9 0 0 1 9 9c0 7-9 16-9 16s-9-9-9-16a9 9 0 0 1 9-9z" fill="#F06A4A" />
              <circle cx="32" cy="19" r="3.5" fill="#fff" />
            </svg>
          </span>
          <span className="feature-text">
            <strong>DIMC 역량 진단</strong>
            <small>AI·디지털·메이킹·컴퓨팅 역량을 측정해보세요</small>
          </span>
        </button>

        <button className="card feature" onClick={() => navigate('/myroom')}>
          <span className="feature-icon room" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="56" height="56">
              <path d="M8 20 32 8l24 12v26L32 58 8 46z" fill="#6FB89A" />
              <path d="M14 23 32 14l18 9v20L32 52 14 43z" fill="#F3D9B8" />
              <rect x="20" y="34" width="16" height="9" rx="3" fill="#B59BE6" />
              <rect x="38" y="26" width="8" height="10" rx="1" fill="#8A97A8" />
            </svg>
          </span>
          <span className="feature-text">
            <strong>마이룸</strong>
            <small>내 방을 꾸미고 나만의 기록을 쌓는 공간</small>
          </span>
          <span className="go">입장 →</span>
        </button>

        <section className="card lesson">
          <span className="eyebrow-s">오늘의 수업{lesson.teacher && <span className="teacher-chip">강사님 수업</span>}</span>
          <h3>{lesson.title}</h3>
          <p>{lesson.desc}</p>
          {lesson.done ? (
            <span className="done-chip">수강 완료 ✓</span>
          ) : (
            <button
              className="btn-primary"
              onClick={() => {
                setProgress({ [lesson.flag]: true })
                setNotice(lesson.notice)
              }}
            >
              수업 듣기 (체험)
            </button>
          )}
          {notice && <p className="notice" role="status">{notice}</p>}
        </section>

        <section className="card adventure">
          <div className="adv-top">
            <span className="eyebrow-s">도로랜드 모험</span>
            <span className="ch-chip">{CHAPTER_TITLES[chapter]}</span>
          </div>
          <ol className="ch-dots" aria-label="챕터 진행">
            {['마이룸', '지도·자동차', '동굴', '하모니아', '큐브', '보이드'].map((name, i) => (
              <li key={name} className={chapter > i ? 'done' : chapter === i ? 'now' : ''}>
                <b>{i}</b>
                <span>{name}</span>
              </li>
            ))}
          </ol>
          <p className="adv-obj">{objectiveOf(progress)}</p>
          <button className="btn-primary" disabled={!next} onClick={() => navigate(next)}>
            {chapter === 6 ? '도로랜드 가기' : chapter === 4 && !progress.rescueLessonDone ? '위의 수업을 먼저 들어요' : '이어하기'}
          </button>
        </section>

        <DailyRoute />
        <AfterStory />

        <div className="schedule-head">
          <h3>이번주 예정된 수업 일정</h3>
          <button className="link">전체 일정 보기</button>
        </div>
        <section className="card schedule">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8A93A6" strokeWidth="1.6" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          <p>이번주 예정된 수업이 없습니다</p>
        </section>
      </main>
    </div>
  )
}
