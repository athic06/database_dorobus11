// 고장 수사대 2D 장면의 배경. 그림은 모두 무료 에셋이다.
// Kenney(CC0): 하늘과 풀밭 배경, 나무, 덤불, 구름, 해와 달, 울타리, 천막 장식, 나무 벽 (public/repair/kenney)
const K = (name) => `${import.meta.env.BASE_URL}repair/kenney/${name}.png`

// 가로세로 비율을 지켜 (x, y)에 너비 w로 놓는다. h를 주면 그 높이로 늘린다.
export const SIZES = {
  tree: [94, 204], treePine: [106, 254], treeLong: [82, 249], bush1: [120, 60], bushAlt1: [141, 47],
  cloud1: [203, 121], cloud3: [216, 139], sun: [84, 84], moon: [78, 80], fence: [104, 77],
  curtain_straight: [256, 80],
  industrial_029: [70, 70], industrial_031: [70, 70], industrial_057: [70, 70], industrial_067: [70, 70],
  industrial_035: [70, 22], industrial_036: [70, 22], industrial_037: [70, 22],
  industrial_039: [50, 40], industrial_040: [50, 40],
  industrial_070: [58, 50], industrial_098: [58, 50], ball_blue: [21, 26], ball_red: [21, 26], ball_yellow: [21, 26],
  present_large_red: [70, 70], present_large_yellow: [70, 70], present_small_orange: [41, 53],
}
export function Sprite({ name, x, y, w, h, flip = false, opacity }) {
  const [sw, sh] = SIZES[name] ?? [1, 1]
  const height = h ?? (w * sh) / sw
  return <image href={K(name)} x={x} y={y} width={w} height={height} preserveAspectRatio="none" opacity={opacity}
    transform={flip ? `translate(${2 * x + w} 0) scale(-1 1)` : undefined} />
}

// 바깥 장면: Kenney 하늘·풀밭 배경의 아래쪽을 쓰고, 해(또는 저녁 노을), 구름, 나무를 얹는다
function Outdoor({ dusk = false, trees = true }) {
  return <>
    <image href={K(dusk ? 'backgroundColorFall' : 'backgroundColorGrass')} x="0" y="-190" width="420" height="420" preserveAspectRatio="none" />
    <Sprite name={dusk ? 'moon' : 'sun'} x={dusk ? 340 : 52} y={10} w={22} />
    <Sprite name="cloud1" x={120} y={6} w={44} opacity={0.9} />
    <Sprite name="cloud3" x={250} y={14} w={38} opacity={0.85} />
    {trees && <>
      <Sprite name="treePine" x={6} y={58} w={22} />
      <Sprite name="tree" x={26} y={70} w={20} />
      <Sprite name="treeLong" x={392} y={56} w={18} />
      <Sprite name="bush1" x={360} y={104} w={34} />
    </>}
  </>
}

// 축제 장식: Kenney 사격장 천막 장식을 위쪽에 이어 붙인다
function Valance({ y = 0, h = 14 }) {
  const w = (256 * h) / 80
  return <>{Array.from({ length: Math.ceil(420 / w) }, (_, i) => <Sprite key={i} name="curtain_straight" x={i * w} y={y} w={w} h={h} />)}</>
}

// 실내 장면: 나무 벽(Kenney bg_wood 무늬)과 바닥
function Indoor({ floor = 113 }) {
  return <>
    <defs>
      <pattern id="repair-wood" width="48" height="48" patternUnits="userSpaceOnUse">
        <image href={K('bg_wood')} width="48" height="48" />
      </pattern>
    </defs>
    <rect width="420" height="158" fill="url(#repair-wood)" />
    <rect width="420" height={floor} fill="#fff3dd" opacity=".35" />
    <rect y={floor} width="420" height={158 - floor} fill="#8a5a3a" opacity=".55" />
  </>
}

export default function RepairSet({ id, dusk }) {
  switch (id) {
    case 'food':
      return <><Indoor /><Valance /></>
    case 'delivery':
      return <Indoor floor={122} />
    case 'safari':
      return <>
        <Outdoor />
        {[300, 330, 360, 390].map((x) => <Sprite key={x} name="fence" x={x} y={38} w={30} />)}
      </>
    case 'coaster':
      return <Outdoor dusk={dusk} />
    case 'carousel':
      return <><Outdoor /><Valance /></>
    case 'viking':
      return <>
        <Outdoor />
        {[8, 36, 64, 330, 358, 386].map((x) => <Sprite key={x} name="fence" x={x} y={112} w={28} />)}
      </>
    case 'sign':
      return <><Outdoor dusk={dusk} /><Valance /></>
    case 'parade':
      return <><Outdoor /><Valance /></>
    default:
      return null
  }
}
