const cream = '#f7e6c9'
const edge = '#705044'

function Bunting({ x = 0, y = 0 }) {
  return <g transform={`translate(${x} ${y})`}>
    <path d="M0 0Q53 24 111 1" fill="none" stroke={edge} strokeWidth="1" />
    <path d="m14 6 9 13 7-8m10 1 9 14 8-12m10 0 10 10 7-13m10-4 8 8 5-12" fill="#ba6451" />
    <path d="m30 10 8 12 7-9m38-2 8 9 6-14" fill="#ce9f4c" />
  </g>
}

function Hills({ dusk = false, safari = false }) {
  return <>
    <path d="M0 0h420v160H0z" fill={dusk ? '#e8bd9c' : '#dfe9de'} />
    <circle cx={dusk ? 352 : 73} cy="34" r="17" fill={dusk ? '#f2cc84' : '#faf0d5'} />
    <path d="M0 90Q34 52 92 64t83 5q47-24 92-10t68-6q45-13 85 22v85H0z" fill={dusk ? '#b8a398' : '#a9bd9f'} />
    <path d="M0 104q50-19 108-14t79 4q72-38 123-25t110-5v96H0z" fill={safari ? '#8da277' : dusk ? '#a58d7d' : '#94ae97'} />
  </>
}

function Trees({ x, y, scale = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M3 28V6m13 22V1m16 27V10" stroke="#5d5945" strokeWidth="2" />
    <path d="M-5 12Q-1 0 7 2t5 11Q8 19-5 12zM5 8q0-13 12-14t10 11q-7 10-22 3zM24 17q-4-12 6-13t11 12q-5 6-17 1z" fill="#729272" stroke="#556f58" strokeWidth=".65" />
  </g>
}

function Fair({ dusk = false }) {
  return <>
    <Hills dusk={dusk} />
    <path d="M0 118q91-19 175-11t245 2v51H0z" fill={dusk ? '#d4b29a' : '#d5c2a1'} />
    <path d="M0 130q82-13 157-10t263 3" fill="none" stroke="#b6a080" strokeDasharray="8 11" />
    <Trees x={22} y={78} />
    <Trees x={354} y={75} scale={1.2} />
  </>
}

export default function RepairSet({ id, dusk }) {
  switch (id) {
    case 'food':
      return <>
        <path d="M0 0h420v158H0z" fill="#ead9bc" />
        <path d="M0 31h420v82H0z" fill="#f5ead7" />
        <path d="M0 42h420M0 62h420M0 82h420M0 102h420M18 42v20m30 0v20m30-40v20m30 0v20m30-40v20m30 0v20m30-40v20m30 0v20m30-40v20m30 0v20m30-40v20m30 0v20m30-40v20m30 0v20" stroke="#d7c8b0" strokeWidth=".7" />
        <path d="M0 0h420v9H0z" fill="#ae5948" />
        <path d="M14 0h17v9H14zm48 0h17v9H62zm48 0h17v9h-17zm48 0h17v9h-17zm48 0h17v9h-17zm48 0h17v9h-17zm48 0h17v9h-17zm48 0h17v9h-17zm48 0h17v9h-17z" fill="#f1d4a1" />
        <path d="M0 113h420v45H0z" fill="#d8b28b" />
        <path d="M0 124h420m-420 28h420" stroke="#b18664" />
        <path d="M5 69h7v25H5m394-25h8v25h-8" fill="#bb6857" stroke={edge} strokeWidth=".8" />
        <path d="M15 84h8v10h-8m373-10h8v10h-8" fill="#ccac5a" />
      </>
    case 'safari':
      return <>
        <Hills safari />
        <Trees x={9} y={64} scale={.9} /><Trees x={286} y={35} scale={.77} /><Trees x={371} y={36} />
        <path d="M0 108h99q63-1 134-44l22-7 165-6v107H0z" fill="#c7ac7d" />
        <path d="M0 111h101q66 0 148-47l171-8" stroke="#e3cca5" strokeWidth="5" fill="none" />
        <path d="M327 66v20m16-24v22m16-23v22m16-24v22m16-23v22m16-24v22m-83-9 87-8" fill="none" stroke="#8b7659" strokeWidth="2" />
      </>
    case 'coaster':
      return <>
        <Fair dusk={dusk} />
        <path d="M99 106V84h44v27m-48-26 10-13h34l9 13z" fill="#cf826f" stroke="#845e51" />
        <path d="M105 76h33m-31 10v16h28V86" fill={cream} stroke="#845e51" strokeWidth=".75" />
        <path d="M112 95q-5-8 4-8t4 8l-4 5z" fill="#c67584" />
      </>
    case 'carousel':
      return <>
        <Fair />
        <Bunting x={12} y={28} /><Bunting x={293} y={29} />
        <path d="M130 127q73-11 164 1l17 7H112z" fill="#a58768" opacity=".56" />
      </>
    case 'viking':
      return <>
        <Fair />
        <path d="M18 129h86m218 0h80m-375-11v18m13-18v18m14-18v18m14-18v18m14-18v18m248-18v18m14-18v18m14-18v18m14-18v18m14-18v18" stroke="#84694e" strokeWidth="2" />
        <path d="M160 28h103v11H160z" fill="#b35f4c" stroke={edge} />
      </>
    case 'sign':
      return <>
        <Fair dusk={dusk} />
        <path d="M56 119v37m166-37v37" stroke="#6f6657" strokeWidth="9" />
        <Bunting x={297} y={14} />
      </>
    case 'parade':
      return <>
        <Fair />
        <Bunting x={139} y={26} /><Bunting x={19} y={24} />
        <path d="M0 117q84-13 143-7t108-9q41-25 169-24v51q-121 2-156 22H0z" fill="#b59376" />
        <path d="M0 126q83-12 142-9t120-11q47-15 158-17" fill="none" stroke="#ecdbc4" strokeDasharray="9 9" />
      </>
    case 'delivery':
      return <>
        <path d="M0 0h420v158H0z" fill="#ded1af" />
        <path d="M0 12h420v41H0z" fill="#eae0c9" />
        <path d="M7 52h406M14 55v59m390-59v59m-404 8h420" stroke="#aa957a" strokeWidth="3" />
        <path d="M16 30h27v20H16zm23-7h20v27H39zm322 7h26v20h-26zm20 9h23v11h-23z" fill="#bb9366" stroke={edge} strokeWidth=".6" />
        <path d="M23 30v10m24-16v12m323-6v8" stroke="#ebd4ab" strokeWidth="4" />
      </>
    default:
      return null
  }
}
