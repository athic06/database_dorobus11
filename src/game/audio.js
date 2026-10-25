// 아주 간단한 멜로디 재생기 (Web Audio). 소리 파일 없이 음 높이로 바로 연주한다.
const FREQ = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
}

let ctx = null
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// notes: ['C4', 'E4', ...], beat: 한 음 길이(초). 끝나는 시간(ms)을 돌려준다.
export function playNotes(notes, beat = 0.32, startDelay = 0) {
  let ac
  try {
    ac = getCtx()
  } catch {
    return 0
  }
  const t0 = ac.currentTime + 0.05 + startDelay
  notes.forEach((n, i) => {
    const f = FREQ[n]
    if (!f) return
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'triangle'
    osc.frequency.value = f
    const t = t0 + i * beat
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.95)
    osc.connect(gain).connect(ac.destination)
    osc.start(t)
    osc.stop(t + beat)
  })
  return (startDelay + notes.length * beat) * 1000
}
