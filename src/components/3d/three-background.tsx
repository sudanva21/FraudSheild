'use client'

import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

interface ThreeBackgroundProps {
  className?: string
}

export default function ThreeBackground({ className = '' }: ThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)

  // Create floating objects data
  const floatingObjects = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
      ] as [number, number, number],
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      },
      floatSpeed: (Math.random() - 0.5) * 0.02,
      scale: 0.5 + Math.random() * 1.5,
    }))
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    camera.position.set(0, 0, 50)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xfbbf24, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x00ffff, 0.5, 50)
    pointLight.position.set(-10, -10, -10)
    scene.add(pointLight)

    // Create geometries and materials
    const geometries = [
      new THREE.SphereGeometry(1, 16, 16),
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.OctahedronGeometry(1),
      new THREE.TetrahedronGeometry(1),
    ]

    const materials = [
      new THREE.MeshPhongMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.7,
        shininess: 100,
      }),
      new THREE.MeshPhongMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.5,
        shininess: 50,
      }),
      new THREE.MeshPhongMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.6,
        shininess: 80,
      }),
    ]

    // Create floating objects
    const objects: THREE.Group[] = []

    floatingObjects.forEach((objData, index) => {
      const group = new THREE.Group()

      // Random geometry and material
      const geometry = geometries[index % geometries.length]
      const material = materials[index % materials.length]

      const mesh = new THREE.Mesh(geometry, material)
      mesh.scale.setScalar(objData.scale)
      mesh.castShadow = true
      mesh.receiveShadow = true

      // Add wireframe overlay for some objects
      if (index % 3 === 0) {
        const wireframe = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.3 })
        )
        wireframe.scale.setScalar(objData.scale)
        group.add(wireframe)
      }

      group.add(mesh)
      group.position.set(...objData.position)
      group.userData = objData

      scene.add(group)
      objects.push(group)
    })

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1

      // Subtle camera movement based on mouse
      camera.position.x = mouseX * 2
      camera.position.y = mouseY * 2
      camera.lookAt(0, 0, 0)
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      const time = Date.now() * 0.001

      // Animate objects
      objects.forEach((obj, index) => {
        const objData = obj.userData as typeof floatingObjects[0]

        // Rotation
        obj.rotation.x += objData.rotationSpeed.x
        obj.rotation.y += objData.rotationSpeed.y
        obj.rotation.z += objData.rotationSpeed.z

        // Floating motion
        obj.position.y += Math.sin(time * objData.floatSpeed + index) * 0.01

        // Subtle pulsing
        const pulseScale = 1 + Math.sin(time * 2 + index) * 0.1
        obj.scale.setScalar(objData.scale * pulseScale)
      })

      // Camera subtle movement
      camera.position.z = 30 + Math.sin(time * 0.5) * 2

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }

      // Dispose of Three.js objects
      objects.forEach(obj => {
        obj.children.forEach((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material instanceof THREE.Material) {
              child.material.dispose()
            }
          }
        })
        scene.remove(obj)
      })

      geometries.forEach(geom => geom.dispose())
      materials.forEach(mat => mat.dispose())

      if (renderer) {
        renderer.dispose()
      }
    }
  }, [floatingObjects])

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  )
}
