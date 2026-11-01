import { useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Mixamo 모션으로 움직이는 로봇 몸체.
// public/models/robot/motions.json: Mixamo(X Bot) 뼈대 기본 자세와 모션. scripts/mixamo-to-json.mjs로 만든다.
// 뼈대 위에 로봇 조각(몸통, 머리, 팔다리)을 붙여서, 사람 동작 데이터로 로봇이 걷고 뛰고 앉는다.

const URL = `${import.meta.env.BASE_URL}models/robot/motions.json`
export const RIG_SCALE = 0.8 // Mixamo 뼈대(키 1.8m)를 로봇 키에 맞춘다

// 모션이 원래 속도로 재생될 때 실제 이동 속도(m/s, RIG_SCALE 적용 후). 이보다 빠르면 재생도 빨라진다.
const LOCO = [
  ['idle', 0],
  ['walk', 1.25],
  ['jog', 2.9],
  ['run', 4.6],
]
const LOOP = ['idle', 'walk', 'jog', 'run', 'fall', 'sit_idle', 'wave']

let dataPromise = null
function loadMotions() {
  dataPromise ??= fetch(URL).then((r) => {
    if (!r.ok) throw new Error(`motions ${r.status}`)
    return r.json()
  })
  return dataPromise
}

export function useMotions() {
  const [data, setData] = useState(null)
  useEffect(() => {
    let alive = true
    loadMotions().then((d) => alive && setData(d), () => {}) // 실패하면 기존 로봇 몸체를 그대로 쓴다
    return () => { alive = false }
  }, [])
  return data
}

function makeClip(name, c) {
  const n = c.frames
  const times = new Float32Array(n)
  for (let i = 0; i < n; i++) times[i] = i / c.fps
  const tracks = [new THREE.VectorKeyframeTrack('Hips.position', times, c.hips)]
  for (const [bone, v] of Object.entries(c.tracks)) tracks.push(new THREE.QuaternionKeyframeTrack(`${bone}.quaternion`, times, v))
  return new THREE.AnimationClip(name, (n - 1) / c.fps, tracks)
}

// 뼈대를 만들고 기본 자세(T자세)에서 로봇 조각을 붙인다. 좌표는 RIG_SCALE 적용 전(m).
function buildRig(data) {
  const bones = {}
  for (const b of data.skeleton) {
    const bone = new THREE.Bone()
    bone.name = b.name
    bone.position.fromArray(b.p)
    bone.quaternion.fromArray(b.q).normalize()
    bones[b.name] = bone
    if (b.parent) bones[b.parent].add(bone)
  }
  const root = new THREE.Group()
  root.add(bones.Hips)
  root.updateMatrixWorld(true)
  const at = (n) => bones[n].getWorldPosition(new THREE.Vector3())

  const green = new THREE.MeshStandardMaterial({ color: '#6CC395', roughness: 0.5 })
  const dark = new THREE.MeshStandardMaterial({ color: '#3E9A6C' })
  const eye = new THREE.MeshStandardMaterial({ color: '#1b2a22' })
  const glow = new THREE.MeshStandardMaterial({ color: '#2BD36B', emissive: '#2BD36B', emissiveIntensity: 0.6 })
  const disposables = [green, dark, eye, glow]

  const add = (bone, geo, mat, pos, { quat, scale, shadow = true } = {}) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.copy(pos)
    if (quat) m.quaternion.copy(quat)
    if (scale) m.scale.set(...scale)
    m.castShadow = shadow
    disposables.push(geo)
    root.add(m)
    m.updateMatrixWorld(true)
    bones[bone].attach(m) // 기본 자세의 월드 위치를 유지한 채 뼈에 붙인다
    return m
  }
  const UP = new THREE.Vector3(0, 1, 0)
  // a→b 사이를 잇는 캡슐 (팔다리)
  const limb = (bone, a, b, r) => {
    const d = new THREE.Vector3().subVectors(at(b), at(a))
    const len = d.length()
    add(bone, new THREE.CapsuleGeometry(r, Math.max(0.01, len - r * 2), 4, 10), dark, at(a).add(at(b)).multiplyScalar(0.5), {
      quat: new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()),
    })
  }

  // 몸통과 허리띠
  const spine1 = at('Spine1')
  add('Spine1', new THREE.CapsuleGeometry(0.19, 0.2, 8, 20), green, new THREE.Vector3(0, spine1.y + 0.03, spine1.z))
  add('Spine', new THREE.TorusGeometry(0.195, 0.035, 10, 32), dark, new THREE.Vector3(0, at('Spine').y - 0.06, at('Spine').z), {
    quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2),
  })
  add('Spine2', new THREE.TorusGeometry(0.2, 0.025, 10, 32), dark, new THREE.Vector3(0, at('Spine2').y + 0.06, at('Spine2').z), {
    quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2),
  })
  add('Hips', new THREE.SphereGeometry(0.15, 16, 12), dark, at('Hips').add(new THREE.Vector3(0, -0.04, 0)), { scale: [1, 0.75, 0.9] })

  // 머리: 동그란 머리, 귀 덮개와 이어진 머리띠, 눈, 안테나
  const head = at('Head').add(new THREE.Vector3(0, 0.14, 0.01))
  add('Head', new THREE.SphereGeometry(0.21, 24, 18), green, head)
  add('Head', new THREE.TorusGeometry(0.215, 0.022, 10, 32), dark, head)
  for (const s of [-1, 1]) {
    add('Head', new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), dark, head.clone().add(new THREE.Vector3(s * 0.21, 0, 0)), {
      quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2),
    })
    add('Head', new THREE.SphereGeometry(0.042, 12, 12), eye, head.clone().add(new THREE.Vector3(s * 0.075, 0.02, 0.19)), { shadow: false })
  }
  add('Head', new THREE.CylinderGeometry(0.014, 0.014, 0.2, 6), dark, head.clone().add(new THREE.Vector3(0, 0.29, 0)))
  add('Head', new THREE.SphereGeometry(0.048, 10, 10), glow, head.clone().add(new THREE.Vector3(0, 0.4, 0)), { shadow: false })

  // 팔다리
  for (const s of ['Left', 'Right']) {
    add(`${s}Arm`, new THREE.SphereGeometry(0.065, 12, 10), dark, at(`${s}Arm`))
    limb(`${s}Arm`, `${s}Arm`, `${s}ForeArm`, 0.045)
    limb(`${s}ForeArm`, `${s}ForeArm`, `${s}Hand`, 0.042)
    add(`${s}Hand`, new THREE.SphereGeometry(0.065, 12, 10), green, at(`${s}Hand`).add(new THREE.Vector3(Math.sign(at(`${s}Hand`).x) * 0.04, 0, 0)))
    limb(`${s}UpLeg`, `${s}UpLeg`, `${s}Leg`, 0.065)
    limb(`${s}Leg`, `${s}Leg`, `${s}Foot`, 0.058)
    const foot = at(`${s}Foot`)
    const toe = at(`${s}ToeBase`)
    add(`${s}Foot`, new THREE.BoxGeometry(0.13, 0.08, 0.26), dark, new THREE.Vector3(foot.x, 0.04, (foot.z + toe.z) / 2 + 0.01))
  }

  const clips = Object.fromEntries(Object.entries(data.clips).map(([k, c]) => [k, makeClip(k, c)]))
  return { root, clips, dispose: () => disposables.forEach((d) => d.dispose()) }
}

const ease = (dt, k) => 1 - Math.exp(-dt * k)

// anim: Robot이 매 프레임 채워 주는 상태 { speed, air, vy, seated, landedAt, jumpedAt, waveUntil }
export default function RobotRig({ data, anim }) {
  const rig = useMemo(() => buildRig(data), [data])
  const mixer = useMemo(() => new THREE.AnimationMixer(rig.root), [rig])
  const actions = useMemo(() => {
    const a = {}
    for (const [name, clip] of Object.entries(rig.clips)) {
      const act = mixer.clipAction(clip)
      if (!LOOP.includes(name)) {
        act.setLoop(THREE.LoopOnce, 1)
        act.clampWhenFinished = true
      }
      act.setEffectiveWeight(name === 'idle' ? 1 : 0)
      act.play()
      a[name] = act
    }
    return a
  }, [mixer, rig])
  const weights = useMemo(() => Object.fromEntries(Object.keys(actions).map((k) => [k, k === 'idle' ? 1 : 0])), [actions])
  const seen = useMemo(() => ({ jumpedAt: -1, landedAt: -1, seatedAt: -1, waveFrom: -1 }), [])

  useEffect(() => () => {
    mixer.stopAllAction()
    mixer.uncacheRoot(rig.root)
    rig.dispose()
  }, [mixer, rig])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const now = state.clock.elapsedTime
    const s = anim.current
    const target = {}
    let k = 14 // 동작이 바뀌는 빠르기 (클수록 빨리 넘어간다)

    // 새로 시작하는 한 번짜리 동작은 처음부터 다시 튼다
    if (s.jumpedAt !== seen.jumpedAt) {
      seen.jumpedAt = s.jumpedAt
      actions.jump_up.reset().play()
    }
    if (s.landedAt !== seen.landedAt) {
      seen.landedAt = s.landedAt
      actions.land.reset().play()
    }
    if (s.seated && seen.seatedAt < 0) {
      seen.seatedAt = now
      actions.stand_to_sit.reset().play()
    }
    if (!s.seated) seen.seatedAt = -1

    const speed = s.speed
    if (s.seated) {
      const t = now - seen.seatedAt
      target[t < rig.clips.stand_to_sit.duration - 0.25 ? 'stand_to_sit' : 'sit_idle'] = 1
      k = 8
    } else if (s.air) {
      // 올라갈 때는 도약 자세, 내려올 때는 떨어지는 자세
      target[s.vy > 0.5 ? 'jump_up' : 'fall'] = 1
      k = 20
    } else if (now - s.landedAt < 0.32 && speed < 1.5) {
      target.land = 1
      k = 25
    } else if (now < s.waveUntil && speed < 0.3) {
      if (seen.waveFrom < 0) {
        seen.waveFrom = now
        actions.wave.reset().play()
      }
      target.wave = 1
      k = 10
    } else {
      // 이동 속도에 따라 이웃한 두 동작을 섞는다
      let i = 0
      while (i < LOCO.length - 2 && speed > LOCO[i + 1][1]) i++
      const [a, va] = LOCO[i]
      const [b, vb] = LOCO[i + 1]
      const t = THREE.MathUtils.clamp((speed - va) / (vb - va), 0, 1)
      target[a] = 1 - t
      target[b] = (target[b] || 0) + t
    }
    if (now >= s.waveUntil || speed >= 0.3) seen.waveFrom = -1

    // 걷기·뛰기 재생 속도를 실제 이동 속도에 맞춰 발이 덜 미끄러지게 한다
    for (const [name, v] of LOCO) {
      if (v) actions[name].timeScale = THREE.MathUtils.clamp(speed / v, 0.75, 1.5)
    }

    const f = ease(dt, k)
    for (const name in actions) {
      weights[name] += ((target[name] || 0) - weights[name]) * f
      actions[name].setEffectiveWeight(weights[name] < 0.001 ? 0 : weights[name])
    }
    mixer.update(dt)
  })

  return <primitive object={rig.root} scale={RIG_SCALE} />
}
