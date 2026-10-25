import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { HairCap, Human, P, Spike, Toon } from './Toon.jsx'

// 스토리 캐릭터 시트(2D 일러스트)를 셀 셰이딩 3D로 옮긴 모형.
// 사람 캐릭터는 pose로 시트의 6동작(설명 · 팔짱 · 반가움 · 고민 · 신남 · 시무룩)을 고를 수 있다.

function Label({ y, text, className = '' }) {
  return (
    <Html position={[0, y, 0]} center zIndexRange={[1, 0]}>
      <div className={`nametag npc ${className}`}>{text}</div>
    </Html>
  )
}

/* ---------- 머리 모양 ---------- */
// 자일로: 위로 쓸어 올린 회색 머리
function XyloHair() {
  return (
    <group>
      <HairCap color="#8F939B" r={0.355} tilt={-0.55} depth={0.55} />
      {/* 앞머리를 위로 쓸어 올린 덩어리 + 한쪽으로 넘긴 끝 */}
      <P color="#A9ACB3" position={[0, 0.27, 0.12]} rotation={[-0.35, 0, 0]} scale={[1.25, 0.62, 1.1]}>
        <sphereGeometry args={[0.2, 20, 14]} />
      </P>
      <P color="#A9ACB3" position={[-0.05, 0.36, 0.13]} rotation={[0.2, 0, 0.75]} scale={[0.55, 1, 0.7]} thick={0.014}>
        <coneGeometry args={[0.11, 0.26, 12]} />
      </P>
      {[-1, 1].map((s) => (
        <P key={s} color="#7D8189" position={[s * 0.3, 0.06, -0.04]} scale={[0.35, 0.8, 0.9]} thick={0.012}>
          <sphereGeometry args={[0.16, 12, 10]} />
        </P>
      ))}
    </group>
  )
}

// 제로: 주황 뾰족머리 + 앞머리 노란 줄
const ZERO_SPIKES = [
  [0, 0.4, -0.02, -0.25, 0, 0, 0.11, 0.34],
  [0.16, 0.36, -0.06, -0.4, 0, -0.7, 0.1, 0.32],
  [-0.17, 0.34, -0.05, -0.4, 0, 0.75, 0.1, 0.3],
  [0.3, 0.2, -0.05, 0, 0, -1.3, 0.09, 0.3],
  [-0.3, 0.18, -0.05, 0, 0, 1.3, 0.09, 0.28],
  [0.12, 0.3, -0.22, -1.1, 0, -0.3, 0.1, 0.3],
  [-0.12, 0.28, -0.24, -1.2, 0, 0.3, 0.1, 0.3],
  [0, 0.12, -0.33, -1.7, 0, 0, 0.11, 0.26],
]
function ZeroHair() {
  return (
    <group>
      <HairCap color="#CB6A2C" r={0.36} tilt={-0.72} depth={0.56} />
      {ZERO_SPIKES.map(([x, y, z, rx, ry, rz, r, h], i) => (
        <Spike key={i} color="#CB6A2C" at={[x, y, z]} rot={[rx, ry, rz]} r={r} h={h} />
      ))}
      <P color="#F3C452" position={[0.03, 0.27, 0.24]} rotation={[1.15, 0, -0.75]} scale={[1, 1, 0.5]} thick={0.012}>
        <coneGeometry args={[0.09, 0.36, 10]} />
      </P>
      <P color="#CB6A2C" position={[-0.08, 0.26, 0.22]} rotation={[1.1, 0, 0.5]} scale={[1, 1, 0.55]} thick={0.012}>
        <coneGeometry args={[0.08, 0.28, 10]} />
      </P>
    </group>
  )
}

// 리코: 허리까지 내려오는 하늘색 긴 머리
function RikoHair() {
  const back = useMemo(() => {
    // 뒤통수에서 허리까지 넓게 퍼지는 머리 (회전체)
    const pts = [[0.36, 0.1], [0.38, -0.2], [0.36, -0.6], [0.4, -1.0], [0.34, -1.25], [0.2, -1.32]].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 28, Math.PI * 0.55, Math.PI * 0.9)
  }, [])
  return (
    <group>
      <HairCap color="#80AACB" r={0.37} tilt={-0.62} depth={0.6} z={-0.01} />
      <P color="#80AACB" position={[0, 0.2, 0.17]} rotation={[0.55, 0, 0]} scale={[1.15, 0.45, 0.7]}>
        <sphereGeometry args={[0.26, 20, 12]} />
      </P>
      <P color="#80AACB" line={false} position={[0, 0, -0.04]} geometry={back} mat={<Toon color="#80AACB" side={THREE.DoubleSide} />} />
      {[-1, 1].map((s) => (
        <P key={s} color="#80AACB" position={[s * 0.3, -0.32, 0.08]} rotation={[0.1, 0, s * 0.08]}>
          <capsuleGeometry args={[0.075, 0.55, 6, 10]} />
        </P>
      ))}
      <P color="#6C97B8" position={[0.14, 0.24, 0.26]} rotation={[0.5, 0, -0.6]} scale={[1, 1, 0.4]} thick={0.01}>
        <coneGeometry args={[0.06, 0.22, 8]} />
      </P>
    </group>
  )
}

// 청록 점퍼 안경 캐릭터: 짧은 주황 머리 + 노란 번개 앞머리
function TealHair() {
  return (
    <group>
      <HairCap color="#C96A2B" r={0.355} tilt={-0.45} depth={0.52} />
      <P color="#C96A2B" position={[0.04, 0.36, 0.02]} rotation={[-0.2, 0, -0.25]} thick={0.014}>
        <coneGeometry args={[0.13, 0.3, 12]} />
      </P>
      <P color="#F3D14E" position={[0, 0.26, 0.24]} rotation={[0.6, 0, 0]} scale={[1, 1, 0.4]} thick={0.01}>
        <coneGeometry args={[0.04, 0.14, 6]} />
      </P>
    </group>
  )
}

export const LOOKS = {
  xylo: { jacket: '#A35F67', trim: '#B97A80', build: 'stocky', face: { eyes: 'dot', glasses: true, brow: '#55585F', jaw: 1.07 }, Hair: XyloHair },
  zero: { jacket: '#4E8A79', trim: '#86B3A6', puffy: true, face: { eyes: 'big', brow: '#9A4A1E' }, Hair: ZeroHair },
  riko: { jacket: '#9C93D3', trim: '#BDB5EA', puffy: true, face: { eyes: 'lash', brow: '#6C97B8', cheeks: true }, Hair: RikoHair },
  teal: { jacket: '#1E8C84', trim: '#7FD6C0', build: 'stocky', badge: '#7FD6C0', face: { eyes: 'dot', glasses: true, brow: '#3A2A20', jaw: 1.08 }, Hair: TealHair },
}

function Character({ who, name, position, rotation = 0, label = true, pose, mood, scale = 1, labelY = 2.95 }) {
  const root = useRef()
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group ref={root} scale={scale}>
        <Human look={LOOKS[who]} pose={pose} mood={mood} />
      </group>
      {label && <Label y={labelY * scale} text={name} />}
    </group>
  )
}

// 자일로: 도로랜드 총책임자. 회색 머리, 검은 뿔테 안경, 자주색 점퍼, 노란 D 배지.
export function Xylo(props) {
  return <Character who="xylo" name="자일로" {...props} />
}

// 제로: 주인공 쪽 친구. 주황 뾰족머리, 청록 점퍼.
export function Zero(props) {
  return <Character who="zero" name="제로" scale={0.95} {...props} />
}

// 리코: 하늘색 긴 머리, 연보라 점퍼.
export function Riko(props) {
  return <Character who="riko" name="리코" scale={0.93} {...props} />
}

export function TealGuy({ name = '???', ...props }) {
  return <Character who="teal" name={name} {...props} />
}

/* ---------- 보이드 ---------- */
// 보이드: 부품으로 조립한 작은 로봇. 흰 몸통에 파란 띠(V.I.D), 검은 화면 얼굴, 파란 헤드폰.
const WHITE = '#F4F6FA'
const BLUE = '#2F86E6'
export function VoidBot({ position, rotation = 0, label = true, groupRef, happy = false }) {
  const body = useRef()
  const legs = [useRef(), useRef()]
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (body.current) body.current.position.y = Math.abs(Math.sin(t * 5)) * 0.05
    legs.forEach((l, i) => { if (l.current) l.current.rotation.x = Math.sin(t * 5 + i * Math.PI) * 0.2 })
  })
  return (
    <group position={position} rotation={[0, rotation, 0]} ref={groupRef}>
      {[-1, 1].map((s, i) => (
        <group key={s} ref={legs[i]} position={[s * 0.17, 0.55, 0]}>
          {[0, 1, 2].map((k) => (
            <P key={k} color={k % 2 ? BLUE : WHITE} position={[0, -0.1 - k * 0.11, 0]} thick={0.012}>
              <cylinderGeometry args={[0.085, 0.085, 0.11, 14]} />
            </P>
          ))}
          <P color={WHITE} position={[0, -0.46, 0.06]} scale={[1, 0.7, 1.35]}>
            <sphereGeometry args={[0.13, 16, 12]} />
          </P>
        </group>
      ))}
      <group ref={body}>
        <P color={WHITE} position={[0, 0.92, 0]} scale={[1, 1.05, 0.85]}>
          <sphereGeometry args={[0.4, 28, 20]} />
        </P>
        <P color={BLUE} position={[0, 0.98, 0]} scale={[1, 1, 0.85]} thick={0.01}>
          <cylinderGeometry args={[0.405, 0.41, 0.13, 28]} />
        </P>
        <Html position={[0, 0.98, 0.35]} center transform scale={0.1} zIndexRange={[1, 0]}>
          <div className="vid-text">V.I.D</div>
        </Html>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.43, 1.05, 0]} rotation={[0, 0, s * (happy ? 2.2 : 0.35)]}>
            {[0, 1].map((k) => (
              <P key={k} color={WHITE} position={[0, -0.12 - k * 0.17, 0]} thick={0.012}>
                <capsuleGeometry args={[0.07, 0.1, 4, 10]} />
              </P>
            ))}
            <P color={WHITE} position={[0, -0.46, 0]} thick={0.012}>
              <sphereGeometry args={[0.085, 12, 10]} />
            </P>
          </group>
        ))}
        {/* 머리 */}
        <group position={[0, 1.72, 0]}>
          <P color={WHITE} scale={[1.08, 0.95, 0.95]}>
            <sphereGeometry args={[0.44, 32, 24]} />
          </P>
          {/* 검은 화면 얼굴: 머리 표면을 따라 휘어진 판 */}
          <mesh scale={[1.08, 0.95, 0.95]}>
            <sphereGeometry args={[0.448, 32, 16, Math.PI / 2 - 0.78, 1.56, Math.PI / 2 - 0.4, 0.82]} />
            <meshToonMaterial color="#17181D" />
          </mesh>
          {[-0.14, 0.14].map((x) =>
            happy ? (
              <mesh key={x} position={[x, 0.01, 0.44]}>
                <torusGeometry args={[0.05, 0.014, 6, 14, Math.PI]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            ) : (
              <mesh key={x} position={[x, 0.01, 0.44]} scale={[0.75, 1.2, 0.3]}>
                <sphereGeometry args={[0.06, 14, 10]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            ),
          )}
          {happy && (
            <mesh position={[0, -0.1, 0.44]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.045, 0.012, 6, 14, Math.PI]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          )}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.46, -0.02, 0]} rotation={[0, 0, s * -Math.PI / 2]}>
              <P color={BLUE}>
                <cylinderGeometry args={[0.15, 0.15, 0.11, 22]} />
              </P>
              <P color="#1F6FC9" position={[0, 0.06, 0]} thick={0.01}>
                <cylinderGeometry args={[0.1, 0.1, 0.03, 18]} />
              </P>
            </group>
          ))}
          <P color="#2B2F3A" position={[0, 0.5, 0]} thick={0.01}>
            <cylinderGeometry args={[0.018, 0.018, 0.2, 6]} />
          </P>
          <P color={WHITE} position={[0, 0.62, 0]} thick={0.012}>
            <sphereGeometry args={[0.055, 12, 10]} />
          </P>
        </group>
      </group>
      {label && <Label y={2.75} text="보이드" />}
    </group>
  )
}

/* ---------- 일반 NPC ---------- */
// 일반 NPC (방문객 · 사육사 · 정비사 등). 광장에 여럿 서 있으니 외곽선 없이 가볍게 그린다.
export function Person({ position, rotation = 0, color = '#E57E9A', hair = '#3B2A20', hat, label, scale = 1.4 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {[-0.11, 0.11].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.06, 0.04]} scale={[1, 0.6, 1.4]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <Toon color="#2B2A30" />
          </mesh>
          <mesh position={[x, 0.37, 0]}>
            <cylinderGeometry args={[0.08, 0.075, 0.62, 10]} />
            <Toon color="#46506A" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.98, 0]} castShadow scale={[1, 1, 0.8]}>
        <capsuleGeometry args={[0.25, 0.36, 6, 14]} />
        <Toon color={color} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.29, 1.2, 0]} rotation={[0, 0, s * 0.15]}>
          <mesh position={[0, -0.25, 0]}>
            <capsuleGeometry args={[0.07, 0.38, 4, 8]} />
            <Toon color={color} />
          </mesh>
          <mesh position={[0, -0.52, 0]}>
            <sphereGeometry args={[0.065, 10, 8]} />
            <Toon color="#F7C4A2" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.27, 18, 14]} />
        <Toon color="#F7C4A2" />
      </mesh>
      <mesh position={[0, 1.7, -0.04]} rotation={[-0.35, 0, 0]}>
        <sphereGeometry args={[0.285, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <Toon color={hair} />
      </mesh>
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 1.62, 0.25]} scale={[0.8, 1.1, 0.4]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshBasicMaterial color="#15141A" />
        </mesh>
      ))}
      <mesh position={[0, 1.52, 0.255]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.04, 0.009, 5, 10, Math.PI]} />
        <meshBasicMaterial color="#5A2A2A" />
      </mesh>
      {hat && (
        <mesh position={[0, 1.88, 0]}>
          <cylinderGeometry args={[0.2, 0.32, 0.18, 16]} />
          <Toon color={hat} />
        </mesh>
      )}
      {label && <Label y={2.4} text={label} />}
    </group>
  )
}

/* ---------- 코덱스 ---------- */
// 잎사귀 모양 (귀)
function useLeaf() {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.16, 0.08, 0.2, 0.3, 0, 0.48)
    s.bezierCurveTo(-0.2, 0.3, -0.16, 0.08, 0, 0)
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 })
    g.translate(0, 0, -0.015)
    return g
  }, [])
}
const poncho = new THREE.LatheGeometry(
  [[0.12, 0.62], [0.3, 0.55], [0.48, 0.25], [0.6, -0.15], [0.62, -0.32], [0.5, -0.36]].map(([x, y]) => new THREE.Vector2(x, y)),
  32,
)

// 코덱스: 도로랜드가 생기기 전부터 숲을 지켜 온 수호자. revealed가 아니면 정체를 드러내지 않은 실루엣.
// 캐릭터 시트 기준: 검은 얼굴, 노란 눈, 크림색 긴 머리, 잎사귀 귀, 연두색 판초, 갈색 장화.
export function CodexSilhouette({ position, rotation = 0, revealed = false }) {
  const root = useRef()
  const leaf = useLeaf()
  useFrame((s) => {
    if (!root.current) return
    const t = s.clock.elapsedTime
    root.current.position.x = revealed ? 0 : Math.sin(t * 13) * 0.04 * (Math.sin(t * 2) > 0.6 ? 1 : 0) // 지직거리는 노이즈
    root.current.position.y = revealed ? Math.sin(t * 1.6) * 0.03 : 0
  })
  const dark = '#14101C'
  const c = (col) => (revealed ? col : dark)
  const line = revealed
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group ref={root} scale={1.25}>
        {/* 장화 · 다리 */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.15, 0, 0]}>
            <P color={c('#A88B63')} line={line} position={[0, 0.1, 0.05]} scale={[1, 0.8, 1.35]}>
              <sphereGeometry args={[0.13, 14, 10]} />
            </P>
            <P color={c('#A88B63')} line={line} position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.32, 12]} />
            </P>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.07, 0.08, 0.25, 10]} />
              <Toon color={dark} />
            </mesh>
          </group>
        ))}
        {/* 하얀 속옷 + 연두 판초 */}
        <P color={c('#F4F4EF')} line={line} position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.22, 0.32, 0.6, 18]} />
        </P>
        <P color={c('#A9C987')} line={false} position={[0, 0.98, 0]} geometry={poncho} mat={<Toon color={c('#A9C987')} side={THREE.DoubleSide} />} />
        <P color={c('#6F9548')} line={line} position={[0, 0.63, 0]} rotation={[Math.PI / 2, 0, 0]} thick={0.01}>
          <torusGeometry args={[0.56, 0.035, 8, 32]} />
        </P>
        {revealed && (
          <>
            <mesh position={[0, 1.38, 0.33]} rotation={[-0.5, 0, 0]}>
              <coneGeometry args={[0.1, 0.22, 3]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            {[0.05, -0.05].map((y) => (
              <mesh key={y} position={[0, 1.2 + y, 0.46]} rotation={[-0.45, 0, 0]}>
                <boxGeometry args={[0.16, 0.025, 0.01]} />
                <meshBasicMaterial color="#86A95A" />
              </mesh>
            ))}
          </>
        )}
        {/* 검은 팔 (지팡이 쪽 팔은 앞으로) */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.36, 1.32, 0]} rotation={[s > 0 ? -0.6 : 0, 0, s * 0.35]}>
            <mesh position={[0, -0.22, 0]}>
              <capsuleGeometry args={[0.055, 0.35, 4, 8]} />
              <Toon color={dark} />
            </mesh>
            <mesh position={[0, -0.47, 0]} scale={[1, 1, 0.7]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <Toon color={dark} />
            </mesh>
          </group>
        ))}
        {/* 머리 */}
        <group position={[0, 1.78, 0]}>
          <P color={revealed ? '#1E1D22' : dark} line={line} scale={[1, 1.08, 0.95]}>
            <sphereGeometry args={[0.3, 26, 20]} />
          </P>
          {revealed ? (
            <>
              <HairCap color="#E9D891" r={0.33} tilt={-0.55} depth={0.52} z={-0.04} />
              <P color="#E9D891" position={[0, 0.13, 0.17]} rotation={[0.6, 0, 0]} scale={[1.2, 0.5, 0.8]}>
                <sphereGeometry args={[0.24, 18, 12]} />
              </P>
              {/* 앞으로 늘어진 머리 두 갈래 + 등 뒤로 긴 머리 */}
              {[-1, 1].map((s) => (
                <P key={s} color="#E9D891" position={[s * 0.25, -0.22, 0.12]} rotation={[0.15, 0, s * 0.12]}>
                  <capsuleGeometry args={[0.075, 0.42, 6, 10]} />
                </P>
              ))}
              <P color="#D7C68E" position={[0, -0.35, -0.18]} scale={[1.6, 1, 0.6]}>
                <capsuleGeometry args={[0.2, 0.55, 6, 14]} />
              </P>
              {[-1, 1].map((s) => (
                <P key={s} color="#8DB55A" position={[s * 0.26, 0.2, -0.02]} rotation={[0, s * 0.3, s * -0.95]} scale={0.62} geometry={leaf} thick={0.012} />
              ))}
              {[-0.1, 0.1].map((x) => (
                <mesh key={x} position={[x, 0, 0.28]} scale={[0.65, 1.35, 0.4]}>
                  <sphereGeometry args={[0.045, 10, 8]} />
                  <meshBasicMaterial color="#F7CF4A" toneMapped={false} />
                </mesh>
              ))}
            </>
          ) : (
            <>
              <mesh position={[0.18, 0.3, 0]} rotation={[0, 0, -0.5]}>
                <coneGeometry args={[0.12, 0.42, 6]} />
                <Toon color={dark} />
              </mesh>
              <mesh position={[0.1, 0.02, 0.27]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#FF3B3B" emissive="#FF2020" emissiveIntensity={3} toneMapped={false} />
              </mesh>
            </>
          )}
        </group>
        {/* 지팡이 */}
        <mesh position={[0.5, 1.15, 0.35]}>
          <cylinderGeometry args={[0.035, 0.04, 2.3, 8]} />
          <Toon color={revealed ? '#6E5235' : '#2A2033'} />
        </mesh>
        <mesh position={[0.5, 2.35, 0.35]}>
          <torusGeometry args={[0.14, 0.035, 8, 16]} />
          <meshStandardMaterial color="#B98CFF" emissive="#8A4DFF" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <pointLight position={[0.5, 2.35, 0.6]} color="#8A4DFF" intensity={5} distance={6} />
      </group>
      {revealed && <Label y={3.4} text="코덱스" className="codex" />}
    </group>
  )
}

/* ---------- 네이티 ---------- */
// 몸통과 불꽃을 한 덩어리로: 아래는 둥글고 위로 갈수록 가늘어지며 한쪽으로 휜다 (회전체)
const FLAME = (() => {
  const g = new THREE.LatheGeometry(
    [[0.001, -0.44], [0.28, -0.38], [0.44, -0.18], [0.47, 0.06], [0.4, 0.3], [0.27, 0.55], [0.14, 0.8], [0.05, 1.0], [0.001, 1.06]].map(([x, y]) => new THREE.Vector2(x, y)),
    32,
  )
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + 0.55 * Math.max(0, p.getY(i) - 0.15) ** 2)
  g.computeVertexNormals()
  return g
})()

// 네이티: 정체불명의 동물. 평소엔 푸른 불꽃, 가끔 붉은빛. 말린 불꽃 꼬리와 떠다니는 불씨.
export function Naty({ position, color = 'blue', label, scale = 1 }) {
  const root = useRef()
  const tail = useRef()
  const sparks = useRef()
  const red = color === 'red'
  const main = red ? '#F25A46' : '#6FA6E2'
  const face = red ? '#FFE1D8' : '#E2F2FD'
  const eye = red ? '#A2342A' : '#6170B8'
  const glow = red ? '#FF2E1F' : '#3E8BFF'
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (root.current) {
      root.current.position.y = Math.sin(t * 2.2) * 0.18
      root.current.rotation.y = Math.sin(t * 0.8) * 0.4
    }
    if (tail.current) tail.current.rotation.z = Math.sin(t * 3) * 0.12
    if (sparks.current) sparks.current.rotation.y = t * 0.9
  })
  const mat = <Toon color={main} emissive={glow} emissiveIntensity={0.12} />
  return (
    <group position={position} scale={scale}>
      <group ref={root}>
        {/* 위로 솟아 한쪽으로 기우는 불꽃 끝 + 말린 끝 */}
        <group ref={tail}>
          <P color={main} mat={mat} geometry={FLAME} scale={[1, 1, 0.95]} />
          <P color={main} mat={mat} position={[0.47, 1.02, 0]} rotation={[0, 0, -1.5]} thick={0.012}>
            <torusGeometry args={[0.08, 0.035, 10, 20, Math.PI * 1.3]} />
          </P>
        </group>
        {/* 얼굴: 몸통 표면을 따라 휘어진 밝은 판 */}
        <mesh position={[0, -0.05, 0]} scale={[1, 0.85, 0.95]}>
          <sphereGeometry args={[0.49, 32, 16, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.25, 1.1]} />
          <Toon color={face} />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, -0.02, 0.48]} rotation={[0, 0, x > 0 ? -0.2 : 0.2]} scale={[0.55, 1.2, 0.3]}>
            <sphereGeometry args={[0.06, 12, 10]} />
            <meshBasicMaterial color={eye} />
          </mesh>
        ))}
        <group ref={sparks}>
          {[[0.62, 0.3, 0.05], [-0.6, 0.15, 0.04], [0.1, 0.45, -0.55]].map((p, i) => (
            <P key={i} color={main} mat={mat} position={p} thick={0.01}>
              <sphereGeometry args={[0.05 + i * 0.01, 10, 8]} />
            </P>
          ))}
        </group>
        <pointLight position={[0, -0.7, 0.6]} color={main} intensity={3} distance={6} />
      </group>
      {label && <Label y={1.5} text={label} />}
    </group>
  )
}

