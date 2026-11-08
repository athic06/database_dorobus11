import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { chapterOf, continuePath, objectiveOf } from '../game/progress.js'

// 대시보드 첫 안내: 처음 로그인 · 스토리 진행 중 · 스토리 완료에 따라 문구와 버튼이 달라진다.
// 진행 중에는 "다음 챕터에서 무엇이 열릴까?", 완료 후에는 "오늘은 무엇을 즐기고 만들까?"를 보여 준다.
const NEXT_UNLOCK = ['지도와 자동차', '동굴', '하모니아 광장', '신비한 큐브', '연구실과 보이드', '도로랜드의 일상 콘텐츠 전체']

function headline(p, c) {
  if (c === 1) return p.carCheckDone ? '운전면허증을 챙기면 출발이에요!' : '자동차를 고치면 운전면허증을 받아요!'
  if (c === 2) return p.diaryFound ? '동굴의 출구를 찾아야 해요!' : '지도의 문양이 동굴을 가리켜요!'
  if (c === 3) {
    if (!p.plazaOpen) return '하모니아가 멈춰 버렸어요!'
    if (!p.harmoniaRestored) return '멈춘 하모니아에 음악을 되살려요!'
    return '광장이 다시 살아나고 있어요!'
  }
  if (c === 4) return p.rescueLessonDone ? '리코가 돌아왔어요!' : '리코가 큐브 속으로 사라졌어요!'
  return '보이드를 다시 깨울 시간이에요!'
}

const scrollTo = (sel) => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

export default function StateBanner() {
  const navigate = useNavigate()
  const { progress: p } = useStore()
  const c = chapterOf(p)
  const path = continuePath(p)

  const view =
    c === 0
      ? {
          tag: '처음 로그인', tone: 'first', title: '도로랜드에 오신 걸 환영해요!', sub: '리코와 제로를 만나 첫 번째 모험을 시작해 보세요.',
          next: '마이룸에 들어가면 자일로가 지도와 자동차를 줘요', action: '메인 스토리 시작하기', go: () => navigate('/myroom'),
        }
      : c === 6
        ? {
            tag: '메인 스토리 완료', tone: 'done', title: '도로랜드에 새로운 하루가 시작됐어요!', sub: '친구가 만든 콘텐츠와 오늘의 활동을 즐겨 보세요.',
            next: '친구 방 셀 찾기 → 보상 → 내 공간 꾸미기', action: '오늘의 활동 확인', go: () => scrollTo('.card.route'),
          }
        : {
            tag: '메인 스토리 진행 중', tone: 'story', title: headline(p, c), sub: objectiveOf(p),
            next: `이번 챕터를 마치면 열려요 · ${NEXT_UNLOCK[c]}`, action: path ? `CH.${c} 이어하기` : '오늘의 수업 먼저 듣기',
            go: () => (path ? navigate(path) : scrollTo('.card.lesson')),
          }

  return (
    <section className={`card state-banner ${view.tone}`}>
      <div className="sb-top">
        <span className="eyebrow-s">DOROBUS DASHBOARD</span>
        <span className="sb-tag">{view.tag}</span>
      </div>
      <h2>{view.title}</h2>
      <p className="sb-sub">{view.sub}</p>
      <div className="sb-next">
        <b>다음 활동</b>
        <span>{view.next}</span>
      </div>
      <button className="btn-primary" onClick={view.go}>{view.action}</button>
    </section>
  )
}
