import { useEffect, useRef } from 'react'

// e.code를 써서 한글 입력 상태에서도 WASD가 동작하게 한다.
const MAP = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  Space: 'jump',
}

const isTyping = (e) => ['INPUT', 'TEXTAREA'].includes(e.target?.tagName)

export function useKeyboard(onAction) {
  const keys = useRef({ forward: false, back: false, left: false, right: false, jump: false })
  const actionRef = useRef(onAction)
  actionRef.current = onAction

  useEffect(() => {
    const down = (e) => {
      if (isTyping(e)) return
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
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', reset)
    }
  }, [])

  return keys
}
