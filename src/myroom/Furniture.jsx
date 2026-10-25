// 기본 가구(피아노 소파)와 상점에서 산 가구들. 모두 기본 도형으로만 만든다.

export function PianoSofa(props) {
  const blue = '#7FA7DA'
  return (
    <group {...props}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.7, 1.4]} />
        <meshStandardMaterial color={blue} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1, -0.55]} castShadow>
        <boxGeometry args={[3, 1.1, 0.35]} />
        <meshStandardMaterial color={blue} roughness={0.7} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 0.75, 0.05]} castShadow>
          <boxGeometry args={[0.3, 0.55, 1.3]} />
          <meshStandardMaterial color="#6C93C8" roughness={0.7} />
        </mesh>
      ))}
      {/* 건반 */}
      <mesh position={[0, 0.74, 0.15]}>
        <boxGeometry args={[2.4, 0.08, 0.75]} />
        <meshStandardMaterial color="#F4F6FA" />
      </mesh>
      {[-0.9, -0.5, 0.1, 0.5, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.8, 0.0]}>
          <boxGeometry args={[0.16, 0.06, 0.42]} />
          <meshStandardMaterial color="#20285A" />
        </mesh>
      ))}
    </group>
  )
}

export function Plant(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.32, 0.7, 20]} />
        <meshStandardMaterial color="#C8714A" />
      </mesh>
      {[[0, 1.2, 0, 0.55], [0.35, 1.0, 0.15, 0.4], [-0.3, 1.05, -0.1, 0.42], [0.05, 1.55, 0.1, 0.38]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 16, 16]} />
          <meshStandardMaterial color={i % 2 ? '#3E9B57' : '#4CAF6E'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function Lamp(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 20]} />
        <meshStandardMaterial color="#3A3A40" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 2.3, 8]} />
        <meshStandardMaterial color="#3A3A40" />
      </mesh>
      <mesh position={[0, 2.45, 0]}>
        <coneGeometry args={[0.55, 0.6, 24, 1, true]} />
        <meshStandardMaterial color="#F5D27A" emissive="#F5B841" emissiveIntensity={0.8} side={2} />
      </mesh>
      <pointLight position={[0, 2.2, 0]} color="#FFCF7A" intensity={18} distance={9} castShadow />
    </group>
  )
}

export function Rug(props) {
  return (
    <group {...props}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial color="#E57E9A" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[1.5, 1.7, 48]} />
        <meshStandardMaterial color="#F7C1CF" roughness={1} />
      </mesh>
    </group>
  )
}

const BOOK_COLORS = ['#E2574C', '#4E8BFF', '#F5B841', '#4CAF6E', '#9B6BD6', '#F08A3E']

export function Shelf(props) {
  return (
    <group {...props}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 3, 0.6]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {[0.6, 1.5, 2.4].map((y, row) => (
        <group key={y}>
          <mesh position={[0, y - 0.32, 0.12]}>
            <boxGeometry args={[2.2, 0.06, 0.45]} />
            <meshStandardMaterial color="#6E4529" />
          </mesh>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[-0.85 + i * 0.32 + (row % 2) * 0.1, y, 0.2]} castShadow>
              <boxGeometry args={[0.2, 0.55 - (i % 3) * 0.07, 0.38]} />
              <meshStandardMaterial color={BOOK_COLORS[(i + row) % BOOK_COLORS.length]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// 컴퓨터 책상 (기본 가구): 의자에 앉으면 2D 미니게임 화면이 뜬다. 모니터는 -x 쪽, 의자는 +x 쪽
export function ComputerDesk(props) {
  const legs = [[-0.5, -1.1], [-0.5, 1.1], [0.5, -1.1], [0.5, 1.1]]
  return (
    <group {...props}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.1, 2.4]} />
        <meshStandardMaterial color="#E8D6B8" />
      </mesh>
      {legs.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.53, z]} castShadow>
          <boxGeometry args={[0.08, 1.06, 0.08]} />
          <meshStandardMaterial color="#8A7560" />
        </mesh>
      ))}
      <mesh position={[-0.35, 1.25, 0]}>
        <boxGeometry args={[0.25, 0.12, 0.5]} />
        <meshStandardMaterial color="#2B2F3A" />
      </mesh>
      <mesh position={[-0.35, 1.5, 0]}>
        <boxGeometry args={[0.08, 0.45, 0.08]} />
        <meshStandardMaterial color="#2B2F3A" />
      </mesh>
      <mesh position={[-0.35, 1.95, 0]} castShadow>
        <boxGeometry args={[0.08, 0.85, 1.4]} />
        <meshStandardMaterial color="#2B2F3A" />
      </mesh>
      <mesh position={[-0.3, 1.95, 0]}>
        <boxGeometry args={[0.02, 0.72, 1.28]} />
        <meshStandardMaterial color="#3E7BE0" emissive="#4E8BFF" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <mesh position={[0.2, 1.17, 0]}>
        <boxGeometry args={[0.3, 0.04, 0.9]} />
        <meshStandardMaterial color="#F4F6FA" />
      </mesh>
      <mesh position={[0.2, 1.17, 0.65]}>
        <boxGeometry args={[0.16, 0.05, 0.1]} />
        <meshStandardMaterial color="#F4F6FA" />
      </mesh>
      <group position={[1.15, 0, 0]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[0.75, 0.12, 0.75]} />
          <meshStandardMaterial color="#E2574C" />
        </mesh>
        <mesh position={[0.36, 1.1, 0]} castShadow>
          <boxGeometry args={[0.1, 0.8, 0.7]} />
          <meshStandardMaterial color="#E2574C" />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.06, 16]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </group>
    </group>
  )
}

export function Bed(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.6, 3.2]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      <mesh position={[0, 0.7, 0.1]} castShadow>
        <boxGeometry args={[1.8, 0.25, 2.9]} />
        <meshStandardMaterial color="#F4F6FA" />
      </mesh>
      <mesh position={[0, 0.86, 0.55]}>
        <boxGeometry args={[1.82, 0.12, 2]} />
        <meshStandardMaterial color="#7FB4EA" />
      </mesh>
      <mesh position={[0, 0.95, -1.15]} castShadow>
        <boxGeometry args={[1.2, 0.25, 0.55]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 1, -1.55]} castShadow>
        <boxGeometry args={[1.9, 1.4, 0.15]} />
        <meshStandardMaterial color="#6E4529" />
      </mesh>
    </group>
  )
}

export function TV(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.8, 0.6]} />
        <meshStandardMaterial color="#4A4F5C" />
      </mesh>
      <mesh position={[0, 1.65, -0.05]} castShadow>
        <boxGeometry args={[2.2, 1.3, 0.1]} />
        <meshStandardMaterial color="#15171C" />
      </mesh>
      <mesh position={[0, 1.65, 0.01]}>
        <boxGeometry args={[2.05, 1.15, 0.02]} />
        <meshStandardMaterial color="#5AC8FA" emissive="#2F7BFF" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Beanbag(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.45, 0]} scale={[1, 0.65, 1]} castShadow>
        <sphereGeometry args={[0.75, 20, 16]} />
        <meshStandardMaterial color="#F5B841" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.75, -0.35]} scale={[1, 0.8, 0.6]} castShadow>
        <sphereGeometry args={[0.55, 18, 14]} />
        <meshStandardMaterial color="#F0A92E" roughness={0.9} />
      </mesh>
    </group>
  )
}

const FISH = [[-0.3, 1.25, 0, '#F08A3E'], [0.25, 1.05, 0.05, '#F5D04E'], [0.05, 1.45, -0.05, '#E2574C']]
export function Aquarium(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.6, 0.8, 0.7]} />
        <meshStandardMaterial color="#3A3A40" />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.5, 0.9, 0.6]} />
        <meshStandardMaterial color="#9ED8FF" transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[1.48, 0.1, 0.58]} />
        <meshStandardMaterial color="#E8D6A0" />
      </mesh>
      {FISH.map(([x, y, z, c]) => (
        <mesh key={c} position={[x, y, z]} scale={[1.6, 1, 0.6]}>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
      <mesh position={[0.5, 1.05, 0]}>
        <coneGeometry args={[0.08, 0.35, 6]} />
        <meshStandardMaterial color="#4CAF6E" />
      </mesh>
    </group>
  )
}

export function Guitar(props) {
  return (
    <group {...props}>
      <group rotation={[0, 0, 0.18]}>
        <mesh position={[0, 0.55, 0]} scale={[1, 1.15, 0.35]} castShadow>
          <sphereGeometry args={[0.45, 20, 14]} />
          <meshStandardMaterial color="#C8714A" />
        </mesh>
        <mesh position={[0, 1.05, 0]} scale={[1, 1, 0.35]} castShadow>
          <sphereGeometry args={[0.33, 18, 12]} />
          <meshStandardMaterial color="#C8714A" />
        </mesh>
        <mesh position={[0, 0.75, 0.16]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
          <meshStandardMaterial color="#2B2F3A" />
        </mesh>
        <mesh position={[0, 1.75, 0]}>
          <boxGeometry args={[0.12, 1.1, 0.08]} />
          <meshStandardMaterial color="#6E4529" />
        </mesh>
      </group>
    </group>
  )
}

export function WallClock(props) {
  return (
    <group {...props}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.1, 28]} />
        <meshStandardMaterial color="#F4F6FA" />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <torusGeometry args={[0.55, 0.05, 8, 28]} />
        <meshStandardMaterial color="#4E8BFF" />
      </mesh>
      <mesh position={[0, 0.17, 0.07]}>
        <boxGeometry args={[0.05, 0.35, 0.02]} />
        <meshStandardMaterial color="#2B2F3A" />
      </mesh>
      <mesh position={[0.12, 0, 0.07]} rotation={[0, 0, -Math.PI / 2]}>
        <boxGeometry args={[0.05, 0.25, 0.02]} />
        <meshStandardMaterial color="#2B2F3A" />
      </mesh>
    </group>
  )
}

export function Poster(props) {
  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[1.4, 1.9, 0.04]} />
        <meshStandardMaterial color="#FFF4D6" />
      </mesh>
      <mesh position={[0, 0.25, 0.03]}>
        <circleGeometry args={[0.45, 24]} />
        <meshStandardMaterial color="#F5B841" />
      </mesh>
      <mesh position={[0, -0.55, 0.03]}>
        <planeGeometry args={[1.1, 0.25]} />
        <meshStandardMaterial color="#4E8BFF" />
      </mesh>
    </group>
  )
}

// 가구별 마이룸 자리. 친구 방 방문, 셀 숨기기 위치(minigames/treasure.js SPOT_POS)와 같다
export const FURNITURE = {
  rug: { C: Rug, pos: [-1, 0, -2] },
  plant: { C: Plant, pos: [8.6, 0, -8.6] },
  lamp: { C: Lamp, pos: [-8.4, 0, -8.6] },
  shelf: { C: Shelf, pos: [2.5, 0, -9.65] },
  bed: { C: Bed, pos: [-8.9, 0, -4.6] },
  tv: { C: TV, pos: [6.3, 0, -9.5] },
  beanbag: { C: Beanbag, pos: [6.3, 0, -6.6], rot: Math.PI },
  aquarium: { C: Aquarium, pos: [9.3, 0, 1.6], rot: -Math.PI / 2 },
  guitar: { C: Guitar, pos: [-9.5, 0, 3.4], rot: Math.PI / 2 },
  clock: { C: WallClock, pos: [6.3, 4.2, -9.9] },
  poster: { C: Poster, pos: [-1.6, 2.7, -9.93] },
}

export function OwnedFurniture({ owned }) {
  return (
    <>
      {Object.entries(FURNITURE).map(([id, f]) => owned.includes(id) && <f.C key={id} position={f.pos} rotation={[0, f.rot || 0, 0]} />)}
    </>
  )
}
