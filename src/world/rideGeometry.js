import * as THREE from 'three'

export function createCoasterTrack() {
  return new THREE.CatmullRomCurve3([
    [-11, 3.2, 0], [-9, 6, -6], [-3, 14.5, -9], [5, 15, -8], [11, 6, -4],
    [12, 3.3, 3], [7, 8, 8], [0, 9.5, 9], [-8, 4.5, 7],
  ].map(p => new THREE.Vector3(...p)), true, 'centripetal')
}
