/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { calculateBlackHoleProperties, formatScientific } from '../utils/physicsConstants';
import { Layers, Eye, Disc, Zap, Compass, RotateCcw, Play, Pause, Orbit, CircleDot } from 'lucide-react';

interface BlackHole3DProps {
  massSolar: number;
  spin: number;
  massKg: number;
  name: string;
}

export type TestParticleOrbit = 'none' | 'circular' | 'elliptic' | 'capture';

export const BlackHole3D: React.FC<BlackHole3DProps> = ({
  massSolar,
  spin,
  massKg,
  name,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showErgosphere, setShowErgosphere] = useState(true);
  const [showPhotonSphere, setShowPhotonSphere] = useState(true);
  const [showISCO, setShowISCO] = useState(true);
  const [showJets, setShowJets] = useState(true);
  const [dopplerBeaming, setDopplerBeaming] = useState(true);
  const [cameraView, setCameraView] = useState<'angled' | 'equatorial' | 'polar'>('angled');
  
  // Test particle orbit state
  const [orbitType, setOrbitType] = useState<TestParticleOrbit>('circular');
  const [probeTelemetry, setProbeTelemetry] = useState<{
    r_rs: number;
    r_km: number;
    speed_c: number;
    status: string;
  }>({
    r_rs: 3.75,
    r_km: 0,
    speed_c: 0.36,
    status: 'Orbita circolare stabile',
  });

  // Animation & Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  
  // Mesh refs for dynamic updates
  const diskMeshRef = useRef<THREE.Mesh | null>(null);
  const warpedDiskMeshRef = useRef<THREE.Mesh | null>(null);
  const ergoMeshRef = useRef<THREE.Mesh | null>(null);
  const photonRingRef = useRef<THREE.Mesh | null>(null);
  const iscoRingRef = useRef<THREE.LineLoop | null>(null);
  const jetsGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  
  // Test particle mesh & physics refs
  const probeGroupRef = useRef<THREE.Group | null>(null);
  const probeTrailRef = useRef<THREE.Line | null>(null);
  const probeStateRef = useRef<{
    r: number;
    phi: number;
    dr: number;
    perihelionAdvance: number;
    trailPoints: THREE.Vector3[];
    lastResetTime: number;
  }>({
    r: 7.5,
    phi: 0,
    dr: 0,
    perihelionAdvance: 0,
    trailPoints: [],
    lastResetTime: 0,
  });

  const orbitTypeRef = useRef<TestParticleOrbit>(orbitType);
  useEffect(() => {
    orbitTypeRef.current = orbitType;
    // Reset probe physics state when changing orbit type
    if (probeStateRef.current) {
      if (orbitType === 'circular') {
        probeStateRef.current.r = 7.5;
      } else if (orbitType === 'elliptic') {
        probeStateRef.current.r = 8.5;
        probeStateRef.current.perihelionAdvance = 0;
      } else if (orbitType === 'capture') {
        probeStateRef.current.r = 8.2;
      }
      probeStateRef.current.phi = 0;
      probeStateRef.current.dr = 0;
      probeStateRef.current.trailPoints = [];
    }
  }, [orbitType]);

  // Compute metric numbers for diagnostic HUD
  const metric = useMemo(() => {
    return calculateBlackHoleProperties(massKg, spin);
  }, [massKg, spin]);

  // Scaled radii in simulation Three.js units (normalized around Horizon radius = 2.0)
  const simScale = useMemo(() => {
    const r_s_sim = 2.0;
    // For Kerr: r_+ relative to r_s
    const r_plus_sim = r_s_sim * (metric.r_plus / metric.r_s);
    const r_ph_sim = r_s_sim * (metric.r_photon / metric.r_s);
    const r_isco_sim = r_s_sim * (metric.r_isco_prograde / metric.r_s);
    const r_ergo_eq = r_s_sim; // at equator r_E = r_s
    return {
      r_s_sim,
      r_plus_sim,
      r_ph_sim,
      r_isco_sim,
      r_ergo_eq,
    };
  }, [metric]);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03060c);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 5, 14);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Stellar Background field (distant stars)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 180 + Math.random() * 40;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // Star spectral variations
      const tempRnd = Math.random();
      if (tempRnd > 0.8) {
        starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0; // blue
      } else if (tempRnd > 0.5) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 0.8; // white/yellow
      } else {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.75; starColors[i * 3 + 2] = 0.6; // orange
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 4. Central Black Hole - The Event Horizon Sphere
    const horizonGeo = new THREE.SphereGeometry(simScale.r_plus_sim, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    scene.add(horizonMesh);

    // 5. Ergosphere (for rotating Kerr metric) - Oblate Spheroid
    // r_E(theta) = M + sqrt(M^2 - a^2 cos^2 theta)
    // Modeled as a spheroid squished at poles and equator = r_s
    const ergoGeo = new THREE.SphereGeometry(simScale.r_ergo_eq, 48, 48);
    // Scale y based on polar vs equatorial ratio
    const polarRatio = metric.r_plus / metric.r_s;
    ergoGeo.scale(1, Math.max(0.65, polarRatio), 1);
    const ergoMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      roughness: 0.4,
    });
    const ergoMesh = new THREE.Mesh(ergoGeo, ergoMat);
    scene.add(ergoMesh);
    ergoMeshRef.current = ergoMesh;

    // 6. Photon Sphere / Photon Ring Halo
    const photonRingGeo = new THREE.RingGeometry(simScale.r_ph_sim * 0.98, simScale.r_ph_sim * 1.03, 96);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: 0xffedd5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    photonRing.rotation.x = Math.PI / 2;
    scene.add(photonRing);
    photonRingRef.current = photonRing;

    // 7. ISCO Boundary Ring
    const iscoPoints: THREE.Vector3[] = [];
    const iscoSegments = 96;
    for (let i = 0; i <= iscoSegments; i++) {
      const angle = (i / iscoSegments) * Math.PI * 2;
      iscoPoints.push(new THREE.Vector3(Math.cos(angle) * simScale.r_isco_sim, 0, Math.sin(angle) * simScale.r_isco_sim));
    }
    const iscoGeo = new THREE.BufferGeometry().setFromPoints(iscoPoints);
    const iscoMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.2,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.6,
    });
    const iscoRing = new THREE.LineLoop(iscoGeo, iscoMat);
    iscoRing.computeLineDistances();
    scene.add(iscoRing);
    iscoRingRef.current = iscoRing;

    // 8. Primary Accretion Disk (Procedural Texture with Relativistic Doppler Beaming)
    const diskInner = simScale.r_isco_sim;
    const diskOuter = diskInner * 2.8;
    const diskGeo = new THREE.RingGeometry(diskInner, diskOuter, 128, 48);

    // Create custom canvas texture for accretion disk
    const diskCanvas = document.createElement('canvas');
    diskCanvas.width = 1024;
    diskCanvas.height = 1024;
    const ctx = diskCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(512, 512, 180, 512, 512, 510);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.15, 'rgba(254, 215, 170, 0.9)');
      grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.75)');
      grad.addColorStop(0.75, 'rgba(180, 40, 10, 0.4)');
      grad.addColorStop(1, 'rgba(40, 5, 2, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Add spiral stream filaments
      ctx.strokeStyle = 'rgba(255, 240, 200, 0.15)';
      ctx.lineWidth = 3;
      for (let s = 0; s < 36; s++) {
        ctx.beginPath();
        const startA = (s / 36) * Math.PI * 2;
        for (let r = 180; r < 490; r += 5) {
          const a = startA + (r - 180) * 0.012;
          const x = 512 + Math.cos(a) * r;
          const y = 512 + Math.sin(a) * r;
          if (r === 180) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    const diskTexture = new THREE.CanvasTexture(diskCanvas);

    const diskMat = new THREE.MeshBasicMaterial({
      map: diskTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    diskMesh.rotation.x = Math.PI / 2;
    scene.add(diskMesh);
    diskMeshRef.current = diskMesh;

    // 9. Gravitationally Warped Lensing Ring (The upper/lower bent images of the accretion disk)
    // In strong general relativity, light from the rear disk bends over the top and under the bottom!
    const warpedGeo = new THREE.RingGeometry(simScale.r_plus_sim * 1.05, simScale.r_plus_sim * 1.55, 96);
    const warpedMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const warpedMesh = new THREE.Mesh(warpedGeo, warpedMat);
    warpedMesh.rotation.x = 0; // Faces camera directly
    scene.add(warpedMesh);
    warpedDiskMeshRef.current = warpedMesh;

    // 10. Polar Relativistic Jets (Collimated plasma outflow along rotation axis)
    const jetsGroup = new THREE.Group();
    const jetGeo = new THREE.CylinderGeometry(0.12, 1.1, 16, 24, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const northJet = new THREE.Mesh(jetGeo, jetMat);
    northJet.position.y = 8 + simScale.r_plus_sim;
    jetsGroup.add(northJet);

    const southJet = new THREE.Mesh(jetGeo, jetMat);
    southJet.rotation.z = Math.PI;
    southJet.position.y = -(8 + simScale.r_plus_sim);
    jetsGroup.add(southJet);

    scene.add(jetsGroup);
    jetsGroupRef.current = jetsGroup;

    // 11. Accretion Plasma Orbiting Particles
    const particleCount = 600;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVel = new Float32Array(particleCount);
    const pRad = new Float32Array(particleCount);
    const pAng = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const radius = diskInner + Math.random() * (diskOuter - diskInner);
      const angle = Math.random() * Math.PI * 2;
      pRad[i] = radius;
      pAng[i] = angle;
      // Keplerian relativistic angular speed ~ 1 / r^1.5
      pVel[i] = 1.6 / Math.pow(radius, 1.2);
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xfed7aa,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 12. Test Particle Probe (Beacon Sphere & Fading Trajectory Trail)
    const probeGroup = new THREE.Group();
    const probeSphereGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const probeSphereMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const probeSphere = new THREE.Mesh(probeSphereGeo, probeSphereMat);
    probeGroup.add(probeSphere);

    const probeHaloGeo = new THREE.SphereGeometry(0.44, 16, 16);
    const probeHaloMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const probeHalo = new THREE.Mesh(probeHaloGeo, probeHaloMat);
    probeGroup.add(probeHalo);

    scene.add(probeGroup);
    probeGroupRef.current = probeGroup;

    // Trajectory Trail Line
    const maxTrailPoints = 350;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setDrawRange(0, 0);

    const trailMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const probeTrail = new THREE.Line(trailGeo, trailMat);
    scene.add(probeTrail);
    probeTrailRef.current = probeTrail;

    // Mouse drag rotation controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalPhi = Math.PI / 2.8;
    let sphericalTheta = 0.4;
    let camRadius = 13.5;

    const updateCameraPos = () => {
      camera.position.x = camRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = camRadius * Math.cos(sphericalPhi);
      camera.position.z = camRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(0, 0, 0);
      
      // Orient the warped gravitational lensing ring perpendicular to camera line-of-sight
      if (warpedMesh) {
        warpedMesh.lookAt(camera.position);
      }
    };
    updateCameraPos();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.007;
      sphericalPhi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalPhi - deltaY * 0.007));
      updateCameraPos();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camRadius = Math.max(5.5, Math.min(28, camRadius + e.deltaY * 0.015));
      updateCameraPos();
    };

    // Touch events for mobile
    let touchX = 0;
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchX;
        const dy = e.touches[0].clientY - touchY;
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
        sphericalTheta -= dx * 0.007;
        sphericalPhi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalPhi - dy * 0.007));
        updateCameraPos();
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });
    domEl.addEventListener('touchstart', onTouchStart, { passive: true });
    domEl.addEventListener('touchmove', onTouchMove, { passive: true });

    // Window resize handler
    const onResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let clockTime = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (isPlaying) {
        clockTime += 0.016;

        // Spin accretion disk
        if (diskMeshRef.current) {
          diskMeshRef.current.rotation.z += 0.004 * (1 + spin * 1.5);
        }

        // Spin ergosphere if visible
        if (ergoMeshRef.current) {
          ergoMeshRef.current.rotation.y += 0.006 * (0.2 + spin);
        }

        // Pulse jet intensity
        if (jetsGroupRef.current) {
          const jetPulse = 1 + 0.15 * Math.sin(clockTime * 4);
          jetsGroupRef.current.scale.set(jetPulse, 1, jetPulse);
        }

        // Rotate particles in plasma disk
        if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            pAng[i] += pVel[i] * 0.015 * (1 + spin * 0.8);
            const r = pRad[i];
            positions[i * 3] = Math.cos(pAng[i]) * r;
            positions[i * 3 + 2] = Math.sin(pAng[i]) * r;
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // 12. Animate Test Particle Probe & Orbit Trail
        const curOrbitType = orbitTypeRef.current;
        if (probeGroupRef.current && probeTrailRef.current) {
          if (curOrbitType === 'none') {
            probeGroupRef.current.visible = false;
            probeTrailRef.current.visible = false;
          } else {
            probeGroupRef.current.visible = true;
            probeTrailRef.current.visible = true;

            const pState = probeStateRef.current;
            const r_s_sim = 2.0;
            const r_plus_sim = 2.0 * (metric.r_plus / metric.r_s);

            let posX = 0;
            let posY = 0;
            let posZ = 0;
            let currentRadiusSim = pState.r;
            let speedFraction = 0.35;

            if (curOrbitType === 'circular') {
              // Stable circular orbit at r = 3.75 r_s
              currentRadiusSim = 7.5;
              const angVel = 0.018 * (1 + spin * 0.3);
              pState.phi += angVel;
              speedFraction = Math.min(0.85, 0.52 / Math.sqrt(currentRadiusSim / r_s_sim));

              // Moderate inclination of 12 degrees relative to disk
              const inclination = 0.21;
              posX = Math.cos(pState.phi) * currentRadiusSim;
              posY = Math.sin(pState.phi) * Math.sin(inclination) * currentRadiusSim;
              posZ = Math.sin(pState.phi) * Math.cos(inclination) * currentRadiusSim;
            } else if (curOrbitType === 'elliptic') {
              // Relativistic precessing rosette orbit (General Relativity)
              const aSemi = 7.6;
              const ecc = 0.36;
              const pSemi = aSemi * (1 - ecc * ecc);

              // Perihelion precession in GR
              pState.perihelionAdvance += 0.0035 * (1 + spin * 0.4);
              const localAngle = pState.phi - pState.perihelionAdvance;
              currentRadiusSim = pSemi / (1 + ecc * Math.cos(localAngle));

              const dPhi = (0.16 / Math.pow(currentRadiusSim, 1.2)) * (1 + spin * 0.2);
              pState.phi += dPhi;
              speedFraction = Math.min(0.88, 0.65 / Math.sqrt(currentRadiusSim / r_s_sim));

              const inclination = 0.18;
              posX = Math.cos(pState.phi) * currentRadiusSim;
              posY = Math.sin(pState.phi) * Math.sin(inclination) * currentRadiusSim;
              posZ = Math.sin(pState.phi) * Math.cos(inclination) * currentRadiusSim;
            } else if (curOrbitType === 'capture') {
              // Relativistic capture plunge spiral
              const dPhi = 0.032 * Math.pow(6.0 / Math.max(pState.r, 1.2), 1.25);
              pState.phi += dPhi;

              const iscoSim = simScale.r_isco_sim;
              const isInwardISCO = pState.r < iscoSim;
              const radialDecay = isInwardISCO
                ? 0.042 * Math.pow(iscoSim / Math.max(pState.r, 1.0), 1.5)
                : 0.014;
              pState.r -= radialDecay;

              currentRadiusSim = pState.r;
              speedFraction = Math.min(0.98, 0.45 + (1 - currentRadiusSim / 8.2) * 0.5);

              // Event horizon plunge check
              if (pState.r <= r_plus_sim * 1.06) {
                // Plunged into horizon! Reset to outer apoapsis
                pState.r = 8.4;
                pState.phi = Math.random() * Math.PI * 2;
                pState.trailPoints = [];
              }

              const inclination = 0.15;
              posX = Math.cos(pState.phi) * currentRadiusSim;
              posY = Math.sin(pState.phi) * Math.sin(inclination) * currentRadiusSim;
              posZ = Math.sin(pState.phi) * Math.cos(inclination) * currentRadiusSim;
            }

            // Set probe position
            probeGroupRef.current.position.set(posX, posY, posZ);

            // Update trail points
            pState.trailPoints.push(new THREE.Vector3(posX, posY, posZ));
            const maxPoints = curOrbitType === 'elliptic' ? 320 : curOrbitType === 'capture' ? 180 : 120;
            if (pState.trailPoints.length > maxPoints) {
              pState.trailPoints.shift();
            }

            const trailGeo = probeTrailRef.current.geometry;
            const positions = trailGeo.attributes.position.array as Float32Array;
            for (let i = 0; i < pState.trailPoints.length; i++) {
              positions[i * 3] = pState.trailPoints[i].x;
              positions[i * 3 + 1] = pState.trailPoints[i].y;
              positions[i * 3 + 2] = pState.trailPoints[i].z;
            }
            trailGeo.setDrawRange(0, pState.trailPoints.length);
            trailGeo.attributes.position.needsUpdate = true;

            // Update trail & probe colors
            const trailMat = probeTrailRef.current.material as THREE.LineBasicMaterial;
            const probeCoreMesh = probeGroupRef.current.children[0] as THREE.Mesh;
            const probeCoreMat = probeCoreMesh.material as THREE.MeshBasicMaterial;

            if (curOrbitType === 'capture') {
              trailMat.color.setHex(0xf43f5e);
              probeCoreMat.color.setHex(0xf43f5e);
            } else if (curOrbitType === 'elliptic') {
              trailMat.color.setHex(0xf59e0b);
              probeCoreMat.color.setHex(0xf59e0b);
            } else {
              trailMat.color.setHex(0x38bdf8);
              probeCoreMat.color.setHex(0x38bdf8);
            }
          }
        }

        // Slowly orbit background stars for cosmic parallax
        starField.rotation.y += 0.0001;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('touchstart', onTouchStart);
      domEl.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []); // Run once on mount

  // Sync visibility toggles with Three.js scene
  useEffect(() => {
    if (ergoMeshRef.current) {
      ergoMeshRef.current.visible = showErgosphere && spin > 0.01;
    }
    if (photonRingRef.current) {
      photonRingRef.current.visible = showPhotonSphere;
    }
    if (iscoRingRef.current) {
      iscoRingRef.current.visible = showISCO;
    }
    if (jetsGroupRef.current) {
      jetsGroupRef.current.visible = showJets && spin > 0.1;
    }
  }, [showErgosphere, showPhotonSphere, showISCO, showJets, spin]);

  // Handle camera view changes
  const setPresetCamera = (type: 'angled' | 'equatorial' | 'polar') => {
    setCameraView(type);
    const camera = cameraRef.current;
    if (!camera) return;

    if (type === 'equatorial') {
      camera.position.set(0, 0.4, 14.5);
    } else if (type === 'polar') {
      camera.position.set(0, 15, 0.1);
    } else {
      camera.position.set(0, 6.5, 13.5);
    }
    camera.lookAt(0, 0, 0);
    if (warpedDiskMeshRef.current) {
      warpedDiskMeshRef.current.lookAt(camera.position);
    }
  };

  return (
    <div className="relative w-full h-[600px] lg:h-[700px] bg-[#03060c] rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D Canvas Stage */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating HUD: Real astrophysical measurements */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-1.5 max-w-sm">
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-lg p-3 text-xs shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <span className="font-semibold text-amber-400 text-sm tracking-wide">{name}</span>
            <span className="text-slate-400 font-mono text-[11px]">
              M = {formatScientific(massSolar, 2)} M_☉
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-300 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">ORIZZONTE r_+</span>
              <span className="font-semibold text-white">{(metric.r_plus / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })} km</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">SPIN DIMENSIONALE a*</span>
              <span className="font-semibold text-cyan-400">{spin.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">SFERA FOTONI r_ph</span>
              <span className="font-semibold text-amber-200">{(metric.r_photon / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })} km</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">BORDO ISCO r_isco</span>
              <span className="font-semibold text-sky-400">{(metric.r_isco_prograde / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })} km</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">TEMPERATURA HAWKING</span>
              <span className="font-semibold text-slate-200">{formatScientific(metric.hawkingTemp, 2)} K</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">OMBRA TEORICA b_c</span>
              <span className="font-semibold text-slate-200">{(metric.b_crit / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })} km</span>
            </div>
          </div>
        </div>

        {/* Legend notes */}
        <div className="bg-slate-950/70 backdrop-blur-sm border border-slate-800/60 rounded-md px-3 py-1.5 text-[11px] text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Ergosfera di Kerr
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Lente & Anello
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Bordo ISCO
          </span>
        </div>
      </div>

      {/* Floating Viewport Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 p-1 rounded-lg">
        <button
          onClick={() => setPresetCamera('angled')}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${cameraView === 'angled' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-white'}`}
          title="Vista prospettica isometrica"
        >
          Inclinata 45°
        </button>
        <button
          onClick={() => setPresetCamera('equatorial')}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${cameraView === 'equatorial' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-white'}`}
          title="Vista di profilo sul piano equatoriale"
        >
          Equatoriale
        </button>
        <button
          onClick={() => setPresetCamera('polar')}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${cameraView === 'polar' ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-white'}`}
          title="Vista zenitale dal polo"
        >
          Polare (Dall'alto)
        </button>
      </div>

      {/* Test Particle Orbit Selector Overlay (Top Right) */}
      <div className="absolute top-16 right-4 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 p-2.5 rounded-xl flex flex-col gap-2 shadow-xl w-64">
        <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-sky-400" />
            Particella di Test (Orbita 3D)
          </span>
          {orbitType !== 'none' && (
            <span className="text-[10px] font-mono text-sky-400">
              ● Attiva
            </span>
          )}
        </div>

        {/* Orbit mode selector buttons */}
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <button
            onClick={() => setOrbitType('none')}
            className={`px-2 py-1.5 rounded-md border text-left font-medium transition-all ${
              orbitType === 'none'
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Disattivata
          </button>
          <button
            onClick={() => setOrbitType('circular')}
            className={`px-2 py-1.5 rounded-md border text-left font-medium transition-all ${
              orbitType === 'circular'
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 font-semibold'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Circolare (Stabile)
          </button>
          <button
            onClick={() => setOrbitType('elliptic')}
            className={`px-2 py-1.5 rounded-md border text-left font-medium transition-all ${
              orbitType === 'elliptic'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Ellittica (Rosetta)
          </button>
          <button
            onClick={() => setOrbitType('capture')}
            className={`px-2 py-1.5 rounded-md border text-left font-medium transition-all ${
              orbitType === 'capture'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-semibold'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Cattura (Plunge)
          </button>
        </div>

        {/* Orbit dynamics note */}
        {orbitType !== 'none' && (
          <div className="text-[10px] text-slate-400 border-t border-slate-800/70 pt-1.5 flex items-start gap-1">
            <span className="text-amber-400 shrink-0">▸</span>
            <span className="leading-tight">
              {orbitType === 'circular' && 'Orbita chiusa a raggio costante r > r_isco.'}
              {orbitType === 'elliptic' && 'Precessione del perielio ad ogni rivoluzione (Rosetta GR).'}
              {orbitType === 'capture' && 'Spirale di caduta libera oltre ISCO dentro l\'orizzonte.'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Interactive HUD Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 p-2.5 rounded-xl">
        {/* Play/Pause & reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                Pausa Moto
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Avvia Moto
              </>
            )}
          </button>
          
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Trascina col mouse per ruotare · Rotella per zoomare
          </span>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowErgosphere(!showErgosphere)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
              showErgosphere && spin > 0.01
                ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Mostra l'ergosfera prodotta dal trascinamento dello spaziotempo (Frame Dragging)"
          >
            <Compass className="w-3 h-3" />
            Ergosfera Kerr
          </button>

          <button
            onClick={() => setShowPhotonSphere(!showPhotonSphere)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
              showPhotonSphere
                ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Mostra la sfera di raggio r = 3M dove la luce può orbitare"
          >
            <Eye className="w-3 h-3" />
            Sfera Fotoni
          </button>

          <button
            onClick={() => setShowISCO(!showISCO)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
              showISCO
                ? 'border-sky-500/50 bg-sky-950/40 text-sky-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Mostra il limite orbitale stabile più interno per particelle con massa"
          >
            <Disc className="w-3 h-3" />
            Bordo ISCO
          </button>

          <button
            onClick={() => setShowJets(!showJets)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all ${
              showJets && spin > 0.1
                ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Mostra i getti relativistici polari alimentati da momento angolare"
          >
            <Zap className="w-3 h-3" />
            Getti Plasma
          </button>
        </div>
      </div>
    </div>
  );
};
