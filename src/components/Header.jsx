import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const TABS = [
  ['대시보드', '/'],
  ['내 수업', null],
  ['공작소', null],
  ['실제 계정 전환', null],
  ['미니게임', '/play'],
]

export function Logo() {
  return (
    <div className="logo">
      <svg width="44" height="30" viewBox="0 0 44 30" aria-hidden="true">
        <rect x="0" y="6" width="14" height="4" rx="2" fill="#4E8BFF" />
        <rect x="4" y="13" width="12" height="4" rx="2" fill="#4E8BFF" />
        <rect x="0" y="20" width="14" height="4" rx="2" fill="#4E8BFF" />
        <path d="M18 2h10a13 13 0 0 1 0 26H18z" fill="#4E8BFF" />
        <circle cx="29" cy="15" r="5" fill="#fff" />
      </svg>
      <span>DOROBUS</span>
    </div>
  )
}

export function CellPill() {
  const { cell } = useStore()
  return (
    <span className="pill pill-cell">
      <span className="cell-dot" />
      {cell.toLocaleString()}
    </span>
  )
}

export default function Header({ active = '대시보드' }) {
  const { user, logout, resetProgress, skipStory } = useStore()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)
  return (
    <header className="header">
      <div className="header-top container">
        <Logo />
        <div className="header-right">
          <CellPill />
          <span className="pill pill-level">Lv. {user.level}</span>
          <button className="icon-btn" aria-label="메시지">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </button>
          <div className="profile-wrap">
            <button className="profile" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
              <span className="avatar" />
              {user.name}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {menu && (
              <div className="menu">
                <div className="menu-who">
                  <strong>{user.name}</strong>
                  <small>{user.role === 'teacher' ? '강사' : '학생'} · 아이디 {user.id}</small>
                </div>
                <button className="menu-plain" onClick={() => { resetProgress(); setMenu(false) }}>{user.preset ? '시연 시작 상태로 되돌리기' : '모험 처음부터 (체험용)'}</button>
                <button className="menu-plain" onClick={() => { skipStory(); setMenu(false) }}>스토리 완료 상태로 바꾸기 (체험용)</button>
                <button onClick={logout}>로그아웃</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="tabs container">
        {TABS.map(([t, to]) => (
          <button key={t} className={t === active ? 'tab active' : 'tab'} onClick={() => to && navigate(to)} aria-current={t === active ? 'page' : undefined}>{t}</button>
        ))}
      </nav>
    </header>
  )
}
