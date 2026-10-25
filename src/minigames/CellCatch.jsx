import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { todayKey } from '../game/routine.js'

// 컴퓨터 2D 미니게임 「셀 캐치」: 떨어지는 CELL을 바구니로 받고 버그는 피한다. 30초 동안 점수 내기.
// 보상: 하루 1번, 점수 10점마다 1 CELL (최대 50).
const W = 480
const H = 320
const TIME = 30
const ITEMS = [
  { icon: '💎', score: 10, weight: 7 },
  { icon: '⭐', score: 30, weight: 1 },
  { icon: '🐛', score: -20, weight: 3 },
]
const MAX_REWARD = 50
const pickItem = () => {
  let n = Math.random() * ITEMS.reduce((s, i) => s + i.weight, 0)
  return ITEMS.find((i) => (n -= i.weight) < 0) || ITEMS[0]
}

export default function CellCatch() {
  const { progress, setProgress, addCell } = useStore()
  const canvas = useRef()
  const [phase, setPhase] = useState('ready') // ready | play | over
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(TIME)
  const [msg, setMsg] = useState('')
  const arcade = progress.arcade || { best: 0, rewarded: '' }

  useEffect(() => {
    if (phase !== 'play') return
    const ctx = canvas.current.getContext('2d')
    const keys = {}
    const st = { x: W / 2, items: [], score: 0, spawn: 0, start: performance.now(), last: performance.now() }
    const down = (e) => { keys[e.key] = true; if (e.key.startsWith('Arrow')) e.preventDefault() }
    const up = (e) => { keys[e.key] = false }
    const mouse = (e) => { const r = canvas.current.getBoundingClientRect(); st.x = ((e.clientX - r.left) / r.width) * W }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    canvas.current.addEventListener('pointermove', mouse)
    let raf
    const loop = (now) => {
      const dt = Math.min((now - st.last) / 1000, 0.05)
      st.last = now
      const remain = Math.max(0, TIME - (now - st.start) / 1000)
      if (keys.ArrowLeft || keys.a) st.x -= 360 * dt
      if (keys.ArrowRight || keys.d) st.x += 360 * dt
      st.x = Math.max(30, Math.min(W - 30, st.x))
      // 시간이 갈수록 더 자주, 더 빨리 떨어진다
      st.spawn -= dt
      if (st.spawn <= 0) {
        st.items.push({ ...pickItem(), x: 20 + Math.random() * (W - 40), y: -20, v: 110 + (TIME - remain) * 5 })
        st.spawn = 0.55 - (TIME - remain) * 0.008
      }
      st.items.forEach((it) => { it.y += it.v * dt })
      st.items = st.items.filter((it) => {
        if (it.y > H - 46 && it.y < H - 14 && Math.abs(it.x - st.x) < 38) { st.score = Math.max(0, st.score + it.score); return false }
        return it.y < H + 20
      })
      // 그리기
      ctx.fillStyle = '#10203A'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#1C3358'
      for (let i = 0; i < 6; i++) ctx.fillRect(0, i * 56, W, 1)
      ctx.font = '26px sans-serif'
      ctx.textAlign = 'center'
      st.items.forEach((it) => ctx.fillText(it.icon, it.x, it.y))
      ctx.fillStyle = '#6CC395'
      ctx.fillRect(st.x - 34, H - 26, 68, 14)
      ctx.fillStyle = '#3E9A6C'
      ctx.fillRect(st.x - 34, H - 14, 68, 6)
      setScore(st.score)
      setLeft(Math.ceil(remain))
      if (remain <= 0) return finish(st.score)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      canvas.current?.removeEventListener('pointermove', mouse)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const finish = (final) => {
    setPhase('over')
    const already = arcade.rewarded === todayKey()
    const reward = already ? 0 : Math.min(MAX_REWARD, Math.floor(final / 10))
    if (reward) addCell(reward)
    setProgress({ arcade: { best: Math.max(arcade.best, final), rewarded: reward ? todayKey() : arcade.rewarded } })
    setMsg(`${final}점${final > arcade.best ? ' · 새 최고 기록!' : ''}${reward ? ` · 오늘의 보상 ${reward} CELL` : already ? ' · 오늘 보상은 이미 받았어요' : ''}`)
  }

  return (
    <div className="arcade">
      <div className="arcade-bar">
        <span>점수 <b>{score}</b></span>
        <span>남은 시간 <b>{left}</b>초</span>
        <span>최고 {arcade.best}점</span>
      </div>
      <canvas ref={canvas} width={W} height={H} className="arcade-canvas" />
      {phase !== 'play' && (
        <div className="arcade-cover">
          <b>{phase === 'over' ? '게임 끝!' : '셀 캐치'}</b>
          <p>{phase === 'over' ? msg : '←/→ 키나 마우스로 바구니를 움직여 💎(10점), ⭐(30점)을 받고 🐛(−20점)는 피해요.'}</p>
          <button className="btn-primary" onClick={() => { setScore(0); setLeft(TIME); setPhase('play') }}>{phase === 'over' ? '다시 하기' : '시작'}</button>
          <small>하루 1번, 10점마다 1 CELL (최대 {MAX_REWARD})</small>
        </div>
      )}
    </div>
  )
}
