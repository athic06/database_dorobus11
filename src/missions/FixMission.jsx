import { useState } from 'react'
import MissionShell from './MissionShell.jsx'
import { useStore } from '../store.jsx'
import { BREAKABLE, today } from '../game/daily.js'

// A · 랜덤 고장 · 업무 이벤트: 오늘 고장 난 시설을 짧은 퀴즈로 고친다. 앞서 배운 개념을 다시 떠올리는 복습형.
const QUIZ = {
  carousel: { q: '회전목마 모터를 교체하기 전에 가장 먼저 해야 할 일은?', options: ['손님을 먼저 태운다', '전원을 끈다', '바로 모터를 뺀다'], answer: 1, hint: '전기가 흐르는 기계를 만질 때는 안전이 먼저예요.' },
  ferris: { q: '관람차 태양광 패널이 전기를 못 만들어요. 먼저 확인할 것은?', options: ['관람차 색깔', '패널의 먼지와 연결선', '광장 음악 소리'], answer: 1, hint: '햇빛을 받고 전기가 흐르는 길을 떠올려 봐요.' },
  coaster: { q: '롤러코스터의 가속도 센서는 무엇을 잴까요?', options: ['속도가 얼마나 빨라지는지', '바깥 온도', '손님 몸무게'], answer: 0, hint: '가속 = 속도가 빨라지는 것.' },
  sign: { q: '전광판의 도트 매트릭스는 무엇으로 글자를 만들까요?', options: ['종이를 붙여서', '작은 LED 점들을 켜고 꺼서', '페인트로 칠해서'], answer: 1, hint: '점(도트)들이 모여 있는 판이에요.' },
  sofa: { q: '소파 피아노 건반을 눌러도 소리가 안 나요. 먼저 확인할 것은?', options: ['소파 색깔', '건반과 스피커를 잇는 선', '방 조명 밝기'], answer: 1, hint: '소리가 지나가는 길을 떠올려 봐요.' },
  harmonia: { q: '광장 조명 규칙을 다시 넣어요. "만약 어두우면 → ?"', options: ['조명 끄기', '음악 끄기', '조명 켜기'], answer: 2, hint: '챕터 3에서 만든 규칙을 떠올려 봐요.' },
}
export const FIX_REWARD = 30
// 마이룸 가구 고장 (오래 비웠을 때)
const ROOM_ITEMS = { sofa: { name: '소파 피아노', fault: '오래 비운 사이 보이드가 건반을 만지다가 고장 냈어요' } }

export default function FixMission({ id, onClose, onFixed }) {
  const { progress, setProgress, addCell, recordAttempt, track } = useStore()
  const quiz = QUIZ[id]
  const item = BREAKABLE[id] || ROOM_ITEMS[id]
  const inRoom = !!ROOM_ITEMS[id]
  const [fb, setFb] = useState('')
  const [done, setDone] = useState(false)

  const choose = (i) => {
    const ok = i === quiz.answer
    recordAttempt(`fix-${id}`, ok)
    if (!ok) return setFb(`음… 힌트: ${quiz.hint}`)
    if (inRoom) setProgress({ sofaBroken: false })
    else {
      const d = today()
      const fixed = progress.work?.date === d ? progress.work.fixed : []
      setProgress({ work: { date: d, fixed: [...fixed, id] } })
      track('fix')
    }
    addCell(FIX_REWARD)
    setDone(true)
  }

  return (
    <MissionShell place={inRoom ? `마이룸 — ${item.name}` : `오늘의 업무 — ${item.name}`} title="고장 수리" feedback={done ? '' : fb} tone="bad" onClose={done ? null : onClose}>
      {done ? (
        <div className="clear">
          <div className="clear-badge">수리 완료</div>
          <h3>{item.name} 수리 완료!</h3>
          <p>업무 보상 CELL +{FIX_REWARD}</p>
          <button className="btn-primary" onClick={onFixed}>확인</button>
        </div>
      ) : (
        <>
          <div className="request">
            <span className="speaker sp-xylo">자일로</span>
            <p>{inRoom ? `“${item.name}가 고장 났네요. ${item.fault}. 같이 고쳐 봐요!”` : `“${item.name} 쪽에서 연락이 왔어요. ${item.fault}. 부탁해요!”`}</p>
          </div>
          <p className="q">{quiz.q}</p>
          <div className="dir-pad">
            {quiz.options.map((o, i) => <button key={o} className="dir-btn" onClick={() => choose(i)}>{o}</button>)}
          </div>
        </>
      )}
    </MissionShell>
  )
}
