// 대화창 옆에 뜨는 캐릭터 2D 초상화.
// 주요 캐릭터는 스토리 소개 영상의 캐릭터 카드 그림을 잘라 public/portraits/ 에 넣어 두었다(배경 투명 PNG).
// 그림 파일이 없는 화자(방문객 등)는 아래의 SVG 그림을 쓴다.
const base = import.meta.env.BASE_URL
const IMAGE_FILES = {
  xylo: `${base}portraits/xylo.png`,
  zero: `${base}portraits/zero.png`,
  riko: `${base}portraits/riko.png`,
  naty: `${base}portraits/naty.png`,
  codex: `${base}portraits/codex.png`,
  shadow: `${base}portraits/codex.png`, // ??? 실루엣: 코덱스 그림을 어둡게
}

const KEY = { 자일로: 'xylo', 제로: 'zero', 리코: 'riko', 네이티: 'naty', 코덱스: 'codex', '???': 'shadow', 일기장: 'diary', 편지: 'letter' }

const SKIN = '#F6D2B4'
const LINE = '#3B2F2A'

function Eyes({ y = 112, gap = 22, color = '#2B2F3A', shine = true }) {
  return (
    <g>
      {[-gap, gap].map((dx) => (
        <g key={dx}>
          <ellipse cx={100 + dx} cy={y} rx="7" ry="9" fill={color} />
          {shine && <circle cx={102 + dx} cy={y - 3} r="2.4" fill="#fff" />}
        </g>
      ))}
    </g>
  )
}

function Xylo() {
  return (
    <g>
      <path d="M40 220 C44 168 70 156 100 156 C130 156 156 168 160 220 Z" fill="#5E8F4E" />
      <path d="M86 158 L100 186 L114 158 Z" fill="#F7F3EA" />
      <rect x="120" y="182" width="16" height="12" rx="2" fill="#F5C451" />
      <rect x="90" y="140" width="20" height="22" fill={SKIN} />
      <ellipse cx="100" cy="108" rx="46" ry="50" fill={SKIN} />
      <path d="M52 104 C48 62 76 46 102 48 C134 50 156 70 150 108 C142 84 128 74 104 72 C84 72 66 82 52 104 Z" fill="#B9BCC4" />
      <path d="M60 74 C72 52 112 44 136 62 C120 58 98 58 82 70 Z" fill="#D3D6DD" />
      {[-21, 21].map((dx) => (
        <circle key={dx} cx={100 + dx} cy="110" r="14" fill="none" stroke={LINE} strokeWidth="3.5" />
      ))}
      <path d="M93 110 L107 110" stroke={LINE} strokeWidth="3" />
      <Eyes y={111} gap={21} />
      <path d="M68 92 L88 90 M112 90 L132 92" stroke="#8E929B" strokeWidth="5" strokeLinecap="round" />
      <path d="M86 134 C94 142 106 142 114 134" fill="none" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="54" cy="112" rx="7" ry="11" fill={SKIN} />
      <ellipse cx="146" cy="112" rx="7" ry="11" fill={SKIN} />
    </g>
  )
}

function Zero() {
  return (
    <g>
      <path d="M40 220 C44 170 70 158 100 158 C130 158 156 170 160 220 Z" fill="#4C9A63" />
      <path d="M74 160 L100 178 L126 160 L120 152 L100 166 L80 152 Z" fill="#F5C451" />
      <rect x="90" y="140" width="20" height="22" fill={SKIN} />
      <ellipse cx="100" cy="110" rx="44" ry="48" fill={SKIN} />
      <path d="M50 108 L44 70 L64 80 L62 44 L84 64 L96 30 L108 60 L128 38 L130 66 L154 58 L146 86 L158 100 C146 80 124 70 100 72 C78 72 60 84 50 108 Z" fill="#F08A3E" />
      <path d="M64 84 L80 98 L86 80 L100 96 L108 78 L120 94 L132 82 L136 96" fill="none" stroke="#D9692A" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <Eyes y={114} gap={20} color="#2B5D3A" />
      <path d="M72 96 L90 100 M110 100 L128 96" stroke="#C25A1F" strokeWidth="5" strokeLinecap="round" />
      <path d="M84 132 C92 146 108 146 116 132 Z" fill="#B23A3A" />
      <path d="M88 134 L112 134" stroke="#fff" strokeWidth="3" />
      <ellipse cx="78" cy="128" rx="7" ry="4" fill="#F4A3A3" opacity="0.7" />
      <ellipse cx="122" cy="128" rx="7" ry="4" fill="#F4A3A3" opacity="0.7" />
    </g>
  )
}

function Riko() {
  return (
    <g>
      <path d="M44 120 C34 170 40 210 48 220 L152 220 C160 210 166 170 156 120 Z" fill="#7F9CC4" />
      <path d="M46 220 C50 172 72 160 100 160 C128 160 150 172 154 220 Z" fill="#7E6BC4" />
      <path d="M88 162 L100 180 L112 162 Z" fill="#E9E4F8" />
      <rect x="91" y="140" width="18" height="22" fill={SKIN} />
      <ellipse cx="100" cy="110" rx="42" ry="47" fill={SKIN} />
      <path d="M54 118 C46 70 70 50 102 50 C136 50 156 74 148 118 C140 96 132 82 118 76 C110 90 94 96 72 94 C64 100 58 108 54 118 Z" fill="#8FA9C9" />
      <path d="M72 94 C86 90 102 82 110 70" fill="none" stroke="#6F8AB0" strokeWidth="3" />
      <Eyes y={116} gap={20} color="#3C4C8A" />
      <path d="M74 102 L90 104 M110 104 L126 102" stroke="#5E6F99" strokeWidth="4" strokeLinecap="round" />
      <path d="M92 136 C97 140 103 140 108 136" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="78" cy="130" rx="6" ry="3.5" fill="#F4A3A3" opacity="0.6" />
      <ellipse cx="122" cy="130" rx="6" ry="3.5" fill="#F4A3A3" opacity="0.6" />
    </g>
  )
}

function Naty({ red }) {
  const c = red ? '#FF6B5A' : '#5AA0FF'
  const d = red ? '#D7332A' : '#2557D6'
  return (
    <g>
      <path d="M100 30 C120 70 162 92 156 150 C152 196 126 214 100 214 C74 214 48 196 44 150 C40 104 86 96 82 60 C94 76 98 52 100 30 Z" fill={c} stroke={d} strokeWidth="4" />
      <ellipse cx="96" cy="170" rx="34" ry="24" fill="#fff" opacity="0.35" />
      <ellipse cx="80" cy="146" rx="9" ry="13" fill="#14213D" />
      <ellipse cx="120" cy="146" rx="9" ry="13" fill="#14213D" />
      <circle cx="83" cy="141" r="3" fill="#fff" />
      <circle cx="123" cy="141" r="3" fill="#fff" />
    </g>
  )
}

function Codex({ shadow }) {
  const robe = shadow ? '#14101C' : '#3B4A3A'
  return (
    <g>
      <path d="M30 220 C36 150 64 120 100 120 C136 120 164 150 170 220 Z" fill={robe} />
      <path d="M48 128 C46 70 70 38 100 38 C130 38 154 70 152 128 C140 100 124 92 100 92 C76 92 60 100 48 128 Z" fill={shadow ? '#0E0B14' : '#2E3A2D'} />
      <ellipse cx="100" cy="116" rx="36" ry="38" fill={shadow ? '#1B1626' : '#D9B48F'} />
      {shadow ? (
        <circle cx="114" cy="112" r="5" fill="#FF3B3B" />
      ) : (
        <>
          <path d="M70 128 C72 176 128 176 130 128 C120 140 80 140 70 128 Z" fill="#EDEDED" />
          <path d="M80 104 L94 106 M106 106 L120 104" stroke="#EDEDED" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="86" cy="116" rx="4" ry="5" fill="#1B1B22" />
          <ellipse cx="114" cy="116" rx="4" ry="5" fill="#1B1B22" />
          <polygon points="100,178 112,190 100,202 88,190" fill="none" stroke="#B98CFF" strokeWidth="4" />
        </>
      )}
      <rect x="160" y="60" width="6" height="160" fill={shadow ? '#2A2033' : '#6B4E33'} />
      <circle cx="163" cy="56" r="10" fill="none" stroke="#B98CFF" strokeWidth="4" />
    </g>
  )
}

function Book({ letter }) {
  return letter ? (
    <g>
      <rect x="40" y="80" width="120" height="84" rx="8" fill="#F6EAD2" stroke="#C9A97A" strokeWidth="4" />
      <path d="M40 84 L100 128 L160 84" fill="none" stroke="#C9A97A" strokeWidth="4" />
      <circle cx="100" cy="130" r="12" fill="#B55B3A" />
      <polygon points="100,122 107,130 100,138 93,130" fill="none" stroke="#F6EAD2" strokeWidth="2.5" />
    </g>
  ) : (
    <g>
      <rect x="50" y="56" width="104" height="136" rx="8" fill="#8B4A2B" />
      <rect x="58" y="62" width="92" height="124" rx="4" fill="#A85E38" />
      <rect x="146" y="56" width="10" height="136" rx="3" fill="#6E3A20" />
      <circle cx="104" cy="122" r="18" fill="none" stroke="#E9C88E" strokeWidth="4" />
    </g>
  )
}

// 이름 없는 방문객 · 상점 주인 등: 이름으로 옷 색을 정한다
function Generic({ name }) {
  const palette = ['#E57E9A', '#4E8BFF', '#F5B841', '#4CAF6E', '#9B6BD6', '#F08A3E', '#7A8CA8']
  const hairs = ['#3B2A20', '#B9BCC4', '#7A4A20', '#1E1E24']
  const h = [...name].reduce((s, c) => s + c.charCodeAt(0), 0)
  return (
    <g>
      <path d="M44 220 C48 170 72 158 100 158 C128 158 152 170 156 220 Z" fill={palette[h % palette.length]} />
      <rect x="90" y="140" width="20" height="22" fill={SKIN} />
      <ellipse cx="100" cy="112" rx="42" ry="46" fill={SKIN} />
      <path d="M56 108 C52 70 76 56 100 56 C126 56 150 70 144 108 C134 86 120 78 100 78 C80 78 64 88 56 108 Z" fill={hairs[h % hairs.length]} />
      <Eyes y={116} gap={19} />
      <path d="M88 136 C96 142 104 142 112 136" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

export default function Portrait({ who, red = false }) {
  const key = KEY[who]
  if (IMAGE_FILES[key]) {
    const cls = `portrait-img${key === 'shadow' ? ' shadow' : ''}${key === 'naty' && red ? ' red' : ''}`
    return <img className={cls} src={IMAGE_FILES[key]} alt="" draggable={false} />
  }
  let art
  if (key === 'xylo') art = <Xylo />
  else if (key === 'zero') art = <Zero />
  else if (key === 'riko') art = <Riko />
  else if (key === 'naty') art = <Naty red={red} />
  else if (key === 'codex') art = <Codex />
  else if (key === 'shadow') art = <Codex shadow />
  else if (key === 'diary') art = <Book />
  else if (key === 'letter') art = <Book letter />
  else art = <Generic name={who} />
  return (
    <svg viewBox="0 0 200 220" className="portrait-svg" aria-hidden="true">
      {art}
    </svg>
  )
}
