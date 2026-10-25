import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import { useStore } from '../store.jsx'
import { PLACES } from '../world/layout.js'

// 맵별 미션 기획안 6번 · 회전목마 주변 — 방문 안내 「안내판 짝 맞추기」
// 리코 구출 수업이 끝나고 큐브가 사라진 뒤의 후속 미션. 주변 시설을 살펴보고
// 시설 이름과 방향이 맞는 안내판을 고른다. 방향은 지도 위쪽이 북쪽.

const ROWS = [
  { id: 'shop', options: ['↑', '↓', '←'], answer: '↑' },
  { id: 'harmonia', options: ['↙', '↗', '↘'], answer: '↗' },
  { id: 'lab', options: ['←', '↑', '→'], answer: '→' },
  { id: 'storage', options: ['↗', '↓', '↖'], answer: '↖' },
]
const DIR_NAME = { '↑': '북쪽', '↓': '남쪽', '←': '서쪽', '→': '동쪽', '↗': '북동쪽', '↖': '북서쪽', '↘': '남동쪽', '↙': '남서쪽' }

// 회전목마 기준 주변 지도
function AroundMap() {
  const c = PLACES.carousel.pos
  const S = 1.9
  const pt = (id) => {
    const p = PLACES[id].pos
    return [130 + (p[0] - c[0]) * S, 110 + (p[2] - c[2]) * S]
  }
  return (
    <svg viewBox="0 0 260 220" className="around-map" role="img" aria-label="회전목마 주변 지도. 위쪽이 북쪽">
      <rect width="260" height="220" rx="14" fill="#DDF0D0" />
      <text x="236" y="24" textAnchor="middle" className="am-n">N</text>
      <path d="M236 30 L236 52 M230 38 L236 30 L242 38" stroke="#2b3140" strokeWidth="2" fill="none" />
      {ROWS.map((r) => {
        const [x, y] = pt(r.id)
        const cx = Math.max(16, Math.min(244, x))
        const cy = Math.max(16, Math.min(204, y))
        return (
          <g key={r.id}>
            <line x1="130" y1="110" x2={cx} y2={cy} stroke="#C9A97A" strokeWidth="5" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="7" fill="#fff" stroke="#2F7BFF" strokeWidth="2" />
            <text x={cx} y={cy + 20} textAnchor="middle" className="am-label">{PLACES[r.id].name}</text>
          </g>
        )
      })}
      <circle cx="130" cy="110" r="11" fill="#E57E9A" stroke="#fff" strokeWidth="2" />
      <text x="130" y="134" textAnchor="middle" className="am-label">회전목마(여기)</text>
    </svg>
  )
}

export default function SignMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const [pick, setPick] = useState({})
  const [showMap, setShowMap] = useState(false)
  const [feedback, setFeedback] = useState('큐브 소동 때 안내판이 뒤섞였대요. 시설마다 방향이 맞는 안내판을 하나씩 골라요.')
  const [tone, setTone] = useState('info')
  const [done, setDone] = useState(false)

  const check = () => {
    if (ROWS.some((r) => !pick[r.id])) {
      setTone('bad')
      setFeedback('모든 시설의 안내판을 골라 주세요.')
      return
    }
    const wrong = ROWS.filter((r) => pick[r.id] !== r.answer)
    recordAttempt('signs', wrong.length === 0)
    if (!wrong.length) return setDone(true)
    setTone('bad')
    setFeedback(`${wrong.map((r) => PLACES[r.id].name).join(', ')} 안내판의 방향이 달라요. ${showMap ? '지도에서 회전목마 기준으로 어느 쪽인지 다시 봐요.' : '「주변 살펴보기」로 지도를 확인해 봐요.'}`)
  }

  return (
    <MissionShell place="회전목마 주변 — 방문 안내" title="안내판 짝 맞추기" feedback={done ? '' : feedback} tone={tone} onClose={done ? null : onClose}>
      {!done ? (
        <div className="sign-wrap">
          <div>
            <table className="sign-table">
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.id}>
                    <th>{PLACES[r.id].name}</th>
                    <td>
                      {r.options.map((o) => (
                        <button
                          key={o}
                          className={pick[r.id] === o ? 'signboard on' : 'signboard'}
                          onClick={() => { setPick((prev) => ({ ...prev, [r.id]: o })); setFeedback('') }}
                          aria-label={`${PLACES[r.id].name} ${DIR_NAME[o]}`}
                          aria-pressed={pick[r.id] === o}
                        >
                          <span className="arrow">{o}</span>
                          <span>{PLACES[r.id].name}</span>
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mission-actions">
              <button className="btn-ghost" onClick={() => setShowMap((s) => !s)}>{showMap ? '지도 접기' : '주변 살펴보기'}</button>
              <button className="btn-primary" onClick={check}>안내판 설치</button>
            </div>
          </div>
          {showMap && <AroundMap />}
        </div>
      ) : (
        <div className="clear">
          <div className="clear-badge">CLEAR</div>
          <h3>방문객들이 길을 잃지 않게 됐어요!</h3>
          <p>회전목마 기준으로 상점은 북쪽, 하모니아는 북동쪽, 연구실은 동쪽, 오래된 창고는 북서쪽이에요.</p>
          <button className="btn-primary" onClick={onClear}>확인</button>
        </div>
      )}
    </MissionShell>
  )
}
