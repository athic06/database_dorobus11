import RepairScene from './RepairScene.jsx'
import { PARADE, REPAIR_CASES, WORKSHOP } from '../game/repairCases.js'
import './repair.css'

// 개발 서버 전용: 고장 수사대 2D 장면을 한 화면에 모아 본다 (#/dev/repair). 그림 손볼 때 확인용.
const initial = (item) => Object.fromEntries(Object.entries(item.controls).map(([id, spec]) => [id, spec.initial]))
const solved = (item) => Object.fromEntries(Object.entries(item.controls).map(([id, spec]) => [id, Array.isArray(spec.target) ? spec.target[0] : spec.target]))

export default function RepairGallery() {
  return (
    <main className="repair-page" style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
      {[...REPAIR_CASES, PARADE, WORKSHOP].map((item) => (
        <section key={item.id}>
          <b>{item.id}, {item.title} (조사 전 / 단서 다 본 뒤 / 고친 뒤)</b>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <RepairScene item={item} settings={initial(item)} trial={null} field />
          <RepairScene item={item} settings={initial(item)} trial={null} field known={item.clueList.map((clue) => clue.id)} />
          <RepairScene item={item} settings={solved(item)} trial={{ start: 0, duration: 1, ok: true, kind: 'test', index: 0 }} finished />
          </div>
        </section>
      ))}
    </main>
  )
}
