import { useEffect, useRef } from 'react'

// e.code를 써서 한글 입력 상태에서도 WASD가 동작하게 한다.
const MAP = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  Space: 'jump',
  ShiftLeft: 'walk', ShiftRight: 'walk',
}

const isTyping = (e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) || e.target?.isContentEditable

export function useKeyboard(onAction, enabled = true) {
  const keys = useRef({ forward: false, back: false, left: false, right: false, jump: false, walk: false })
  const actionRef = useRef(onAction)
  actionRef.current = onAction

  useEffect(() => {
    if (!enabled) return
    const down = (e) => {
      if (isTyping(e)) return
      if (e.code === 'Space' && e.target?.closest?.('.repair-page button, .repair-page a')) return
      if (MAP[e.code]) {
        keys.current[MAP[e.code]] = true
        e.preventDefault()
      } else {
        actionRef.current?.(e.code)
      }
    }
    const up = (e) => {
      if (MAP[e.code]) keys.current[MAP[e.code]] = false
    }
    const reset = () => Object.keys(keys.current).forEach((k) => (keys.current[k] = false))
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', reset)
    return () => {
      reset()
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', reset)
    }
  }, [enabled])

  return keys
}
