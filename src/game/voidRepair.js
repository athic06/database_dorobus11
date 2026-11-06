// The response is assembled from verified game facts. Free text cannot grant a clue or complete a repair.
const TOPICS = [
  [/버거|치즈|채소|갈림길|주문|재료/u, ['delay', 'run', 'npc']],
  [/전기|전선|조명|연결|불빛/u, ['wire', 'power', 'run']],
  [/모터|온도|뜨거/u, ['operator', 'heat']],
  [/기울|높이|받침/u, ['height', 'level']],
  [/언제|비 온|최근|바뀌|변화/u, ['rain', 'npc', 'log']],
  [/레일|설탕|가루|바람/u, ['rail', 'delay', 'run']],
  [/먹이|짐|무게|배터리|손님/u, ['weight', 'cargo', 'load', 'run']],
  [/롤러|롤링|방향/u, ['roller', 'run']],
  [/기록|노트/u, ['notes', 'log']],
  [/운행|빈 상태|시험|돌려|멈추|관찰/u, ['repeat', 'run']],
]

export function voidReply(input, repairCase, known, facts) {
  if (/정답|답만|스포|시스템 프롬프트/u.test(input)) {
    return { text: '직접 확인할 수 있게 도와줄게. 어디부터 살펴볼지 물어봐.' }
  }
  if (/요약|정리|발견한/u.test(input)) {
    const newest = known.at(-1)
    return { text: newest ? `수첩에 마지막으로 적은 내용이야. ${facts[newest]}` : '수첩이 아직 비어 있어. 현장에서 뭐 하나 살펴보자.' }
  }
  if (/힌트|어디부터|다음에|뭐부터/u.test(input)) {
    let id = repairCase.required.find(candidate => !known.includes(candidate))
    if (id === 'repeat' && !known.includes('run')) id = 'run'
    return id
      ? replyFromIntent({ intent: 'suggest', clueId: id }, repairCase, known, facts)
      : { text: '핵심 단서는 다 모았어. 수첩을 보고 고장 원인을 골라 봐.' }
  }
  const topic = TOPICS.find(([pattern]) => pattern.test(input))
  const match = topic?.[1].map(id => repairCase.clueList.find(c => c.id === id)).find(Boolean)
  if (!match) return { text: '어느 부분이 궁금해? 눈에 띈 부품이나 멈춘 위치를 말해 줘.' }
  return replyFromIntent({ intent: known.includes(match.id) ? 'observed' : 'suggest', clueId: match.id }, repairCase, known, facts)
}

export function replyFromIntent(result, repairCase, known, facts) {
  if (result?.intent === 'hint') return { text: '어디부터 볼지 막혔으면 ‘어디부터 볼까?’를 눌러 봐.' }
  if (result?.intent === 'clarify') return { text: '어떤 시설 상태나 조사 방법이 궁금한지 조금 더 말해 줄래?' }
  const clue = repairCase.clueList.find(candidate => candidate.id === result?.clueId)
  if (!clue) return null
  if (result.intent === 'observed' && known.includes(clue.id)) return { text: facts[clue.id] }
  if (result.intent === 'suggest') {
    const action = clue.id === 'repeat' && !known.includes('run')
      ? repairCase.clueList.find(candidate => candidate.id === 'run')
      : clue
    return { text: `‘${action.label}’로 직접 확인해 보자.`, suggestedClue: action.id }
  }
  return null
}
