import { useEffect, useRef, useState } from 'react'

// 방향 블록을 쌓아 로봇을 목표까지 움직이는 작은 코딩 판.
// level: { cols, rows, start: [x, y], goal: [x, y], rocks: [[x, y]], max }
const DIRS = {
  up: { label: '↑ 위로', dx: 0, dy: -1 },
  down: { label: '↓ 아래로', dx: 0, dy: 1 },
  left: { label: '← 왼쪽', dx: -1, dy: 0 },
  right: { label: '→ 오른쪽', dx: 1, dy: 0 },
}

export default function GridProgram({ level, robot = '🤖', goalIcon = '★', onResult }) {
  const { cols, rows, start, goal, rocks, max } = level
  const [prog, setProg] = useState([])
  const [pos, setPos] = useState(start)
  const [running, setRunning] = useState(false)
  const [msg, setMsg] = useState('')
  const timer = useRef()
  useEffect(() => () => clearInterval(timer.current), [])

  const isRock = (x, y) => rocks.some(([rx, ry]) => rx === x && ry === y)

  const run = () => {
    if (!prog.length) {
      setMsg('명령 블록을 하나 이상 쌓아 주세요.')
      return
    }
    setRunning(true)
    setMsg('')
    let i = 0
    let [x, y] = start
    setPos(start)
    timer.current = setInterval(() => {
      const d = DIRS[prog[i]]
      const nx = x + d.dx
      const ny = y + d.dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || isRock(nx, ny)) {
        clearInterval(timer.current)
        setRunning(false)
        setMsg(`${i + 1}번째 블록에서 ${isRock(nx, ny) ? '바위에 부딪혔어요' : '판 밖으로 나가려고 했어요'}. 블록을 고쳐 봐요.`)
        onResult?.(false)
        return
      }
      x = nx
      y = ny
      setPos([x, y])
      i++
      if (i >= prog.length) {
        clearInterval(timer.current)
        setRunning(false)
        const ok = x === goal[0] && y === goal[1]
        if (!ok) setMsg(`명령이 끝났지만 ${goalIcon}에 도착하지 못했어요.`)
        onResult?.(ok, prog.length)
      }
    }, 380)
  }

  return (
    <div className="grid-prog">
      <div className="grid-board" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} role="img" aria-label="코딩 판">
        {Array.from({ length: cols * rows }).map((_, k) => {
          const x = k % cols
          const y = Math.floor(k / cols)
          const here = pos[0] === x && pos[1] === y
          return (
            <div key={k} className={`cell${isRock(x, y) ? ' rock' : ''}`}>
              {here ? robot : goal[0] === x && goal[1] === y ? goalIcon : isRock(x, y) ? '🪨' : ''}
            </div>
          )
        })}
      </div>
      <div className="grid-side">
        <div className="cmd-row">
          {Object.entries(DIRS).map(([k, d]) => (
            <button key={k} className="cmd" disabled={running || prog.length >= max} onClick={() => setProg((p) => (p.length >= max ? p : [...p, k]))}>{d.label}</button>
          ))}
        </div>
        <ol className="prog">
          {prog.map((k, i) => <li key={i}>{DIRS[k].label}</li>)}
          {!prog.length && <li className="ph">블록을 눌러 순서대로 쌓아요 (최대 {max}개)</li>}
        </ol>
        <div className="mission-actions">
          <button className="btn-ghost" disabled={running} onClick={() => { setProg([]); setPos(start); setMsg('') }}>지우기</button>
          <button className="btn-primary" disabled={running} onClick={run}>{running ? '실행 중…' : '▶ 실행'}</button>
        </div>
        {msg && <p className="feedback bad">{msg}</p>}
      </div>
    </div>
  )
}
