import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import { useStore } from '../store.jsx'
import { playNotes } from '../game/audio.js'

// 챕터 3 · 하모니아 — 멈춰버린 노래 「하모니아 멜로디 복원」 (스토리 영상 챕터 2 기반 제안 미션)
// 악보가 사라졌다. 제로·리코·자일로의 기억을 모아 멜로디 조각 4개의 순서를 맞추고 하모니아에 입력해 연주한다.

const PIECES = [
  { id: 'a', notes: ['C4', 'D4', 'E4', 'G4'], beat: 0.42, color: '#7FB2FF' },
  { id: 'b', notes: ['E4', 'F4', 'G4', 'A4'], beat: 0.32, color: '#9ED8C6' },
  { id: 'c', notes: ['A4', 'B4', 'C5', 'D5', 'E5'], beat: 0.2, color: '#F5B841' },
  { id: 'd', notes: ['G5', 'E5', 'D5', 'C5'], beat: 0.28, color: '#E57E9A' },
]
const ANSWER = ['a', 'b', 'c', 'd']
const SHOWN = ['c', 'a', 'd', 'b'] // 화면에 섞어서 보여주는 순서
const LABEL = { a: '조각 ㄱ', b: '조각 ㄴ', c: '조각 ㄷ', d: '조각 ㄹ' }
const MEMORIES = [
  { who: '제로', text: '처음은 낮은 음에서 느리고 따뜻하게 시작했어.' },
  { who: '자일로', text: '그다음엔 계단을 한 칸씩 오르듯 차분히 올라갔죠.' },
  { who: '리코', text: '중간부터 점점 빨라지면서 신나게 높이 올라갔다고!' },
  { who: '리코', text: '마지막은 제일 높은 음에서 내려와 \'도\'로 쾅 끝났어.' },
]
const HINTS = [
  '제로의 기억: 가장 낮고 느린 조각이 맨 앞이에요.',
  '조각을 하나씩 들어 보고, 음이 점점 높아지는 순서로 놓아 봐요.',
  '리코의 기억: 높은 음에서 "도"로 내려오며 끝나는 조각이 맨 뒤예요.',
]

// 점 그래프: 음 높이를 세로 위치로 보여준다
const LEVEL = { C4: 0, D4: 1, E4: 2, F4: 3, G4: 4, A4: 5, B4: 6, C5: 7, D5: 8, E5: 9, G5: 11 }
function NoteDots({ piece }) {
  return (
    <svg viewBox="0 0 110 60" className="note-dots" aria-hidden="true">
      {piece.notes.map((n, i) => (
        <circle key={i} cx={14 + i * 21} cy={54 - LEVEL[n] * 4.4} r="5" fill={piece.color} stroke="#2b3140" strokeWidth="1" />
      ))}
    </svg>
  )
}

export default function MelodyMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const [slots, setSlots] = useState([null, null, null, null])
  const [feedback, setFeedback] = useState('조각을 눌러 들어 보고, 기억에 맞게 빈칸에 차례대로 놓아요.')
  const [tone, setTone] = useState('info')
  const [wrong, setWrong] = useState(0)
  const [done, setDone] = useState(false)
  const [playing, setPlaying] = useState(false)

  const piece = (id) => PIECES.find((p) => p.id === id)
  const listen = (id) => playNotes(piece(id).notes, piece(id).beat)

  const place = (id) => {
    listen(id)
    if (slots.includes(id)) return
    const i = slots.indexOf(null)
    if (i === -1) return
    const next = [...slots]
    next[i] = id
    setSlots(next)
    setFeedback('')
  }
  const unplace = (i) => {
    const next = [...slots]
    next[i] = null
    setSlots(next)
  }

  const playAll = () => {
    if (slots.includes(null)) {
      setTone('bad')
      setFeedback('빈칸을 모두 채워 주세요.')
      return
    }
    setPlaying(true)
    let delay = 0
    slots.forEach((id) => {
      const p = piece(id)
      delay = playNotes(p.notes, p.beat, delay / 1000)
    })
    setTimeout(() => {
      setPlaying(false)
      const ok = slots.every((id, i) => id === ANSWER[i])
      recordAttempt('melody', ok)
      if (ok) {
        setDone(true)
      } else {
        setTone('bad')
        setFeedback(`음… 하모니아가 반응하지 않아요. ${HINTS[wrong % HINTS.length]}`)
        setWrong((w) => w + 1)
      }
    }, delay + 150)
  }

  return (
    <MissionShell
      place="하모니아 — 멈춰버린 노래"
      title="하모니아 멜로디 복원"
      feedback={done ? '' : feedback}
      tone={tone}
      onClose={done ? null : onClose}
    >
      {!done ? (
        <>
          <div className="memories">
            {MEMORIES.map((m, i) => (
              <p key={i}><b>{m.who}</b>{m.text}</p>
            ))}
          </div>
          <p className="q">멜로디 조각 (눌러서 듣고 빈칸에 놓기)</p>
          <div className="pieces">
            {SHOWN.map((id) => (
              <button key={id} className={slots.includes(id) ? 'piece used' : 'piece'} onClick={() => place(id)}>
                <NoteDots piece={piece(id)} />
                <span>{LABEL[id]} ▶</span>
              </button>
            ))}
          </div>
          <p className="q">하모니아 악보</p>
          <ol className="score">
            {slots.map((id, i) => (
              <li key={i}>
                {id ? (
                  <button className="piece small" onClick={() => unplace(i)} title="빼기">
                    <NoteDots piece={piece(id)} />
                    <span>{LABEL[id]} ✕</span>
                  </button>
                ) : (
                  <span className="empty">{i + 1}</span>
                )}
              </li>
            ))}
          </ol>
          <div className="mission-actions">
            <button className="btn-ghost" onClick={() => setSlots([null, null, null, null])}>다시 놓기</button>
            <button className="btn-primary" onClick={playAll} disabled={playing}>{playing ? '연주 중…' : '하모니아에 입력하고 연주하기'}</button>
          </div>
        </>
      ) : (
        <div className="clear">
          <div className="clear-badge">CLEAR</div>
          <h3>하모니아가 다시 노래해요!</h3>
          <p>서로 다른 기억을 모아 원래의 멜로디를 되살렸어요.</p>
          <button className="btn-primary" onClick={onClear}>확인</button>
        </div>
      )}
    </MissionShell>
  )
}
