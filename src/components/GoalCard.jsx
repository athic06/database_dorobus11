import { SHOP_ITEMS, useStore } from '../store.jsx'

// 마이룸 화면의 구매 목표 카드: 현재 CELL · 목표 가구 가격 · 부족한 CELL
export default function GoalCard({ onOpenShop, onOpenPark }) {
  const { cell, owned, progress } = useStore()
  const goal = SHOP_ITEMS.find((i) => i.id === progress.goalItem && !owned.includes(i.id))
  if (!goal) {
    const left = SHOP_ITEMS.some((i) => !owned.includes(i.id))
    return (
      <div className="goal-card empty">
        <span>🎯 구매 목표</span>
        {left ? <button onClick={onOpenShop}>상점에서 목표 정하기</button> : <small>상점 가구를 모두 모았어요!</small>}
      </div>
    )
  }
  const short = Math.max(0, goal.price - cell)
  const pct = Math.min(100, Math.round((cell / goal.price) * 100))
  return (
    <div className="goal-card">
      <div className="gc-head">
        <span className="gc-swatch" style={{ background: goal.color }} />
        <b>🎯 {goal.name}</b>
      </div>
      <div className="gc-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="목표까지 진행률">
        <span style={{ width: `${pct}%` }} />
      </div>
      <dl className="gc-nums">
        <dt>현재 CELL</dt><dd>{cell.toLocaleString()}</dd>
        <dt>목표 가격</dt><dd>{goal.price.toLocaleString()}</dd>
        <dt>부족한 CELL</dt><dd className={short ? 'short' : 'ok'}>{short ? short.toLocaleString() : '0'}</dd>
      </dl>
      {short ? (
        <p className="gc-tip">미션 · 오늘의 수리 · 작품 등록 · <button onClick={onOpenPark}>테마파크 운영 수익</button>으로 모아요</p>
      ) : (
        <button className="gc-buy" onClick={onOpenShop}>살 수 있어요! 상점 열기</button>
      )}
    </div>
  )
}
