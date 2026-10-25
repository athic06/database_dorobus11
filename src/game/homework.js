// 수업 과제: 수업을 들은 뒤 하모니아 광장에서 도움이 필요한 NPC를 찾아 수업 내용으로 돕는다.
// 수업 카드(대시보드)의 완료 플래그를 키로 쓴다. 완료한 과제는 progress.homeworkDone에 쌓인다.
export const HOMEWORK = {
  classDone: {
    lesson: '1차시 · 블록코딩 첫걸음',
    who: '길 잃은 꼬마',
    ask: '엄마를 잃어버렸어요… 엄마는 광장 반대편에 있대요. 순서대로 블록을 쌓아서 데려다줄래요?',
    concept: '순서대로 명령 쌓기',
    robot: '🧒',
    goalIcon: '👩',
    level: { cols: 5, rows: 4, start: [0, 0], goal: [4, 3], rocks: [[2, 0], [2, 1], [1, 3]], max: 9 },
    thanks: '엄마를 찾았어요! 블록을 순서대로 쌓으니까 길을 잃지 않았어요. 고마워요!',
    reward: 50,
  },
  rescueLessonDone: {
    lesson: '2차시 · 시그널 브레이크',
    who: '광장 신호 기술자',
    ask: '큐브 소동 때문에 광장 신호가 끊겼어. 수업에서 단서를 따라간 것처럼, 신호를 끊긴 전등까지 전달해 줄래?',
    concept: '단서를 따라 경로 만들기',
    robot: '📡',
    goalIcon: '💡',
    level: { cols: 5, rows: 4, start: [0, 3], goal: [4, 0], rocks: [[1, 3], [1, 2], [3, 2], [3, 1]], max: 9 },
    thanks: '신호가 다시 이어졌어! 광장 전등이 반짝반짝하네. 정말 고마워.',
    reward: 80,
  },
}

// 지금 해야 할 과제의 수업 플래그 (가장 최근에 들은 수업 기준). 없으면 null
export function pendingHomework(p) {
  const done = p.homeworkDone || []
  for (const flag of ['rescueLessonDone', 'classDone']) {
    if (p[flag]) return done.includes(flag) ? null : flag
  }
  return null
}
