import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import { useStore } from '../store.jsx'

// 맵별 미션 기획안 5번 · 상점 — 재개장 준비 「물품 분류와 진열」
// 뒤섞인 물건을 용도별로 분류하고, 상인이 요청한 수량에 맞춰 진열대에 놓는다.

const ITEMS = [
  { id: 1, name: '주스', icon: '🧃', kind: 'food' },
  { id: 2, name: '쿠키', icon: '🍪', kind: 'food' },
  { id: 3, name: '엽서', icon: '💌', kind: 'gift' },
  { id: 4, name: '풍선', icon: '🎈', kind: 'toy' },
  { id: 5, name: '팝콘', icon: '🍿', kind: 'food' },
  { id: 6, name: '열쇠고리', icon: '🔑', kind: 'gift' },
  { id: 7, name: '비눗방울', icon: '🫧', kind: 'toy' },
  { id: 8, name: '물', icon: '💧', kind: 'food' },
  { id: 9, name: '배지', icon: '📛', kind: 'gift' },
  { id: 10, name: '솜사탕', icon: '🍭', kind: 'food' },
  { id: 11, name: '팽이', icon: '🪀', kind: 'toy' },
  { id: 12, name: '스티커', icon: '⭐', kind: 'gift' },
]
const SHELVES = [
  { kind: 'food', name: '먹을 것', need: 4 },
  { kind: 'gift', name: '기념품', need: 3 },
  { kind: 'toy', name: '놀잇감', need: 2 },
]

export default function ShopRestockMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const [where, setWhere] = useState({}) // itemId -> shelf kind
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState('물건을 고른 다음, 놓을 진열대를 눌러요. 진열대 위 물건을 누르면 다시 빠져요.')
  const [tone, setTone] = useState('info')
  const [done, setDone] = useState(false)

  const putOn = (kind) => {
    if (selected == null) {
      setTone('info')
      setFeedback('먼저 아래에서 물건을 하나 골라 주세요.')
      return
    }
    setWhere((w) => ({ ...w, [selected]: kind }))
    setSelected(null)
    setFeedback('')
  }
  const takeOff = (id) => setWhere((w) => {
    const next = { ...w }
    delete next[id]
    return next
  })

  const check = () => {
    for (const s of SHELVES) {
      const on = ITEMS.filter((i) => where[i.id] === s.kind)
      const wrong = on.filter((i) => i.kind !== s.kind)
      if (wrong.length) {
        recordAttempt('shop-restock', false)
        setTone('bad')
        setFeedback(`「${s.name}」 진열대에 맞지 않는 물건이 섞여 있어요: ${wrong.map((i) => i.name).join(', ')}. 용도를 다시 생각해 봐요.`)
        return
      }
      if (on.length !== s.need) {
        recordAttempt('shop-restock', false)
        setTone('bad')
        setFeedback(`「${s.name}」 진열대는 ${s.need}개가 필요한데 지금 ${on.length}개예요.`)
        return
      }
    }
    recordAttempt('shop-restock', true)
    setDone(true)
  }

  const loose = ITEMS.filter((i) => !where[i.id])

  return (
    <MissionShell place="상점 — 재개장 준비" title="물품 분류와 진열" feedback={done ? '' : feedback} tone={tone} onClose={done ? null : onClose}>
      {!done ? (
        <>
          <div className="request">
            <span className="speaker">상점 주인</span>
            <p>“광장이 다시 북적이니 가게 문을 열어야겠어! 먹을 것 4개, 기념품 3개, 놀잇감 2개를 진열해 줄래?”</p>
          </div>
          <div className="shelves">
            {SHELVES.map((s) => {
              const on = ITEMS.filter((i) => where[i.id] === s.kind)
              return (
                <div key={s.kind} className="shelf" role="button" tabIndex={0} onClick={() => putOn(s.kind)} onKeyDown={(e) => e.key === 'Enter' && putOn(s.kind)}>
                  <div className="shelf-head">
                    <b>{s.name}</b>
                    <span>{on.length} / {s.need}</span>
                  </div>
                  <div className="shelf-items">
                    {on.map((i) => (
                      <button key={i.id} className="chip-item" onClick={(e) => { e.stopPropagation(); takeOff(i.id) }} title="빼기">
                        {i.icon} {i.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="q">뒤섞인 물건</p>
          <div className="loose">
            {loose.map((i) => (
              <button key={i.id} className={selected === i.id ? 'chip-item on' : 'chip-item'} onClick={() => setSelected(i.id)} aria-pressed={selected === i.id}>
                {i.icon} {i.name}
              </button>
            ))}
            {loose.length === 0 && <span className="small">모든 물건을 올렸어요. 남는 물건이 없어도 되는지 확인해 봐요!</span>}
          </div>
          <div className="mission-actions">
            <button className="btn-ghost" onClick={() => setWhere({})}>모두 내리기</button>
            <button className="btn-primary" onClick={check}>진열 완료</button>
          </div>
        </>
      ) : (
        <div className="clear">
          <div className="clear-badge">CLEAR</div>
          <h3>상점이 다시 문을 열었어요!</h3>
          <p>“너희가 하모니아와 광장을 되살린 덕분이야. 고맙다!” — 상점 주인</p>
          <button className="btn-primary" onClick={onClear}>확인</button>
        </div>
      )}
    </MissionShell>
  )
}
