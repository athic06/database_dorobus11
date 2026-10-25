import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

// 챕터 2 동굴. x -8~8, z -14~14 범위의 길쭉한 굴. 입구는 z=+14 쪽.
export const CAVE = { halfX: 8, halfZ: 14 }
export const CAVE_BOUNDS = { minX: -7, maxX: 7, minZ: -13, maxZ: 13 }
export const DIARY_POS = [0, 0, -10.5]
export const SIGN_POS = [5.4, 0, -2]
export const ENTRANCE_POS = [0, 0, 12.6]
export const EXIT_POS = [-5.6, 0, -12.2]

// 매번 같은 모양이 나오도록 고정 시드 난수
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function Rocks() {
  const rocks = useMemo(() => {
    const rnd = seeded(7)
    const list = []
    const add = (x, z) => list.push({ x, z, r: 0.9 + rnd() * 0.8, sy: 0.6 + rnd() * 0.4, rot: rnd() * 3, shade: rnd() })
    for (let z = -CAVE.halfZ; z <= CAVE.halfZ - 2; z += 1.6) {
      add(-CAVE.halfX - 0.3 + rnd() * 0.6, z)
      add(CAVE.halfX - 0.3 + rnd() * 0.6, z)
    }
    for (let x = -CAVE.halfX; x <= CAVE.halfX; x += 1.6) {
      add(x, -CAVE.halfZ - 0.3 + rnd() * 0.6)
      // 입구 쪽(카메라가 있는 쪽)은 시야를 가리지 않게 양 끝에만 둔다
      if (Math.abs(x) > 5.5) add(x, CAVE.halfZ + rnd() * 0.5)
    }
    return list
  }, [])
  return rocks.map((r, i) => (
    <mesh key={i} position={[r.x, r.r * r.sy * 0.6, r.z]} rotation={[r.rot, r.rot * 2, 0]} scale={[1, r.sy, 1]} castShadow receiveShadow>
      <dodecahedronGeometry args={[r.r, 0]} />
      <meshStandardMaterial color={r.shade > 0.5 ? '#5A4E44' : '#4A4038'} flatShading roughness={1} />
    </mesh>
  ))
}

function Torch({ position }) {
  const light = useRef()
  const flame = useRef()
  useFrame((s) => {
    const t = s.clock.elapsedTime + position[2]
    const f = 1 + Math.sin(t * 9) * 0.08 + Math.sin(t * 23) * 0.05
    light.current.intensity = 9 * f
    flame.current.scale.setScalar(f)
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.4, 8]} />
        <meshStandardMaterial color="#5B3A22" />
      </mesh>
      <mesh ref={flame} position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#FFB547" emissive="#FF8A1F" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, 1.7, 0]} color="#FF9A3C" distance={9} />
    </group>
  )
}

function Crystal({ position, color }) {
  return (
    <group position={position}>
      {[[0, 0.5, 0, 0.45], [0.35, 0.3, 0.2, 0.3], [-0.3, 0.28, -0.1, 0.25]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.2 * i, i, 0.3]}>
          <octahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, 0.8, 0]} color={color} intensity={4} distance={5} />
    </group>
  )
}

function Diary({ found }) {
  const book = useRef()
  useFrame((s) => {
    if (!book.current) return
    book.current.position.y = 1.25 + Math.sin(s.clock.elapsedTime * 2) * 0.06
    book.current.rotation.y = s.clock.elapsedTime * 0.6
  })
  return (
    <group position={DIARY_POS}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.8, 0.9, 7]} />
        <meshStandardMaterial color="#6B5D50" flatShading />
      </mesh>
      {!found && (
        <>
          <mesh ref={book} position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[0.55, 0.12, 0.42]} />
            <meshStandardMaterial color="#8B4A2B" emissive="#FFCF7A" emissiveIntensity={0.35} />
          </mesh>
          <pointLight position={[0, 1.6, 0]} color="#FFD58A" intensity={6} distance={5} />
          <Html position={[0, 2.1, 0]} center zIndexRange={[1, 0]}>
            <div className="portal-label">반짝이는 물건</div>
          </Html>
        </>
      )}
    </group>
  )
}

function Sign() {
  return (
    <group position={SIGN_POS} rotation={[0, -Math.PI / 2.4, 0]}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.6, 8]} />
        <meshStandardMaterial color="#5B3A22" />
      </mesh>
      <mesh position={[0, 1.6, 0.06]}>
        <boxGeometry args={[1.3, 0.8, 0.08]} />
        <meshStandardMaterial color="#D9C29A" emissive="#4FD1C5" emissiveIntensity={0.25} />
      </mesh>
      <pointLight position={[0, 1.8, 0.8]} color="#4FD1C5" intensity={4} distance={4} />
      <Html position={[0, 2.4, 0]} center zIndexRange={[1, 0]}>
        <div className="portal-label">지도 표지판</div>
      </Html>
    </group>
  )
}

export default function CaveScene({ diaryFound, caveCleared }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CAVE.halfX * 2 + 6, CAVE.halfZ * 2 + 6]} />
        <meshStandardMaterial color="#3B3029" roughness={1} />
      </mesh>
      <Rocks />
      {[[-3.5, -5], [3.2, 5.5], [-4.2, 3], [2.5, -7.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.6, z]} castShadow>
          <coneGeometry args={[0.35, 1.2 + (i % 2) * 0.6, 7]} />
          <meshStandardMaterial color="#6B5D50" flatShading />
        </mesh>
      ))}
      <Crystal position={[-6.3, 0, -3]} color="#4FD1C5" />
      <Crystal position={[6.2, 0, 7]} color="#9B6BD6" />
      <Crystal position={[6, 0, -11]} color="#4FD1C5" />
      <Torch position={[-6.4, 0, 8]} />
      <Torch position={[6.4, 0, 1]} />
      <Torch position={[-6.4, 0, -7]} />

      <Diary found={diaryFound} />
      {diaryFound && !caveCleared && <Sign />}

      {/* 입구: 처음엔 밖의 빛이 들어오고, 일기장을 찾으면 무너져 막힌다 */}
      {!diaryFound ? (
        <>
          <pointLight position={[0, 3, 14.5]} color="#FFF4D6" intensity={14} distance={10} />
          <Html position={[0, 2.6, 13.6]} center zIndexRange={[1, 0]}>
            <div className="portal-label">입구</div>
          </Html>
        </>
      ) : (
        [[-1.4, 0.9], [0, 1.3], [1.4, 0.9], [-0.7, 1.9], [0.8, 2]].map(([x, y], i) => (
          <mesh key={i} position={[x, y * 0.6, 13.9]} castShadow>
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial color="#5A4E44" flatShading />
          </mesh>
        ))
      )}

      {/* 출구: 출구 찾기를 마친 뒤 다시 들어오면 보인다 */}
      {caveCleared && (
        <group position={EXIT_POS}>
          <pointLight position={[0, 2, -1]} color="#FFF4D6" intensity={14} distance={8} />
          <Html position={[0, 2.4, 0]} center zIndexRange={[1, 0]}>
            <div className="portal-label">출구</div>
          </Html>
        </group>
      )}
    </group>
  )
}
