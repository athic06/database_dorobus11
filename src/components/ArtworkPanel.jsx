import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { artworkVisitors } from '../game/daily.js'

// B · 수업 결과물 → 웹 · 앱 성장: 수업에서 만든 작품을 하모니아 광장에 부스로 등록하고, 방문객이 느는 것을 본다.
const COURSES = ['블록코딩', '아두이노', '앱 만들기', 'AI 그림', '모바일 로봇']
const ICONS = ['🤖', '💡', '📱', '🎨', '🚗', '🎵']
export const MAX_ARTWORKS = 3

export default function ArtworkPanel({ onClose }) {
  const { progress, setProgress, addCell } = useStore()
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState(COURSES[0])
  const [icon, setIcon] = useState(ICONS[0])
  const [err, setErr] = useState('')
  const [, tick] = useState(0)
  const arts = progress.artworks
  const fc = progress.facilities.length

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 5000) // 방문객 수가 늘어나는 걸 볼 수 있게
    return () => clearInterval(id)
  }, [])

  const add = (e) => {
    e.preventDefault()
    if (title.trim().length < 2) return setErr('작품 이름을 두 글자 이상 적어 주세요.')
    if (arts.length >= MAX_ARTWORKS) return setErr(`광장 부스는 ${MAX_ARTWORKS}개까지예요.`)
    setProgress({ artworks: [...arts, { id: Date.now(), title: title.trim(), course, icon, at: Date.now() }] })
    addCell(20)
    setTitle('')
    setErr('')
  }

  return (
    <div className="modal-bg" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mission" role="dialog" aria-modal="true" aria-labelledby="art-title">
        <div className="mission-head">
          <div>
            <span className="mission-place">수업 결과물 → 하모니아 광장 전시</span>
            <h2 id="art-title">내 작품 등록하기</h2>
          </div>
          <button className="close" onClick={onClose} aria-label="닫기">×</button>
        </div>
        <p className="q">수업에서 만든 작품을 광장 부스에 전시해요. 시간이 지날수록, 광장 시설이 많을수록 방문객이 늘어요.</p>
        <ul className="arts">
          {arts.map((a) => (
            <li key={a.id}>
              <span className="art-ic">{a.icon}</span>
              <span className="art-t"><b>{a.title}</b><small>{a.course} 수업</small></span>
              <span className="art-v">👀 {artworkVisitors(a, fc).toLocaleString()}명</span>
            </li>
          ))}
          {arts.length === 0 && <li className="small">아직 등록한 작품이 없어요.</li>}
        </ul>
        {arts.length < MAX_ARTWORKS && (
          <form className="art-form" onSubmit={add}>
            <label className="field-label" htmlFor="art-name">작품 이름</label>
            <input id="art-name" className="field" value={title} maxLength={20} onChange={(e) => { setTitle(e.target.value); setErr('') }} placeholder="예) 어두우면 켜지는 무드등" />
            <div className="art-row">
              <label className="field-label" htmlFor="art-course">수업</label>
              <select id="art-course" className="field" value={course} onChange={(e) => setCourse(e.target.value)}>
                {COURSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="art-icons" role="radiogroup" aria-label="부스 아이콘">
              {ICONS.map((ic) => (
                <button type="button" key={ic} role="radio" aria-checked={icon === ic} className={icon === ic ? 'chip-item on' : 'chip-item'} onClick={() => setIcon(ic)}>{ic}</button>
              ))}
            </div>
            {err && <p className="feedback bad">{err}</p>}
            <div className="mission-actions">
              <button type="submit" className="btn-primary">광장에 전시하기 (+20 CELL)</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
