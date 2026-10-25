import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import GridProgram from './GridProgram.jsx'
import { useStore } from '../store.jsx'
import { VOID_PARTS } from '../game/progress.js'

// 맵별 미션 기획안 7번 후반 「조립 후 작동 시험」
// 모은 부품을 설계도의 알맞은 자리에 끼우고, 블록 코딩으로 첫 걸음을 시험한다.

const SLOTS = [
  { slot: '머리 위', hint: '신호를 주고받는 곳', x: 50, y: 6 },
  { slot: '얼굴', hint: '앞을 살피는 눈', x: 50, y: 24 },
  { slot: '어깨', hint: '팔을 움직이는 힘', x: 16, y: 46 },
  { slot: '몸통', hint: '전기를 저장하는 곳', x: 50, y: 52 },
  { slot: '다리', hint: '굴러서 이동', x: 50, y: 84 },
]

export default function VoidAssemblyMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const [step, setStep] = useState(1)
  const [sel, setSel] = useState(null)
  const [placed, setPlaced] = useState({}) // slot -> partId
  const [fb, setFb] = useState('부품을 고른 다음, 설계도에서 끼울 자리를 눌러요.')
  const [tone, setTone] = useState('info')

  const put = (slot) => {
    if (!sel) {
      setTone('info')
      setFb('먼저 아래에서 부품을 골라 주세요.')
      return
    }
    setPlaced((p) => {
      const next = Object.fromEntries(Object.entries(p).filter(([, v]) => v !== sel))
      next[slot] = sel
      return next
    })
    setSel(null)
    setFb('')
  }

  const checkParts = () => {
    if (Object.keys(placed).length < SLOTS.length) {
      setTone('bad')
      setFb('모든 자리에 부품을 끼워 주세요.')
      return
    }
    const wrong = SLOTS.filter((s) => VOID_PARTS.find((p) => p.id === placed[s.slot])?.slot !== s.slot)
    recordAttempt('void-assembly', !wrong.length)
    if (wrong.length) {
      setTone('bad')
      setFb(`${wrong.map((s) => s.slot).join(', ')} 자리의 부품이 맞지 않아요. 각 자리의 설명을 다시 읽어 봐요.`)
      return
    }
    setStep(2)
    setTone('info')
    setFb('')
  }

  const loose = VOID_PARTS.filter((p) => !Object.values(placed).includes(p.id))
  // 정답 예: → → ↑ → ↑
  const level = { cols: 4, rows: 3, start: [0, 2], goal: [3, 0], rocks: [[1, 1], [2, 0]], max: 6 }

  return (
    <MissionShell
      place="연구실 — 자일로의 작업실"
      title={step === 1 ? '보이드 조립' : step === 2 ? '작동 시험' : '보이드 완성'}
      step={step}
      total={2}
      feedback={step === 1 ? fb : ''}
      tone={tone}
      onClose={step < 3 ? onClose : null}
    >
      {step === 1 && (
        <>
          <div className="request">
            <span className="speaker sp-xylo">자일로</span>
            <p>“설계도를 보니 부품마다 들어갈 자리가 정해져 있네요. 각 자리 설명을 잘 읽고 끼워 봐요!”</p>
          </div>
          <div className="void-blueprint">
            <svg viewBox="0 0 100 100" className="void-shape" aria-hidden="true">
              <rect x="30" y="14" width="40" height="22" rx="8" />
              <rect x="25" y="38" width="50" height="34" rx="10" />
              <rect x="8" y="42" width="15" height="8" rx="4" />
              <rect x="77" y="42" width="15" height="8" rx="4" />
              <rect x="34" y="74" width="32" height="14" rx="6" />
              <line x1="50" y1="14" x2="50" y2="4" />
            </svg>
            {SLOTS.map((s) => {
              const p = VOID_PARTS.find((x) => x.id === placed[s.slot])
              return (
                <button key={s.slot} className={`bp-slot${p ? ' filled' : ''}`} style={{ left: `${s.x}%`, top: `${s.y}%` }} onClick={() => put(s.slot)}>
                  <b>{p ? `${p.icon} ${p.name}` : s.slot}</b>
                  <small>{s.hint}</small>
                </button>
              )
            })}
          </div>
          <div className="loose">
            {loose.map((p) => (
              <button key={p.id} className={sel === p.id ? 'chip-item on' : 'chip-item'} aria-pressed={sel === p.id} onClick={() => setSel(p.id)}>
                {p.icon} {p.name}
              </button>
            ))}
          </div>
          <div className="mission-actions">
            <button className="btn-ghost" onClick={() => setPlaced({})}>모두 빼기</button>
            <button className="btn-primary" onClick={checkParts}>조립 완료</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="request">
            <span className="speaker sp-xylo">자일로</span>
            <p>“조립 끝! 이제 작동 시험이에요. 보이드가 바위를 피해 ★까지 걸어가도록 명령을 짜 볼까요?”</p>
          </div>
          <GridProgram level={level} robot="🤖" onResult={(ok) => { recordAttempt('void-test', ok); if (ok) setTimeout(() => setStep(3), 500) }} />
        </>
      )}
      {step === 3 && (
        <div className="clear">
          <div className="clear-badge">CLEAR</div>
          <h3>보이드가 첫 걸음을 내디뎠어요!</h3>
          <p>부품 5개를 모아 조립하고, 블록 코딩으로 작동 시험까지 마쳤어요.</p>
          <button className="btn-primary" onClick={onClear}>확인</button>
        </div>
      )}
    </MissionShell>
  )
}
