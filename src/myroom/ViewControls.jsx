import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

const ROTATE = 0.005
const MIN_PITCH = 0.12
const MAX_PITCH = 1.4
const MIN_DIST = 5
const MAX_DIST = 18

// 마우스 드래그로 시점 회전, 휠로 확대·축소. 값은 view ref에 쓰고 Robot이 카메라에 반영한다.
export default function ViewControls({ view }) {
  const { gl } = useThree()

  useEffect(() => {
    const el = gl.domElement
    let last = null

    const down = (e) => {
      last = { x: e.clientX, y: e.clientY }
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }
    const moveView = (e) => {
      if (!last) return
      const v = view.current
      v.yaw -= (e.clientX - last.x) * ROTATE
      v.pitch = Math.min(MAX_PITCH, Math.max(MIN_PITCH, v.pitch + (e.clientY - last.y) * ROTATE))
      last = { x: e.clientX, y: e.clientY }
    }
    const up = (e) => {
      last = null
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      el.style.cursor = 'grab'
    }
    const wheel = (e) => {
      e.preventDefault()
      const v = view.current
      v.dist = Math.min(MAX_DIST, Math.max(MIN_DIST, v.dist * Math.exp(e.deltaY * 0.001)))
    }
    const noMenu = (e) => e.preventDefault()

    el.style.cursor = 'grab'
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', moveView)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    el.addEventListener('contextmenu', noMenu)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', moveView)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('contextmenu', noMenu)
    }
  }, [gl, view])

  return null
}
