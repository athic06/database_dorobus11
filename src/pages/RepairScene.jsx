import { useEffect, useState } from 'react'
import RepairSet from './RepairSet.jsx'

const gold = '#d6a14f'
const mint = '#486957'
const coral = '#a84435'
const ink = '#302c24'
const clamp = (value) => Math.min(1, Math.max(0, value))

function Caption({ x, y = 143, color = ink, children }) {
  return <text x={x} y={y} fill={color} textAnchor="middle" className="repair-scene-text">{children}</text>
}

function positionOn(points, progress) {
  const index = Math.min(points.length - 2, Math.floor(progress * (points.length - 1)))
  const fraction = progress * (points.length - 1) - index
  return points[index].map((value, axis) => value + (points[index + 1][axis] - value) * fraction)
}

function route(points) {
  return points.map(([x, y]) => [x, y + 10].join(',')).join(' ')
}

function Box({ x, y, color = gold }) {
  return <g transform={`translate(${x} ${y})`}>
    <rect x="-9" y="-8" width="18" height="16" rx="3" fill={color} />
    <path d="M0-8v6m-9 1h18" stroke={ink} strokeOpacity=".55" />
  </g>
}

function Truck({ point, color = gold, cargo = false, tilt = 0 }) {
  return <g transform={`translate(${point.join(' ')}) rotate(${tilt})`}>
    <path d="M-25-3h29v-13h13l9 10v13h-51z" fill={color} />
    <path d="M9-12h6l6 7H9z" fill={ink} />
    <circle cx="-15" cy="8" r="5" fill="#0c2525" stroke="#c3e3d5" strokeWidth="2" />
    <circle cx="15" cy="8" r="5" fill="#0c2525" stroke="#c3e3d5" strokeWidth="2" />
    {cargo && <Box x={-12} y={-12} color={coral} />}
  </g>
}

function Belt({ x = 28, y = 102, width = 364, reverse = false }) {
  return <g>
    <rect x={x + 12} y={y + 9} width={width - 24} height="12" fill="#94785c" />
    <rect x={x} y={y} width={width} height="13" rx="6.5" fill="#53635a" stroke="#4d473b" />
    <path d={`M${x + 8} ${y + 3}h${width - 16}`} stroke="#91a198" strokeWidth=".8" />
    <circle cx={x + 7} cy={y + 6.5} r="2.5" fill="#e5d2ab" />
    <circle cx={x + width - 7} cy={y + 6.5} r="2.5" fill="#e5d2ab" />
    {[.18, .38, .62, .82].map(ratio => <path key={ratio}
      d="M-3-3 1 0-3 3" fill="none" stroke="#e5d2ab" strokeWidth="1.2"
      transform={`translate(${x + width * ratio} ${y + 7}) scale(${reverse ? -1 : 1} 1)`} />)}
  </g>
}

const ingredients = {
  base: ['바닥 빵', 'bun', 15],
  patty: ['패티', 'beef', 13],
  cheese: ['치즈', 'cheese', 12],
  greens: ['채소', 'lettuce', 14],
  top: ['윗빵', 'bun', 27],
}

function Ingredient({ id }) {
  const [, file, height] = ingredients[id]
  return <image href={`${import.meta.env.BASE_URL}repair/last-bite/${file}.png`}
    x="-30" y={6 - height} width="60" height={height} preserveAspectRatio="none" />
}

function BurgerLine({ x, width, label, extra, early, diverted, progress }) {
  const order = extra
    ? early ? ['cheese', 'base', 'patty', 'greens', 'top'] : ['base', 'patty', 'cheese', 'greens', 'top']
    : ['base', 'patty', 'greens', 'top']
  const step = progress * (order.length + 1)
  const current = progress > 0 && progress < .98 ? ingredients[order[Math.min(order.length - 1, Math.floor(step))]] : null
  const center = x + width / 2
  return <g>
    <path d={`M${center - 44} 9h88v22h-88z`} fill="#fff8df" stroke="#b7946f" strokeWidth=".7" />
    <Caption x={center} y={24} color={progress >= .98 && (early || diverted) ? coral : ink}>{label}</Caption>
    <g transform={`translate(${center} 0)`}>
      <path d="M-30 37h60l-8 9H-23z" fill="#a2a69a" stroke="#5e5e50" />
      <path d="M-22 45h44v5h-44z" fill="#69746a" />
      <circle cx="24" cy="41" r="1.8" fill="#f9d273" />
    </g>
    <Belt x={x + 5} y={105} width={width - 10} />
    <path d={`M${center - 34} 103h68l-5 5h-58z`} fill="#f2e8ce" stroke="#766653" strokeWidth=".75" />
    {order.map((id, index) => {
      const move = clamp(step - index)
      if (move <= 0) return null
      const side = id === 'greens' && diverted
      const xPosition = center + (side ? Math.min(width / 2 - 22, 145) * move * move : 0)
      const stack = diverted && id === 'top' ? index - 1 : index
      const y = 51 + ((side ? 101 : 99 - stack * 9) - 51) * move * move
      return <g key={id} transform={`translate(${xPosition} ${y}) rotate(${side ? 16 * move : 0})`}>
        <Ingredient id={id} />
      </g>
    })}
    <Caption x={center} color={progress >= .98 && (early || diverted) ? coral : ink}>
      {current ? `${current[0]} 투입` : progress >= .98 && (early ? '치즈가 빵 아래에 깔림' : diverted ? '채소가 옆 통로로 빠짐' : '빠진 재료 없이 완성')}
    </Caption>
  </g>
}

function Food({ settings, trial, inspected, field, progress }) {
  const early = field ? inspected !== 'delay' : settings.timing === 0
  const diverted = !early && (field || settings.junction !== 2)
  if (field && inspected === 'run') return <>
    <path d="M210 14v116" stroke="#ad8561" strokeDasharray="3 5" />
    <BurgerLine x={12} width={188} label="기본 주문" progress={progress} />
    <BurgerLine x={220} width={188} label="치즈 추가" extra early progress={progress} />
  </>
  const extra = field || trial?.index !== 0
  const branchX = [104, 241, 301][settings.junction]
  return <>
    {extra && <path d={diverted ? 'M245 76h66l61 23' : `M${branchX} 64v23h${branchX < 210 ? 63 : -55}`}
      stroke={diverted ? '#a85c45' : '#a38a5b'} strokeWidth="5" strokeDasharray="4 5" fill="none" opacity=".6" />}
    <BurgerLine x={22} width={376} label={field && !inspected ? '조리대' : inspected === 'delay' ? '치즈 늦게 넣기' : extra ? '치즈 추가' : '기본 주문'}
      extra={extra} early={extra && early} diverted={extra && diverted} progress={progress} />
  </>
}

function Carousel({ settings, trial, inspected, progress }) {
  const level = settings.height - 4
  const pad = 113 - level * 4
  const spin = trial ? progress * (trial.ok ? 2 : .88) * Math.PI : 0
  return <>
    <path d="M92 126h237" stroke="#688d80" strokeWidth="3" />
    {[105, 213, 320].map((x, i) => <g key={x}>
      <rect x={x - 7} y={i === 1 ? pad - 25 : 88} width="14" height={i === 1 ? 151 - pad : 38}
        rx="3" fill={i === 1 ? gold : '#75a493'} />
      <Caption x={x} y={145} color={i === 1 ? gold : mint}>{['A · 4칸', `B · ${settings.height}칸`, 'C · 4칸'][i]}</Caption>
    </g>)}
    <g transform={`rotate(${-level * 3} 210 84)`}>
      <ellipse cx="210" cy="86" rx="123" ry="17" fill="#a97259" stroke="#704938" strokeWidth="2" />
      <path d="M210 29v54m-72-32 72-28 72 28z" fill="#f2ce8a" stroke="#79493a" strokeWidth="2" strokeLinejoin="round" />
      <path d="m138 51 72-28-34 28zm56 0 16-28 18 28zm51 0-35-28 72 28z" fill="#b95e50" />
      <path d="M141 51q7 8 14 0 7 8 14 0 7 8 14 0 7 8 14 0 7 8 14 0 7 8 14 0 7 8 14 0 7 8 14 0 7 8 14 0 7 8 14 0" fill="none" stroke="#9d5948" strokeWidth="1.5" />
      {[0, 1, 2, 3].map(i => {
        const phase = spin + i * Math.PI / 2
        const x = 210 + Math.cos(phase) * 92
        const y = 72 + Math.sin(phase) * 9
        return <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0-12v24" stroke="#b87e42" />
          <path d="M-13 2q2-5 8-3l9 1 5-8 3 4 5 3-1 4-7 1-2 7H4V7h-9l-5 5-3-1 3-7z" fill={i % 2 ? '#e6ad88' : '#fff0ca'} stroke="#724c3b" strokeWidth=".8" />
          <path d="M-7 0h8v4h-8z" fill={i % 2 ? '#658372' : '#a85145'} />
        </g>
      })}
      <circle cx="297" cy="88" r="5" fill="#ffdb59" />
      {inspected === 'level' && <circle cx="267" cy="86" r="5" fill="#fff" />}
    </g>
  </>
}

function Safari({ settings, trial, inspected, progress }) {
  const hill = [[40, 99], [138, 99], [254, 57], [369, 47]]
  const cargo = settings.cargo === 0
  const beltTest = trial?.index === 1
  const arrival = cargo ? .64 : 1
  const point = positionOn(hill, beltTest ? 0 : progress * arrival)
  const boxTravel = !cargo && beltTest ? progress * (settings.direction ? 1 : -.12) : 0
  return <>
    <Caption x={82} y={27}>3호차 · 투어 노선</Caption>
    <Caption x={345} y={27} color={mint}>동물 구역</Caption>
    <polyline points={route(hill)} fill="none" stroke="#6d9b85" strokeWidth="7" strokeLinejoin="round" />
    <Truck point={point} cargo={cargo} tilt={!beltTest && progress > .34 && progress < .87 ? -13 : 0} />
    <Belt x={55} y={120} width={310} reverse={!settings.direction} />
    {!cargo && <Box x={104 + boxTravel * 228} y={116} />}
    {inspected === 'weight' && <Caption x={244} y={38} color={coral}>짐칸 무게 초과</Caption>}
    <Caption x={210} y={150}>먹이 전용 운반 벨트</Caption>
  </>
}

function Viking({ settings, trial, inspected, progress }) {
  const spins = trial && trial.kind !== 'kids' && trial.index !== 0
  const imbalance = settings.side === 1 ? 2 - settings.mass : 2 + settings.mass
  const swing = trial ? Math.sin(progress * Math.PI * (trial.ok ? 2 : 1.3)) * 26 : 0
  const shake = spins && imbalance !== 0 && progress > .6 && progress < .94 ? Math.sin(progress * 125) * 7 : 0
  const rotation = spins ? progress * (trial.ok ? 360 : 130) + shake : 0
  return <>
    <path d="M117 136 174 29h72l57 107" fill="none" stroke="#75a797" strokeWidth="9" strokeLinejoin="round" />
    <g transform={`rotate(${swing} 210 32)`}>
      <path d="M210 32v64" stroke={gold} strokeWidth="8" strokeLinecap="round" />
      <g transform={`translate(210 105) rotate(${rotation})`}>
        <circle r="32" fill="#203f42" stroke="#addaca" strokeWidth="3" />
        <path d="M0-31a31 31 0 0 1 0 62z" fill="#80534b" />
        {Array.from({ length: 8 }, (_, i) => <circle key={i}
          cx={Math.cos(i * Math.PI / 4 - 1.18) * 24} cy={Math.sin(i * Math.PI / 4 - 1.18) * 24}
          r="3.8" fill={i < 4 ? coral : mint} />)}
        <Box x={12} y={-9} color={coral} />
        {settings.mass > 0 && <circle cx={settings.side ? -15 : 15} cy="8" r={3 + settings.mass} fill={gold} />}
      </g>
    </g>
    <circle cx="210" cy="32" r="9" fill="#f3d28c" stroke={ink} strokeWidth="3" />
    <Caption x={64} y={104} color={coral}>{inspected === 'weight' ? '1–4번이 더 무거움' : '배터리 · 1–4번'}</Caption>
    <Caption x={353} y={104} color={gold}>{settings.mass ? `균형추 · ${settings.mass}칸` : '균형추 미장착'}</Caption>
    {trial && <Caption x={210} y={150}>{trial.kind === 'kids' || trial.index === 0 ? '어린이 모드 · 팔만 움직임' : '스릴 모드 · 팔과 원판'}</Caption>}
  </>
}

function Coaster({ settings, trial, inspected, field, progress }) {
  const compare = field && trial?.kind === 'run'
  const evening = compare ? progress >= .5 : trial?.index === 1 || field
  const moving = compare ? (progress < .5 ? progress * 2 : (progress - .5) * 2) : progress
  const dusty = field ? evening : !settings.clean || (evening && settings.screen !== 1)
  const track = [[25, 89], [74, 55], [107, 61], [154, 111], [211, 116], [268, 91], [316, 44], [348, 45], [392, 90]]
  const [x, y] = positionOn(track, moving * (dusty ? .65 : 1))
  return <>
    <RepairSet id="coaster" dusk={evening} />
    <Caption x={60} y={22}>{evening ? '저녁 운행' : '아침 운행'}</Caption>
    {track.filter((_, i) => i % 2).map(([x, y]) => <path key={x} d={`M${x} ${y + 10}v${134 - y}`} stroke="#446d63" strokeWidth="3" />)}
    <polyline points={route(track)} fill="none" stroke="#694b45" strokeWidth="4" strokeLinejoin="round" />
    {dusty && [0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={215 + i * 8} cy={117 - i * 4} r={i % 2 ? 2 : 3} fill={coral} />)}
    {settings.screen !== 0 && <rect x={settings.screen === 1 ? 248 : 349} y="27" width="7" height="39" rx="2" fill={mint} />}
    {(inspected === 'rail' || evening) && <path d="M161 66h74l-9-6m9 6-9 6" fill="none" stroke={coral} strokeDasharray="4 3" />}
    <g transform={`translate(${x} ${y})`}>
      <rect x="-14" y="-7" width="28" height="13" rx="4" fill={gold} />
      <circle cx="-7" cy="7" r="3" fill="#16322f" stroke={mint} />
      <circle cx="7" cy="7" r="3" fill="#16322f" stroke={mint} />
    </g>
    <Caption x={275} y={151} color={dusty ? coral : mint}>{dusty ? '설탕 가루가 쌓이는 구간' : '마지막 언덕 · 레일 정상'}</Caption>
  </>
}

function Sign({ settings, trial, inspected, field, progress }) {
  const night = trial ? (field ? progress >= .45 : trial.index === 1) : inspected === 'wire'
  const lit = night && settings.wire !== 2
  const overload = lit && settings.wire === 0
  const flicker = overload && (progress === 1 || Math.floor(progress * 8) % 2 === 0)
  return <>
    <RepairSet id="sign" dusk={night} />
    <rect x="32" y="17" width="214" height="116" rx="12" fill={night ? '#10292e' : '#31584d'} stroke="#719d8e" />
    {['도로랜드 축제', '퍼레이드 안내', flicker ? '■ · ░ · ■' : '오후 6시 개막'].map((line, i) => <g key={i}>
      <rect x="47" y={30 + i * 31} width="184" height="25" rx="5" fill={i === 2 && overload ? '#753e3c' : '#21493f'} />
      <Caption x={139} y={47 + i * 31} color={i === 2 && overload ? '#ffc5a2' : '#f9dda2'}>{line}</Caption>
    </g>)}
    <path d={settings.wire === 0 ? 'M246 107h53V67h75' : 'M274 128h34V67h66'} fill="none" stroke={overload ? coral : mint} strokeWidth="3" strokeDasharray={settings.wire === 2 ? '3 5' : undefined} />
    {[311, 338, 365].map(x => <circle key={x} cx={x} cy="67" r="7" fill={lit ? gold : '#607b73'} />)}
    <Caption x={337} y={43}>{night ? '밤 · 장식 조명' : '낮 · 안내 표시'}</Caption>
    <Caption x={336} y={109} color={overload ? coral : mint}>{['3번 줄과 전선 공유', '장식 전원 분리', '장식 전원 꺼짐'][settings.wire]}</Caption>
  </>
}

function Parade({ settings, trial, inspected, progress }) {
  const routeTest = trial?.index === 1 || inspected === 'route'
  const [x, y] = positionOn(
    settings.route ? [[44, 101], [153, 111], [235, 111], [324, 90]] : [[44, 101], [128, 101], [216, 75], [324, 75]],
    progress * (routeTest ? settings.route ? 1 : .65 : settings.load && settings.balance ? 1 : .52),
  )
  return <>
    <path d="M35 112h89l93-26h122" stroke="#719a8b" strokeWidth="6" fill="none" strokeLinejoin="round" />
    <path d="M125 114h127l82-18" stroke={settings.route ? mint : '#5e8077'} strokeDasharray="6 5" fill="none" />
    <path d="M314 78V33h77v45m-86-45h95l-47-18z" fill="#42685d" stroke="#7cab9b" strokeWidth="2" />
    {[329, 351, 376].map((lamp, index) => <circle key={lamp} cx={lamp} cy="44" r="5"
      fill={settings.power || Math.floor(progress * 16 + index) % 3 === 0 ? gold : '#77634b'} />)}
    <Caption x={351} y={65} color="#fff0d6">축제 무대</Caption>
    {!settings.route && <path d="M236 78h24m-22-7 20 13m0-13-20 13" stroke={coral} strokeWidth="4" />}
    <Truck point={[x, y]} cargo={!settings.load} tilt={!settings.balance ? -8 : 0} />
    {[0, 1, 2].map(i => {
      const dx = settings.balance ? (i - 1) * 15 : -19 - i * 10
      return <g key={i}><path d={`M${x - 6} ${y - 12}l${dx + 6} -23`} stroke={mint} />
        <ellipse cx={x + dx} cy={y - 37 - i % 2 * 5} rx="7" ry="9" fill={[coral, gold, mint][i]} /></g>
    })}
    <Caption x={105} y={142} color={settings.load && settings.balance ? mint : coral}>{settings.load ? '짐 별도 운반' : '짐과 장식을 차량에 적재'}</Caption>
    <Caption x={317} y={142} color={settings.route ? mint : coral}>{settings.route ? '우회로 연결' : '기존 도로에 장애물'}</Caption>
  </>
}

function Delivery({ settings, trial, progress }) {
  const emptyTest = trial?.index === 0
  const stop = settings.direction ? settings.clear ? 1 : .83 : .46
  return <>
    <Caption x={103} y={43}>첫 번째 롤러</Caption>
    <Caption x={243} y={43} color={settings.direction ? mint : coral}>두 번째 롤러</Caption>
    <Belt x={27} y={88} width={144} />
    <Belt x={173} y={88} width={153} reverse={!settings.direction} />
    <path d="M333 78v32h61V78" fill="#315a4f" stroke={mint} strokeWidth="3" />
    {!settings.clear && <path d="M309 86l-6-11 16 2 5 9z" fill={coral} />}
    {!emptyTest && <Box x={51 + 311 * progress * stop} y={78} />}
    {emptyTest && <circle cx={51 + 267 * progress * (settings.direction ? 1 : .52)} cy="96" r="5" fill={mint} />}
    <Caption x={361} y={133}>{settings.clear ? '도착 상자' : '포장 조각이 막음'}</Caption>
  </>
}

const scenes = { food: Food, carousel: Carousel, safari: Safari, viking: Viking, coaster: Coaster, sign: Sign, parade: Parade, delivery: Delivery }
const locations = {
  food: '푸드코트 안쪽 조리대',
  carousel: '회전목마 승강장',
  safari: '사파리 3호차 출발점',
  viking: '이클립스 탑승장',
  coaster: '롤러코스터 마지막 언덕',
  sign: '광장 입구 전광판',
  parade: '퍼레이드 리허설 구간',
  delivery: '작업실 포장대',
}

export default function RepairScene({ item, settings, trial, inspected, field, finished = false, stage = false }) {
  const [frame, setFrame] = useState(null)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const animate = Boolean(trial && !reduceMotion && !finished)

  useEffect(() => {
    if (!animate) return
    let animation
    const step = (now) => {
      const progress = clamp((now - trial.start) / trial.duration)
      setFrame({ trial, progress })
      if (progress < 1) animation = requestAnimationFrame(step)
    }
    animation = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animation)
  }, [animate, trial])

  const Scene = scenes[item.id]
  if (!Scene) return null
  const showBurger = item.id === 'food' && (!field || inspected === 'run' || inspected === 'delay')
  const progress = animate ? frame?.trial === trial ? frame.progress : 0 : trial || showBurger ? 1 : 0
  const testing = trial?.kind === 'test'
  const status = testing ? progress < 1 ? '시험 중' : trial.ok ? '통과' : '재점검'
    : trial && progress < 1 ? '작동 중' : null

  const art = <>
    {item.id !== 'coaster' && item.id !== 'sign' && <RepairSet id={item.id} />}
    <Scene settings={settings} trial={trial} inspected={inspected} field={field} progress={progress} />
  </>
  const caption = <figcaption><span>{locations[item.id]}</span>{status && <b data-failed={testing && progress >= 1 && !trial.ok}>{status}</b>}</figcaption>
  if (stage) return (
    <figure className={`repair-scene repair-scene-stage repair-scene-${item.id}`}>
      <svg className="repair-stage-fill" viewBox="0 0 420 158" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{art}</svg>
      <svg className="repair-stage-main" viewBox="0 0 420 158" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${item.district} 장치 작동 그림`}>{art}</svg>
      {caption}
    </figure>
  )
  return (
    <figure className={`repair-scene repair-scene-${item.id}`}>
      <svg viewBox="0 0 420 158" role="img" aria-label={`${item.district} 장치 작동 그림`}>{art}</svg>
      {caption}
    </figure>
  )
}
