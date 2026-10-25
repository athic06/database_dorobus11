import { useEffect, useMemo, useRef, useState } from 'react'
import { playNotes } from '../game/audio.js'
import { useStore } from '../store.jsx'
import { PIANO_TIERS, pianoReward, todayKey } from '../game/routine.js'

// H · 피아노 게임: 모드 2개 · 점수 랭킹 · 점수 구간별 CELL 보상(모드마다 하루 1번).
// 기억 모드: 보이드가 들려준 음을 같은 순서로 누르기 (최대 8단계, 짧게 끝남)
// 음 맞히기: 들리는 음 하나를 듣고 맞는 건반 누르기 (10문제, 빨리 맞힐수록 보너스)
const KEYS = [
  { note: 'C4', name: '도', color: '#E2574C', key: '1' },
  { note: 'E4', name: '미', color: '#F5B841', key: '2' },
  { note: 'G4', name: '솔', color: '#4CAF6E', key: '3' },
  { note: 'C5', name: '높은 도', color: '#4E8BFF', key: '4' },
]
const MODES = {
  memory: { name: '기억 모드', desc: '들려준 음을 같은 순서로 눌러요. 최대 8단계' },
  ear: { name: '음 맞히기', desc: '들리는 음을 듣고 맞는 건반을 눌러요. 10문제' },
}
const MEMORY_MAX = 8
const EAR_QUESTIONS = 10
const TEMPO = 380
const EXAMPLE_SCORES = { memory: [['예시 · 도로 친구 하나', 420], ['예시 · 도로 친구 둘', 180]], ear: [['예시 · 도로 친구 둘', 380], ['예시 · 도로 친구 하나', 240]] }

export default function PianoGame({ onClose }) {
  const { user, progress, setProgress, addCell, otherPlayers, track } = useStore()
  const [mode, setMode] = useState('memory')
  const [phase, setPhase] = useState('ready') // ready | showing | input | over
  const [seq, setSeq] = useState([])
  const [input, setInput] = useState([])
  const [score, setScore] = useState(0)
  const [q, setQ] = useState(0) // 음 맞히기 문제 번호
  const [lit, setLit] = useState(-1)
  const [result, setResult] = useState('')
  const askedAt = useRef(0)
  const timers = useRef([])
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  useEffect(() => clear, [])

  const piano = progress.piano || { best: {}, rewarded: {} }
  const best = piano.best?.[mode] || 0

  const board = useMemo(() => {
    const rows = []
    if (best) rows.push({ name: `${user.name} (나)`, s: best, me: true })
    otherPlayers().forEach((p) => p.progress.piano?.best?.[mode] && rows.push({ name: p.name, s: p.progress.piano.best[mode] }))
    EXAMPLE_SCORES[mode].forEach(([name, s]) => rows.push({ name, s }))
    return rows.sort((a, b) => b.s - a.s).slice(0, 6)
  }, [mode, best, otherPlayers, user.name])

  const flash = (i, at) => {
    timers.current.push(setTimeout(() => { setLit(i); playNotes([KEYS[i].note], 0.3) }, at))
    timers.current.push(setTimeout(() => setLit(-1), at + 260))
  }

  const finish = (final, text) => {
    setPhase('over')
    const reward = piano.rewarded?.[mode] === todayKey() ? 0 : pianoReward(final)
    if (reward) addCell(reward)
    setProgress({
      piano: {
        best: { ...piano.best, [mode]: Math.max(best, final) },
        rewarded: reward ? { ...piano.rewarded, [mode]: todayKey() } : piano.rewarded,
      },
      pianoBest: Math.max(progress.pianoBest, mode === 'memory' ? seq.length - 1 : 0),
    })
    track('piano', final, 'max')
    setResult(`${text} 점수 ${final}점${final > best ? ' · 새 최고 기록!' : ''}${reward ? ` · 오늘의 보상 ${reward} CELL` : piano.rewarded?.[mode] === todayKey() ? ' · 오늘 보상은 이미 받았어요' : ''}`)
  }

  /* 기억 모드 */
  const nextRound = (prev) => {
    const s = [...prev, Math.floor(Math.random() * 4)]
    setSeq(s)
    setInput([])
    setPhase('showing')
    s.forEach((i, k) => flash(i, 400 + k * TEMPO))
    timers.current.push(setTimeout(() => setPhase('input'), 400 + s.length * TEMPO))
  }

  /* 음 맞히기 */
  const ask = (n) => {
    const note = Math.floor(Math.random() * 4)
    setQ(n)
    setSeq([note])
    setPhase('showing')
    timers.current.push(setTimeout(() => { playNotes([KEYS[note].note], 0.5) }, 300))
    timers.current.push(setTimeout(() => { setPhase('input'); askedAt.current = Date.now() }, 700))
  }

  const start = () => {
    clear()
    setScore(0)
    setResult('')
    if (mode === 'memory') nextRound([])
    else ask(1)
  }

  const press = (i) => {
    if (phase !== 'input') return
    flash(i, 0)
    if (mode === 'memory') {
      const next = [...input, i]
      if (seq[next.length - 1] !== i) return finish(score, `${seq.length - 1}단계까지 성공!`)
      setInput(next)
      const gained = 10 * seq.length
      const s = score + gained
      setScore(s)
      if (next.length === seq.length) {
        if (seq.length >= MEMORY_MAX) return finish(s + 100, `${MEMORY_MAX}단계 완주! 보너스 +100.`)
        timers.current.push(setTimeout(() => nextRound(seq), 500))
      }
      return
    }
    // 음 맞히기
    const ok = seq[0] === i
    const fast = Math.max(0, 20 - Math.floor((Date.now() - askedAt.current) / 150))
    const s = score + (ok ? 40 + fast : 0)
    setScore(s)
    setResult(ok ? `정답! +${40 + fast}` : `아쉬워요. 정답은 ${KEYS[seq[0]].name}`)
    setPhase('showing')
    if (q >= EAR_QUESTIONS) timers.current.push(setTimeout(() => finish(s, `${EAR_QUESTIONS}문제 끝!`), 600))
    else timers.current.push(setTimeout(() => ask(q + 1), 700))
  }

  useEffect(() => {
    const k = (e) => {
      const i = KEYS.findIndex((x) => x.key === e.key)
      if (i >= 0) press(i)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  const playing = phase === 'showing' || phase === 'input'
  return (
    <div className="modal-bg">
      <div className="mission piano-game wide" role="dialog" aria-modal="true" aria-labelledby="piano-title">
        <div className="mission-head">
          <div>
            <span className="mission-place">미니게임 · 랭킹 · 보상</span>
            <h2 id="piano-title">🎹 피아노 게임</h2>
          </div>
          <button className="close" onClick={onClose} aria-label="닫기">×</button>
        </div>
        <div className="piano-layout">
          <div>
            <div className="tabs-inline">
              {Object.entries(MODES).map(([id, m]) => (
                <button key={id} className={mode === id ? 'chip on' : 'chip'} aria-pressed={mode === id} disabled={playing} onClick={() => { setMode(id); setPhase('ready'); setResult('') }}>{m.name}</button>
              ))}
            </div>
            <p className="q">
              {phase === 'ready' && `${MODES[mode].desc} (키보드 1~4도 돼요)`}
              {phase === 'showing' && (mode === 'memory' ? `잘 들어 봐요… (${seq.length}단계)` : `${q} / ${EAR_QUESTIONS}번 문제 · 잘 들어 봐요…`)}
              {phase === 'input' && (mode === 'memory' ? `이제 눌러요! ${input.length} / ${seq.length}` : `${q} / ${EAR_QUESTIONS}번 문제 · 어떤 음일까요?`)}
              {phase === 'over' && '게임 끝!'}
              <b className="piano-score">점수 {score}</b>
            </p>
            <div className="piano-keys">
              {KEYS.map((k, i) => (
                <button key={k.note} className={`pkey${lit === i ? ' lit' : ''}`} style={{ '--c': k.color }} onClick={() => press(i)} disabled={phase !== 'input'}>
                  <b>{k.name}</b>
                  <small>{k.key}</small>
                </button>
              ))}
            </div>
            {result && <p className={`feedback ${phase === 'over' ? 'good' : 'info'}`}>{result}</p>}
            <div className="mission-actions">
              <span className="small">내 최고 {best}점</span>
              <span className="grow" />
              {mode === 'ear' && phase === 'input' && <button className="btn-ghost" onClick={() => playNotes([KEYS[seq[0]].note], 0.5)}>다시 듣기</button>}
              {!playing && <button className="btn-primary" onClick={start}>{phase === 'over' ? '다시 하기' : '시작'}</button>}
            </div>
          </div>
          <aside className="piano-rank">
            <h3>🏆 {MODES[mode].name} 랭킹</h3>
            <ol className="rank">
              {board.map((r, i) => (
                <li key={r.name + i} className={r.me ? 'me' : ''}><b>{i + 1}</b><span>{r.name}</span><em>{r.s}점</em></li>
              ))}
            </ol>
            <p className="small">오늘의 보상(모드마다 하루 1번): {PIANO_TIERS.map(([min, c]) => `${min}점↑ ${c}`).join(' · ')} CELL</p>
            <p className="small">{piano.rewarded?.[mode] === todayKey() ? '✓ 오늘 이 모드 보상을 받았어요' : '아직 오늘 보상을 받지 않았어요'}</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
