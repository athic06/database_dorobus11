import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { useStore } from '../store.jsx'
import { COURSES, TRACKS, courseDone } from '../game/courses.js'
import { PLACES } from '../world/layout.js'

// 내 수업: 도로버스 수업 목록(SPARK 1년차 · AWAKE 2년차)과 수업별 도로랜드 월드 미션
export default function Courses() {
  const navigate = useNavigate()
  const { progress: p, setProgress } = useStore()
  const canDrive = p.carCheckDone

  return (
    <div className="page">
      <Header active="내 수업" />
      <main className="container courses">
        <div className="courses-head">
          <div>
            <span className="eyebrow-s">내 수업</span>
            <h2>도로버스 수업 목록</h2>
            <p>수강 중인 수업을 고르면, 그 수업에서 배우는 내용으로 푸는 미션이 도로랜드 월드에 ❗로 나타나요.</p>
          </div>
        </div>
        {Object.entries(TRACKS).map(([tid, t]) => (
          <section key={tid} className="track">
            <h3 className="track-title" style={{ '--tc': t.color }}>{t.name} · {t.year}</h3>
            <div className="course-grid">
              {COURSES.filter((c) => c.track === tid).map((c) => {
                const on = p.course === c.id
                const done = courseDone(p, c.id)
                return (
                  <article key={c.id} className={`card course-card${on ? ' on' : ''}`} style={{ '--tc': t.color }}>
                    <div className="cc-top">
                      <span className="cc-level">level {c.level}</span>
                      {on && <span className="cc-now">수강 중</span>}
                    </div>
                    <h4>{c.icon} {c.project}</h4>
                    <p className="cc-mission">{c.mission}</p>
                    <p className="cc-summary">{c.summary}</p>
                    <dl className="cc-meta">
                      <dt>핵심 배움</dt><dd>{c.skills.join(', ')}</dd>
                      <dt>사용 툴</dt><dd>{c.tools.join(', ')}</dd>
                      <dt>키트</dt><dd>{c.kit || '없음'}</dd>
                      <dt>결과물</dt><dd>{c.result}</dd>
                    </dl>
                    <div className="cc-world">
                      <b>🗺️ 도로랜드 미션 · {c.world.title}</b>
                      <small>{PLACES[c.world.place].name} 근처의 {c.world.npc.label} {done ? '· ✓ 완료' : ''}</small>
                    </div>
                    <div className="cc-actions">
                      {on ? (
                        <button className="btn-primary" disabled={!canDrive} onClick={() => navigate('/world')}>
                          {canDrive ? (done ? '도로랜드 가기' : '미션 하러 가기') : '자동차 점검 후 갈 수 있어요'}
                        </button>
                      ) : (
                        <button className="btn-ghost" onClick={() => setProgress({ course: c.id })}>이 수업 수강하기</button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
