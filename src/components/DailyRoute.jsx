import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { storyDone } from '../game/progress.js'
import { parkOpen } from '../game/park.js'
import { DAY_NAMES, VEHICLES, dailyOf, guardEarned, monthKey, questOf, raidsOf, todayKey } from '../game/routine.js'
import { HIDE_SPOTS } from '../minigames/treasure.js'
import { AttendanceBoard, BadgeRow, QuestPanel, VehiclePanel } from './Routine.jsx'
import ParkPanel from './ParkPanel.jsx'
import PianoGame from '../minigames/PianoGame.jsx'

// 오늘의 목표 확인: 내가 없는 동안 내 방에서 일어난 일 (방문 · 셀을 찾아갔는지 · 지킨 보상)
function RoomNews() {
  const navigate = useNavigate()
  const { progress: p } = useStore()
  const mg = p.minigame
  const earned = guardEarned(mg)
  const visitors = (p.visitors || []).slice(0, 3)
  const toRoom = (panel) => navigate('/myroom', { state: { panel } })
  const spot = HIDE_SPOTS[mg?.hideIn]?.name

  let line = '🙈 아직 내 방에 숨긴 셀이 없어요. 셀을 숨기면 친구가 놀러 와요.'
  if (mg?.stake && mg.foundBy) line = `💎 ${mg.foundBy}님이 ${spot}에 숨긴 ${mg.stake} CELL을 찾아갔어요. 다른 곳에 다시 숨겨 봐요!`
  else if (mg?.stake) line = `🛡️ ${spot}의 ${mg.stake} CELL을 지키는 중 · 못 찾고 돌아간 친구 ${mg.fails || 0}명 · 받을 지킨 보상 ${earned} CELL`
  const visitText = visitors.length ? `👋 최근 방문 · ${visitors.map((v) => `${v.from}(${v.date.slice(5)})`).join(', ')}` : '👋 아직 놀러 온 친구가 없어요'

  return (
    <div className="room-news">
      <div className="rn-main">
        <span className="eyebrow-s">오늘의 목표 확인 · 내 방 소식</span>
        <p>{line}</p>
        <small>{visitText} · ❤️ 좋아요 {mg?.likes || 0} · 방문 수익 +{p.visitIncome || 0} CELL</small>
      </div>
      <div className="rn-actions">
        {mg?.stake > 0 && !mg.foundBy && earned > 0 && <button className="btn-primary" onClick={() => toRoom('editor')}>지킨 보상 받기</button>}
        <button className={mg?.stake && !mg.foundBy ? 'btn-ghost' : 'btn-primary'} onClick={() => toRoom('editor')}>{mg?.stake ? '숨김 위치 바꾸기' : '셀 숨기기'}</button>
        <button className="btn-ghost" onClick={() => toRoom('shop')}>내 방 꾸미기</button>
      </div>
    </div>
  )
}

// 로그인 이후의 활동 루트: 무엇을 하고 → 무엇을 얻고 → 어디에 쓰는지
export default function DailyRoute() {
  const navigate = useNavigate()
  const { progress: p } = useStore()
  const [panel, setPanel] = useState(null)
  const now = new Date()
  const done = storyDone(p)
  const daily = dailyOf(p, now)
  const q = questOf(now)
  const nextVehicle = VEHICLES.find((v) => !v.monthly && (p.stamps || 0) < v.need)
  const attended = p.attendance?.month === monthKey(now) && p.attendance.days.includes(now.getDate())
  const piano = p.piano?.rewarded || {}
  // 스토리 진행 중에는 메인 스토리 안내가 먼저다. 루트는 접어 두고 미리 보기만 한다
  const [peek, setPeek] = useState(false)
  const open = done || peek

  const STEPS = [
    {
      icon: '🐾', title: '출석 체크', do: '오늘 도로버스에 접속', get: '탈것 스탬프 1개', use: nextVehicle ? `${nextVehicle.icon} ${nextVehicle.name}까지 ${nextVehicle.need - (p.stamps || 0)}개` : '모든 탈것 해금!',
      ok: attended, action: '탈것 보기', go: () => setPanel('vehicle'),
    },
    {
      icon: q.icon, title: `${DAY_NAMES[now.getDay()]}요일 퀘스트 · ${q.theme}`, do: q.tasks.map((t) => t.label).join(' · '), get: `CELL ${q.reward.cell} · 스탬프 ${q.reward.stamps} · 배지`, use: '가구 사기 · 시설 강화',
      ok: daily.claimed, lock: !done && '메인 스토리를 마치면 열려요', action: '퀘스트 보기', go: () => setPanel('quest'),
    },
    {
      icon: '💎', title: '친구 방 셀 찾기', do: '친구 마이룸에 들어가 가구 살펴보기', get: '친구가 숨긴 CELL', use: '구매 목표 가구',
      ok: raidsOf(p, now).steals > 0, action: '친구 방 가기', go: () => navigate('/play', { state: { tab: 'friends' } }),
    },
    {
      icon: '🛡️', title: '내 방 셀 숨기기', do: '내 가구에 CELL 숨기기', get: '못 찾고 버틴 시간만큼 지킨 보상', use: '테마파크 시설 강화',
      ok: !!(p.minigame?.stake && !p.minigame.foundBy), lock: !done && '메인 스토리를 마치면 열려요', action: '마이룸 가기', go: () => navigate('/myroom'),
    },
    {
      icon: '🎹', title: '피아노 랭킹', do: '기억 모드 · 음 맞히기', get: '점수별 CELL (모드마다 하루 1번)', use: '랭킹 순위 올리기',
      ok: Object.values(piano).includes(todayKey(now)), action: '피아노 하기', go: () => setPanel('piano'),
    },
    {
      icon: '🎡', title: '테마파크 운영', do: '운영 수익 받기 · 강화', get: '방문객 수만큼 운영 수익', use: '어트랙션 강화 → 방문객 증가',
      ok: (daily.counts.collect || 0) > 0, lock: !parkOpen(p) && '챕터 3 상점 재개장 후 열려요', action: '운영하기', go: () => setPanel('park'),
    },
  ]

  return (
    <section className="card route">
      <div className="route-head">
        <div>
          <span className="eyebrow-s">오늘의 도로랜드 루트</span>
          <h3>하기 → 얻기 → 쓰기</h3>
        </div>
        <small>{done ? '모은 CELL과 스탬프로 가구·시설·탈것을 바꾸면, 내일 다시 올 이유가 생겨요.' : '메인 스토리를 마치면 모두 열려요. 지금도 출석 · 피아노 · 친구 방 구경은 할 수 있어요.'}</small>
        {!done && <button className="btn-ghost" aria-expanded={open} onClick={() => setPeek((o) => !o)}>{open ? '접기 ▴' : '루트 미리 보기 ▾'}</button>}
      </div>
      {done && <RoomNews />}
      {open && (
      <div className="route-body">
        <ol className="route-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className={`${s.ok ? 'ok' : ''}${s.lock ? ' locked' : ''}`}>
              <span className="rs-num">{s.ok ? '✓' : i + 1}</span>
              <div className="rs-main">
                <b>{s.icon} {s.title}</b>
                <dl>
                  <dt>하기</dt><dd>{s.do}</dd>
                  <dt>얻기</dt><dd>{s.get}</dd>
                  <dt>쓰기</dt><dd>{s.use}</dd>
                </dl>
              </div>
              {s.lock ? <small className="rs-lock">{s.lock}</small> : <button className="btn-ghost" onClick={s.go}>{s.action}</button>}
            </li>
          ))}
        </ol>
        <div className="route-side">
          <AttendanceBoard />
          <div className="route-badges">
            <b>내 배지</b>
            <BadgeRow />
          </div>
        </div>
      </div>
      )}
      {panel === 'vehicle' && <VehiclePanel onClose={() => setPanel(null)} />}
      {panel === 'quest' && <QuestPanel onClose={() => setPanel(null)} />}
      {panel === 'park' && <ParkPanel onClose={() => setPanel(null)} />}
      {panel === 'piano' && <PianoGame onClose={() => setPanel(null)} />}
    </section>
  )
}
