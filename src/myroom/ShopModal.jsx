import { useEffect, useState } from 'react'
import { SHOP_ITEMS, useStore } from '../store.jsx'
import { CellPill } from '../components/Header.jsx'

// 3D 마이룸 위에 뜨는 2D 상점 화면
export default function ShopModal({ onClose }) {
  const { cell, owned, buy, progress, setProgress } = useStore()
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-bg" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="shop" role="dialog" aria-modal="true" aria-labelledby="shop-title">
        <div className="shop-head">
          <h2 id="shop-title">상점</h2>
          <span className="grow" />
          <CellPill />
          <button className="close" onClick={onClose} aria-label="상점 닫기">×</button>
        </div>
        <p className="shop-sub">CELL로 가구를 사면 마이룸에 바로 놓여요. 당장 못 사는 가구는 🎯 목표로 정해 두면 마이룸에서 남은 CELL을 알려 줘요.</p>
        <div className="items">
          {SHOP_ITEMS.map((item) => {
            const has = owned.includes(item.id)
            const short = !has && cell < item.price
            const isGoal = progress.goalItem === item.id
            return (
              <div className={`item${isGoal ? " is-goal" : ""}`} key={item.id}>
                <div className="item-swatch" style={{ background: item.color + '22' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: item.color }} />
                </div>
                <strong>{item.name}</strong>
                <small>{item.desc}</small>
                <button
                  className="buy"
                  disabled={has || short}
                  onClick={() => buy(item) && setMsg(`${item.name} 구매 완료! 방에 놓았어요.`)}
                >
                  {has ? '보유 중' : short ? `${item.price} CELL · 부족` : `${item.price} CELL`}
                </button>
                {!has && (
                  <button
                    className={`goal-btn${isGoal ? " on" : ""}`}
                    aria-pressed={isGoal}
                    onClick={() => {
                      setProgress({ goalItem: isGoal ? null : item.id })
                      setMsg(isGoal ? '구매 목표를 해제했어요.' : `구매 목표: ${item.name}. 마이룸에서 남은 CELL을 확인해요.`)
                    }}
                  >
                    {isGoal ? '🎯 목표 해제' : '🎯 목표로'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <p className="toast" aria-live="polite">{msg}</p>
      </div>
    </div>
  )
}
