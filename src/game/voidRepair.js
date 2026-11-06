// 보이드의 답은 게임이 확인한 사실로만 만든다. 자유 입력으로 단서를 얻거나 수리를 끝낼 수는 없다.
// 기준 문서 대화 규칙: 확인 안 된 단서는 먼저 말하지 않고, NPC 증언은 그 NPC에게 묻게 하고,
// 점검으로 알 수 있는 건 점검하게 하고, 오답 가설에는 검증 방법을 제안한다.
const TOPICS = [
  [/운행|빈 상태|시험|돌려|멈추|멈춰|관찰|덜컹|모드/u, ['run', 'kids', 'repeat', 'hill']],
  [/배터리|충전/u, ['battery', 'npc', 'deco', 'weight']],
  [/바퀴|타이어|공기압/u, ['tire', 'wheel', 'run']],
  [/모터|회전축|온도|뜨거/u, ['motor', 'operator', 'heat', 'temp', 'wheel']],
  [/LED|엘이디|장식/u, ['ledoff', 'deco', 'npc', 'wire']],
  [/전구/u, ['bulb']],
  [/전기|전선|조명|연결|불빛|전력/u, ['wire', 'power', 'electric', 'lights', 'run']],
  [/글자|프로그램/u, ['text', 'run']],
  [/날씨|비 |비가|습기/u, ['weather', 'rain', 'cleaner']],
  [/버거|치즈|채소|갈림길|주문|재료|순서/u, ['order', 'delay', 'run', 'stock', 'log']],
  [/기울|높이|받침|수평|구슬/u, ['height', 'level']],
  [/레일|설탕|가루|바람|개미|끈적/u, ['rail', 'wind', 'cleaner', 'speed']],
  [/속도|느려|빨라/u, ['speed', 'boost', 'run']],
  [/좌석|부품|상자|교체|밑에|실었|실려|짐칸/u, ['deco', 'cargo', 'npc', 'obstacle', 'load']],
  [/먹이|짐|무게|무거|손님|승객/u, ['weight', 'cargo', 'load', 'log', 'run']],
  [/풍선/u, ['balloon', 'load']],
  [/무대|길|경로|막/u, ['route', 'obstacle']],
  [/롤러|롤링|방향/u, ['roller', 'run']],
  [/기록|노트/u, ['notes', 'log']],
  [/언제|최근|바뀌|변화|달라/u, ['guide2', 'cleaner', 'deco', 'staff', 'npc', 'log']],
]
const GUESS = /때문|같아|아닐까|인가|거야|인 듯|탓|일까/u

export function voidReply(input, repairCase, known, facts) {
  if (/정답|답만|답 알려|스포|시스템 프롬프트/u.test(input)) {
    return { text: '정답은 직접 찾아야 더 재밌어! 막혔으면 ‘막혔어, 도와줘’를 눌러. 한 단계씩 도와줄게.' }
  }
  if (/요약|정리|발견한/u.test(input)) {
    const newest = known.at(-1)
    return { text: newest ? `수첩에 마지막으로 적은 내용이야. ${facts[newest]}` : '수첩이 아직 비어 있어. 현장에서 뭐 하나 살펴보자.' }
  }
  if (/힌트|어디부터|다음에|뭐부터/u.test(input)) {
    return { text: '먼저 네 생각을 들려줘. 지금까지 본 것 중에 이상했던 건 뭐야? 정말 막혔으면 ‘막혔어, 도와줘’를 눌러.' }
  }
  // 아이가 원인을 추측하면: 오답 가설이면 확인할 방법을 제안하거나 이미 본 단서로 반박한다
  if (GUESS.test(input)) {
    const handler = repairCase.judge?.wrong?.find(candidate => candidate.re.test(input))
    if (handler) return { text: known.includes(handler.clue) ? handler.refute : handler.ask }
  }
  const candidates = TOPICS.filter(([pattern]) => pattern.test(input)).flatMap(([, ids]) => ids)
  const match = candidates.map(id => repairCase.clueList.find(c => c.id === id)).find(Boolean)
  if (!match) {
    if (/왜|이유|원인/u.test(input)) return { text: '좋은 질문이야! 네 생각엔 왜 그런 것 같아? 수첩에 적고, 그걸 확인할 조사를 골라 봐.' }
    return { text: '어느 부분이 궁금해? 눈에 띈 부품이나 멈춘 위치를 말해 줘.' }
  }
  return replyFromIntent({ intent: known.includes(match.id) ? 'observed' : 'suggest', clueId: match.id }, repairCase, known, facts)
}

export function replyFromIntent(result, repairCase, known, facts) {
  if (result?.intent === 'hint') return { text: '답을 알려 주진 않을게. 대신 같이 생각해 보자. 막혔으면 ‘막혔어, 도와줘’를 눌러.' }
  if (result?.intent === 'clarify') return { text: '어떤 시설 상태나 조사 방법이 궁금한지 조금 더 말해 줄래?' }
  const clue = repairCase.clueList.find(candidate => candidate.id === result?.clueId)
  if (!clue) return null
  if (result.intent === 'observed' && known.includes(clue.id)) return { text: `우리가 확인한 거야. ${facts[clue.id]}` }
  if (result.intent === 'suggest') {
    // NPC가 알고 있는 건 보이드가 대신 말하지 않는다
    if (clue.npc) return { text: `그건 내가 직접 알 수는 없어. ${clue.npc}에게 물어보면 알 수 있을 거야. ‘질문’에 있어.` }
    // 아직 안 본 것이면 어떤 버튼인지 말하지 않고, 어느 쪽 조사인지만 귀띔한다
    return { text: `그건 직접 확인해 봐야 알 수 있어. ‘${clue.type}’ 쪽에서 확인할 방법을 찾아볼래?` }
  }
  return null
}
