import { useState } from 'react'
import { useStore } from '../store.jsx'
import { CellPill } from './Header.jsx'
import {
  BADGES, DAY_NAMES, MONTHLY_GOAL, VEHICLES, WEEKLY_QUESTS, dailyOf, isLastDayOfMonth, monthKey, monthlyVehicle,
  ownsVehicle, questDone, questOf, taskValue, vehicleOf,
} from '../game/routine.js'

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-bg" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`shop${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="shop-head">
          <h2>{title}</h2>
          <span className="grow" />
          <CellPill />
          <button className="close" onClick={onClose} aria-label="닫기">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const rewardText = (r) => [`CELL ${r.cell}`, `탈것 스탬프 ${r.stamps}개`, r.badge && `배지 「${BADGES[r.badge].name}」`].filter(Boolean).join(' · ')

/* ---------------- 요일별 일일 퀘스트 ---------------- */
export function QuestBoard({ compact = false }) {
  const { progress: p, setProgress, addCell } = useStore()
  const [msg, setMsg] = useState('')
  const now = new Date()
  const q = questOf(now)
  const daily = dailyOf(p, now)
  const done = questDone(p, now)

  const claim = () => {
    if (!done || daily.claimed) return
    addCell(q.reward.cell)
    const badges = q.reward.badge && !p.badges.includes(q.reward.badge) ? [...p.badges, q.reward.badge] : p.badges
    setProgress({ daily: { ...daily, claimed: true }, stamps: (p.stamps || 0) + q.reward.stamps, badges })
    setMsg(`퀘스트 완료! ${rewardText(q.reward)}`)
  }

  return (
    <div className="quest-board">
      <div className="qb-head">
        <span className="qb-day">{DAY_NAMES[now.getDay()]}요일</span>
        <b>{q.icon} {q.theme}</b>
      </div>
      <ul className="qb-tasks">
        {q.tasks.map((t) => {
          const v = Math.min(t.goal, taskValue(daily, t.ev))
          return (
            <li key={t.ev} className={v >= t.goal ? 'ok' : ''}>
              <span>{v >= t.goal ? '✅' : '⬜'} {t.label}</span>
              <small>{t.ev === 'piano' ? `최고 ${taskValue(daily, t.ev)}점` : `${v} / ${t.goal}`}</small>
            </li>
          )
        })}
      </ul>
      <p className="qb-reward">보상 · {rewardText(q.reward)}</p>
      <button className="btn-primary" disabled={!done || daily.claimed} onClick={claim}>
        {daily.claimed ? '오늘 퀘스트 완료 ✓' : done ? '보상 받기' : '진행 중'}
      </button>
      {msg && <p className="feedback good">{msg}</p>}
      {!compact && (
        <>
          <h3 className="park-h">이번 주 퀘스트 표</h3>
          <table className="week-table">
            <tbody>
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <tr key={d} className={d === now.getDay() ? 'today' : ''}>
                  <th>{DAY_NAMES[d]}</th>
                  <td>{WEEKLY_QUESTS[d].icon} {WEEKLY_QUESTS[d].theme}</td>
                  <td>{WEEKLY_QUESTS[d].tasks.map((t) => t.label).join(' · ')}</td>
                  <td>{rewardText(WEEKLY_QUESTS[d].reward)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small">퀘스트는 수업 내용과 관계없이 누구나 할 수 있는 도로랜드 활동으로 구성했어요.</p>
        </>
      )}
    </div>
  )
}

export function QuestPanel({ onClose }) {
  return (
    <Modal title="📋 오늘의 퀘스트" onClose={onClose} wide>
      <QuestBoard />
    </Modal>
  )
}

/* ---------------- 출석판 ---------------- */
export function AttendanceBoard() {
  const { progress: p, setProgress } = useStore()
  const now = new Date()
  const att = p.attendance?.month === monthKey(now) ? p.attendance : { days: [] }
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const mv = monthlyVehicle(now)
  const owned = mv && ownsVehicle(p, mv)
  const canClaim = mv && !owned && isLastDayOfMonth(now) && att.days.length >= MONTHLY_GOAL
  return (
    <div className="attend">
      <div className="attend-head">
        <b>{now.getMonth() + 1}월 출석판</b>
        <small>{att.days.length}일 출석 · 탈것 스탬프 {p.stamps || 0}개</small>
      </div>
      <div className="attend-grid">
        {Array.from({ length: last }, (_, i) => i + 1).map((d) => (
          <span key={d} className={`${att.days.includes(d) ? 'on' : ''}${d === now.getDate() ? ' today' : ''}`}>{att.days.includes(d) ? '🐾' : d}</span>
        ))}
      </div>
      {mv && (
        <p className="attend-goal">
          {owned
            ? `이달의 탈것 ${mv.icon} ${mv.name} 획득 완료!`
            : `${MONTHLY_GOAL}일 이상 출석하면 ${now.getMonth() + 1}월 ${last}일에 이달의 탈것 ${mv.icon} ${mv.name} 지급 (${Math.min(att.days.length, MONTHLY_GOAL)}/${MONTHLY_GOAL})`}
        </p>
      )}
      {canClaim && <button className="btn-primary" onClick={() => setProgress({ monthlyVehicles: [...(p.monthlyVehicles || []), mv.id] })}>이달의 탈것 받기</button>}
    </div>
  )
}

/* ---------------- 탈것 ---------------- */
export function VehiclePanel({ onClose }) {
  const { progress: p, setProgress } = useStore()
  return (
    <Modal title="🚗 탈것" onClose={onClose}>
      <p className="shop-sub">출석과 일일 퀘스트로 탈것 스탬프를 모으면 새 탈것이 열려요. 지금 스탬프 <b>{p.stamps || 0}개</b></p>
      <div className="park-list">
        {VEHICLES.map((v) => {
          const has = ownsVehicle(p, v)
          const using = (p.vehicle || 'car') === v.id
          return (
            <div className="park-row" key={v.id}>
              <span className="park-icon">{v.icon}</span>
              <div className="grow">
                <b>{v.name} {using && <span className="lv">타는 중</span>}</b>
                <small>{v.desc} · 속도 ×{v.speed}{has ? '' : v.monthly ? ` · ${v.monthly}월 출석판 보상` : ` · 스탬프 ${v.need}개 필요`}</small>
              </div>
              <button className="buy" disabled={!has || using} onClick={() => setProgress({ vehicle: v.id })}>
                {using ? '타는 중' : has ? '타기' : '잠김'}
              </button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

export const currentVehicle = (p) => {
  const v = vehicleOf(p.vehicle)
  return ownsVehicle(p, v) ? v.id : 'car'
}

export function BadgeRow() {
  const { progress: p } = useStore()
  if (!p.badges?.length) return <small className="small">요일 퀘스트를 마치면 배지를 모을 수 있어요.</small>
  return (
    <div className="badge-row">
      {p.badges.map((b) => <span key={b} className="badge" title={BADGES[b].name}>{BADGES[b].icon} {BADGES[b].name}</span>)}
    </div>
  )
}
