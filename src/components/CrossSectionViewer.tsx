import React, { useRef, useMemo, useEffect, useState, Component, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Get base path from Vite
const BASE_PATH = import.meta.env.BASE_URL || '/'

// Helper to resolve paths with base, while avoiding double-prefixing BASE_PATH.
const resolvePath = (path: string) => {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) {
    return path
  }

  if (path.startsWith(BASE_PATH)) {
    return path
  }

  return path.startsWith('/') ? `${BASE_PATH}${path.slice(1)}` : path
}

// Error Boundary for catching 3D rendering errors
class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CrossSectionViewer error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

interface CrossSectionViewerProps {
  modelPath: string
  viewMode: 'airflow' | 'thermal' | 'moisture' | 'structure'
  isAnimating?: boolean
}

// Airflow particles component
function AirflowParticles({ isAnimating = true }: { isAnimating?: boolean }) {
  const particlesRef = useRef<THREE.Points>(null)
  const frameBudgetRef = useRef(0)
  const count = 220

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return pos
  }, [])

  useFrame((state, delta) => {
    if (particlesRef.current && isAnimating) {
      frameBudgetRef.current += delta
      if (frameBudgetRef.current < 1 / 30) {
        return
      }
      frameBudgetRef.current = 0

      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += 0.02 * Math.sin(state.clock.elapsedTime + i)
        positions[i * 3] += 0.01 * Math.cos(state.clock.elapsedTime * 0.5 + i)
        
        if (positions[i * 3 + 1] > 2) positions[i * 3 + 1] = -2
        if (positions[i * 3] > 2) positions[i * 3] = -2
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial size={0.05} color="#00bfff" transparent opacity={0.8} />
    </points>
  )
}

// Thermal heat map shader
function ThermalOverlay({ isAnimating = true }: { isAnimating?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          float heat = sin(vPosition.y * 2.0 + time) * 0.5 + 0.5;
          heat += sin(vPosition.x * 3.0 + time * 0.5) * 0.3;
          heat = clamp(heat, 0.0, 1.0);
          
          vec3 coldColor = vec3(0.0, 0.5, 1.0);
          vec3 hotColor = vec3(1.0, 0.2, 0.0);
          vec3 color = mix(coldColor, hotColor, heat);
          
          gl_FragColor = vec4(color, 0.6);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [])

  useFrame((state) => {
    if (shaderMaterial && isAnimating) {
      shaderMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <boxGeometry args={[3, 3, 3]} />
    </mesh>
  )
}

// Moisture droplets
function MoistureDroplets({ isAnimating = true }: { isAnimating?: boolean }) {
  const dropletsRef = useRef<THREE.Points>(null)
  const frameBudgetRef = useRef(0)
  const count = 140

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4
      pos[i * 3 + 1] = Math.random() * 4
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return pos
  }, [])

  useFrame((_, delta) => {
    if (dropletsRef.current && isAnimating) {
      frameBudgetRef.current += delta
      if (frameBudgetRef.current < 1 / 30) {
        return
      }
      frameBudgetRef.current = 0

      const positions = dropletsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 0.03
        if (positions[i * 3 + 1] < -2) {
          positions[i * 3 + 1] = 2
          positions[i * 3] = (Math.random() - 0.5) * 4
          positions[i * 3 + 2] = (Math.random() - 0.5) * 4
        }
      }
      dropletsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  return (
    <points ref={dropletsRef} geometry={geometry}>
      <pointsMaterial size={0.08} color="#4fc3f7" transparent opacity={0.9} />
    </points>
  )
}

// Main model with effects
function ModelWithEffects({ modelPath, viewMode, isAnimating = true }: CrossSectionViewerProps) {
  const resolvedPath = resolvePath(modelPath)
  const { scene } = useGLTF(resolvedPath)
  const modelRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (modelRef.current && isAnimating) {
      modelRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <>
      <primitive ref={modelRef} object={scene.clone()} scale={1.5} />
      
      {viewMode === 'airflow' && <AirflowParticles isAnimating={isAnimating} />}
      {viewMode === 'thermal' && <ThermalOverlay isAnimating={isAnimating} />}
      {viewMode === 'moisture' && <MoistureDroplets isAnimating={isAnimating} />}
    </>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#444" wireframe />
    </mesh>
  )
}

function ErrorFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-lg mb-2">⚠️</div>
        <div className="text-sm opacity-70">Failed to load 3D model</div>
      </div>
    </div>
  )
}

export default function CrossSectionViewer({ modelPath, viewMode, isAnimating = true }: CrossSectionViewerProps) {
  const [tabVisible, setTabVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState === 'visible'
  )

  useEffect(() => {
    const handleVisibilityChange = () => {
      setTabVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const shouldAnimate = isAnimating && tabVisible

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden">
        <Canvas
          camera={{ position: [5, 3, 5], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          frameloop={shouldAnimate ? 'always' : 'demand'}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4fc3f7" />
          
          <React.Suspense fallback={<LoadingFallback />}>
            <ModelWithEffects modelPath={modelPath} viewMode={viewMode} isAnimating={shouldAnimate} />
          </React.Suspense>
          
          <OrbitControls enableZoom={true} enablePan={true} enableDamping={false} />
        </Canvas>   
        
        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
          {viewMode === 'airflow' && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
              <span>Air circulation flow</span>
            </div>
          )}
          {viewMode === 'thermal' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Hot zones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Cool zones</span>
              </div> 
            </div>
          )}
          {viewMode === 'moisture' && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-300"></div>
              <span>Moisture movement</span>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
