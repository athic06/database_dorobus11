import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import { useStore } from '../store.jsx'

// 맵별 미션 기획안 3번 · 하모니아 — 광장에 불을 켜라 「조명 복구」
// '어두우면 조명 켜기' 같은 조건 블록을 만들고, 시험 운전으로 조건대로 작동하는지 확인한다.

const CONDITIONS = [
  { id: 'dark', label: '어두우면', test: (s) => s.dark },
  { id: 'bright', label: '밝으면', test: (s) => !s.dark },
  { id: 'people', label: '사람이 있으면', test: (s) => s.people },
  { id: 'rain', label: '비가 오면', test: (s) => s.rain },
]
const ACTIONS = [
  { id: 'on', label: '조명 켜기' },
  { id: 'off', label: '조명 끄기' },
  { id: 'music', label: '음악 틀기' },
]
const CASES = [
  { name: '밤 · 사람 있음', icon: '🌙', state: { dark: true, people: true, rain: false }, expect: 'on' },
  { name: '낮 · 사람 있음', icon: '☀️', state: { dark: false, people: true, rain: false }, expect: 'off' },
  { name: '밤 · 사람 없음', icon: '🌙', state: { dark: true, people: false, rain: false }, expect: 'on' },
  { name: '비 오는 낮', icon: '🌧️', state: { dark: false, people: false, rain: true }, expect: 'off' },
]

function Slot({ value, options, onPick, placeholder }) {
  return (
    <span className="block-slot">
      <select value={value || ''} onChange={(e) => onPick(e.target.value)} aria-label={placeholder}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </span>
  )
}

export default function LightsMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const [cond, setCond] = useState('')
  const [then, setThen] = useState('')
  const [els, setEls] = useState('')
  const [results, setResults] = useState(null)
  const [feedback, setFeedback] = useState('블록 빈칸을 골라 조명 규칙을 만들고 시험 운전을 해 봐요.')
  const [tone, setTone] = useState('info')
  const [done, setDone] = useState(false)

  const run = () => {
    if (!cond || !then || !els) {
      setTone('bad')
      setFeedback('조건과 두 개의 동작 칸을 모두 골라 주세요.')
      return
    }
    const c = CONDITIONS.find((x) => x.id === cond)
    const res = CASES.map((k) => {
      const act = c.test(k.state) ? then : els
      return { ...k, act, ok: act === k.expect }
    })
    setResults(res)
    const ok = res.every((r) => r.ok)
    recordAttempt('lights', ok)
    if (ok) {
      setTone('good')
      setFeedback('모든 시험을 통과했어요! 광장에 불이 들어와요.')
    } else {
      const bad = res.find((r) => !r.ok)
      setTone('bad')
      setFeedback(`「${bad.name}」일 때 조명이 ${bad.expect === 'on' ? '켜져야' : '꺼져야'} 해요. 조건을 다시 살펴봐요.`)
    }
  }

  const label = (list, id) => list.find((x) => x.id === id)?.label

  return (
    <MissionShell place="하모니아 — 광장에 불을 켜라" title="조명 복구" feedback={done ? '' : feedback} tone={tone} onClose={done ? null : onClose}>
      {!done ? (
        <>
          <p className="q">광장 조명이 알맞게 켜지고 꺼지도록 조건 블록을 완성해요.</p>
          <div className="blocks">
            <div className="block if">
              만약 <Slot value={cond} options={CONDITIONS} onPick={(v) => { setCond(v); setResults(null) }} placeholder="조건" /> 이라면
            </div>
            <div className="block do">
              <Slot value={then} options={ACTIONS} onPick={(v) => { setThen(v); setResults(null) }} placeholder="동작" />
            </div>
            <div className="block if">아니면</div>
            <div className="block do">
              <Slot value={els} options={ACTIONS} onPick={(v) => { setEls(v); setResults(null) }} placeholder="동작" />
            </div>
          </div>
          {results && (
            <ul className="cases">
              {results.map((r) => (
                <li key={r.name} className={r.ok ? 'ok' : 'no'}>
                  <span className="case-ic">{r.icon}</span>
                  <span className="case-name">{r.name}</span>
                  <span className={`lamp ${r.act === 'on' ? 'lit' : ''}`} aria-hidden="true" />
                  <span>{label(ACTIONS, r.act)}</span>
                  <b>{r.ok ? '✓' : '✗'}</b>
                </li>
              ))}
            </ul>
          )}
          <div className="mission-actions">
            {results?.every((r) => r.ok) ? (
              <button className="btn-primary" onClick={() => setDone(true)}>조명 규칙 적용하기</button>
            ) : (
              <button className="btn-primary" onClick={run}>시험 운전</button>
            )}
          </div>
        </>
      ) : (
        <div className="clear">
          <div className="clear-badge">CLEAR</div>
          <h3>광장에 불이 켜졌어요!</h3>
          <p>
            만약 {label(CONDITIONS, cond)} → {label(ACTIONS, then)}, 아니면 → {label(ACTIONS, els)}. 이제 조건에 따라 알아서 작동해요.
          </p>
          <button className="btn-primary" onClick={onClear}>확인</button>
        </div>
      )}
    </MissionShell>
  )
}
