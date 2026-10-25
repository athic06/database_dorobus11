import { useEffect, useState } from 'react'
import { SHOP_ITEMS, useStore } from '../store.jsx'
import { CellPill } from './Header.jsx'
import {
  ATTRACTIONS, FACILITY_PRICE, INCOME_CAP_MIN, MAX_LEVEL, PLAZA_FACILITIES, VISITORS_PER,
  incomePerMin, levelOf, parkOpen, pendingIncome, upgradeCost, visitorsOf,
} from '../game/park.js'

// 테마파크 운영: 어트랙션 강화 · 광장 시설 설치 · 운영 수익 받기
export default function ParkPanel({ onClose, onOpenShop }) {
  const { cell, owned, progress: p, setProgress, addCell, spendCell, track } = useStore()
  const [msg, setMsg] = useState('')
  const [, tick] = useState(0)
  const open = parkOpen(p)
  const visitors = visitorsOf(p, owned)
  const pending = pendingIncome(p, owned)

  // 처음 열면 수익 계산을 시작하고, 열려 있는 동안 1분마다 쌓인 수익을 다시 그린다
  useEffect(() => {
    if (open && !p.parkCollectAt) setProgress({ parkCollectAt: new Date().toISOString() })
    const id = setInterval(() => tick((n) => n + 1), 15000)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => { clearInterval(id); window.removeEventListener('keydown', onKey) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const collect = () => {
    if (!pending) return
    addCell(pending)
    setProgress({ parkCollectAt: new Date().toISOString() })
    track('collect')
    setMsg(`운영 수익 ${pending} CELL을 받았어요!`)
  }
  const upgrade = (a) => {
    const lv = levelOf(p, a.id)
    const cost = upgradeCost(a, lv)
    if (spendCell(cost, { park: { ...p.park, [a.id]: lv + 1 } })) track('upgrade'), setMsg(`${a.icon} ${a.name} Lv.${lv + 1}! 방문객 +${a.visitors}명`)
  }
  const install = (f) => {
    if (spendCell(FACILITY_PRICE[f.id], { facilities: [...p.facilities, f.id] })) track('upgrade'), setMsg(`광장에 ${f.icon} ${f.name} 설치 완료! 방문객 +${VISITORS_PER.facility}명`)
  }

  return (
    <div className="modal-bg" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="shop park" role="dialog" aria-modal="true" aria-labelledby="park-title">
        <div className="shop-head">
          <h2 id="park-title">🎡 테마파크 운영</h2>
          <span className="grow" />
          <CellPill />
          <button className="close" onClick={onClose} aria-label="운영 화면 닫기">×</button>
        </div>
        {!open ? (
          <p className="shop-sub">챕터 3에서 하모니아 광장을 살리고 상점이 다시 문을 열면 테마파크를 운영할 수 있어요.</p>
        ) : (
          <>
            <div className="park-stats">
              <div><small>방문객</small><b>{visitors}명</b></div>
              <div><small>수익</small><b>{incomePerMin(visitors)} CELL/분</b></div>
              <div><small>쌓인 수익</small><b>{pending} CELL</b></div>
              <button className="btn-primary" disabled={!pending} onClick={collect}>수익 받기</button>
            </div>
            <p className="shop-sub">방문객이 많을수록 수익이 빨리 쌓여요. 최대 {INCOME_CAP_MIN / 60}시간치까지 모아 둘 수 있어요.</p>

            <h3 className="park-h">어트랙션 강화</h3>
            <div className="park-list">
              {ATTRACTIONS.map((a) => {
                const lv = levelOf(p, a.id)
                const max = lv >= MAX_LEVEL
                const cost = upgradeCost(a, lv)
                return (
                  <div className="park-row" key={a.id}>
                    <span className="park-icon">{a.icon}</span>
                    <div className="grow">
                      <b>{a.name} <span className="lv">Lv.{lv}</span></b>
                      <small>방문객 {a.visitors * lv}명{max ? ' · 최대 레벨' : ` → 강화하면 ${a.visitors * (lv + 1)}명`}</small>
                    </div>
                    <button className="buy" disabled={max || cell < cost} onClick={() => upgrade(a)}>
                      {max ? 'MAX' : cell < cost ? `${cost} CELL 부족` : `강화 ${cost} CELL`}
                    </button>
                  </div>
                )
              })}
            </div>

            <h3 className="park-h">광장 시설 설치</h3>
            <div className="park-list">
              {PLAZA_FACILITIES.map((f) => {
                const has = p.facilities.includes(f.id)
                const price = FACILITY_PRICE[f.id]
                return (
                  <div className="park-row" key={f.id}>
                    <span className="park-icon">{f.icon}</span>
                    <div className="grow">
                      <b>{f.name}</b>
                      <small>방문객 +{VISITORS_PER.facility}명</small>
                    </div>
                    <button className="buy" disabled={has || cell < price} onClick={() => install(f)}>
                      {has ? '설치됨' : cell < price ? `${price} CELL 부족` : `설치 ${price} CELL`}
                    </button>
                  </div>
                )
              })}
            </div>

            <h3 className="park-h">마이룸 가구</h3>
            <div className="park-row">
              <span className="park-icon">🛋️</span>
              <div className="grow">
                <b>{owned.length} / {SHOP_ITEMS.length}개 설치</b>
                <small>가구 1개마다 마이룸 구경 방문객 +{VISITORS_PER.furniture}명 · 수업 작품 1개마다 +{VISITORS_PER.artwork}명</small>
              </div>
              {onOpenShop && <button className="buy" onClick={onOpenShop}>상점</button>}
            </div>
          </>
        )}
        <p className="toast" aria-live="polite">{msg}</p>
      </div>
    </div>
  )
}
