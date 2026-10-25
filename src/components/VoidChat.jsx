import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { pendingFaults, BREAKABLE } from '../game/daily.js'

// D · LLM 대화형 나만의 로봇 (체험판).
// 실제 서비스에서는 이 대화 기록(ROBOT_CHAT)과 성격 설정을 LLM에 넘겨 답을 만든다.
// 프로토타입에서는 API 키 없이 돌아가도록 키워드 규칙으로 답한다.
const PERSONAS = {
  kind: { label: '다정한', end: (t) => `${t} 😊`, hello: '안녕! 오늘도 와 줘서 고마워.' },
  brave: { label: '씩씩한', end: (t) => `${t}! 삐빅!`, hello: '안녕! 오늘도 출동 준비 완료' },
  silly: { label: '엉뚱한', end: (t) => `${t}… 삐빅? 헤헤`, hello: '안녕! 나 방금 내 바퀴랑 술래잡기 했어' },
}

function reply(text, ctx) {
  const t = text.replace(/\s/g, '')
  const P = PERSONAS[ctx.persona]
  if (/안녕|하이|hello|hi/i.test(t)) return P.end(P.hello)
  if (/이름|누구/.test(t)) return P.end('나는 보이드! 몸통에 V.I.D라고 쓰여 있어서 제로가 지어 준 이름이야')
  if (/코덱스/.test(t)) return P.end('코덱스는 숲을 지켜 온 수호자래. 같이 진실을 보러 가자고 했지')
  if (/하모니아|음악|노래/.test(t)) return P.end('하모니아의 노래가 들리면 내 회로도 신나게 반짝여')
  if (/자일로/.test(t)) return P.end('자일로 앞에서는 이상하게 몸이 안 움직여… 왜일까?')
  if (/리코|제로/.test(t)) return P.end('제로랑 리코는 내 최고의 친구야. 둘 앞에서만 춤출 수 있어')
  if (/미래|꿈/.test(t)) return P.end(ctx.future ? `네가 말한 도로랜드의 미래, 「${ctx.future}」 정말 멋졌어` : '도로랜드의 미래는 우리가 같이 만들어 가는 거래')
  if (/춤|댄스/.test(t)) return '(보이드가 바퀴를 굴리며 신나게 춤을 춘다) 삐빅 삐빅!'
  if (/고장|업무|일/.test(t)) {
    return ctx.faults.length
      ? P.end(`오늘 고장 난 곳은 ${ctx.faults.map((f) => BREAKABLE[f].name).join(', ')}. 같이 고치러 가자`)
      : P.end('오늘 업무는 다 끝났어. 최고야')
  }
  if (/코딩|블록|챌린지/.test(t)) return P.end('미니게임의 코딩 챌린지에서 블록을 적게 쓰는 기록에 도전해 봐')
  if (/기분|어때|괜찮/.test(t)) return P.end('배터리 100%! 기분 최고야')
  if (/고마|사랑|좋아/.test(t)) return P.end('나도! 나를 만들어 줘서 고마워')
  const fallback = ['음… 그건 아직 잘 모르겠어. 도로랜드 얘기라면 자신 있어', '삐빅, 처리 중… 다른 말로 물어봐 줄래?', '그 얘기 재밌다! 더 들려줘']
  return P.end(fallback[text.length % fallback.length])
}

export default function VoidChat({ onClose }) {
  const { user, progress, setProgress } = useStore()
  const [text, setText] = useState('')
  const log = progress.robotChat
  const end = useRef()

  useEffect(() => {
    // 최근 브라우저에서 scrollIntoView가 Promise를 돌려줄 수 있어 반환값을 넘기지 않는다
    end.current?.scrollIntoView({ block: 'end' })
  }, [log.length])
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const send = (e) => {
    e.preventDefault()
    const v = text.trim()
    if (!v) return
    const ans = reply(v, { persona: progress.robotPersona, future: progress.futureAnswer, faults: pendingFaults(user.id, progress.work) })
    setProgress({ robotChat: [...log, { role: 'me', text: v }, { role: 'void', text: ans }].slice(-40) })
    setText('')
  }

  return (
    <div className="modal-bg" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mission chat-panel" role="dialog" aria-modal="true" aria-labelledby="void-chat-title">
        <div className="mission-head">
          <div>
            <span className="mission-place">나만의 로봇 · 체험판</span>
            <h2 id="void-chat-title">🤖 보이드와 대화하기</h2>
          </div>
          <button className="close" onClick={onClose} aria-label="닫기">×</button>
        </div>
        <div className="persona">
          <span>보이드의 성격</span>
          {Object.entries(PERSONAS).map(([k, v]) => (
            <button key={k} className={progress.robotPersona === k ? 'chip-item on' : 'chip-item'} aria-pressed={progress.robotPersona === k} onClick={() => setProgress({ robotPersona: k })}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="chat-log" aria-live="polite">
          {log.length === 0 && <p className="small">보이드에게 말을 걸어 봐요. 예: 안녕 · 네 이름은? · 오늘 업무 있어? · 춤춰 줘</p>}
          {log.map((m, i) => (
            <p key={i} className={`msg ${m.role}`}>{m.text}</p>
          ))}
          <span ref={end} />
        </div>
        <form className="chat-input" onSubmit={send}>
          <input id="void-chat-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="보이드에게 말하기" maxLength={80} aria-label="보이드에게 보낼 말" autoFocus />
          <button type="submit" className="btn-primary">보내기</button>
        </form>
        <p className="small">체험판은 정해진 규칙으로 대답해요. 실제 서비스에서는 대화 기록과 성격 설정을 LLM에 연결해요.</p>
      </div>
    </div>
  )
}
