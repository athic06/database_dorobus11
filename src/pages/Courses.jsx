import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { useStore } from '../store.jsx'
import { ASSIGN, CLASS_INFO, COURSES, TRACKS } from '../game/courses.js'
import { CONCEPTS, CONTENT_REWARD, contentDone, contentOf } from '../game/content.js'

// 내 수업: 실제 도로버스 화면처럼 수업 카드 목록 → 「수업 입장」으로 수업 상세(수업 영상, 과제, 공지, 자료, 강의 평가).
// 상세 창의 「교실 입장」을 누르면 그때 마이룸(교실)으로 간다.
// 과제는 수업마다 따로 만들지 않고 범용 콘텐츠 라이브러리(game/content.js)에서 골라 낸다.
// 과제는 이 화면에서 바로 푼다 (수업과 도로랜드 월드는 연결하지 않는다).
export default function Courses() {
  const { progress: p } = useStore()
  const [track, setTrack] = useState('all')
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)

  const list = COURSES.filter((c) => track === 'all' || c.track === track)
    .filter((c) => status === 'all' || (status === 'on' ? p.course === c.id : p.course !== c.id))
    .filter((c) => !query.trim() || c.project.includes(query.trim()))
    // 수강 중인 수업을 맨 앞에
    .sort((a, b) => (b.id === p.course) - (a.id === p.course))

  return (
    <div className="page">
      <Header active="내 수업" />
      <main className="container classes">
        <div className="classes-bar">
          <div className="seg">
            <button className="on">▦ 수업</button>
            <button disabled title="체험판에서는 준비 중이에요">🗓 일정</button>
          </div>
          <select className="field sel" value={track} onChange={(e) => setTrack(e.target.value)} aria-label="과정">
            <option value="all">전체 과정</option>
            {Object.entries(TRACKS).map(([id, t]) => <option key={id} value={id}>{t.name} · {t.year}</option>)}
          </select>
          <select className="field sel" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="상태">
            <option value="all">전체</option>
            <option value="on">수강 중</option>
            <option value="off">수강 가능</option>
          </select>
          <input className="field search" placeholder="수업 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="class-grid">
          {list.map((c) => {
            const info = CLASS_INFO[c.id]
            const on = p.course === c.id
            return (
              <article key={c.id} className={`class-card${on ? ' on' : ''}`}>
                <div className="class-top">
                  <span>👤 {info.members}</span>
                  <span className="class-tag" style={{ '--tc': TRACKS[c.track].color }}>{TRACKS[c.track].name} Lv.{c.level}</span>
                  {on && <span className="class-now">수강 중</span>}
                </div>
                <h4>{c.icon} {c.project}</h4>
                <small>{info.teacher}</small>
                <button className="class-enter" onClick={() => setOpenId(c.id)}>수업 입장</button>
              </article>
            )
          })}
          {list.length === 0 && <p className="small">조건에 맞는 수업이 없어요.</p>}
        </div>
      </main>
      {openId && <ClassRoom course={COURSES.find((c) => c.id === openId)} onClose={() => setOpenId(null)} />}
    </div>
  )
}

const TABS = ['수업 영상', '과제', '공지', '자료', '강의 평가']

function ClassRoom({ course: c, onClose }) {
  const navigate = useNavigate()
  const { progress: p, setProgress } = useStore()
  const [tab, setTab] = useState('과제')
  const info = CLASS_INFO[c.id]
  const on = p.course === c.id

  return (
    <div className="classroom-bg" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="classroom" role="dialog" aria-modal="true" aria-label={c.project}>
        <div className="cr-head">
          <div>
            <h2>{c.project}</h2>
            <small>{info.start} · {info.teacher}</small>
          </div>
          <span className="grow" />
          {!on && <button className="cr-btn ghost" onClick={() => setProgress({ course: c.id })}>이 수업 수강하기</button>}
          <button className="cr-btn" onClick={() => navigate('/myroom')}>🚪 교실 입장</button>
          <button className="cr-close" onClick={onClose} aria-label="닫기">×</button>
        </div>
        <div className="cr-tabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
          <span className="grow" />
          <span className="cr-members">👥 {info.members}</span>
        </div>
        <div className="cr-body">
          {tab === '과제' && <Tasks course={c} />}
          {tab === '수업 영상' && <Videos course={c} />}
          {tab === '공지' && <Simple icon="📢" title="공지" lines={[`${c.project} 수업에 오신 걸 환영해요!`, `과제는 도로랜드 콘텐츠 라이브러리에서 골라 냈어요. 과제 탭을 확인해 주세요.`, '과제는 수업 시간 전까지 마쳐 주세요.']} />}
          {tab === '자료' && <Simple icon="📎" title="수업 자료" lines={[`사용 툴: ${c.tools.join(', ')}`, `키트: ${c.kit || '없음'}`, `필요 계정: ${c.account}`, `결과물: ${c.result}`]} />}
          {tab === '강의 평가' && <Simple icon="⭐" title="강의 평가" lines={['12주 수업이 끝나면 강의 평가가 열려요.']} />}
        </div>
      </div>
    </div>
  )
}

function Videos({ course: c }) {
  const weeks = [`1주차 · ${c.project} 오리엔테이션`, `2주차 · ${c.skills[0]}`, `3주차 · ${c.skills[1] || c.skills[0]}`, `4주차 · ${c.skills[2] || '결과물 만들기'}`]
  const [pick, setPick] = useState(null)
  return (
    <div className="cr-split">
      <aside className="cr-list">
        {weeks.map((w) => (
          <button key={w} className={pick === w ? 'on' : ''} onClick={() => setPick(w)}><b>{w}</b><small>수업 녹화본</small></button>
        ))}
      </aside>
      <section className="cr-detail empty">
        <span className="cr-empty-ic">🎬</span>
        <b>{pick || '영상을 선택하세요'}</b>
        <small>{pick ? '체험판에서는 수업 영상이 재생되지 않아요.' : '왼쪽 목록에서 영상을 고르면 여기에서 재생돼요.'}</small>
      </section>
    </div>
  )
}

function Simple({ icon, title, lines }) {
  return (
    <section className="cr-detail">
      <div className="cr-card"><b>{icon} {title}</b>{lines.map((l) => <p key={l}>{l}</p>)}</div>
    </section>
  )
}

const KIND = { quiz: { label: '일반 문제', cls: 'k-quiz' } }

// 수업이 범용 콘텐츠 라이브러리에서 골라 낸 과제 목록
const assigned = (c) => ASSIGN[c.id].map(([id, date]) => ({ ...contentOf(id), date }))

function Tasks({ course: c }) {
  const { progress: p } = useStore()
  const tasks = assigned(c)
  const [pickId, setPickId] = useState(null)
  const t = tasks.find((x) => x.id === pickId)
  return (
    <div className="cr-split">
      <aside className="cr-list">
        <p className="cr-list-note">선생님이 도로랜드 콘텐츠 라이브러리에서 고른 과제예요.</p>
        {tasks.map((x) => (
          <button key={x.id} className={pickId === x.id ? 'on' : ''} onClick={() => setPickId(x.id)}>
            <b>{x.title}</b>
            <span className="cr-chips">
              <em className={KIND[x.kind].cls}>{KIND[x.kind].label}</em>
              <em className="k-concept">{CONCEPTS[x.concept]}</em>
              {contentDone(p, x.id) ? <em className="k-done">완료</em> : <em className="k-new">NEW</em>}
            </span>
            <small>{x.date}</small>
          </button>
        ))}
      </aside>
      {t ? <TaskDetail key={t.id} course={c} task={t} /> : (
        <section className="cr-detail empty">
          <span className="cr-empty-ic">☑️</span>
          <b>과제를 선택하세요</b>
          <small>왼쪽 목록에서 과제를 고르면 자세한 내용이 여기에 나와요.</small>
        </section>
      )}
    </div>
  )
}

function TaskDetail({ course: c, task: t }) {
  const { progress: p, setProgress, addCell } = useStore()
  const done = contentDone(p, t.id)
  const reward = CONTENT_REWARD[t.kind]
  const [answer, setAnswer] = useState(null)
  const [msg, setMsg] = useState('')

  const submitQuiz = () => {
    if (answer === null) return setMsg('답을 하나 골라 주세요.')
    if (answer !== t.answer) return setMsg('아쉬워요. 다시 골라 봐요.')
    addCell(reward.cell)
    setProgress({ contentDone: [...(p.contentDone || []), t.id] })
    setMsg(`과제 완료! CELL +${reward.cell}`)
  }

  return (
    <section className="cr-detail task">
      <div className="task-head">
        <span className="task-ic">☑️</span>
        <div>
          <b>{t.title}</b>
          <small>출제 {t.date} · {CLASS_INFO[c.id].teacher} · 개념: {CONCEPTS[t.concept]}</small>
        </div>
        <span className="grow" />
        <span className={`task-state${done ? ' done' : ''}`}>{done ? '완료' : '미응시'}</span>
      </div>
      <div className="task-cols">
        <div className="cr-card">
          <b>📘 과제 안내</b>
          <small className="cr-label">과제 설명</small>
          <p className="task-desc">{t.desc}{t.code ? `\n\n${t.code}` : ''}</p>
          <small className="cr-label">완료 시 보상</small>
          <span className="cr-reward">
            <em>💎 x{reward.cell}</em>
            {reward.stamps ? <em>🐾 x{reward.stamps}</em> : null}
          </span>
          <small className="cr-label">출처</small>
          <p className="task-desc">도로랜드 콘텐츠 라이브러리 · {CONCEPTS[t.concept]} 문제 (다른 수업에서도 쓰는 범용 문제)</p>
        </div>
        <div className="cr-card">
          <b>📝 문제</b>
          {done ? (
            <p className="task-ok">✓ 완료한 과제예요.</p>
          ) : (
            <>
              <p className="task-desc">{t.q}</p>
              <div className="pick-list">
                {t.options.map((o, i) => (
                  <button key={o} className={`pick wide${answer === i ? ' on' : ''}`} onClick={() => { setAnswer(i); setMsg('') }}>{o}</button>
                ))}
              </div>
              <button className="btn-primary" onClick={submitQuiz}>제출하기</button>
            </>
          )}
          {msg && <p className={`feedback ${msg.includes('완료') ? 'good' : 'bad'}`}>{msg}</p>}
        </div>
      </div>
    </section>
  )
}
