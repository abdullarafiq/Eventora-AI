import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react'
import { getReducedMotion, setReducedMotion } from '../utils/storage'

interface ThreeCelebrationSceneProps {
  className?: string
  interactive?: boolean
  showControls?: boolean
}

// WebGL Check Helper
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export const ThreeCelebrationScene: React.FC<ThreeCelebrationSceneProps> = ({
  className = '',
  interactive = true,
  showControls = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [webglSupported, setWebglSupported] = useState<boolean>(() => checkWebGLSupport())
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(getReducedMotion())
  const [isPaused, setIsPaused] = useState<boolean>(false)

  useEffect(() => {
    const handleMotionChange = (e: any) => {
      setIsReducedMotion(e.detail)
    }
    window.addEventListener('eventora_motion_toggled', handleMotionChange)
    return () => window.removeEventListener('eventora_motion_toggled', handleMotionChange)
  }, [])

  useEffect(() => {
    const container = mountRef.current
    if (!container || !webglSupported) return

    // Three.js Scene Setup
    const scene = new THREE.Scene()
    // Soft atmospheric fog matching #070814 dark background
    scene.fog = new THREE.FogExp2(0x070814, 0.035)

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 2, 14)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' })
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      container.appendChild(renderer.domElement)
    } catch {
      window.requestAnimationFrame(() => setWebglSupported(false))
      return
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xa78bfa, 2.2)
    mainLight.position.set(5, 8, 5)
    scene.add(mainLight)

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 20)
    cyanLight.position.set(-6, -2, 4)
    scene.add(cyanLight)

    const pinkLight = new THREE.PointLight(0xec4899, 3.5, 20)
    pinkLight.position.set(6, 4, 3)
    scene.add(pinkLight)

    // Floating Celebration Group
    const celebrationGroup = new THREE.Group()
    scene.add(celebrationGroup)

    // 1. Stylized Floating Metallic Balloons (Optimized geometry)
    const balloonColors = [0x8b5cf6, 0xec4899, 0x06b6d4, 0xf59e0b, 0x10b981, 0xd946ef]
    const balloons: Array<{ mesh: THREE.Mesh; initialY: number; speed: number; rotSpeed: number; floatOffset: number }> = []

    const balloonGeometry = new THREE.SphereGeometry(0.85, 20, 20)
    // Scale sphere vertically slightly to make it an elegant balloon shape
    balloonGeometry.scale(1, 1.25, 1)

    for (let i = 0; i < 9; i++) {
      const color = balloonColors[i % balloonColors.length]
      const balloonMaterial = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.15,
        metalness: 0.25,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9,
      })

      const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial)
      const angle = (i / 9) * Math.PI * 2
      const radius = 3.5 + (i % 3) * 1.2
      const x = Math.cos(angle) * radius + (Math.sin(i) * 0.8)
      const y = -1.5 + (i % 4) * 1.1 + (Math.cos(i) * 0.5)
      const z = Math.sin(angle) * radius * 0.7 - (i % 2) * 1.5

      balloon.position.set(x, y, z)
      celebrationGroup.add(balloon)

      balloons.push({
        mesh: balloon,
        initialY: y,
        speed: 0.8 + (i % 3) * 0.4,
        rotSpeed: 0.005 + (i % 2) * 0.005,
        floatOffset: i * 0.7
      })
    }

    // 2. Holographic Floating Torus Rings & Diamonds (Optimized segments)
    const ringGeo = new THREE.TorusGeometry(1.4, 0.04, 12, 36)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6366f1,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    })
    const ring1 = new THREE.Mesh(ringGeo, ringMat)
    ring1.rotation.x = Math.PI / 3
    ring1.position.set(0, 0, -1)
    celebrationGroup.add(ring1)

    const ring2Geo = new THREE.TorusGeometry(2.1, 0.03, 12, 36)
    const ring2 = new THREE.Mesh(ring2Geo, new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.3
    }))
    ring2.rotation.x = -Math.PI / 4
    ring2.rotation.y = Math.PI / 6
    celebrationGroup.add(ring2)

    // Stylized floating crystal gems / diamonds
    const octaGeo = new THREE.OctahedronGeometry(0.55, 0)
    const octaMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.6,
      thickness: 0.5,
      reflectivity: 0.8
    })
    const gem1 = new THREE.Mesh(octaGeo, octaMat)
    gem1.position.set(-2.8, 2.2, 1)
    celebrationGroup.add(gem1)

    const gem2 = new THREE.Mesh(octaGeo, new THREE.MeshPhysicalMaterial({
      color: 0xec4899,
      transmission: 0.6,
      roughness: 0.05
    }))
    gem2.position.set(3.2, 1.8, 0.5)
    celebrationGroup.add(gem2)

    // 3. Shimmering Gold & Violet Confetti & Particle Sparks (Optimized 140 count)
    const particleCount = 140
    const particleGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    const palette = [
      new THREE.Color(0xf59e0b), // Gold
      new THREE.Color(0x8b5cf6), // Violet
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0xec4899), // Pink
      new THREE.Color(0xffffff)  // Sparkle white
    ]

    for (let p = 0; p < particleCount; p++) {
      const idx = p * 3
      particlePositions[idx] = (Math.random() - 0.5) * 16
      particlePositions[idx + 1] = (Math.random() - 0.5) * 12
      particlePositions[idx + 2] = (Math.random() - 0.5) * 10

      const c = palette[p % palette.length]
      particleColors[idx] = c.r
      particleColors[idx + 1] = c.g
      particleColors[idx + 2] = c.b
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    })

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    celebrationGroup.add(particleSystem)

    // Mouse Interaction
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return
      const rect = container.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      targetX = x * 0.4
      targetY = y * 0.3
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Intersection Observer to pause rendering when offscreen
    let isIntersecting = true
    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        isIntersecting = entry.isIntersecting
      }, { threshold: 0.05 })
      observer.observe(container)
    }

    // Animation Loop
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Skip render when tab hidden or canvas scrolled offscreen
      if (!isIntersecting || (typeof document !== 'undefined' && document.hidden)) {
        return
      }

      if (isPaused) {
        renderer.render(scene, camera)
        return
      }

      clock.getDelta()
      const time = clock.getElapsedTime()

      // Smooth camera follow mouse
      if (!isReducedMotion) {
        currentX += (targetX - currentX) * 0.04
        currentY += (targetY - currentY) * 0.04
        celebrationGroup.rotation.y = currentX * 0.7 + time * 0.08
        celebrationGroup.rotation.x = currentY * 0.5
      }

      // Animate balloons gentle bobbing
      balloons.forEach((b) => {
        if (!isReducedMotion) {
          b.mesh.position.y = b.initialY + Math.sin(time * b.speed + b.floatOffset) * 0.35
          b.mesh.rotation.y += b.rotSpeed
          b.mesh.rotation.z = Math.sin(time * 0.5 + b.floatOffset) * 0.08
        }
      })

      // Animate Rings
      if (!isReducedMotion) {
        ring1.rotation.z += 0.006
        ring2.rotation.y -= 0.005
        gem1.rotation.y += 0.015
        gem1.rotation.x += 0.01
        gem2.rotation.y -= 0.012
        gem2.rotation.z += 0.008

        // Particle sway
        particleSystem.rotation.y = time * 0.03
        particleSystem.rotation.x = Math.sin(time * 0.05) * 0.1
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      observer?.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      balloonGeometry.dispose()
      ringGeo.dispose()
      ring2Geo.dispose()
      octaGeo.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      renderer.dispose()
    }
  }, [isReducedMotion, isPaused, interactive, webglSupported])

  const toggleMotion = () => {
    const nextVal = !isReducedMotion
    setIsReducedMotion(nextVal)
    setReducedMotion(nextVal)
  }

  if (!webglSupported) {
    return (
      <div className={`relative flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-gradient-to-br from-violet-950/40 via-purple-900/30 to-slate-900 border border-violet-500/20 backdrop-blur-xl ${className}`}>
        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center mb-4 text-violet-300">
          <Sparkles className="w-8 h-8 animate-pulse text-violet-400" />
        </div>
        <h4 className="text-xl font-bold text-white mb-2">3D Celebration Canvas</h4>
        <p className="text-sm text-slate-300 max-w-sm mb-4">
          WebGL acceleration is disabled or unsupported on this device. Eventora AI has switched to optimized high-performance visual mode.
        </p>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-xs font-semibold text-cyan-300 tracking-wider uppercase">Visual Mode Active</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" aria-label="Interactive 3D Celebration Canvas with floating festive balloons, confetti particles, and glowing rings" role="img" />

      {/* Floating 3D Controls Badge */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-slate-300 shadow-xl transition-all hover:border-violet-500/40">
          <span className="flex items-center gap-1.5 text-violet-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            3D Canvas
          </span>
          <span className="text-slate-600">|</span>
          <button
            onClick={toggleMotion}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            title={isReducedMotion ? 'Enable 3D motion' : 'Reduce motion for accessibility'}
            aria-label={isReducedMotion ? 'Enable 3D animations' : 'Reduce 3D motion'}
          >
            {isReducedMotion ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isReducedMotion ? 'Motion Off' : 'Motion On'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="hover:text-white transition-colors cursor-pointer text-slate-400 hover:text-cyan-300"
            title={isPaused ? 'Resume rendering' : 'Pause rendering'}
            aria-label={isPaused ? 'Resume 3D scene' : 'Pause 3D scene'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPaused ? 'text-amber-400' : ''}`} />
          </button>
        </div>
      )}
    </div>
  )
}
