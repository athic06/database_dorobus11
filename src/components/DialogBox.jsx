import { useCallback, useEffect, useState } from 'react'
import Portrait from './Portraits.jsx'

const SPEAKER_CLASS = { 제로: 'sp-zero', 리코: 'sp-riko', 일기장: 'sp-diary', 편지: 'sp-diary', 자일로: 'sp-xylo', 네이티: 'sp-naty', '???': 'sp-voice', 코덱스: 'sp-codex' }

const TYPE_MS = 28 // 글자 하나가 찍히는 간격

// 스토리 대사창. 클릭 · Enter · Space · E로 넘긴다. 글자가 찍히는 중에 누르면 한 번에 다 보여 준다.
// lines: [{ who: '제로', text: '...' }]  who가 없으면 지문(나레이션) — 초상화 없이 보여준다.
export default function DialogBox({ lines, onDone }) {
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(0)
  const line = lines[i]
  const full = line ? line.text.length : 0
  const typing = shown < full

  const next = useCallback(() => {
    if (typing) return setShown(full)
    if (i < lines.length - 1) setI(i + 1)
    else onDone?.()
  }, [typing, full, i, lines.length, onDone])

  useEffect(() => {
    setI(0)
  }, [lines])

  useEffect(() => {
    setShown(0)
  }, [i, line?.text])

  useEffect(() => {
    if (!typing) return
    const id = setTimeout(() => setShown((n) => n + 1), TYPE_MS)
    return () => clearTimeout(id)
  }, [typing, shown])

  useEffect(() => {
    const onKey = (e) => {
      if (['Enter', 'Space', 'KeyE'].includes(e.code)) {
        e.preventDefault()
        e.stopImmediatePropagation()
        if (!e.repeat) next()
      }
    }
    // 캡처 단계에서 먼저 받아, 같은 E 키가 장면의 상호작용으로 넘어가지 않게 한다.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [next])

  if (!line) return null
  const cls = SPEAKER_CLASS[line.who] || 'sp-npc'
  return (
    <div className={`dialog${line.who ? ' has-portrait' : ''}`} role="dialog" aria-live="polite" onClick={next}>
      {line.who && (
        <div className="portrait" key={line.who}>
          <div className="portrait-frame">
            <Portrait who={line.who} />
          </div>
          <span className={`portrait-name ${cls}`}>{line.who}</span>
        </div>
      )}
      <p className={line.who ? '' : 'narration'}>
        {line.text.slice(0, shown)}
        {/* 남은 글자도 자리를 차지하게 해 창 크기가 흔들리지 않는다 */}
        <span className="dialog-rest">{line.text.slice(shown)}</span>
      </p>
      <span className={`dialog-next${typing ? ' typing' : ''}`}>
        {i + 1} / {lines.length} · 클릭 또는 Space ▶
      </span>
    </div>
  )
}
