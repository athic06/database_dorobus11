import { useCallback, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Only presentation is delayed: existing interaction handlers retain all story checks.
export function useSceneEntry(hold) {
  const [state, setState] = useState(null)
  const current = useRef(null)
  const move = useCallback(next => { current.current = next; setState(next) }, [])
  const enter = useCallback((shot, action) => {
    if (current.current) return
    move({ ...shot, phase: 'enter', action, reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches })
  }, [move])
  const arrive = useCallback(() => {
    const value = current.current
    if (value?.phase !== 'enter') return
    move({ ...value, phase: 'hold', action: null })
    value.action()
  }, [move])
  useEffect(() => {
    if (state?.phase === 'hold' && !hold) move({ ...state, phase: 'return' })
  }, [state, hold, move])
  const finish = useCallback(() => move(null), [move])
  return { state, enter, arrive, finish, active: !!state, transitioning: !!state && state.phase !== 'hold' }
}

export function sceneShot(pos, title, offset = [5, 3.6, 7], focusHeight = 1.8) {
  return { title, eye: [pos[0] + offset[0], pos[1] + offset[1], pos[2] + offset[2]], target: [pos[0], pos[1] + focusHeight, pos[2]], fov: 46 }
}

export function EntryCamera({ entry }) {
  const runtime = useRef({ phase: null })
  const helper = useRef(new THREE.Object3D())
  useFrame(({ camera }, delta) => {
    const state = entry.state, r = runtime.current
    if (!state) { r.phase = null; return }
    if (r.phase !== state.phase) {
      r.phase = state.phase
      r.elapsed = 0
      r.from = camera.position.clone()
      r.rotation = camera.quaternion.clone()
      r.fov = camera.fov
      if (state.phase === 'enter') {
        r.home = { pos: camera.position.clone(), quat: camera.quaternion.clone(), fov: camera.fov }
        r.to = new THREE.Vector3(...state.eye)
        // Cameras look along -Z; Object3D.lookAt uses +Z.
        helper.current.position.copy(r.to)
        helper.current.lookAt(...state.target)
        helper.current.rotateY(Math.PI)
        r.toRotation = helper.current.quaternion.clone()
        r.toFov = state.fov
      } else if (state.phase === 'return') {
        r.to = r.home.pos
        r.toRotation = r.home.quat
        r.toFov = r.home.fov
      }
    }
    if (state.phase === 'hold') {
      camera.position.copy(r.to)
      camera.quaternion.copy(r.toRotation)
      camera.fov = r.toFov
      camera.updateProjectionMatrix()
      return
    }
    r.elapsed += delta
    const duration = state.reduced ? 0.01 : state.phase === 'enter' ? 1.15 : 0.65
    const t = Math.min(r.elapsed / duration, 1), ease = t * t * t * (t * (t * 6 - 15) + 10)
    camera.position.lerpVectors(r.from, r.to, ease)
    camera.quaternion.slerpQuaternions(r.rotation, r.toRotation, ease)
    camera.fov = THREE.MathUtils.lerp(r.fov, r.toFov, ease)
    camera.updateProjectionMatrix()
    if (t === 1) state.phase === 'enter' ? entry.arrive() : entry.finish()
  })
  return null
}

export function EntryOverlay({ entry }) {
  if (!entry.transitioning) return null
  return <div className="scene-entry" role="status" aria-live="polite">
    <div className="scene-entry-top" />
    <div className="scene-entry-caption"><small>DOROLAND / {entry.state.phase === 'enter' ? 'ENTER' : 'EXPLORE'}</small><strong>{entry.state.title}</strong></div>
    {entry.state.phase === 'enter' && <button onClick={entry.arrive}>연출 건너뛰기 →</button>}
  </div>
}
