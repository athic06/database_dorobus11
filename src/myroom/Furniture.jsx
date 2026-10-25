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

function Plant(props) {
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

function Lamp(props) {
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

function Rug(props) {
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

function Shelf(props) {
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

export function OwnedFurniture({ owned }) {
  return (
    <>
      {owned.includes('rug') && <Rug position={[-1, 0, -2]} />}
      {owned.includes('plant') && <Plant position={[8.6, 0, -8.6]} />}
      {owned.includes('lamp') && <Lamp position={[-8.4, 0, -8.6]} />}
      {owned.includes('shelf') && <Shelf position={[2.5, 0, -9.65]} />}
    </>
  )
}
