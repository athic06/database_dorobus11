import { useState } from 'react'
import { useStore } from '../store.jsx'
import { HIDE_SPOTS, spotsFor } from './treasure.js'
import { FAIL_BONUS, GUARD_CAP_HOURS, GUARD_PER_HOUR, STAKES, guardEarned } from '../game/routine.js'

// G · 내 마이룸에 CELL 숨기기. 친구가 찾으면 숨긴 CELL을 가져가고,
// 못 찾고 버틴 시간과 실패한 방문자 수만큼 주인이 지킨 보상을 받는다.
export default function TreasureEditor({ onClose, onOpenShop }) {
  const { owned, cell, progress, setProgress, addCell, spendCell } = useStore()
  const mine = progress.minigame
  const active = mine?.stake && !mine.foundBy // 아직 아무도 못 찾은 숨긴 CELL
  const [title, setTitle] = useState(mine?.title || '')
  const [hideIn, setHideIn] = useState(mine?.hideIn || '')
  const [stake, setStake] = useState(mine?.stake || STAKES[0])
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const spots = spotsFor(owned)
  const earned = guardEarned(mine)

  const collect = () => {
    if (!earned) return
    addCell(earned)
    setProgress({ minigame: { ...mine, guardClaimed: (mine.guardClaimed || 0) + earned } })
    setMsg(`지킨 보상 ${earned} CELL을 받았어요!`)
  }

  const save = (e) => {
    e.preventDefault()
    if (title.trim().length < 2) return setErr('게임 이름을 두 글자 이상 적어 주세요.')
    if (!hideIn) return setErr('셀을 숨길 가구를 골라 주세요.')
    const base = { title: title.trim(), hideIn, plays: mine?.plays || 0, likes: mine?.likes || 0, likedBy: mine?.likedBy || [] }
    if (active) {
      // 이미 숨겨 둔 CELL은 그대로 두고 자리만 옮긴다
      setProgress({ minigame: { ...mine, ...base } })
      setMsg('숨긴 자리를 옮겼어요.')
      return
    }
    // 이전 판에서 아직 안 받은 지킨 보상은 이번에 숨길 CELL에서 먼저 정산한다
    const next = { ...base, stake, hiddenAt: new Date().toISOString(), foundBy: null, foundAt: null, fails: 0, guardClaimed: 0 }
    const net = stake - earned
    if (net > 0) {
      if (!spendCell(net, { minigame: next })) return setErr(`CELL이 모자라요. (지금 ${cell} CELL)`)
    } else {
      addCell(-net)
      setProgress({ minigame: next })
    }
    setMsg(`${HIDE_SPOTS[hideIn].name}에 ${stake} CELL을 숨겼어요!`)
  }

  const withdraw = () => {
    addCell(mine.stake + earned)
    setProgress({ minigame: { ...mine, stake: 0, guardClaimed: (mine.guardClaimed || 0) + earned } })
    setMsg(`숨긴 ${mine.stake} CELL과 지킨 보상 ${earned} CELL을 돌려받았어요.`)
  }

  return (
    <div className="modal-bg">
      <form className="mission" onSubmit={save}>
        <div className="mission-head">
          <div>
            <span className="mission-place">마이룸 · 셀 숨기기</span>
            <h2>내 방에 셀 숨기기</h2>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="닫기">×</button>
        </div>

        {mine?.stake > 0 && (
          <div className={`treasure-status${mine.foundBy ? ' lost' : ''}`}>
            {mine.foundBy ? (
              <p><b>{mine.foundBy}님이 {HIDE_SPOTS[mine.hideIn]?.name}에서 {mine.stake} CELL을 찾아갔어요!</b><br />다시 숨기면 새 판이 시작돼요.</p>
            ) : (
              <p><b>{HIDE_SPOTS[mine.hideIn]?.name}에 {mine.stake} CELL 숨기는 중</b><br />못 찾고 돌아간 친구 {mine.fails || 0}명 · 지금까지 지킨 보상 {earned} CELL</p>
            )}
            <div className="mission-actions">
              <button type="button" className="btn-primary" disabled={!earned} onClick={collect}>지킨 보상 받기</button>
              {active && <button type="button" className="btn-ghost" onClick={withdraw}>숨긴 셀 회수하기</button>}
              {onOpenShop && <button type="button" className="btn-ghost" onClick={onOpenShop}>내 방 꾸미기</button>}
            </div>
          </div>
        )}

        <p className="q">
          친구가 내 방에 와서 숨긴 셀을 찾으면 가져가요. 대신 못 찾고 버틴 1시간마다 {GUARD_PER_HOUR} CELL(최대 {GUARD_CAP_HOURS}시간),
          못 찾고 돌아간 친구 1명마다 {FAIL_BONUS} CELL을 받아요.
        </p>
        <label className="field-label" htmlFor="tg-title">게임 이름</label>
        <input id="tg-title" className="field" value={title} maxLength={20} onChange={(e) => { setTitle(e.target.value); setErr('') }} placeholder="예) 소파 밑은 아니야!" />
        <p className="q" style={{ marginTop: 12 }}>숨길 곳 {active && <small>(숨긴 셀은 그대로 두고 자리만 옮겨요)</small>}</p>
        <div className="pick-grid">
          {spots.map((id) => (
            <button type="button" key={id} className={hideIn === id ? 'pick on' : 'pick'} aria-pressed={hideIn === id} onClick={() => { setHideIn(id); setErr('') }}>
              <span className="pick-icon">{HIDE_SPOTS[id].icon}</span>{HIDE_SPOTS[id].name}
            </button>
          ))}
        </div>
        {!active && (
          <>
            <p className="q" style={{ marginTop: 12 }}>숨길 CELL <small>(지금 {cell.toLocaleString()} CELL)</small></p>
            <div className="dir-pad">
              {STAKES.map((s) => (
                <button type="button" key={s} className={stake === s ? 'dir-btn on' : 'dir-btn'} aria-pressed={stake === s} onClick={() => setStake(s)}>{s} CELL</button>
              ))}
            </div>
          </>
        )}
        {err && <p className="feedback bad">{err}</p>}
        {msg && <p className="feedback good">{msg}</p>}
        {mine && <p className="small">친구가 찾은 횟수 {mine.plays} · 좋아요 {mine.likes}</p>}
        <div className="mission-actions">
          <button type="submit" className="btn-primary">{active ? '자리 옮기기' : `${stake} CELL 숨기기`}</button>
          <button type="button" className="btn-ghost" onClick={onClose}>닫기</button>
        </div>
      </form>
    </div>
  )
}
