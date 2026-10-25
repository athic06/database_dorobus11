import { useParams } from 'react-router-dom'
import CarCheckMission from '../missions/CarCheckMission.jsx'
import CaveExitMission from '../missions/CaveExitMission.jsx'
import LightsMission from '../missions/LightsMission.jsx'
import FacilityMission from '../missions/FacilityMission.jsx'
import ShopRestockMission from '../missions/ShopRestockMission.jsx'
import SignMission from '../missions/SignMission.jsx'
import MelodyMission from '../missions/MelodyMission.jsx'
import HomeworkMission from '../missions/HomeworkMission.jsx'
import { AntennaMission, BatteryMission, MotorMission, SensorMission, WheelMission } from '../missions/PartMissions.jsx'

// 개발 서버 전용: 미션 창 하나만 띄워 보는 페이지 (#/dev/mission/lights). 발표 자료용 화면 캡처에 쓴다.
const MISSIONS = {
  car: CarCheckMission,
  cave: CaveExitMission,
  melody: MelodyMission,
  lights: LightsMission,
  facility: FacilityMission,
  shop: ShopRestockMission,
  sign: SignMission,
  homework1: (p) => <HomeworkMission flag="classDone" {...p} />,
  homework2: (p) => <HomeworkMission flag="rescueLessonDone" {...p} />,
  sensor: SensorMission,
  battery: BatteryMission,
  motor: MotorMission,
  wheel: WheelMission,
  antenna: AntennaMission,
}

export default function MissionPreview() {
  const { name } = useParams()
  const M = MISSIONS[name]
  if (!M) return <p style={{ padding: 24 }}>미션 이름: {Object.keys(MISSIONS).join(', ')}</p>
  return <M onClose={() => {}} onClear={() => {}} />
}
