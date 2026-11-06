import { useEffect, useState } from 'react'
import CellCatch from '../minigames/CellCatch.jsx'
import { Challenge } from '../pages/Play.jsx'
import { FestivalDesk } from '../pages/Repair.jsx'

// 마이룸 컴퓨터 화면: 책상 의자에 앉으면 뜨는 2D 미니게임 바탕화면
const APPS = [
  { id: 'catch', icon: '💎', name: '셀 캐치', desc: '떨어지는 CELL 받기' },
  { id: 'coding', icon: '🧩', name: '코딩 챌린지', desc: '최소 블록으로 길 찾기' },
  { id: 'piano', icon: '🎹', name: '피아노 게임', desc: '기억 모드, 음 맞히기' },
  { id: 'repair', asset: '1F527', name: '원격 수리실', desc: '원격 수리 자격증으로 시설 고치기' },
]

export default function ComputerScreen({ onClose, onPiano }) {
  const [app, setApp] = useState(null)
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && (app ? setApp(null) : onClose())
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [app, onClose])
  const cur = APPS.find((a) => a.id === app)

  return (
    <div className="modal-bg">
      <div className="pc" role="dialog" aria-modal="true" aria-label="컴퓨터">
        <div className="pc-bar">
          <span className="pc-dots"><i /><i /><i /></span>
          <b>DORO OS{cur ? ` · ${cur.name}` : ''}</b>
          <span className="grow" />
          {app && <button className="pc-btn" onClick={() => setApp(null)}>← 바탕화면</button>}
          <button className="pc-btn" onClick={onClose}>일어나기 ✕</button>
        </div>
        <div className={`pc-screen${app === 'repair' ? ' pc-repair-screen' : ''}`}>
          {!app && (
            <div className="pc-desktop">
              {APPS.map((a) => (
                <button key={a.id} className="pc-app" onClick={() => (a.id === 'piano' ? onPiano() : setApp(a.id))}>
                  {a.asset ? <img className="pc-icon" width="42" height="42" src={`${import.meta.env.BASE_URL}repair/openmoji/${a.asset}.svg`} alt="" /> : <span className="pc-icon">{a.icon}</span>}
                  <b>{a.name}</b>
                  <small>{a.desc}</small>
                </button>
              ))}
            </div>
          )}
          {app === 'catch' && <CellCatch />}
          {app === 'coding' && <div className="pc-app-body"><Challenge /></div>}
          {app === 'repair' && <FestivalDesk />}
        </div>
      </div>
    </div>
  )
}
