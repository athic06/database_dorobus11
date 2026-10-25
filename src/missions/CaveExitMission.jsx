import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import { useStore } from '../store.jsx'

// 맵별 미션 기획안 2번 · 동굴 — 돌아가는 길 「출구 찾기」
// 지도를 보고 갈림길마다 출구로 이어지는 방향을 고른다. 틀리면 안내 후 다시 시도.

const NODES = [
  { x: 200, y: 395 }, // 시작
  { x: 200, y: 330 }, // 갈림길 1
  { x: 300, y: 250 }, // 갈림길 2
  { x: 230, y: 170 }, // 갈림길 3
  { x: 230, y: 55 }, // 출구
]
const ANSWERS = ['right', 'left', 'straight']
const DIRS = [
  { id: 'left', label: '← 왼쪽' },
  { id: 'straight', label: '↑ 가운데' },
  { id: 'right', label: '오른쪽 →' },
]

// 지도의 길. 막다른 길(돌무더기)도 함께 그려서 학생이 지도를 보고 따라가게 한다.
const PATHS = [
  'M200 395 L200 330',
  'M200 330 L100 330 L100 270', // 갈림길1 왼쪽: 막힘
  'M200 330 L200 290', // 갈림길1 가운데: 막힘
  'M200 330 L300 330 L300 250', // 갈림길1 오른쪽: 정답
  'M300 250 L230 250 L230 170', // 갈림길2 왼쪽: 정답
  'M300 250 L300 190', // 갈림길2 가운데: 막힘
  'M300 250 L360 250 L360 305', // 갈림길2 오른쪽: 막힘
  'M230 170 L150 170 L150 120', // 갈림길3 왼쪽: 막힘
  'M230 170 L230 55', // 갈림길3 가운데: 정답
  'M230 170 L295 170 L295 115', // 갈림길3 오른쪽: 막힘
]
const DEAD_ENDS = [[100, 270], [200, 290], [300, 190], [360, 305], [150, 120], [295, 115]]

const HINTS = [
  '막다른 길이에요! ★ 출구에서부터 길을 거꾸로 따라와 보면 쉬워요.',
  '돌무더기로 막힌 길이에요. 지도에서 지금 서 있는 갈림길(파란 점)을 다시 찾아봐요.',
  '이 길로는 나갈 수 없어요. 갈림길에서 어느 쪽 길이 ★까지 이어지는지 확인해요.',
]

export default function CaveExitMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const [fork, setFork] = useState(0) // 0~2: 갈림길, 3: 탈출
  const [feedback, setFeedback] = useState('지도를 보고 첫 번째 갈림길에서 갈 방향을 골라요.')
  const [tone, setTone] = useState('info')
  const [wrong, setWrong] = useState(0)
  const [tries, setTries] = useState(0)

  const choose = (dir) => {
    const ok = ANSWERS[fork] === dir
    recordAttempt('cave-exit', ok)
    setTries((t) => t + 1)
    if (ok) {
      const next = fork + 1
      setFork(next)
      setTone('good')
      setFeedback(next < 3 ? `좋아요! ${next + 1}번째 갈림길에 도착했어요.` : '')
    } else {
      setTone('bad')
      setFeedback(HINTS[wrong % HINTS.length])
      setWrong((w) => w + 1)
    }
  }

  const me = NODES[Math.min(fork + 1, 4)]

  return (
    <MissionShell
      place="동굴 — 돌아가는 길"
      title="출구 찾기"
      step={fork + 1}
      total={3}
      feedback={fork < 3 ? feedback : ''}
      tone={tone}
      onClose={fork < 3 ? onClose : null}
    >
      {fork < 3 ? (
        <div className="cave-map-wrap">
          <svg viewBox="0 0 420 420" className="cave-map" role="img" aria-label={`동굴 지도. 지금 ${fork + 1}번째 갈림길에 있음`}>
            <rect width="420" height="420" rx="18" fill="#2A2420" />
            {PATHS.map((d) => (
              <path key={d} d={d} stroke="#8C7660" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {DEAD_ENDS.map(([x, y]) => (
              <g key={`${x}${y}`}>
                <circle cx={x} cy={y} r="12" fill="#5A4B3E" />
                <circle cx={x + 6} cy={y - 5} r="7" fill="#6B5A4A" />
              </g>
            ))}
            <text x="230" y="40" textAnchor="middle" fontSize="26" fill="#FFD45C">★</text>
            <text x="262" y="60" className="cm-label">출구</text>
            <text x="200" y="415" textAnchor="middle" className="cm-label">입구(무너짐)</text>
            {NODES.slice(1, 4).map((n, i) => (
              <text key={i} x={n.x - 22} y={n.y + 5} textAnchor="end" className="cm-label">{i + 1}</text>
            ))}
            <circle cx={me.x} cy={me.y} r="11" fill="#4E8BFF" stroke="#fff" strokeWidth="3" className="cm-me" />
          </svg>
          <div className="dir-pad">
            <p className="q">지금 <b>{fork + 1}번째 갈림길</b>이에요. 어느 쪽으로 갈까요?</p>
            {DIRS.map((d) => (
              <button key={d.id} className="dir-btn" onClick={() => choose(d.id)}>{d.label}</button>
            ))}
            <p className="small">지도 위쪽이 앞(가운데)이에요.</p>
          </div>
        </div>
      ) : (
        <div className="clear">
          <div className="clear-badge">CLEAR</div>
          <h3>출구를 찾았어요!</h3>
          <p>갈림길 3곳을 지나 동굴 밖으로 나가는 길을 찾았어요. (시도 {tries}회, 막다른 길 {wrong}번)</p>
          <button className="btn-primary" onClick={onClear}>동굴 밖으로</button>
        </div>
      )}
    </MissionShell>
  )
}
