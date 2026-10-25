import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import GridProgram from './GridProgram.jsx'
import { useStore } from '../store.jsx'
import { HOMEWORK } from '../game/homework.js'

// 수업 과제 「도움이 필요한 NPC 돕기」: 방금 들은 수업 개념을 광장 NPC의 부탁에 써 본다
export default function HomeworkMission({ flag, onClose, onClear }) {
  const { progress, setProgress, addCell, recordAttempt } = useStore()
  const hw = HOMEWORK[flag]
  const [done, setDone] = useState(false)

  const finish = () => {
    addCell(hw.reward)
    setProgress({ homeworkDone: [...(progress.homeworkDone || []), flag] })
    onClear(hw)
  }

  return (
    <MissionShell place={`수업 과제 — ${hw.lesson}`} title="도움이 필요한 NPC 돕기" onClose={done ? null : onClose}>
      {done ? (
        <div className="clear">
          <div className="clear-badge">과제 완료</div>
          <h3>{hw.who}를 도왔어요!</h3>
          <p>수업에서 배운 「{hw.concept}」로 문제를 해결했어요 · CELL +{hw.reward}</p>
          <button className="btn-primary" onClick={finish}>확인</button>
        </div>
      ) : (
        <>
          <div className="request">
            <span className="speaker">{hw.who}</span>
            <p>“{hw.ask}”</p>
          </div>
          <p className="q">방향 블록을 순서대로 쌓아 {hw.robot} → {hw.goalIcon} 까지 이동시켜요.</p>
          <GridProgram
            level={hw.level}
            robot={hw.robot}
            goalIcon={hw.goalIcon}
            onResult={(ok) => {
              recordAttempt(`homework-${flag}`, ok)
              if (ok) setTimeout(() => setDone(true), 500)
            }}
          />
        </>
      )}
    </MissionShell>
  )
}
