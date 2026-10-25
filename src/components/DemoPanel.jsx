import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { SCENES, completePatch, nextStep, sceneOf, stateBefore } from '../game/demo.js'
import { INITIAL_PROGRESS } from '../game/progress.js'
import DialogBox from './DialogBox.jsx'

// 시연 계정 전용 🎬 버튼: 지금 단계 바로 완료, 원하는 장면으로 바로 이동.
// 장면으로 넘어가기 전에 '지금까지의 이야기'를 대사로 먼저 보여 줘서, 갑자기 미션부터 시작하지 않게 한다.
// 프로필 메뉴의 시연 ①, ②도 window 'demo-jump' 이벤트로 같은 흐름을 탄다.
export default function DemoPanel() {
  const { user, progress, replaceProgress, setProgress, resetProgress } = useStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [recap, setRecap] = useState(null) // { scene, reset }

  // 프로필 메뉴에서 보낸 장면 이동 (reset: DEMO_STAGES 이름이면 CELL, 가구까지 되돌린다)
  useEffect(() => {
    const on = (e) => {
      const scene = sceneOf(e.detail.scene)
      if (scene) setRecap({ scene, reset: e.detail.reset })
    }
    window.addEventListener('demo-jump', on)
    return () => window.removeEventListener('demo-jump', on)
  }, [])

  if (!user?.preset || pathname === '/login') return null

  const step = nextStep(progress)
  const completeNow = () => {
    const patch = completePatch(progress)
    if (!patch) return
    setProgress(patch)
    setNote(`✓ 「${step.label}」 완료 처리했어요`)
  }
  const restart = () => {
    if (!window.confirm('시연 계정을 처음 상태로 되돌릴까요? (CELL, 가구, 진행 기록 모두 초기화)')) return
    resetProgress('start')
    setOpen(false)
    setNote('')
    navigate('/jump', { state: { to: '/' } })
  }
  // 이야기를 다 보면 그 장면 직전 상태로 바꾸고 이동한다
  const go = ({ scene, reset }) => {
    setRecap(null)
    if (reset) resetProgress(reset)
    else replaceProgress({ ...INITIAL_PROGRESS, ...stateBefore(scene.before), homeworkDone: ['classDone'], demoPark: true })
    // 같은 화면이어도 새로 그리도록 /jump를 거쳐 이동한다
    navigate('/jump', { state: { to: scene.to, from: scene.from } })
  }
  const pick = (scene) => {
    setOpen(false)
    setNote('')
    setRecap({ scene })
  }

  return (
    <>
      {recap && (
        <div className="demo-recap">
          <div className="demo-recap-title">
            <small>지금까지의 이야기</small>
            <b>{recap.scene.tag ? `${recap.scene.tag} · ` : ''}{recap.scene.label}</b>
            <button className="btn-ghost" onClick={() => go(recap)}>건너뛰기 ▶</button>
          </div>
          <DialogBox lines={recap.scene.recap} onDone={() => go(recap)} />
        </div>
      )}
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
            <button className="btn-ghost demo-restart" onClick={restart}>🔄 처음부터 다시 시작 (첫 수업 전)</button>
            <small className="demo-sub">장면 바로 가기 (지금까지의 이야기를 보고 그 장면으로 이동해요)</small>
            <div className="demo-scenes">
              {SCENES.map((s) => (
                <button key={s.id} className="demo-scene" onClick={() => pick(s)}>
                  {s.tag && <em>{s.tag}</em>}{s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {!recap && <button className="demo-fab" onClick={() => setOpen((o) => !o)} aria-expanded={open}>🎬 시연</button>}
      </div>
    </>
  )
}

// /jump: 장면 바로 가기의 중간 경로. 바로 목적지로 넘겨서 그 화면을 새로 마운트한다
export function JumpRedirect() {
  const { state } = useLocation()
  return <Navigate to={state?.to || '/'} state={state?.from ? { from: state.from } : undefined} replace />
}
