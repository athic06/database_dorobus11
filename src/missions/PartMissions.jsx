import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import GridProgram from './GridProgram.jsx'
import { useStore } from '../store.jsx'
import { VOID_PARTS } from '../game/progress.js'

// 맵별 미션 기획안 7번 · 도로랜드 전역 — 보이드 구조 작전 「부품 수집」
// 여러 지역을 다시 방문해 앞서 익힌 활동을 응용한 미션으로 보이드 부품을 하나씩 얻는다.

const part = (id) => VOID_PARTS.find((p) => p.id === id)

function PartClear({ id, onClear, note }) {
  const p = part(id)
  return (
    <div className="clear">
      <div className="clear-badge">부품 획득</div>
      <h3>{p.icon} {p.name}</h3>
      <p>{note}</p>
      <button className="btn-primary" onClick={() => onClear(id)}>챙기기</button>
    </div>
  )
}

function Request({ who, text }) {
  return (
    <div className="request">
      <span className="speaker">{who}</span>
      <p>“{text}”</p>
    </div>
  )
}

/* 1. 사파리 · 조건 블록 응용 */
export function SensorMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const CONDS = [
    { id: 'near', label: '동물이 가까우면', test: (s) => s.near },
    { id: 'wide', label: '길이 넓으면', test: (s) => s.wide },
    { id: 'night', label: '밤이 되면', test: (s) => s.night },
  ]
  const ACTS = [
    { id: 'stop', label: '멈추기' },
    { id: 'go', label: '달리기' },
    { id: 'horn', label: '경적 울리기' },
  ]
  const CASES = [
    { name: '사자가 바로 앞', s: { near: true, wide: true, night: false }, expect: 'stop' },
    { name: '동물 없는 넓은 길', s: { near: false, wide: true, night: false }, expect: 'go' },
    { name: '좁은 숲길, 기린이 옆', s: { near: true, wide: false, night: true }, expect: 'stop' },
    { name: '좁은 숲길, 동물 없음', s: { near: false, wide: false, night: true }, expect: 'go' },
  ]
  const [c, setC] = useState('')
  const [t, setT] = useState('')
  const [e, setE] = useState('')
  const [fb, setFb] = useState('')
  const [done, setDone] = useState(false)
  const run = () => {
    if (!c || !t || !e) return setFb('세 칸을 모두 골라 주세요.')
    const cond = CONDS.find((x) => x.id === c)
    const bad = CASES.find((k) => (cond.test(k.s) ? t : e) !== k.expect)
    recordAttempt('part-sensor', !bad)
    if (!bad) return setDone(true)
    setFb(`「${bad.name}」일 때 로봇이 ${bad.expect === 'stop' ? '멈춰야' : '달려야'} 해요.`)
  }
  const sel = (val, set, opts, ph) => (
    <span className="block-slot">
      <select value={val} onChange={(ev) => { set(ev.target.value); setFb('') }} aria-label={ph}>
        <option value="" disabled>{ph}</option>
        {opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </span>
  )
  return (
    <MissionShell place="사파리 — 부품 수집" title="동물 감지 센서" feedback={done ? '' : fb} tone="bad" onClose={done ? null : onClose}>
      {done ? (
        <PartClear id="sensor" onClear={onClear} note="조건 블록 덕분에 로봇이 동물 앞에서 안전하게 멈춰요." />
      ) : (
        <>
          <Request who="사파리 사육사" text="모바일 로봇이 동물 가까이에서는 꼭 멈추게 규칙을 만들어 주면, 이 감지 센서를 줄게!" />
          <div className="blocks">
            <div className="block if">만약 {sel(c, setC, CONDS, '조건')} 이라면</div>
            <div className="block do">{sel(t, setT, ACTS, '동작')}</div>
            <div className="block if">아니면</div>
            <div className="block do">{sel(e, setE, ACTS, '동작')}</div>
          </div>
          <div className="mission-actions"><button className="btn-primary" onClick={run}>시험 운전</button></div>
        </>
      )}
    </MissionShell>
  )
}

/* 2. 관람차 · 점검 순서 응용 */
export function BatteryMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const ORDER = ['패널 먼지 닦기', '전선 연결 확인', '스위치 켜기', '전력 계기판 확인']
  const HINT = ['먼지가 있으면 햇빛을 못 받아요.', '선이 끊겨 있으면 전기가 흐르지 않아요.', '준비가 끝나야 스위치를 켜요.', '켠 다음에 잘 되는지 확인해요.']
  const SHOWN = [2, 0, 3, 1].map((i) => ORDER[i])
  const [seq, setSeq] = useState([])
  const [fb, setFb] = useState('')
  const [done, setDone] = useState(false)
  const add = (s) => {
    const next = [...seq, s]
    setSeq(next)
    setFb('')
    if (next.length < ORDER.length) return
    const bad = next.findIndex((v, i) => v !== ORDER[i])
    recordAttempt('part-battery', bad === -1)
    if (bad === -1) return setDone(true)
    setFb(`${bad + 1}번째 순서가 달라요. 힌트: ${HINT[bad]}`)
    setSeq([])
  }
  return (
    <MissionShell place="관람차 — 부품 수집" title="태양광 배터리" feedback={done ? '' : fb} tone="bad" onClose={done ? null : onClose}>
      {done ? (
        <PartClear id="battery" onClear={onClear} note="관람차 전등이 다시 환하게 켜지고, 여분의 배터리를 받았어요." />
      ) : (
        <>
          <Request who="관람차 기술자" text="관람차 전등이 고장 나서 안 켜져! 전등에 전기를 주는 태양광 패널을 순서대로 점검해서 다시 켜 주면 남는 배터리를 줄게." />
          <ol className="seq">
            {ORDER.map((_, i) => (
              <li key={i} className={seq[i] ? 'filled' : ''}><b>{i + 1}</b>{seq[i] || '　'}</li>
            ))}
          </ol>
          <div className="pick-grid two">
            {SHOWN.map((s) => (
              <button key={s} className={seq.includes(s) ? 'pick used' : 'pick'} disabled={seq.includes(s)} onClick={() => add(s)}>{s}</button>
            ))}
          </div>
        </>
      )}
    </MissionShell>
  )
}

/* 3. 롤러코스터 · 분류 응용 */
export function MotorMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const PILE = [
    { id: 1, name: '작은 모터', icon: '⚙️', need: true },
    { id: 2, name: '빈 깡통', icon: '🥫' },
    { id: 3, name: '톱니바퀴', icon: '🔩', need: true },
    { id: 4, name: '병뚜껑', icon: '🔘' },
    { id: 5, name: '톱니바퀴', icon: '🔩', need: true },
    { id: 6, name: '찢어진 표', icon: '🎫' },
    { id: 7, name: '전선 뭉치', icon: '🧶', need: true },
    { id: 8, name: '나뭇잎', icon: '🍂' },
  ]
  const [picked, setPicked] = useState([])
  const [fb, setFb] = useState('')
  const [done, setDone] = useState(false)
  const check = () => {
    const missing = PILE.filter((i) => i.need && !picked.includes(i.id)).length
    const extra = PILE.filter((i) => !i.need && picked.includes(i.id)).length
    recordAttempt('part-motor', !missing && !extra)
    if (!missing && !extra) return setDone(true)
    setFb([missing && `설계도의 부품이 ${missing}개 빠졌어요`, extra && `고철이 ${extra}개 섞여 있어요`].filter(Boolean).join(', ') + '.')
  }
  return (
    <MissionShell place="롤러코스터 — 부품 수집" title="팔 모터" feedback={done ? '' : fb} tone="bad" onClose={done ? null : onClose}>
      {done ? (
        <PartClear id="motor" onClear={onClear} note="고철 더미에서 설계도에 맞는 부품만 골라 팔 모터를 완성했어요." />
      ) : (
        <>
          <Request who="롤러코스터 정비사" text="정비하다 나온 고철 더미야. 설계도에 있는 부품만 골라 가면 팔 모터를 만들 수 있을 거야." />
          <p className="q">설계도: 작은 모터 1 · 톱니바퀴 2 · 전선 뭉치 1</p>
          <div className="pick-grid">
            {PILE.map((it) => (
              <button key={it.id} className={picked.includes(it.id) ? 'pick on' : 'pick'} aria-pressed={picked.includes(it.id)}
                onClick={() => { setFb(''); setPicked((p) => (p.includes(it.id) ? p.filter((x) => x !== it.id) : [...p, it.id])) }}>
                <span className="pick-icon">{it.icon}</span>{it.name}
              </button>
            ))}
          </div>
          <div className="mission-actions"><button className="btn-primary" onClick={check}>조립하기</button></div>
        </>
      )}
    </MissionShell>
  )
}

/* 4. 동굴 앞 · 길 찾기 응용 (코딩) */
export function WheelMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const [done, setDone] = useState(false)
  // 정답 예: → → → ↑ → ↑ ↑  (7개)
  const level = { cols: 5, rows: 4, start: [0, 3], goal: [4, 0], rocks: [[1, 2], [2, 2], [3, 0], [3, 1], [1, 0]], max: 9 }
  return (
    <MissionShell place="동굴 앞 — 부품 수집" title="튼튼한 바퀴" onClose={done ? null : onClose}>
      {done ? (
        <PartClear id="wheel" onClear={onClear} note="바위 사이 길을 찾아 바퀴를 꺼냈어요." />
      ) : (
        <>
          <Request who="리코" text="바위 틈에 바퀴가 끼어 있어! 모바일 로봇의 집게 팔을 블록으로 움직여서 ★까지 가 보자." />
          <GridProgram level={level} robot="🦾" goalIcon="🛞" onResult={(ok) => { recordAttempt('part-wheel', ok); if (ok) setTimeout(() => setDone(true), 500) }} />
        </>
      )}
    </MissionShell>
  )
}

/* 5. 오래된 창고 숲 · 방향 안내 응용 */
export function AntennaMission({ onClear, onClose }) {
  const { recordAttempt } = useStore()
  const OPTIONS = [
    { id: 'ne', label: '↗ 북동쪽, 관람차 쪽 길' },
    { id: 'se', label: '↘ 남동쪽, 회전목마 쪽 길' },
    { id: 'sw', label: '↙ 남서쪽, 숲 안쪽' },
  ]
  const [fb, setFb] = useState('')
  const [done, setDone] = useState(false)
  const choose = (id) => {
    const ok = id === 'se'
    recordAttempt('part-antenna', ok)
    if (ok) return setDone(true)
    setFb('그쪽으로 가면 회전목마가 나오지 않아요. 미니맵에서 오래된 창고와 회전목마의 위치를 비교해 봐요.')
  }
  return (
    <MissionShell place="오래된 창고 숲 — 부품 수집" title="신호 안테나" feedback={done ? '' : fb} tone="bad" onClose={done ? null : onClose}>
      {done ? (
        <PartClear id="antenna" onClear={onClear} note="방문객이 약속 시간에 맞춰 회전목마에 도착했어요. 고맙다며 주운 안테나를 줬어요." />
      ) : (
        <>
          <Request who="길 잃은 방문객" text="친구랑 회전목마 앞에서 만나기로 했는데 숲에서 길을 잃었어요. 약속 시간에 늦겠어요! 어느 쪽으로 가야 하죠? 아까 숲에서 주운 이 안테나를 드릴게요." />
          <p className="q">오래된 창고에서 회전목마는 어느 쪽일까요?</p>
          <div className="dir-pad">
            {OPTIONS.map((o) => <button key={o.id} className="dir-btn" onClick={() => choose(o.id)}>{o.label}</button>)}
          </div>
        </>
      )}
    </MissionShell>
  )
}

export const PART_MISSIONS = {
  sensor: SensorMission,
  battery: BatteryMission,
  motor: MotorMission,
  wheel: WheelMission,
  antenna: AntennaMission,
}
