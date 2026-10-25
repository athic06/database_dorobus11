import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import { useStore } from '../store.jsx'

// 맵별 미션 기획안 1번 · 마이룸 — 출발 준비 「자동차 출발 점검」
// 지도 확인 → 필요한 물건 선택 → 점검 순서 맞추기

const PLACES = [
  { id: 'cave', name: '동굴', x: 250, y: 60, open: true },
  { id: 'harmonia', name: '하모니아', x: 160, y: 110 },
  { id: 'shop', name: '상점', x: 80, y: 70 },
  { id: 'lab', name: '연구실', x: 260, y: 160 },
  { id: 'carousel', name: '회전목마', x: 160, y: 175 },
]

const ITEMS = [
  { id: 'battery', name: '배터리', icon: '🔋', need: true },
  { id: 'wheel', name: '바퀴', icon: '🛞', need: true },
  { id: 'flash', name: '손전등', icon: '🔦', need: true },
  { id: 'piano', name: '피아노', icon: '🎹' },
  { id: 'cake', name: '케이크', icon: '🎂' },
  { id: 'ball', name: '축구공', icon: '⚽' },
  { id: 'umbrella', name: '우산', icon: '☂️' },
  { id: 'plant', name: '화분', icon: '🪴' },
]

const ORDER = ['배터리 끼우기', '바퀴 확인하기', '지도에 목적지 정하기', '시동 걸기']
const ORDER_HINTS = [
  '전기가 있어야 다른 장치도 움직여요.',
  '바퀴가 있어야 굴러갈 수 있어요.',
  '어디로 갈지 정해야 출발할 수 있어요.',
  '시동은 모든 준비가 끝난 뒤에 걸어요.',
]
const SHUFFLED = [2, 0, 3, 1].map((i) => ORDER[i])

export default function CarCheckMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const [step, setStep] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [tone, setTone] = useState('info')
  const [picked, setPicked] = useState([])
  const [seq, setSeq] = useState([])
  const [tries, setTries] = useState(0)

  const result = (ok, msg) => {
    recordAttempt('car-check', ok)
    setTries((t) => t + 1)
    setTone(ok ? 'good' : 'bad')
    setFeedback(msg)
  }

  const choosePlace = (p) => {
    if (!p.open) return result(false, `${p.name}에는 자물쇠가 있어요. 자물쇠가 없는 곳을 찾아보세요.`)
    result(true, '맞아요! 오늘은 동굴까지 갈 수 있어요.')
    setStep(2)
  }

  const checkItems = () => {
    if (picked.length === 0) {
      setTone('bad')
      setFeedback('물건을 먼저 골라 주세요.')
      return
    }
    const missing = ITEMS.filter((i) => i.need && !picked.includes(i.id)).length
    const extra = ITEMS.filter((i) => !i.need && picked.includes(i.id)).length
    if (!missing && !extra) {
      result(true, '좋아요! 자동차에 꼭 필요한 물건만 챙겼어요.')
      setStep(3)
      return
    }
    const parts = []
    if (missing) parts.push(`빠진 물건이 ${missing}개`)
    if (extra) parts.push(`필요 없는 물건이 ${extra}개`)
    result(false, `${parts.join(', ')} 있어요. 힌트: 동굴은 어두워요.`)
  }

  const addStep = (s) => {
    if (seq.includes(s)) return
    const next = [...seq, s]
    setSeq(next)
    setFeedback('')
    if (next.length < ORDER.length) return
    const wrongAt = next.findIndex((v, i) => v !== ORDER[i])
    if (wrongAt === -1) {
      result(true, '출발 점검 완료!')
      setStep(4)
    } else {
      result(false, `${wrongAt + 1}번째 순서가 달라요. 힌트: ${ORDER_HINTS[wrongAt]}`)
      setSeq([])
    }
  }

  const togglePick = (id) => {
    setFeedback('')
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  return (
    <MissionShell
      place="마이룸 — 출발 준비"
      title="자동차 출발 점검"
      step={step}
      total={3}
      feedback={step < 4 ? feedback : ''}
      tone={tone}
      onClose={step < 4 ? onClose : null}
    >
      {step === 1 && (
        <>
          <p className="q">① 지도를 확인해요. 오늘 자동차로 갈 수 있는 곳(자물쇠가 없는 곳)을 골라요.</p>
          <svg viewBox="0 0 330 220" className="mini-map" role="group" aria-label="도로랜드 지도">
            <rect width="330" height="220" rx="16" fill="#DDF0D0" />
            <path d="M40 200 C90 150 120 150 160 110 S230 70 250 60 M160 110 L80 70 M160 110 L160 175 M160 110 L260 160" stroke="#C9A97A" strokeWidth="9" fill="none" strokeLinecap="round" />
            <circle cx="40" cy="200" r="11" fill="#4E8BFF" />
            <text x="58" y="205" className="mm-label">마이룸</text>
            {PLACES.map((p) => (
              <g key={p.id} className="mm-spot" role="button" tabIndex={0} onClick={() => choosePlace(p)} onKeyDown={(e) => e.key === 'Enter' && choosePlace(p)}>
                <circle cx={p.x} cy={p.y} r="17" fill={p.open ? '#FFFFFF' : '#EEF0F3'} stroke={p.open ? '#2F7BFF' : '#9AA1AE'} strokeWidth="2" />
                <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="14">{p.open ? '⛰️' : '🔒'}</text>
                <text x={p.x} y={p.y + 32} textAnchor="middle" className="mm-label">{p.name}</text>
              </g>
            ))}
          </svg>
        </>
      )}

      {step === 2 && (
        <>
          <p className="q">② 동굴까지 가려면 무엇이 필요할까요? 필요한 물건 3개를 골라요.</p>
          <div className="pick-grid">
            {ITEMS.map((it) => (
              <button key={it.id} className={picked.includes(it.id) ? 'pick on' : 'pick'} onClick={() => togglePick(it.id)} aria-pressed={picked.includes(it.id)}>
                <span className="pick-icon">{it.icon}</span>
                {it.name}
              </button>
            ))}
          </div>
          <div className="mission-actions">
            <button className="btn-primary" onClick={checkItems}>다 골랐어요</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p className="q">③ 점검 순서를 맞춰요. 먼저 할 일부터 차례대로 눌러요.</p>
          <ol className="seq">
            {ORDER.map((_, i) => (
              <li key={i} className={seq[i] ? 'filled' : ''}>
                <b>{i + 1}</b>
                {seq[i] || '　'}
              </li>
            ))}
          </ol>
          <div className="pick-grid two">
            {SHUFFLED.map((s) => (
              <button key={s} className={seq.includes(s) ? 'pick used' : 'pick'} disabled={seq.includes(s)} onClick={() => addStep(s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="mission-actions">
            <button className="btn-ghost" onClick={() => { setSeq([]); setFeedback('') }}>다시 놓기</button>
          </div>
        </>
      )}

      {step === 4 && (
        <div className="clear">
          <div className="clear-badge">CLEAR</div>
          <h3>출발 점검 완료!</h3>
          <p>지도 확인, 준비물, 점검 순서까지 모두 마쳤어요. (시도 {tries}회)</p>
          <button className="btn-primary" onClick={onClear}>확인</button>
        </div>
      )}
    </MissionShell>
  )
}
