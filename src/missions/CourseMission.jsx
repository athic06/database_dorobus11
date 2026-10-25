import { useMemo, useState } from 'react'
import MissionShell from './MissionShell.jsx'
import { useStore } from '../store.jsx'
import { COURSE_REWARD, TRACKS } from '../game/courses.js'

// 수업 연계 월드 미션: game/courses.js의 문제 데이터(steps)를 차례로 풀게 한다.
// 수업이 바뀌면 이 화면은 그대로 두고 데이터만 바꾼다.

// 보기 순서는 매번 같게 섞는다 (정답이 늘 첫 번째에 오지 않도록)
const shuffle = (arr, seed) => arr.map((v, i) => [v, Math.sin(seed * 97 + i * 13.7)]).sort((a, b) => a[1] - b[1]).map(([v]) => v)

function Choose({ step, onOk, onBad }) {
  const opts = useMemo(() => shuffle(step.options, step.q.length), [step])
  const [picked, setPicked] = useState(null)
  return (
    <div className="pick-list">
      {opts.map((o) => (
        <button
          key={o.label}
          className={`pick wide${picked === o.label ? (o.ok ? ' right' : ' wrong') : ''}`}
          onClick={() => {
            setPicked(o.label)
            if (o.ok) setTimeout(onOk, 450)
            else onBad(o.why || '다시 생각해 봐요.')
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Order({ step, onOk, onBad }) {
  const shown = useMemo(() => shuffle(step.items, step.items.length + step.q.length), [step])
  const [seq, setSeq] = useState([])
  const add = (s) => {
    const next = [...seq, s]
    setSeq(next)
    if (next.length < step.items.length) return
    const bad = next.findIndex((v, i) => v !== step.items[i])
    if (bad === -1) return setTimeout(onOk, 450)
    onBad(`${bad + 1}번째 순서가 달라요.${step.hints?.[bad] ? ` 힌트: ${step.hints[bad]}` : ''}`)
    setSeq([])
  }
  return (
    <>
      <ol className="seq" style={{ gridTemplateColumns: `repeat(${Math.min(step.items.length, 5)}, 1fr)` }}>
        {step.items.map((_, i) => (
          <li key={i} className={seq[i] ? 'filled' : ''}><b>{i + 1}</b>{seq[i] || '　'}</li>
        ))}
      </ol>
      <div className="pick-grid two">
        {shown.map((s) => (
          <button key={s} className={seq.includes(s) ? 'pick used' : 'pick'} disabled={seq.includes(s)} onClick={() => add(s)}>{s}</button>
        ))}
      </div>
    </>
  )
}

function Pick({ step, onOk, onBad }) {
  const [on, setOn] = useState([])
  const check = () => {
    const missing = step.items.filter((i) => i.ok && !on.includes(i.label)).length
    const extra = step.items.filter((i) => !i.ok && on.includes(i.label)).length
    if (!missing && !extra) return onOk()
    onBad([missing && `${missing}개를 더 찾아야 해요`, extra && `아닌 것이 ${extra}개 섞여 있어요`].filter(Boolean).join(', ') + '.')
  }
  return (
    <>
      <div className="pick-grid three">
        {step.items.map((it) => (
          <button key={it.label} className={on.includes(it.label) ? 'pick on' : 'pick'} aria-pressed={on.includes(it.label)}
            onClick={() => setOn((o) => (o.includes(it.label) ? o.filter((x) => x !== it.label) : [...o, it.label]))}>
            {it.icon && <span className="pick-icon">{it.icon}</span>}{it.label}
          </button>
        ))}
      </div>
      <div className="mission-actions"><button className="btn-primary" onClick={check}>확인</button></div>
    </>
  )
}

function Table({ step, onOk, onBad }) {
  const [ans, setAns] = useState({})
  const check = () => {
    if (step.rows.some((r) => !ans[r.label])) return onBad('모든 줄을 골라 주세요.')
    const bad = step.rows.find((r) => ans[r.label] !== r.answer)
    if (!bad) return onOk()
    onBad(`「${bad.label}」을(를) 다시 생각해 봐요.`)
  }
  return (
    <>
      <div className="rule-table">
        {step.rows.map((r) => (
          <div key={r.label} className="rule-row">
            <span className="rule-case">{r.label}</span>
            <span className="rule-arrow">→</span>
            <span className="rule-acts">
              {step.actions.map((a) => (
                <button key={a} className={ans[r.label] === a ? 'chip-item on' : 'chip-item'} aria-pressed={ans[r.label] === a} onClick={() => setAns((s) => ({ ...s, [r.label]: a }))}>{a}</button>
              ))}
            </span>
          </div>
        ))}
      </div>
      <div className="mission-actions"><button className="btn-primary" onClick={check}>확인</button></div>
    </>
  )
}

const STEP = { choose: Choose, order: Order, pick: Pick, table: Table }

export default function CourseMission({ course, onClose, onClear }) {
  const { recordAttempt } = useStore()
  const w = course.world
  const [i, setI] = useState(0)
  const [fb, setFb] = useState('')
  const done = i >= w.steps.length
  const step = w.steps[i]
  const S = step && STEP[step.type]
  const ok = () => {
    recordAttempt(`course-${course.id}-${i}`, true)
    setFb('')
    setI((n) => n + 1)
  }
  const bad = (msg) => {
    recordAttempt(`course-${course.id}-${i}`, false)
    setFb(msg)
  }
  const tr = TRACKS[course.track]
  return (
    <MissionShell
      place={`${tr.name} Level ${course.level} 수업 연계 — ${course.project}`}
      title={w.title}
      step={i + 1}
      total={w.steps.length}
      feedback={done ? '' : fb}
      tone="bad"
      onClose={done ? null : onClose}
    >
      {done ? (
        <div className="clear">
          <div className="clear-badge">수업 미션 완료</div>
          <h3>{course.icon} {w.title}</h3>
          <p>“{w.thanks}” — {w.npc.label}</p>
          <p className="small">보상 CELL +{COURSE_REWARD.cell}, 탈것 스탬프 +{COURSE_REWARD.stamps}</p>
          <button className="btn-primary" onClick={onClear}>보상 받기</button>
        </div>
      ) : (
        <>
          {i === 0 && (
            <div className="request">
              <span className="speaker">{w.npc.label}</span>
              <p>“{w.ask}”</p>
            </div>
          )}
          <p className="q">{step.q}</p>
          <S key={i} step={step} onOk={ok} onBad={bad} />
        </>
      )}
    </MissionShell>
  )
}
