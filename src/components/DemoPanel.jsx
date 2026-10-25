import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { SCENES, completePatch, nextStep, stateBefore } from '../game/demo.js'
import { INITIAL_PROGRESS } from '../game/progress.js'

// 시연 계정 전용 🎬 버튼: 지금 단계 바로 완료, 원하는 장면으로 바로 이동.
// 시연 중 미션이 막히거나 오류가 나도 흐름을 이어 가기 위한 것이라 일반 계정에는 보이지 않는다.
export default function DemoPanel() {
  const { user, progress, replaceProgress, setProgress } = useStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  if (!user?.preset || pathname === '/login') return null

  const step = nextStep(progress)
  const completeNow = () => {
    const patch = completePatch(progress)
    if (!patch) return
    setProgress(patch)
    setNote(`✓ 「${step.label}」 완료 처리했어요`)
  }
  const jump = (scene) => {
    // CELL과 가구는 그대로 두고, 진행 상태만 그 장면 직전으로 바꾼다
    replaceProgress({ ...INITIAL_PROGRESS, ...stateBefore(scene.before), homeworkDone: ['classDone'], demoPark: true })
    setOpen(false)
    setNote('')
    // 같은 화면이어도 새로 그리도록 /jump를 거쳐 이동한다
    navigate('/jump', { state: { to: scene.to, from: scene.from } })
  }

  return (
    <div className="demo-dock">
      {open && (
        <div className="demo-panel" role="dialog" aria-label="시연 도구">
          <div className="demo-head">
            <b>🎬 시연 도구</b>
            <button className="close" onClick={() => setOpen(false)} aria-label="닫기">×</button>
          </div>
          <div className="demo-now">
            <small>지금 단계</small>
            <span>{step ? step.label : '메인 스토리 완료'}</span>
            <button className="btn-primary" disabled={!step} onClick={completeNow}>이 단계 바로 완료</button>
            {note && <small className="demo-note">{note}</small>}
          </div>
          <small className="demo-sub">장면 바로 가기 (그 장면 직전 상태로 바꾸고 이동해요)</small>
          <div className="demo-scenes">
            {SCENES.map((s) => (
              <button key={s.id} className="demo-scene" onClick={() => jump(s)}>
                {s.tag && <em>{s.tag}</em>}{s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button className="demo-fab" onClick={() => setOpen((o) => !o)} aria-expanded={open}>🎬 시연</button>
    </div>
  )
}

// /jump: 장면 바로 가기의 중간 경로. 바로 목적지로 넘겨서 그 화면을 새로 마운트한다
export function JumpRedirect() {
  const { state } = useLocation()
  return <Navigate to={state?.to || '/'} state={state?.from ? { from: state.from } : undefined} replace />
}
