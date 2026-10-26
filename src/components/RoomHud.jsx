import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CellPill } from './Header.jsx'
import QuestTracker from './QuestTracker.jsx'

// 3D 장면 공통 화면 위 UI: 뒤로가기 · 제목 · 퀘스트 · CELL · 접속 인원 · 조작 안내 · 채팅
export default function RoomHud({ title, backTo = '/', backLabel = '← 대시보드', onChat }) {
  const navigate = useNavigate()
  const [chat, setChat] = useState('')

  const send = (e) => {
    e.preventDefault()
    const text = chat.trim()
    if (!text) return
    onChat?.(text)
    setChat('')
    e.target.querySelector('input').blur()
  }

  return (
    <>
      <div className="hud hud-top">
        <button className="back" onClick={() => navigate(backTo)}>{backLabel}</button>
        <span className="room-title">{title}</span>
        <span className="grow" />
        <CellPill />
        <span className="users" title="접속 인원">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
          </svg>
          1
        </span>
      </div>
      <div className="hud hud-quest"><QuestTracker /></div>
      <div className="hud hint">WASD 이동 · 마우스 드래그로 시점 회전 · 휠로 확대/축소 · Space 점프 · E 상호작용</div>
      {onChat && (
        <form className="hud chat" onSubmit={send}>
          <input
            id="chat-input"
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            placeholder="채팅을 입력해 주세요"
            maxLength={60}
            aria-label="채팅 입력"
          />
          <button type="submit" aria-label="보내기">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 11 21 3l-8 18-2-8z" />
            </svg>
          </button>
        </form>
      )}
    </>
  )
}
