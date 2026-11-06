import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { PARADE, PARADE_STAMP_TARGET, REPAIR_CASES, WORKSHOP, trialResult } from '../game/repairCases.js'
import { replyFromIntent, voidReply } from '../game/voidRepair.js'
import RepairScene from './RepairScene.jsx'
import FixMission from '../missions/FixMission.jsx'
import { BREAKABLE, pendingFaults } from '../game/daily.js'
import './repair.css'

const ART = `${import.meta.env.BASE_URL}repair/openmoji/`
const CATEGORY = ['관찰', '점검', '기록']
const STEPS = ['살펴보기', '가설 시험', '복구 완료']
const MIN_OBSERVATIONS = 2 // 가설을 세우기 전에 적어도 이만큼은 직접 살펴본다
const MIN_HYPOTHESIS = 8 // 가설은 한 문장 이상
const emptyRecords = Object.freeze({})
const image = (id) => `${ART}${id}.svg`
const geminiDemo = import.meta.env.DEV && import.meta.env.MODE === 'repair-demo'
const fieldPrompts = {
  food: '어떤 재료부터 떨어지는지 같이 보자.',
  carousel: '빈 상태로 한 바퀴 돌려 보자. 멈춘 자리를 기억해 둬.',
  safari: '3호차를 출발시켜 보자. 평지에선 잘 가는지도 봐.',
  viking: '운행 모드가 두 개야. 하나씩 돌려 보고 어디서 덜컹하는지 봐.',
  coaster: '아침과 저녁 운행을 비교해 보자. 마지막 언덕에서 뭐가 다를까?',
  sign: '낮 화면부터 보고, 장식 불을 켜 보자. 몇 번째 줄이 달라질까?',
  parade: '차량이 출발할 자리부터 무대까지 걸어 보자.',
  delivery: '상자를 하나 올려 봐. 어느 롤러에서 멈추는지 보자.',
}

function CasePlay({ item, records, investigation, surface, save, onComplete, onBack }) {
  const [phase, setPhase] = useState(() => {
    if (records[item.id]) return 'complete'
    return investigation.diagnosed ? 'bench' : 'field'
  })
  const [category, setCategory] = useState('관찰')
  const [sideTab, setSideTab] = useState('chat') // 오른쪽 창: 대화 | 수첩
  const [guessing, setGuessing] = useState(false) // 가설 세우기 창
  const [known, setKnown] = useState(investigation.known ?? [])
  const [fact, setFact] = useState(() => investigation.diagnosed
    ? '부품을 조정하고 두 조건에서 시험해 보자.'
    : fieldPrompts[item.id])
  // 아이가 직접 적는 것들: 관찰마다 든 생각, 가설(문장)과 그 근거로 고른 관찰
  const [thoughts, setThoughts] = useState(investigation.thoughts ?? {})
  const [draft, setDraft] = useState(investigation.hypothesis?.text ?? '')
  const [evidence, setEvidence] = useState(investigation.hypothesis?.evidence ?? [])
  const [myHypothesis, setMyHypothesis] = useState(investigation.hypothesis ?? null)
  const [tries, setTries] = useState(investigation.tries ?? 0) // 가설을 세운 횟수
  const [hintLevel, setHintLevel] = useState(0) // ‘막혔어’를 누를 때마다 도움이 조금씩 구체적으로
  const [question, setQuestion] = useState('')
  const [chat, setChat] = useState([])
  const [asking, setAsking] = useState(false)
  const [settings, setSettings] = useState(() => Object.fromEntries(Object.entries(item.controls).map(([id, spec]) => [id, investigation.settings?.[id] ?? spec.initial])))
  const [verified, setVerified] = useState(investigation.verified ?? [])
  const [trial, setTrial] = useState(null)
  const [inspected, setInspected] = useState(null)
  const [running, setRunning] = useState(false)
  const timer = useRef(null)
  const pendingQuestion = useRef(null)
  const completed = useRef(false)
  const titleRef = useRef(null)
  const actionRef = useRef(null)
  const evidenceReadyRef = useRef(null)
  const chatLogRef = useRef(null)
  const facts = Object.fromEntries(item.clueList.map(clue => [clue.id, clue.fact]))
  const noteCount = known.length
  const canHypothesize = known.length >= MIN_OBSERVATIONS
  const inWorld = surface === 'world'
  const working = phase === 'field' || phase === 'bench'
  const activeStep = ['field', 'bench', 'complete'].indexOf(phase)
  const portrait = <img className="repair-case-portrait" src={`${import.meta.env.BASE_URL}portraits/void.svg`} alt="보이드" />

  useEffect(() => () => {
    window.clearTimeout(timer.current)
    pendingQuestion.current?.abort()
  }, [])
  useEffect(() => { titleRef.current?.focus({ preventScroll: true }) }, [phase])
  useEffect(() => {
    const log = chatLogRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [chat])

  const record = (clue) => {
    if (!known.includes(clue.id)) {
      const next = [...known, clue.id]
      setKnown(next)
      save({ known: next })
    }
    setFact(clue.fact)
  }
  const animate = (ok, done, kind, index) => {
    if (running) return
    setRunning(true)
    const duration = item.id === 'food' || item.id === 'coaster' ? 3000 : 2200
    const run = { start: performance.now(), duration, ok, kind, index }
    setTrial(run)
    timer.current = window.setTimeout(() => {
      setRunning(false)
      done()
    }, duration)
  }
  const inspect = (clue) => {
    setInspected(clue.id)
    if (['run', 'repeat', 'kids'].includes(clue.id) || (item.id === 'food' && clue.id === 'delay') || (item.id === 'parade' && clue.id === 'route')) {
      setFact(item.id === 'food' ? '투입구 바로 아래를 봐. 재료가 하나씩 떨어져.' : '움직임이 달라지는 순간을 눈여겨봐.')
      animate(clue.id === 'kids', () => record(clue), clue.id)
    } else {
      setTrial(null)
      record(clue)
    }
  }
  const submitHypothesis = () => {
    const text = draft.trim()
    if (text.length < MIN_HYPOTHESIS) {
      setFact('조금 더 자세히 적어 볼래? 무엇이 왜 그렇게 됐는지 한 문장으로.')
      return
    }
    if (!evidence.length) {
      setFact('어떤 관찰 때문에 그렇게 생각했는지 하나 이상 골라 줘.')
      return
    }
    pendingQuestion.current?.abort()
    pendingQuestion.current = null
    setAsking(false)
    setChat(previous => previous.filter(message => message.reply))
    setTrial(null)
    const next = { text, evidence }
    setMyHypothesis(next)
    setTries(tries + 1)
    save({ diagnosed: true, hypothesis: next, tries: tries + 1 })
    setGuessing(false)
    setHintLevel(0)
    setPhase('bench')
    setFact('네 가설을 시험해 보자. 가설이 맞다면 어떤 부품을 어떻게 바꿔야 할까? 바꾸기 전에 결과를 먼저 예상해 봐.')
  }
  // 시험이 생각대로 안 되면 다시 현장으로 돌아가 관찰하고 가설을 고칠 수 있다
  const rethink = () => {
    if (running) return
    setTrial(null)
    save({ diagnosed: false })
    setPhase('field')
    setHintLevel(0)
    setFact('다시 살펴보자. 아직 안 해 본 조사가 있을까? 새로 알게 된 걸로 가설을 고쳐 봐.')
  }
  const writeThought = (id, value) => setThoughts(previous => ({ ...previous, [id]: value }))
  const keepThoughts = () => save({ thoughts })
  // ‘막혔어’: 처음엔 생각을 정리하게 묻고, 다시 누르면 조사 방향, 그다음에야 구체적인 도움
  const stuck = () => {
    const level = hintLevel
    setHintLevel(Math.min(level + 1, 2))
    let text
    if (phase === 'field') {
      const missing = item.clueList.find(clue => item.required.includes(clue.id) && !known.includes(clue.id))
      if (level === 0) text = '지금까지 본 것 중에 평소와 다른 점은 뭐였어? 언제, 어디서 문제가 생기는지 수첩에 먼저 정리해 보자.'
      else if (level === 1) text = missing ? `‘${missing.type}’ 쪽 조사로 새로 알 수 있는 게 있을지도 몰라. 어떤 걸 확인해 볼래?` : '관찰은 충분히 모은 것 같아. 수첩을 보면서 네 생각으로 가설을 세워 봐.'
      else text = missing ? item.hints[Math.min(item.required.indexOf(missing.id), item.hints.length - 1)] ?? item.hints.at(-1) : '수첩에 적은 관찰들 사이에 공통점이 있는지 찾아봐.'
    } else {
      const firstControl = Object.values(item.controls)[0]
      if (level === 0) text = '네 가설이 맞다면 어떤 부품을 어떻게 바꿔야 할까? 결과를 먼저 예상하고 시험해 봐.'
      else if (level === 1) text = '한 번에 한 가지만 바꾸고 시험하면 무엇이 효과가 있는지 알 수 있어.'
      else text = `‘${firstControl.label}’을 바꾸면 결과가 어떻게 달라지는지 비교해 봐.`
    }
    setChat(previous => [...previous.slice(-3), { input: '막혔어', reply: { text } }])
  }
  const test = (index) => {
    const ok = trialResult(item, settings, index)
    animate(ok, () => {
      if (!ok) {
        setFact(`${item.fail} 네 가설로 이 결과를 설명할 수 있어? 설정을 바꿔 보거나 가설을 다시 세워 봐.`)
        return
      }
      const next = [...new Set([...verified, index])]
      setVerified(next)
      save({ verified: next })
      setFact(item.pass)
      if (next.length === item.tests.length && !completed.current) {
        completed.current = true
        onComplete()
        setPhase('complete')
      }
    }, 'test', index)
  }
  const adjust = (id, value) => {
    if (running || settings[id] === Number(value)) return
    const next = { ...settings, [id]: Number(value) }
    const stillVerified = verified.filter(index => item.testControls?.[index] && !item.testControls[index].includes(id))
    setSettings(next)
    setVerified(stillVerified)
    setTrial(null)
    setFact('설정을 바꿨어요. 아래에서 시험해 보세요.')
    save({ settings: next, verified: stillVerified })
  }
  const ask = async (input, quick = false) => {
    input = input.trim()
    if (!input || pendingQuestion.current) return
    if (!quick) setQuestion('')
    let reply = voidReply(input, item, known, facts)
    if (phase === 'bench') {
      const nextTest = item.tests.find((_, index) => !verified.includes(index))
      if (running) reply = { text: '지금 시험 중이야. 장치가 끝까지 움직이는지 먼저 보자.' }
      else if (/지금|현재|설정|어디에|어느 쪽/u.test(input) && !quick) {
        const current = Object.entries(item.controls).map(([id, spec]) => `${spec.label}은 ‘${spec.options[settings[id]]}’`)
        reply = { text: `작업대에서 지금 고른 값이야. ${current.join(', ')}.` }
      }
      else if (trial && !trial.ok) reply = { text: item.fail + ' 네 가설과 어떻게 달라?' }
      else if (quick || /시험|다음|힌트|뭐부터|어디부터/u.test(input)) {
        reply = { text: nextTest
          ? `‘${nextTest}’부터 해 보자. 부품을 조정한 뒤 실제로 어떻게 움직이는지 확인할 수 있어.`
          : '모든 시험을 통과했어.' }
      } else {
        reply = { text: '네 가설에 따르면 어떤 결과가 나와야 해? 예상해 보고 시험해서 확인해 봐.' }
      }
    }
    if (geminiDemo && phase === 'field' && !quick && !/힌트|어디부터|다음에|뭐부터/u.test(input)) {
      const controller = new AbortController()
      pendingQuestion.current = controller
      setAsking(true)
      setChat(previous => [...previous.slice(-3), { input, reply: null }])
      try {
        const response = await fetch('/api/void-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: item.id, known, question: input }),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
        })
        if (response.ok) {
          const result = await response.json()
          reply = replyFromIntent(result, item, known, facts) ?? reply
        }
      } catch {
        // Local guidance also covers missing credentials, rate limits and offline demos.
      }
      if (controller.signal.aborted) return
      pendingQuestion.current = null
      setAsking(false)
      setChat(previous => [...previous.slice(0, -1), { input, reply }])
      return
    }
    setChat(previous => [...previous.slice(-3), { input, reply }])
  }

  // 게임 화면 배치: 2D 장면이 화면 전체를 채우고, 그 위에
  //  왼쪽 위: 사건 제목과 진행 단계 / 오른쪽: 보이드 대화와 정비 수첩 / 아래: 보이드 대사와 조사·수리 버튼
  return (
    <section className={`repair-case repair-stage${inWorld ? ' in-world' : ' in-desk'}`}>
      <div className="repair-stage-scene">
        <RepairScene item={item} settings={settings} trial={trial} inspected={inspected} field={phase === 'field'} finished={phase === 'complete' && !trial} stage />
      </div>

      <header className="repair-hud-title">
        {portrait}
        <div>
          <p className="repair-kicker">
            {item.district} <span aria-hidden="true">/</span> {inWorld ? '축제 전 시설 점검' : '마이룸 정비 작업실'}
          </p>
          <h2 ref={titleRef} tabIndex={-1}>{item.title}</h2>
          <ol className="repair-steps" aria-label="수리 진행 단계">
            {STEPS.map((label, index) => (
              <li key={label} aria-current={index === activeStep ? 'step' : undefined} data-done={index < activeStep}>
                <span aria-hidden="true">{index < activeStep ? '✓' : index + 1}</span>{label}
              </li>
            ))}
          </ol>
        </div>
      </header>

      <aside className="repair-hud-side">
        <div className="repair-side-tabs" role="tablist" aria-label="보이드 창">
          <button role="tab" aria-selected={sideTab === 'chat'} onClick={() => setSideTab('chat')}>보이드와 대화</button>
          <button role="tab" aria-selected={sideTab === 'notes'} onClick={() => setSideTab('notes')}>정비 수첩 <span>{noteCount}/{item.clueList.length}</span></button>
        </div>
        {sideTab === 'chat' && (
          <section className="repair-conversation" aria-label="보이드와 대화">
            <div className="repair-chat-log" ref={chatLogRef} role="log" aria-label="보이드 대화 기록">
              <p className="repair-chat-bubble">{phase === 'bench' ? '작업대를 열었어. 어떤 부품이나 시험이 궁금해?' : phase === 'complete' ? item.resolution : item.request}</p>
              {chat.map(({ input, reply }, index) => {
                return <div className="repair-chat-turn" key={index}>
                  <p className="repair-chat-bubble repair-chat-player"><b>나</b>{input}</p>
                  <div className="repair-chat-bubble">
                    <p>{reply?.text ?? '생각 중…'}</p>
                  </div>
                </div>
              })}
            </div>
            {working && <>
              <button className="repair-chat-prompt" type="button" disabled={asking} onClick={stuck}>막혔어, 도와줘</button>
              <form className="repair-chat" onSubmit={event => {
                event.preventDefault()
                void ask(question)
              }}>
                <input aria-label="보이드에게 질문" placeholder="궁금한 점을 물어봐" value={question} maxLength={180} onChange={event => setQuestion(event.target.value)} />
                <button className="repair-primary" type="submit" disabled={asking || !question.trim()}>보내기</button>
              </form>
            </>}
          </section>
        )}
        {sideTab === 'notes' && (
          <section className="repair-notes" aria-label="정비 수첩">
            {myHypothesis && <div className="repair-my-hypothesis"><b>내 가설</b><p>{myHypothesis.text}</p></div>}
            {known.length ? <ul className="repair-note-list">{known.map(id => (
              <li key={id}>
                <p className="repair-note-fact">{facts[id]}</p>
                <textarea
                  className="repair-note-thought"
                  aria-label="이 관찰에 대한 내 생각"
                  placeholder="이걸 보고 어떤 생각이 들었어? (예: 왜 그럴까? 다른 곳과 뭐가 달라?)"
                  value={thoughts[id] ?? ''}
                  maxLength={200}
                  rows={2}
                  onChange={event => writeThought(id, event.target.value)}
                  onBlur={keepThoughts}
                />
              </li>
            ))}</ul> : <p>아직 기록이 없어요. 현장에서 직접 살펴본 것을 여기 모아요.</p>}
            {item.id === 'parade' && known.includes('notes') && <ul>{REPAIR_CASES.filter(candidate => records[candidate.id]).map(candidate => <li key={candidate.id}><b>{candidate.district}</b> {candidate.resolution}</li>)}</ul>}
          </section>
        )}
      </aside>

      {working && (
        <div className="repair-hud-bottom">
          {/* 보이드 대사: 게임 대화창처럼 버튼 바로 위에 띄운다 */}
          <div className="repair-hud-line" role="status">
            {portrait}
            <p><b>보이드</b>{fact}</p>
            {phase === 'field' && inspected && <button className="repair-text-button" onClick={() => setSideTab('notes')}>수첩에 내 생각 적기</button>}
          </div>

          {phase === 'field' && (
            <div className="repair-hud-actions">
              <div className="repair-tabs" aria-label="조사 방법">
                {CATEGORY.filter(type => item.clueList.some(clue => clue.type === type)).map(type => (
                  <button key={type} aria-pressed={type === category} onClick={() => setCategory(type)}>{type}</button>
                ))}
              </div>
              <div className="repair-action-row" ref={actionRef}>
                {item.clueList.filter(clue => clue.type === category).map(clue => (
                  <button key={clue.id} className="repair-action" data-done={known.includes(clue.id)} disabled={running || (clue.id === 'repeat' && !known.includes('run'))} onClick={() => inspect(clue)}>
                    {clue.label}{known.includes(clue.id) ? ' ✓' : ''}
                  </button>
                ))}
                <button className="repair-action repair-action-go" disabled={running || !canHypothesize} onClick={() => setGuessing(true)}
                  title={canHypothesize ? '' : `먼저 ${MIN_OBSERVATIONS}가지 이상 살펴봐요`}>내 가설 세우기 →</button>
              </div>
              <span className="repair-evidence">살펴본 것 {known.length}개</span>
            </div>
          )}

          {phase === 'bench' && myHypothesis && (
            <div className="repair-hud-hypothesis"><b>내 가설</b><span>{myHypothesis.text}</span><button className="repair-text-button" disabled={running} onClick={rethink}>다시 조사하고 고치기</button></div>
          )}
          {phase === 'bench' && (
            <div className="repair-hud-actions">
              <div className="repair-bench-row">
                {Object.entries(item.controls).map(([id, spec]) => item.id === 'carousel' ? (
                  <label key={id} className="repair-control">{spec.label}
                    <div className="repair-range"><input type="range" min={0} max={spec.options.length - 1} value={settings[id]} disabled={running} aria-valuetext={spec.options[settings[id]]} onChange={event => adjust(id, event.target.value)} /><output>{spec.options[settings[id]]}</output></div>
                  </label>
                ) : (
                  <fieldset key={id} className="repair-control" disabled={running}>
                    <legend>{spec.label}</legend>
                    <div className="repair-chips">{spec.options.map((option, index) => (
                      <button key={option} type="button" aria-pressed={settings[id] === index} onClick={() => adjust(id, index)}>{option}</button>
                    ))}</div>
                  </fieldset>
                ))}
              </div>
              <div className="repair-action-row" aria-label="시험 운행">
                {item.tests.map((label, index) => {
                  const current = trial?.kind === 'test' && trial.index === index
                  const status = current && running ? '시험 중…' : verified.includes(index) ? '통과' : current && !trial.ok ? '다시 점검' : '시험하기'
                  return <button key={label} className="repair-action repair-test" disabled={running} data-status={status} onClick={() => test(index)}>
                    <strong>{label}</strong><span>{status}</span>
                  </button>
                })}
                <span className="repair-evidence">시험 통과 {verified.length} / {item.tests.length}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 원인 고르기: 장면 위에 뜨는 선택 창 */}
      {phase === 'field' && guessing && (
        <div className="repair-overlay" onClick={event => event.target === event.currentTarget && setGuessing(false)}>
          <fieldset className="repair-hypotheses repair-overlay-card" ref={evidenceReadyRef}>
            <legend>왜 이런 일이 생겼을까?</legend>
            <p className="repair-overlay-line"><b>보이드</b>정답을 맞히는 게 아니라 네 생각을 적는 거야. 틀려도 괜찮아, 작업대에서 직접 시험해 보면 돼.</p>
            <textarea className="repair-hypothesis-input" aria-label="내 가설" placeholder="예: ○○ 때문에 △△가 되어서 멈추는 것 같아."
              value={draft} maxLength={200} rows={3} autoFocus onChange={event => setDraft(event.target.value)} />
            <p className="repair-overlay-sub">어떤 관찰 때문에 그렇게 생각했어?</p>
            <div className="repair-evidence-pick">
              {known.map(id => (
                <label key={id}>
                  <input type="checkbox" checked={evidence.includes(id)} onChange={() => setEvidence(previous => previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id])} />
                  <span>{facts[id]}{thoughts[id] ? <em> · 내 생각: {thoughts[id]}</em> : null}</span>
                </label>
              ))}
            </div>
            <p className="repair-overlay-line repair-overlay-status" role="status">{fact}</p>
            <div className="repair-overlay-buttons">
              <button className="repair-text-button" onClick={() => setGuessing(false)}>더 조사하기</button>
              <button className="repair-primary" disabled={running} onClick={submitHypothesis}>작업대에서 시험해 보기</button>
            </div>
          </fieldset>
        </div>
      )}

      {phase === 'complete' && (
        <div className="repair-overlay">
          <div className="repair-success repair-overlay-card">
            <img src={image(item.asset)} alt="" />
            <h2>{item.id === 'parade' ? '축제가 열렸어요!' : '시설이 다시 움직여요!'}</h2>
            {myHypothesis && <div className="repair-compare">
              <div><b>내가 세운 가설</b><p>{myHypothesis.text}</p></div>
              <div><b>실제로 일어난 일</b><p>{item.resolution}</p></div>
            </div>}
            {!myHypothesis && <p>{item.resolution}</p>}
            {tries > 1 && <p className="repair-tries">가설을 {tries}번 고쳐 세우며 찾아냈어요!</p>}
            {item.part && <p>정비 인증 스탬프 · 해금 부품 <b>{item.part}</b></p>}
            {item.id === 'parade' && (
              <div className="repair-license">
                <span aria-hidden="true">🪪</span>
                <div><b>원격 수리 자격증을 받았어요!</b><p>이제 마이룸 컴퓨터의 ‘원격 수리실’에서 도로랜드 시설을 원격으로 고칠 수 있어요.</p></div>
              </div>
            )}
            <button className="repair-primary" onClick={onBack}>{inWorld ? '도로랜드로 돌아가기' : '작업 목록으로'}</button>
          </div>
        </div>
      )}
    </section>
  )
}

function SavedCase({ item, surface, onBack }) {
  const { progress, setProgress } = useStore()
  const records = progress.festivalRepairs ?? emptyRecords
  const investigation = progress.festivalInvestigations?.[item.id] ?? emptyRecords
  return <CasePlay key={item.id} item={item} surface={surface} records={records} investigation={investigation} onBack={onBack}
    save={patch => setProgress(current => ({
      festivalInvestigations: {
        ...current.festivalInvestigations,
        [item.id]: { ...current.festivalInvestigations?.[item.id], ...patch },
      },
    }))}
    onComplete={() => setProgress(current => ({
      festivalRepairs: { ...current.festivalRepairs, [item.id]: true },
      // 스토리 수리를 모두 마치면(개막 퍼레이드) 원격 수리 자격증
      ...(item.id === 'parade' ? { remoteLicense: true } : {}),
    }))}
  />
}

export function FestivalField({ item, onClose }) {
  useEffect(() => {
    const closeOnEscape = event => {
      if (event.key === 'Escape' && !event.isComposing) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <main className="repair-field-screen repair-page" aria-label="보이드와 함께하는 고장 수사대">
      <SavedCase item={item} surface="world" onBack={onClose} />
      <button className="repair-hud-back" onClick={onClose} title="도로랜드로 돌아가기 (Esc)">← 도로랜드로 <kbd>Esc</kbd></button>
      <AssetCredit />
    </main>
  )
}

function AssetCredit() {
  return <footer className="repair-credit">아이콘 <a href="https://openmoji.org/">OpenMoji</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> · 버거 재료 <a href="https://davemarian.itch.io/food-and-ingredients-assets-from-gamejam">Dave Marian</a></footer>
}

// 마이룸 컴퓨터의 원격 수리실. 스토리 수리를 모두 마쳐 원격 수리 자격증을 받으면 열린다.
// 자격증이 있으면 도로랜드에 가지 않고도 오늘 고장 난 시설을 고치고, 원격 의뢰를 받을 수 있다.
export function FestivalDesk() {
  const { user, progress } = useStore()
  const [active, setActive] = useState(null)
  const [fixing, setFixing] = useState(null)
  const records = progress.festivalRepairs ?? emptyRecords
  const stamps = REPAIR_CASES.filter(item => records[item.id]).length
  const licensed = progress.remoteLicense || !!records.parade
  const archive = licensed ? [...REPAIR_CASES, PARADE].filter(item => records[item.id]) : []
  const item = [WORKSHOP, ...archive].find(candidate => candidate.id === active)
  const faults = licensed && progress.carCheckDone ? pendingFaults(user.id, progress.work) : []
  return (
    <section className={`repair-page repair-desk${item ? ' has-case' : ''}`}>
      {item ? (
        <>
          <SavedCase item={item} surface="desk" onBack={() => setActive(null)} />
          <button className="repair-hud-back" onClick={() => setActive(null)}>← 원격 수리실</button>
        </>
      ) : (
        <>
          <p className="repair-kicker">DORO OS / 마이룸</p>
          <h2>원격 수리실</h2>
          {!licensed ? (
            <div className="repair-locked">
              <span aria-hidden="true">🔒</span>
              <div>
                <b>원격 수리 자격증이 필요해요</b>
                <p>도로랜드에서 축제 시설을 고치고(스탬프 {stamps}/{PARADE_STAMP_TARGET}) 개막 퍼레이드까지 마치면 자격증을 받아요. 그다음부터는 여기서도 수리할 수 있어요.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="repair-license">
                <span aria-hidden="true">🪪</span>
                <div><b>원격 수리 자격증</b><p>{user.name} · 도로랜드 정비 인증 스탬프 {stamps}/{REPAIR_CASES.length}</p></div>
              </div>
              <h3>오늘 고장 난 시설</h3>
              {faults.length ? (
                <div className="repair-cards">
                  {faults.map(id => (
                    <button key={id} className="repair-card repair-card-fault" onClick={() => setFixing(id)}>
                      <strong>⚠ {BREAKABLE[id].name}</strong>
                      <span>{BREAKABLE[id].fault}</span>
                      <span>원격으로 수리하기</span>
                    </button>
                  ))}
                </div>
              ) : <p>오늘 고장 난 시설은 모두 고쳤어요.</p>}
              <h3>원격 의뢰</h3>
              <div className="repair-cards">
                <button className="repair-card" onClick={() => setActive(WORKSHOP.id)}>
                  <img src={image(WORKSHOP.asset)} alt="" />
                  <strong>{WORKSHOP.title}</strong>
                  <span>{records.delivery ? '완료 기록 보기' : progress.festivalInvestigations?.delivery ? '작업 이어하기' : '새 의뢰 시작'}</span>
                </button>
              </div>
              <h3>축제 시설 수리 기록</h3>
              <div className="repair-cards">
                {archive.map(candidate => (
                  <button key={candidate.id} className="repair-card" onClick={() => setActive(candidate.id)}>
                    <img src={image(candidate.asset)} alt="" />
                    <strong>{candidate.title}</strong>
                    <span>완료 기록 보기</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {fixing && <FixMission id={fixing} onClose={() => setFixing(null)} onFixed={() => setFixing(null)} />}
      <AssetCredit />
    </section>
  )
}
