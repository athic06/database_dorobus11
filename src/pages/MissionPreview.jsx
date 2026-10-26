import { useParams } from 'react-router-dom'
import CarCheckMission from '../missions/CarCheckMission.jsx'
import CaveExitMission from '../missions/CaveExitMission.jsx'
import LightsMission from '../missions/LightsMission.jsx'
import FacilityMission from '../missions/FacilityMission.jsx'
import ShopRestockMission from '../missions/ShopRestockMission.jsx'
import SignMission from '../missions/SignMission.jsx'
import MelodyMission from '../missions/MelodyMission.jsx'
import { AntennaMission, BatteryMission, MotorMission, SensorMission, WheelMission } from '../missions/PartMissions.jsx'
import ContentMission from '../missions/ContentMission.jsx'
import { CONTENT, contentOf } from '../game/content.js'

// 개발 서버 전용: 미션 창 하나만 띄워 보는 페이지 (#/dev/mission/lights). 발표 자료용 화면 캡처에 쓴다.
const MISSIONS = {
  car: CarCheckMission,
  cave: CaveExitMission,
  melody: MelodyMission,
  lights: LightsMission,
  facility: FacilityMission,
  shop: ShopRestockMission,
  sign: SignMission,
  sensor: SensorMission,
  battery: BatteryMission,
  motor: MotorMission,
  wheel: WheelMission,
  antenna: AntennaMission,
  // 범용 콘텐츠의 도로랜드 문제: w-condition, w-sequence, w-loop …
  ...Object.fromEntries(Object.keys(CONTENT).filter((id) => CONTENT[id].kind === 'world').map((id) => [id, (p) => <ContentMission item={contentOf(id)} {...p} />])),
}

export default function MissionPreview() {
  const { name } = useParams()
  const M = MISSIONS[name]
  if (!M) return <p style={{ padding: 24 }}>미션 이름: {Object.keys(MISSIONS).join(', ')}</p>
  return <M onClose={() => {}} onClear={() => {}} />
}
