import { useStore } from '../store.jsx'
import { CHAPTER_TITLES, chapterOf, objectiveOf } from '../game/progress.js'

export default function QuestTracker() {
  const { progress } = useStore()
  return (
    <div className="quest">
      <span className="quest-ch">{CHAPTER_TITLES[chapterOf(progress)]}</span>
      <span className="quest-obj">{objectiveOf(progress)}</span>
    </div>
  )
}
