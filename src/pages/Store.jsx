import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import Robot, { INITIAL_VIEW, viewOffset } from '../myroom/Robot.jsx'
import ViewControls from '../myroom/ViewControls.jsx'
import RoomHud from '../components/RoomHud.jsx'
import { Person } from '../world/Characters.jsx'
import { FURNITURE } from '../myroom/Furniture.jsx'
import { useKeyboard } from '../myroom/useKeyboard.js'
import { useProximity } from '../game/useProximity.js'
import { SHOP_ITEMS, useStore } from '../store.jsx'

// 상점 공간: 마이룸 상점 포탈로 워프해 오는 3D 가구 가게.
// 진열대에 실제 가구가 놓여 있고, 가까이 가면 가격 카드가 떠서 바로 사거나 구매 목표로 정한다.
const HALF_X = 13
const HALF_Z = 9
const EXIT_POS = [11.6, 0, 5.5]
const COUNTER_POS = [0, 0, -7.2]

// 진열대 자리 (앞줄 6개, 뒷줄 나머지) · 진열용 크기와 높이
const SHOW = {
  bed: { scale: 0.5 }, tv: { scale: 0.62 }, shelf: { scale: 0.5 }, lamp: { scale: 0.55 }, rug: { scale: 0.42 },
  plant: { scale: 0.85 }, beanbag: { scale: 0.85 }, aquarium: { scale: 0.75 }, guitar: { scale: 0.75 },
  clock: { scale: 0.9, y: 1.1 }, poster: { scale: 0.75, y: 1.1 },
}
const slots = SHOP_ITEMS.map((item, i) => {
  const back = i >= 6
  const n = back ? SHOP_ITEMS.length - 6 : 6
  const k = back ? i - 6 : i
  const x = -((n - 1) * 3.9) / 2 + k * 3.9
  return { item, pos: [x, 0, back ? -2.6 : 2.6] }
})

function StoreRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF_X * 2, HALF_Z * 2]} />
        <meshStandardMaterial color="#F3E6CF" />
      </mesh>
      {/* 바닥 체크무늬 띠 */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -7.5 + i * 3]} receiveShadow>
          <planeGeometry args={[HALF_X * 2, 1.5]} />
          <meshStandardMaterial color="#EAD8B8" />
        </mesh>
      ))}
      {[
        [[0, 3.5, -HALF_Z], 0, HALF_X * 2],
        [[HALF_X, 3.5, 0], -Math.PI / 2, HALF_Z * 2],
        [[-HALF_X, 3.5, 0], Math.PI / 2, HALF_Z * 2],
      ].map(([pos, rot, w]) => (
        <mesh key={rot} position={pos} rotation={[0, rot, 0]} receiveShadow>
          <planeGeometry args={[w, 7]} />
          <meshStandardMaterial color="#A7D3C8" />
        </mesh>
      ))}
      {/* 간판 */}
      <mesh position={[0, 5, -HALF_Z + 0.05]}>
        <boxGeometry args={[7, 1.2, 0.1]} />
        <meshStandardMaterial color="#E2574C" />
      </mesh>
      <Html position={[0, 5, -HALF_Z + 0.2]} center transform scale={0.6} zIndexRange={[1, 0]}>
        <div className="store-sign">도로랜드 가구점</div>
      </Html>
      {/* 계산대 */}
      <mesh position={[COUNTER_POS[0], 0.6, COUNTER_POS[2] + 1]} castShadow>
        <boxGeometry args={[4.2, 1.2, 1]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      <Person position={COUNTER_POS} color="#F08A3E" hair="#3B2A20" hat="#E2574C" label="가구점 주인" />
    </group>
  )
}

function Pedestal({ item, pos, owned, active }) {
  const f = FURNITURE[item.id]
  const show = SHOW[item.id] || { scale: 0.7 }
  return (
    <group position={pos}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.45, 0.4, 32]} />
        <meshStandardMaterial color={active ? '#FFF4D6' : '#FFFFFF'} />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[1.37, 1.37, 0.02, 32]} />
        <meshStandardMaterial color={item.color} />
      </mesh>
      {f && (
        <group position={[0, 0.42 + (show.y || 0), 0]} scale={show.scale}>
          <f.C position={[0, 0, 0]} />
        </group>
      )}
      <Html position={[0, 2.9, 0]} center zIndexRange={[1, 0]}>
        <div className={`price-tag${owned ? ' owned' : ''}`}>{item.name} · {owned ? '보유 ✓' : `${item.price} CELL`}</div>
      </Html>
    </group>
  )
}

function ExitPortal({ active }) {
  const ring = useRef()
  useFrame((s) => {
    if (ring.current) ring.current.material.emissiveIntensity = 2.2 + Math.sin(s.clock.elapsedTime * 3) * 0.6 + (active ? 1.5 : 0)
  })
  return (
    <group position={[EXIT_POS[0] + 1, 1.6, EXIT_POS[2]]} rotation={[0, -Math.PI / 2, 0]}>
      <group scale={[1, 1.4, 1]}>
        <mesh ref={ring}>
          <torusGeometry args={[0.9, 0.07, 16, 64]} />
          <meshStandardMaterial color="#3d7bff" emissive="#2f6bff" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[0.88, 48]} />
          <meshBasicMaterial color="#0d2a7a" transparent opacity={0.8} />
        </mesh>
      </group>
      <pointLight color="#4d8dff" intensity={8} distance={6} position={[0, 0, 0.8]} />
      <Html position={[0, 2.1, 0]} center zIndexRange={[1, 0]}>
        <div className="portal-label">마이룸 포탈</div>
      </Html>
    </group>
  )
}

export default function Store() {
  const navigate = useNavigate()
  const { user, cell, owned, buy, progress, setProgress } = useStore()
  const posRef = useRef(new THREE.Vector3(EXIT_POS[0] - 1.6, 0, EXIT_POS[2]))
  const targetRef = useRef(null)
  const view = useRef({ ...INITIAL_VIEW, yaw: Math.PI / 5 })
  const [msg, setMsg] = useState('')
  const [bubble, setBubble] = useState('')

  const { near, nearRef, onMove } = useProximity([
    ...slots.map((s) => ({ id: s.item.id, pos: s.pos, radius: 2.3 })),
    { id: 'exit', pos: EXIT_POS, radius: 2 },
  ])
  const colliders = [...slots.map((s) => [s.pos[0], s.pos[2], 1.75]), [COUNTER_POS[0], COUNTER_POS[2] + 1, 2.3]]
  const item = SHOP_ITEMS.find((i) => i.id === near)
  const has = item && owned.includes(item.id)
  const isGoal = item && progress.goalItem === item.id

  const purchase = (it) => {
    if (owned.includes(it.id)) return setMsg(`${it.name}은(는) 이미 마이룸에 있어요.`)
    if (cell < it.price) return setMsg(`CELL이 ${it.price - cell} 모자라요. 🎯 목표로 정해 두면 마이룸에서 남은 CELL을 알려 줘요.`)
    if (buy(it)) setMsg(`${it.name} 구매 완료! 마이룸에 놓아 두었어요.`)
  }
  const interact = (id) => {
    if (id === 'exit') return navigate('/myroom', { state: { from: 'store' } })
    const it = SHOP_ITEMS.find((i) => i.id === id)
    if (it) purchase(it)
  }
  const keys = useKeyboard((code) => {
    if (code === 'KeyE' && nearRef.current) interact(nearRef.current)
  })

  const start = posRef.current.clone().add(viewOffset(view.current))
  return (
    <div className="room-page">
      <Canvas shadows camera={{ position: [start.x, start.y, start.z], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#DDEEE9']} />
        <ambientLight intensity={0.85} />
        <hemisphereLight args={['#ffffff', '#c9a982', 0.5]} />
        <directionalLight position={[-6, 14, 8]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={12} shadow-camera-bottom={-12} />
        <ViewControls view={view} />
        <StoreRoom />
        {slots.map((s) => <Pedestal key={s.item.id} item={s.item} pos={s.pos} owned={owned.includes(s.item.id)} active={near === s.item.id} />)}
        <ExitPortal active={near === 'exit'} />
        <Robot
          posRef={posRef}
          targetRef={targetRef}
          keys={keys}
          view={view}
          name={user.name}
          bubble={bubble}
          onMove={onMove}
          bounds={{ minX: -HALF_X + 0.7, maxX: HALF_X - 0.7, minZ: -HALF_Z + 0.7, maxZ: HALF_Z - 0.7 }}
          colliders={colliders}
        />
      </Canvas>

      <RoomHud title="도로랜드 가구점" backTo="/myroom" backLabel="← 마이룸" onChat={setBubble} />
      {near === 'exit' && <button className="hud prompt" onClick={() => interact('exit')}>E · 마이룸으로 돌아가기</button>}
      {item && (
        <div className="hud store-card">
          <div className="store-card-top">
            <span className="store-swatch" style={{ background: item.color }} />
            <div>
              <b>{item.name}</b>
              <small>{item.desc}</small>
            </div>
          </div>
          <div className="store-card-actions">
            <button className="btn-primary" disabled={has} onClick={() => purchase(item)}>
              {has ? '보유 중' : `E · 사기 ${item.price} CELL`}
            </button>
            {!has && (
              <button className="btn-ghost" aria-pressed={isGoal} onClick={() => { setProgress({ goalItem: isGoal ? null : item.id }); setMsg(isGoal ? '구매 목표를 해제했어요.' : `구매 목표: ${item.name}`) }}>
                {isGoal ? '🎯 목표 해제' : '🎯 목표로'}
              </button>
            )}
          </div>
        </div>
      )}
      {msg && <p className="hud raid-note" role="status"><span>{msg}</span></p>}
    </div>
  )
}
