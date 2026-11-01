import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

function makeFoliage(count, radius, y, seed) {
  let s = seed
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
  return Array.from({ length: count }, () => {
    const a = rand() * Math.PI * 2
    const r = Math.sqrt(rand()) * radius
    const h = (rand() - 0.5) * radius * 0.48
    const size = 1.15 + rand() * 1.45
    return [Math.cos(a) * r, y + h, Math.sin(a) * r, size]
  })
}

function FoliageTier({ radius, y, count, seed, colors }) {
  const ref = useRef()
  const data = useMemo(() => makeFoliage(count, radius, y, seed), [count, radius, y, seed])
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: colors, roughness: 0.92, vertexColors: false }), [colors])
  useEffect(() => {
    if (!ref.current) return
    const dummy = new THREE.Object3D()
    data.forEach(([x, yy, z, size], i) => {
      dummy.position.set(x, yy, z)
      dummy.scale.set(size * (0.9 + (i % 3) * 0.08), size * 0.72, size * (0.9 + (i % 5) * 0.025))
      dummy.rotation.set((i % 7) * 0.08, (i % 11) * 0.19, (i % 5) * 0.07)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
      const tint = new THREE.Color().setHSL(0.27 + (i % 9) * 0.004, 0.42 + (i % 4) * 0.025, 0.19 + (i % 7) * 0.012)
      ref.current.setColorAt(i, tint)
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [data])
  return <instancedMesh ref={ref} args={[geometry, material, count]} castShadow receiveShadow />
}

function Branch({ from, to, radius = 0.48 }) {
  const start = new THREE.Vector3(...from)
  const end = new THREE.Vector3(...to)
  const direction = new THREE.Vector3().subVectors(end, start)
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  return <mesh position={midpoint.toArray()} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())} castShadow>
    <cylinderGeometry args={[radius * 0.55, radius, direction.length(), 8]} />
    <meshStandardMaterial color="#68452d" roughness={1} />
  </mesh>
}

function AncientTree() {
  const branches = useMemo(() => {
    const result = []
    ;[[40, 19.5, 10], [54, 15.5, 9], [66, 11.5, 8]].forEach(([y, r, n], tier) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + tier * 0.21
        const reach = r * (0.78 + (i % 3) * 0.055)
        result.push({ from: [0, y - 1.2, 0], to: [Math.cos(a) * reach, y + (i % 3) * 0.65, Math.sin(a) * reach], radius: tier === 0 ? 0.7 : 0.52 })
      }
    })
    return result
  }, [])
  return <group>
    <mesh position={[0, 20, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.45, 2.35, 40, 18, 12]} />
      <meshStandardMaterial color="#65432d" roughness={1} />
    </mesh>
    {Array.from({ length: 9 }, (_, i) => {
      const a = i * Math.PI * 2 / 9
      return <mesh key={i} position={[Math.cos(a) * 1.5, 1.25, Math.sin(a) * 1.5]} rotation={[0, -a, -0.16]} castShadow>
        <coneGeometry args={[0.8, 3.2, 7]} />
        <meshStandardMaterial color="#704a30" roughness={1} />
      </mesh>
    })}
    {Array.from({ length: 7 }, (_, i) => <mesh key={`ridge-${i}`} position={[Math.sin(i * 2.1) * 0.72, 20, Math.cos(i * 2.1) * 0.72]} rotation={[0, i * 0.9, 0]}>
      <cylinderGeometry args={[0.12, 0.2, 39, 5]} />
      <meshStandardMaterial color="#80583a" roughness={1} />
    </mesh>)}
    {branches.map((b, i) => <Branch key={i} {...b} />)}
    <FoliageTier radius={20} y={42} count={360} seed={41} colors="#315d37" />
    <FoliageTier radius={16} y={56} count={270} seed={73} colors="#3d7040" />
    <FoliageTier radius={12} y={68} count={190} seed={97} colors="#4b7d47" />
    <mesh position={[0, 39, 0]}>
      <sphereGeometry args={[2.2, 20, 16]} />
      <meshStandardMaterial color="#8c643c" roughness={1} />
    </mesh>
    <pointLight position={[0, 46, 0]} color="#f6c86c" intensity={45} distance={38} />
  </group>
}

function Spirit({ position }) {
  const core = useRef()
  const halo = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (core.current) core.current.position.y = Math.sin(t * 2.2) * 0.18
    if (halo.current) halo.current.rotation.z = t * 0.45
  })
  return <group>
    <mesh ref={core} castShadow>
      <icosahedronGeometry args={[0.72, 2]} />
      <meshStandardMaterial color="#b8f7ff" emissive="#50dfff" emissiveIntensity={2.8} roughness={0.18} metalness={0.15} />
    </mesh>
    <mesh ref={halo}>
      <torusGeometry args={[1.15, 0.035, 8, 64]} />
      <meshBasicMaterial color="#8cecff" />
    </mesh>
    <pointLight color="#65dfff" intensity={18} distance={13} />
    <Sparkles count={24} scale={3.2} size={3} speed={0.5} color="#b8f7ff" />
  </group>
}

function PlayerWorld({ onNearTree }) {
  const player = useRef(new THREE.Vector3(0, 2.2, 13))
  const group = useRef()
  const keys = useRef({})
  const { camera, gl } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(0.22)
  const distance = useRef(13)
  const dragging = useRef(false)
  const last = useRef([0, 0])
  const [near, setNear] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const down = e => { keys.current[e.code] = true; if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault() }
    const up = e => { keys.current[e.code] = false }
    const pointerDown = e => { dragging.current = true; last.current = [e.clientX, e.clientY] }
    const pointerMove = e => {
      if (!dragging.current) return
      const dx = e.clientX - last.current[0], dy = e.clientY - last.current[1]
      yaw.current -= dx * 0.004
      pitch.current = clamp(pitch.current + dy * 0.003, -0.05, 0.85)
      last.current = [e.clientX, e.clientY]
    }
    const pointerUp = () => { dragging.current = false }
    const wheel = e => { distance.current = clamp(distance.current + e.deltaY * 0.012, 6, 24) }
    const keyAction = e => {
      if (e.code === 'KeyE' && near) setMessage('Cây Thần đang lắng nghe điều ước của bạn.')
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('keydown', keyAction)
    gl.domElement.addEventListener('pointerdown', pointerDown)
    window.addEventListener('pointermove', pointerMove)
    window.addEventListener('pointerup', pointerUp)
    gl.domElement.addEventListener('wheel', wheel, { passive: true })
    return () => {
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('keydown', keyAction)
      gl.domElement.removeEventListener('pointerdown', pointerDown); window.removeEventListener('pointermove', pointerMove); window.removeEventListener('pointerup', pointerUp)
      gl.domElement.removeEventListener('wheel', wheel)
    }
  }, [gl, near])

  useFrame((_, delta) => {
    const k = keys.current
    const forward = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0)
    const side = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0)
    const vertical = (k.Space ? 1 : 0) - (k.ControlLeft || k.ControlRight ? 1 : 0)
    const boost = k.ShiftLeft || k.ShiftRight ? 2.2 : 1
    const speed = 11 * boost * Math.min(delta, 0.04)
    const dir = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current))
    player.current.addScaledVector(dir, forward * speed)
    player.current.addScaledVector(right, side * speed)
    player.current.y = clamp(player.current.y + vertical * speed, 1.5, 34)
    player.current.x = clamp(player.current.x, -95, 95)
    player.current.z = clamp(player.current.z, -95, 95)
    if (group.current) group.current.position.copy(player.current)
    const treeNear = Math.hypot(player.current.x, player.current.z) < 29 && player.current.y < 16
    if (treeNear !== near) { setNear(treeNear); onNearTree(treeNear) }
    const cp = Math.cos(pitch.current)
    const offset = new THREE.Vector3(Math.sin(yaw.current) * cp, Math.sin(pitch.current), Math.cos(yaw.current) * cp).multiplyScalar(distance.current)
    const target = player.current.clone().add(new THREE.Vector3(0, 0.5, 0))
    camera.position.lerp(target.clone().add(offset), 1 - Math.exp(-5 * delta))
    camera.lookAt(target)
  })

  return <>
    <group ref={group} position={[0, 2.2, 13]}>
      <Spirit position={player} />
      {near && <Html position={[0, 2.2, 0]} center distanceFactor={18}><div className="tree-prompt">Nhấn E để tương tác</div></Html>}
      {message && <Html position={[0, 3.6, 0]} center distanceFactor={18}><div className="tree-message" onClick={() => setMessage('')}>{message} ×</div></Html>}
    </group>
  </>
}

function World() {
  const [nearTree, setNearTree] = useState(false)
  return <>
    <color attach="background" args={['#070b1c']} />
    <fog attach="fog" args={['#0b1230', 65, 220]} />
    <hemisphereLight args={['#a6baff', '#1b2c24', 1.25]} />
    <directionalLight position={[35, 65, 25]} intensity={2} color="#ffe3b0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
    <pointLight position={[0, 14, 0]} intensity={65} color="#ffca70" distance={65} />
    <Stars radius={220} depth={80} count={2800} factor={5} fade />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[180, 96]} />
      <meshStandardMaterial color="#243d32" roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
      <ringGeometry args={[5, 31, 96]} />
      <meshBasicMaterial color="#8b713d" transparent opacity={0.22} side={THREE.DoubleSide} />
    </mesh>
    <AncientTree />
    <Sparkles count={420} scale={[70, 28, 70]} position={[0, 18, 0]} size={5} speed={0.25} color="#ffd98a" />
    <PlayerWorld onNearTree={setNearTree} />
    <ambientLight intensity={nearTree ? 0.18 : 0.08} />
  </>
}

export default function Scene() {
  return <>
    <Canvas dpr={[1, 1.5]} shadows camera={{ position: [0, 7, 28], fov: 62, near: 0.1, far: 500 }}>
      <World />
    </Canvas>
    <div className="world-hud">
      <div className="world-title">CÂY THẦN</div>
      <div className="world-controls">WASD di chuyển · Space lên · Ctrl xuống · Shift tăng tốc<br />Giữ chuột trái để xoay camera · Cuộn để zoom · E tương tác</div>
    </div>
  </>
}
