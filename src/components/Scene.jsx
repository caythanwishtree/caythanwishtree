import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles } from '@react-three/drei'

export default function Scene() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 6, 55], fov: 60, far: 500 }}>
      <color attach="background" args={['#070b1c']} />
      <fog attach="fog" args={['#0b1230', 60, 300]} />
      <hemisphereLight args={['#6f86ff', '#2a2440', 1.2]} />
      <directionalLight position={[40, 60, 30]} intensity={1.5} color="#b8c4ff" />
      <pointLight position={[0, 6, 0]} intensity={400} color="#ffcf70" distance={60} />

      <Stars radius={250} depth={60} count={2500} factor={6} fade />

      <mesh position={[90, 90, -200]}>
        <sphereGeometry args={[28, 32, 32]} />
        <meshBasicMaterial color="#f3ecc8" fog={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[200, 48]} />
        <meshStandardMaterial color="#3a5a46" />
      </mesh>

      <mesh position={[0, 30, 0]}>
        <cylinderGeometry args={[3, 6, 60, 20]} />
        <meshStandardMaterial color="#6b4a36" emissive="#2a1608" />
      </mesh>

      <Sparkles count={600} scale={[80, 20, 80]} position={[0, 52, 0]} size={14} speed={0.3} color="#ffd36b" />
      <Sparkles count={200} scale={[50, 10, 50]} position={[0, 50, 0]} size={10} speed={0.2} color="#b9a6ff" />

      <OrbitControls target={[0, 28, 0]} maxPolarAngle={Math.PI / 2.05} />
    </Canvas>
  )
}