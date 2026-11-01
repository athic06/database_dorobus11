// Mixamo FBX(스킨 없이, 30fps, X Bot) → 로봇 캐릭터용 모션 JSON
// 사용법: node scripts/mixamo-to-json.mjs <FBX 폴더> public/models/robot/motions.json
// 폴더 안 파일 이름이 곧 모션 이름이다 (idle.fbx, walk.fbx …). 원본 FBX는 저장소에 넣지 않는다.
//
// 줄이는 것
// - 손가락·발끝 같은 잔뼈는 버리고 로봇에 필요한 뼈 22개만 남긴다 (손·발끝 뼈는 위치만 쓰고 회전 트랙은 뺀다)
// - cm → m, 소수점 3자리
// - 공중 동작(점프, 낙하, 착지)은 골반이 서 있는 높이보다 위로 못 가게 자른다. 높이는 게임 물리가 맡는다.
// - 점프는 도약 직전부터, 착지는 발이 닿는 순간부터 쓰도록 앞을 잘라 낸다 (키를 누르자마자 반응하게)
import fs from 'node:fs'
import path from 'node:path'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

const [dir, out] = process.argv.slice(2)
if (!dir || !out) {
  console.error('node scripts/mixamo-to-json.mjs <FBX 폴더> <출력 JSON>')
  process.exit(1)
}

const KEEP = [
  'Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head',
  'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand',
  'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
  'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase',
  'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase',
]
const NO_TRACK = new Set(['LeftHand', 'RightHand', 'LeftToeBase', 'RightToeBase'])
const CLIPS = ['idle', 'walk', 'jog', 'run', 'jump_up', 'fall', 'land', 'stand_to_sit', 'sit_idle', 'wave']
const AIR = new Set(['jump_up', 'fall', 'land'])
const STAND_Y = 1.0 // 공중 동작에서 골반이 올라갈 수 있는 최대 높이(m)
const r3 = (x) => Math.round(x * 1000) / 1000

const strip = (n) => n.replace(/^mixamorig:?/, '')

function load(file) {
  const buf = fs.readFileSync(file)
  return new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '')
}

// 뼈대 기본 자세(T자세): 첫 파일에서 뽑는다
let skeleton = null
const clips = {}

for (const name of CLIPS) {
  const file = path.join(dir, `${name}.fbx`)
  if (!fs.existsSync(file)) {
    console.warn('없음:', file)
    continue
  }
  const obj = load(file)
  if (!skeleton) {
    skeleton = KEEP.map((n) => {
      const b = obj.getObjectByName(`mixamorig${n}`)
      let parent = b.parent
      while (parent && !KEEP.includes(strip(parent.name))) parent = parent.parent
      // 중간에 빠진 뼈가 없어서(손가락·발끝 끝 뼈만 버림) 부모 위치를 그대로 쓸 수 있다
      return {
        name: n,
        parent: parent?.isBone ? strip(parent.name) : null,
        p: b.position.toArray().map((v) => r3(v / 100)),
        q: b.quaternion.toArray().map(r3),
      }
    })
  }

  const clip = obj.animations[0]
  const byName = Object.fromEntries(clip.tracks.map((t) => [t.name.replace('mixamorig', ''), t]))
  const hipsP = byName['Hips.position']
  const n = hipsP.times.length
  const fps = Math.round((n - 1) / clip.duration)
  const hy = (i) => hipsP.values[i * 3 + 1] / 100

  // 앞을 잘라 낼 프레임
  let start = 0
  if (name === 'jump_up') {
    // 웅크렸다가 다시 처음 높이를 넘는 순간(도약) 바로 앞
    let min = 0
    for (let i = 0; i < n; i++) if (hy(i) < hy(min)) min = i
    let take = min
    while (take < n - 1 && hy(take) < hy(0)) take++
    start = Math.max(0, take - 2)
  }
  if (name === 'land') {
    // 떨어지다가 골반이 서 있는 높이까지 내려온 순간(발이 닿음)
    while (start < n - 1 && hy(start) > STAND_Y) start++
    start = Math.max(0, start - 1)
  }

  const tracks = {}
  for (const bone of KEEP) {
    if (NO_TRACK.has(bone)) continue
    const q = byName[`${bone}.quaternion`]
    if (!q) continue
    const v = []
    for (let i = start; i < n; i++) for (let k = 0; k < 4; k++) v.push(r3(q.values[i * 4 + k]))
    tracks[bone] = v
  }
  // 골반 위치: 제자리 동작은 좌우 흔들림만 남기고, 나머지는 첫 프레임 기준으로 옮긴다
  const x0 = hipsP.values[start * 3] / 100
  const z0 = hipsP.values[start * 3 + 2] / 100
  const inPlace = ['idle', 'walk', 'jog', 'run'].includes(name)
  const hips = []
  for (let i = start; i < n; i++) {
    let x = hipsP.values[i * 3] / 100
    let y = hipsP.values[i * 3 + 1] / 100
    let z = hipsP.values[i * 3 + 2] / 100
    if (!inPlace) {
      x -= x0
      z -= z0
    }
    if (AIR.has(name)) {
      x = 0
      z = 0
      y = Math.min(y, STAND_Y)
    }
    hips.push(r3(x), r3(y), r3(z))
  }
  clips[name] = { fps, frames: n - start, hips, tracks }
  console.log(name.padEnd(13), `${((n - start - 1) / fps).toFixed(2)}s`, `frames ${n - start}`, start ? `(앞 ${start}프레임 자름)` : '')
}

// 앉아 있는 자세는 앉는 동작이 끝난 자리에서 이어지게 골반 위치를 맞춘다
if (clips.stand_to_sit && clips.sit_idle) {
  const s = clips.stand_to_sit.hips
  const lx = s[s.length - 3]
  const lz = s[s.length - 1]
  const h = clips.sit_idle.hips
  for (let i = 0; i < h.length; i += 3) {
    h[i] = r3(h[i] + lx)
    h[i + 2] = r3(h[i + 2] + lz)
  }
}

fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify({ source: 'Mixamo (X Bot, 30fps)', skeleton, clips }))
console.log('→', out, `${(fs.statSync(out).size / 1024).toFixed(0)} KB`)
