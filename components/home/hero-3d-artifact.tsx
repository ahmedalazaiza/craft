"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Move3d, Layers, RotateCw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/layout/theme-provider";

type VisualMode = "monolith" | "matrix" | "orbital";

export function Hero3DArtifact({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const [activeMode, setActiveMode] = useState<VisualMode>("monolith");
  const [isInteracting, setIsInteracting] = useState(false);
  const [fps, setFps] = useState(60);

  // References for scene objects that need live dynamic updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const monolithMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const orbitalRingsRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  // Physics state
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const mousePosNormRef = useRef({ x: 0, y: 0 });
  const pulseScaleRef = useRef(1);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  // Trigger pulse effect
  const handlePulse = useCallback(() => {
    pulseScaleRef.current = 1.35;
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 8.0;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8dff00, 2.5);
    dirLight2.position.set(-5, -6, -3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x8dff00, 3.5, 20);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 3. Central Monolith Geometry (Faceted Icosahedron)
    const isDark = resolvedTheme === "dark";
    const monolithGeo = new THREE.IcosahedronGeometry(2.1, 0);
    const monolithMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x090c09 : 0xf3f4f0,
      emissive: isDark ? 0x071505 : 0x223311,
      roughness: 0.12,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    const monolithMesh = new THREE.Mesh(monolithGeo, monolithMat);
    rootGroup.add(monolithMesh);
    monolithMeshRef.current = monolithMesh;

    // 4. Outer Architectural Wireframe Matrix
    const wireGeo = new THREE.IcosahedronGeometry(2.45, 1);
    const wireframeEdges = new THREE.WireframeGeometry(wireGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x8dff00,
      transparent: true,
      opacity: isDark ? 0.75 : 0.6,
      linewidth: 1.5,
    });
    const wireframeMesh = new THREE.LineSegments(wireframeEdges, wireMat);
    rootGroup.add(wireframeMesh);
    wireframeMeshRef.current = wireframeMesh;

    // 5. Interlocking Orbital Discipline Rings
    const orbitalGroup = new THREE.Group();
    rootGroup.add(orbitalGroup);
    orbitalRingsRef.current = orbitalGroup;

    const ringConfigs = [
      { radius: 3.4, tube: 0.018, rx: Math.PI / 4, ry: 0, color: 0x8dff00 },
      { radius: 3.8, tube: 0.015, rx: -Math.PI / 3, ry: Math.PI / 6, color: 0xffffff },
      { radius: 4.2, tube: 0.02, rx: Math.PI / 6, ry: Math.PI / 3, color: 0x8dff00 },
    ];

    ringConfigs.forEach((cfg) => {
      const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color === 0x8dff00 ? 0x448800 : 0x222222,
        roughness: 0.2,
        metalness: 0.9,
        transparent: true,
        opacity: isDark ? 0.8 : 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.set(cfg.rx, cfg.ry, 0);
      orbitalGroup.add(ringMesh);
    });

    // 6. Floating Ambient Dust Particle Field
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const greenColor = new THREE.Color(0x8dff00);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.8 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = Math.random() > 0.4 ? greenColor : whiteColor;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.8 : 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);
    particlesRef.current = particles;

    // 7. Interaction Listeners (Pointer, Drag, Touch)
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      setIsInteracting(true);
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const yNorm = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePosNormRef.current = { x: xNorm, y: yNorm };

      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousPointerPosRef.current.x;
        const deltaY = e.clientY - previousPointerPosRef.current.y;

        velocityRef.current = {
          x: deltaX * 0.008,
          y: deltaY * 0.008,
        };

        if (rootGroupRef.current) {
          rootGroupRef.current.rotation.y += velocityRef.current.x;
          rootGroupRef.current.rotation.x += velocityRef.current.y;
        }

        previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      setTimeout(() => setIsInteracting(false), 800);
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 9. Intersection Observer (Pause WebGL when scrolled out)
    const io = new IntersectionObserver((entries) => {
      isVisibleRef.current = entries[0].isIntersecting;
    });
    io.observe(container);

    // 10. Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Calculate live FPS
      frameCount++;
      if (time - lastFpsUpdate > 1000) {
        setFps(Math.round((frameCount * 1000) / (time - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = time;
      }

      if (rootGroupRef.current) {
        // Inertia physics decay
        if (!isDraggingRef.current) {
          velocityRef.current.x *= 0.94;
          velocityRef.current.y *= 0.94;

          rootGroupRef.current.rotation.y += velocityRef.current.x;
          rootGroupRef.current.rotation.x += velocityRef.current.y;

          // Natural ambient rotation
          const autoSpeed = shouldReduceMotion ? 0.05 : 0.35;
          rootGroupRef.current.rotation.y += autoSpeed * delta;

          // Parallax tilt towards mouse
          const targetTiltX = mousePosNormRef.current.y * 0.45;
          const targetTiltY = mousePosNormRef.current.x * 0.45;
          rootGroupRef.current.rotation.x += (targetTiltX - rootGroupRef.current.rotation.x) * 0.05;
          rootGroupRef.current.rotation.z += (-targetTiltY * 0.5 - rootGroupRef.current.rotation.z) * 0.05;
        }

        // Pulse scale spring damping
        pulseScaleRef.current += (1 - pulseScaleRef.current) * 0.12;
        const currentScale = pulseScaleRef.current;
        monolithMesh.scale.set(currentScale, currentScale, currentScale);
        wireframeMesh.scale.set(currentScale, currentScale, currentScale);

        // Point Light follows mouse coordinate
        if (pointLightRef.current) {
          const targetLightX = mousePosNormRef.current.x * 4;
          const targetLightY = mousePosNormRef.current.y * 4;
          pointLightRef.current.position.x += (targetLightX - pointLightRef.current.position.x) * 0.1;
          pointLightRef.current.position.y += (targetLightY - pointLightRef.current.position.y) * 0.1;
          pointLightRef.current.intensity += (3.5 - pointLightRef.current.intensity) * 0.08;
        }

        // Independent sub-layer rotations
        if (orbitalGroup) {
          orbitalGroup.rotation.y -= 0.6 * delta;
          orbitalGroup.rotation.x += 0.2 * delta;
        }

        if (particles) {
          particles.rotation.y += 0.15 * delta;
        }
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      resizeObserver.disconnect();
      io.disconnect();
      renderer.dispose();
      monolithGeo.dispose();
      monolithMat.dispose();
      wireGeo.dispose();
      wireframeEdges.dispose();
      wireMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [resolvedTheme, shouldReduceMotion]);

  // Mode Switcher Reactions
  useEffect(() => {
    if (!monolithMeshRef.current || !wireframeMeshRef.current || !orbitalRingsRef.current) return;

    if (activeMode === "monolith") {
      monolithMeshRef.current.visible = true;
      wireframeMeshRef.current.visible = true;
      orbitalRingsRef.current.visible = true;
    } else if (activeMode === "matrix") {
      monolithMeshRef.current.visible = false;
      wireframeMeshRef.current.visible = true;
      orbitalRingsRef.current.visible = true;
    } else if (activeMode === "orbital") {
      monolithMeshRef.current.visible = true;
      wireframeMeshRef.current.visible = false;
      orbitalRingsRef.current.visible = true;
    }
  }, [activeMode]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[460px] sm:h-[520px] rounded-[32px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)]/75 backdrop-blur-xl overflow-hidden shadow-[0_24px_60px_rgba(9,12,9,0.08)] select-none cursor-grab active:cursor-grabbing group",
        className
      )}
      onClick={handlePulse}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top HUD Strip: Engine & Status */}
      <div className="absolute top-4 inset-x-4 sm:top-5 sm:inset-x-5 flex items-center justify-between pointer-events-none z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-screen)]/85 backdrop-blur-md border border-[var(--border-neutral)] px-3.5 py-1.5 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8DFF00] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8DFF00]" />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-tight text-[var(--content-primary)]">
            Craft 3D Monolith
          </span>
          <span className="text-[10px] font-mono text-[var(--content-tertiary)] border-l border-[var(--border-neutral)] pl-2">
            {fps} FPS
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-screen)]/85 backdrop-blur-md border border-[var(--border-neutral)] px-3 py-1.5 shadow-xs text-[11px] font-semibold text-[var(--content-secondary)]">
          <Sparkles className="h-3.5 w-3.5 text-[#8DFF00]" />
          <span className="hidden sm:inline">Interactive Core</span>
        </div>
      </div>

      {/* Center Floating Interaction Hint (Fades out when interacting) */}
      {!isInteracting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute inset-x-0 bottom-16 sm:bottom-18 flex justify-center z-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-screen)]/90 backdrop-blur-md border border-[var(--border-neutral)] px-4 py-1.5 text-xs font-semibold text-[var(--content-primary)] shadow-lg animate-bounce">
            <Move3d className="h-3.5 w-3.5 text-[#8DFF00]" />
            <span>Drag to rotate • Click to pulse</span>
          </div>
        </motion.div>
      )}

      {/* Bottom Mode Switcher HUD (Clickable controls) */}
      <div className="absolute bottom-4 inset-x-4 sm:bottom-5 sm:inset-x-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--bg-screen)]/85 backdrop-blur-md border border-[var(--border-neutral)] p-1 shadow-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMode("monolith");
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
              activeMode === "monolith"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
            )}
          >
            Prism
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMode("matrix");
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
              activeMode === "matrix"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
            )}
          >
            Matrix
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMode("orbital");
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
              activeMode === "orbital"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
            )}
          >
            Orbit
          </button>
        </div>

        {/* Pulse Trigger Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePulse();
          }}
          className="h-8 px-3.5 rounded-full bg-[var(--primary-forest-green)] text-[var(--bg-screen)] dark:bg-[#8DFF00] dark:text-[#090C09] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Trigger energetic pulse"
        >
          <RotateCw className="h-3 w-3" />
          <span>Pulse</span>
        </button>
      </div>
    </div>
  );
}
