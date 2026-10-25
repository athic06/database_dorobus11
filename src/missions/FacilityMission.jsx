import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import { useStore } from '../store.jsx'
import { FACILITY_GOAL } from '../game/progress.js'

// 맵별 미션 기획안 4번 · 하모니아 — 방문객 맞이하기 「첫 시설 설치」 (테마파크 꾸미기 루프)
// 방문객 요청을 읽고 알맞은 시설을 골라 광장에 놓는다. 설치할수록 방문객·CELL이 늘고 새 시설이 열린다.

export const FACILITIES = [
  { id: 'bench', name: '벤치', icon: '🪑', unlockAt: 0 },
  { id: 'fountain', name: '음수대 분수', icon: '⛲', unlockAt: 0 },
  { id: 'flower', name: '꽃밭', icon: '🌷', unlockAt: 0 },
  { id: 'photo', name: '포토존', icon: '📸', unlockAt: 1 },
  { id: 'balloon', name: '풍선 가판대', icon: '🎈', unlockAt: 2 },
]

const REQUESTS = [
  { who: '할아버지 방문객', text: '다리가 아파서 그러는데, 잠깐 앉아서 쉴 곳이 있으면 좋겠구나.', answer: 'bench', hint: '앉아서 쉴 수 있는 시설을 찾아봐요.' },
  { who: '꼬마 방문객', text: '뛰어놀았더니 목이 너무 말라요!', answer: 'fountain', hint: '목이 마를 때 필요한 시설이에요.' },
  { who: '가족 방문객', text: '도로랜드에 온 기념으로 다 같이 사진을 남기고 싶어요.', answer: 'photo', hint: '새로 열린 시설 중에 사진과 관련된 게 있어요.' },
]
const REWARD = 50

export default function FacilityMission({ onClear, onClose }) {
  const { progress, setProgress, addCell, recordAttempt } = useStore()
  const placed = progress.facilities
  const round = placed.length
  const req = REQUESTS[round]
  const [feedback, setFeedback] = useState('')
  const [tone, setTone] = useState('info')
  const [justPlaced, setJustPlaced] = useState(null)

  const choose = (f) => {
    if (f.unlockAt > round) return
    const ok = f.id === req.answer
    recordAttempt('facility', ok)
    if (!ok) {
      setTone('bad')
      setFeedback(`이 방문객에게는 ${f.name}보다 더 알맞은 시설이 있어요. 힌트: ${req.hint}`)
      return
    }
    addCell(REWARD)
    setProgress({ facilities: [...placed, f.id] })
    setJustPlaced(f)
    setTone('good')
    setFeedback('')
  }

  const newlyUnlocked = justPlaced ? FACILITIES.filter((f) => f.unlockAt === placed.length) : []

  if (justPlaced) {
    const finished = placed.length >= FACILITY_GOAL
    return (
      <MissionShell place="하모니아 — 방문객 맞이하기" title="첫 시설 설치" step={placed.length + 1} total={FACILITY_GOAL}>
        <div className="clear">
          <div className="clear-badge">{finished ? 'CLEAR' : '설치 완료'}</div>
          <h3>{justPlaced.icon} {justPlaced.name} 설치 완료!</h3>
          <p>방문객이 늘었어요 · CELL +{REWARD}</p>
          {newlyUnlocked.length > 0 && <p className="unlock">새 시설 해금: {newlyUnlocked.map((f) => `${f.icon} ${f.name}`).join(', ')}</p>}
          {finished && <p className="unlock">광장이 다시 붐비기 시작했어요. 상점 주인이 돌아왔대요!</p>}
          <div className="cc-actions">
            {!finished && <button className="btn-ghost" onClick={() => setJustPlaced(null)}>다음 방문객 맞이하기</button>}
            <button className="btn-primary" onClick={finished ? onClear : onClose}>{finished ? '확인' : '광장 둘러보기'}</button>
          </div>
        </div>
      </MissionShell>
    )
  }

  return (
    <MissionShell
      place="하모니아 — 방문객 맞이하기"
      title="첫 시설 설치"
      step={round + 1}
      total={FACILITY_GOAL}
      feedback={feedback}
      tone={tone}
      onClose={onClose}
    >
      <div className="request">
        <span className="speaker">{req.who}</span>
        <p>“{req.text}”</p>
      </div>
      <p className="q">요청에 맞는 시설을 골라 광장에 설치해요.</p>
      <div className="pick-grid">
        {FACILITIES.map((f) => {
          const locked = f.unlockAt > round
          const used = placed.includes(f.id)
          return (
            <button key={f.id} className={`pick${used ? ' used' : ''}`} disabled={locked || used} onClick={() => choose(f)}>
              <span className="pick-icon">{locked ? '🔒' : f.icon}</span>
              {f.name}
              {used && <small>설치됨</small>}
              {locked && <small>시설 {f.unlockAt}개 설치 후</small>}
            </button>
          )
        })}
      </div>
    </MissionShell>
  )
}
