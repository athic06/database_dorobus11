import { useState } from 'react'

const EXAMPLES = ['동물과 사람이 함께 웃는 곳', '기술이 숲과 강을 지켜 주는 곳', '모두의 노래가 함께 울리는 곳']

// 코덱스의 질문 "너희가 생각하는 도로랜드의 미래는?"에 학생이 직접 답한다.
export default function FutureAnswer({ onSubmit }) {
  const [text, setText] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const v = text.trim()
    if (v.length < 5) {
      setErr('다섯 글자 이상 적어 주세요.')
      return
    }
    onSubmit(v)
  }

  return (
    <div className="modal-bg">
      <form className="mission future" onSubmit={submit}>
        <span className="mission-place">코덱스의 질문</span>
        <h2>너희가 생각하는 도로랜드의 미래는 어떤 모습이지?</h2>
        <label htmlFor="future-text" className="q">내가 꿈꾸는 도로랜드를 한 문장으로 적어 봐요.</label>
        <textarea
          id="future-text"
          value={text}
          maxLength={80}
          rows={3}
          onChange={(e) => { setText(e.target.value); setErr('') }}
          placeholder="예) 동물과 사람이 함께 웃는 곳"
          autoFocus
        />
        {err && <p className="feedback bad">{err}</p>}
        <div className="examples">
          {EXAMPLES.map((ex) => (
            <button type="button" key={ex} className="chip-item" onClick={() => { setText(ex); setErr('') }}>{ex}</button>
          ))}
        </div>
        <div className="mission-actions">
          <button type="submit" className="btn-primary">코덱스에게 답하기</button>
        </div>
      </form>
    </div>
  )
}
