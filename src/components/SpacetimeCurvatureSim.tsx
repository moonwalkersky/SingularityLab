/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Activity, Info, Sparkles } from 'lucide-react';
import { MathView } from './MathView';

interface SpacetimeCurvatureSimProps {
  massSolar: number;
}

export const SpacetimeCurvatureSim: React.FC<SpacetimeCurvatureSimProps> = ({ massSolar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [gravityMode, setGravityMode] = useState<'einstein' | 'newton'>('einstein');
  const [initialRadius, setInitialRadius] = useState<number>(12.0); // in units of M
  const [initialTangentialSpeed, setInitialTangentialSpeed] = useState<number>(0.29); // orbital velocity
  const [showFlammFunnel, setShowFlammFunnel] = useState<boolean>(true);
  const [trailLength, setTrailLength] = useState<number>(900);

  // Relativistic particle state
  // In geometrized units: M = 1, r_s = 2, r_isco = 6
  const particleState = useRef<{
    r: number;
    phi: number;
    dr: number;
    dphi: number;
    trail: { x: number; y: number; r: number }[];
    status: 'orbiting' | 'plunged';
    lapsCompleted: number;
  }>({
    r: 12.0,
    phi: 0,
    dr: 0,
    dphi: 0.29 / 12.0,
    trail: [],
    status: 'orbiting',
    lapsCompleted: 0,
  });

  const M = 1.0;
  const r_s = 2.0;
  const r_isco = 6.0;

  // Reset particle to initial condition
  const resetSimulation = useCallback(() => {
    particleState.current = {
      r: initialRadius,
      phi: 0,
      dr: 0,
      dphi: initialTangentialSpeed / initialRadius,
      trail: [{
        x: initialRadius,
        y: 0,
        r: initialRadius,
      }],
      status: 'orbiting',
      lapsCompleted: 0,
    };
  }, [initialRadius, initialTangentialSpeed]);

  useEffect(() => {
    resetSimulation();
  }, [initialRadius, initialTangentialSpeed, gravityMode, resetSimulation]);

  // Numerical integration loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dt = 0.05;

    const render = () => {
      const p = particleState.current;

      if (isSimulating && p.status === 'orbiting') {
        // Run multiple sub-steps for symplectic precision
        for (let sub = 0; sub < 4; sub++) {
          const r = p.r;
          if (r <= r_s * 1.05) {
            p.status = 'plunged';
            break;
          }

          // Angular momentum per unit mass L = r^2 * dphi
          const L = r * r * p.dphi;

          // Radial acceleration:
          // In Newton: d^2r/dt^2 = - M / r^2 + L^2 / r^3
          // In GR (Schwarzschild geodesic):
          // d^2r/dt^2 = - M / r^2 + L^2 / r^3 - (3 * M * L^2) / r^4
          let d2r = - (M / (r * r)) + (L * L) / (r * r * r);
          if (gravityMode === 'einstein') {
            // Relativistic GR perihelion precession correction
            d2r -= (3.0 * M * L * L) / Math.pow(r, 4);
          }

          p.dr += d2r * dt;
          p.r += p.dr * dt;

          // dphi update (conservation of angular momentum)
          p.dphi = L / (p.r * p.r);
          const prevPhi = p.phi;
          p.phi += p.dphi * dt;
          if (p.phi - prevPhi > 0 && Math.floor(p.phi / (2 * Math.PI)) > Math.floor(prevPhi / (2 * Math.PI))) {
            p.lapsCompleted++;
          }

          const curX = p.r * Math.cos(p.phi);
          const curY = p.r * Math.sin(p.phi);
          p.trail.push({ x: curX, y: curY, r: p.r });
          if (p.trail.length > trailLength) {
            p.trail.shift();
          }
        }
      }

      // Drawing
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) / 38;

      const toScreenX = (x: number) => cx + x * scale;
      const toScreenY = (y: number) => cy - y * scale;

      // 1. Clear background
      ctx.fillStyle = '#03060c';
      ctx.fillRect(0, 0, width, height);

      // 2. Flamm's Paraboloid Curvature Contours / Gravitational Funnel
      if (showFlammFunnel) {
        // Draw warped coordinate grid
        ctx.lineWidth = 1;
        for (let ring = 2.5; ring <= 24; ring += 2.0) {
          // Flamm curvature z(r) = 2 * sqrt(r_s * (r - r_s))
          const zRel = ring > r_s ? 2 * Math.sqrt(r_s * (ring - r_s)) : 0;
          const alpha = Math.max(0.04, 0.25 - (ring / 28) * 0.2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.beginPath();
          ctx.arc(cx, cy, ring * scale, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Radial coordinate spokes
        for (let sp = 0; sp < 12; sp++) {
          const ang = (sp / 12) * Math.PI * 2;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * (r_s * scale), cy + Math.sin(ang) * (r_s * scale));
          ctx.lineTo(cx + Math.cos(ang) * (26 * scale), cy + Math.sin(ang) * (26 * scale));
          ctx.stroke();
        }
      }

      // 3. ISCO Ring (r = 6M)
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, r_isco * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('ISCO (r = 6M)', cx + r_isco * scale + 6, cy - 6);

      // 4. Horizon (r = 2M)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy, r_s * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ef4444';
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('r_s = 2M', cx, cy + 3.5);
      ctx.textAlign = 'left';

      // 5. Orbit Trail (Rosette pattern for GR)
      if (p.trail.length > 1) {
        ctx.lineWidth = 1.6;
        for (let i = 1; i < p.trail.length; i++) {
          const alpha = i / p.trail.length;
          ctx.strokeStyle = gravityMode === 'einstein'
            ? `rgba(245, 158, 11, ${alpha * 0.9})` // amber for GR
            : `rgba(96, 165, 250, ${alpha * 0.9})`; // blue for Newton
          ctx.beginPath();
          ctx.moveTo(toScreenX(p.trail[i - 1].x), toScreenY(p.trail[i - 1].y));
          ctx.lineTo(toScreenX(p.trail[i].x), toScreenY(p.trail[i].y));
          ctx.stroke();
        }
      }

      // 6. Current Particle Position
      if (p.status === 'orbiting') {
        const px = toScreenX(p.r * Math.cos(p.phi));
        const py = toScreenY(p.r * Math.sin(p.phi));

        // Particle halo
        ctx.fillStyle = gravityMode === 'einstein' ? '#f59e0b' : '#60a5fa';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, gravityMode, showFlammFunnel, trailLength, M, r_s, r_isco]);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
      {/* Title & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Curvatura dello Spaziotempo & Precessione delle Orbite (Rosetta)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Confronto fra l'ellisse chiusa kepleriana di Newton e la precessione relativistica di Einstein con collasso ISCO
          </p>
        </div>

        {/* Segmented gravity mode selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setGravityMode('einstein')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              gravityMode === 'einstein'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Relatività Generale (Einstein)
          </button>
          <button
            onClick={() => setGravityMode('newton')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              gravityMode === 'newton'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gravitazione Classica (Newton)
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-[440px] sm:h-[480px] bg-[#03060c] rounded-lg overflow-hidden border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          className="w-full h-full object-contain"
        />

        {/* Live HUD overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs font-mono shadow-md">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
            Telemetria Orbitale
          </div>
          <div className="space-y-1 text-slate-300">
            <div>
              <span>Raggio Attuale r:</span>{' '}
              <span className="text-amber-400 font-bold">
                {particleState.current.r.toFixed(2)} M
              </span>{' '}
              ({(particleState.current.r / r_s).toFixed(2)} r_s)
            </div>
            <div>
              <span>Stato:</span>{' '}
              <span
                className={`font-semibold ${
                  particleState.current.status === 'plunged' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {particleState.current.status === 'plunged'
                  ? 'Catturato nell\'Orizzonte!'
                  : 'Orbita Stabile / Precessione'}
              </span>
            </div>
            <div>
              <span>Rivoluzioni completate:</span>{' '}
              <span className="text-white font-semibold">
                {particleState.current.lapsCompleted}
              </span>
            </div>
          </div>
        </div>

        {/* Top-Right Simulation Action Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" /> Pausa
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" /> Avvia
              </>
            )}
          </button>
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            title="Reimposta orbita iniziale"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Orbit Parameters Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Initial Radius Slider */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Raggio di Partenza (Apoastro):</span>
            <span className="font-mono text-cyan-400 font-semibold">{initialRadius.toFixed(1)} M</span>
          </div>
          <input
            type="range"
            min="6.5"
            max="18.0"
            step="0.5"
            value={initialRadius}
            onChange={(e) => setInitialRadius(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>6.5 M (Prossimo a ISCO)</span>
            <span>12.0 M</span>
            <span>18.0 M (Lontano)</span>
          </div>
        </div>

        {/* Initial Tangential Speed Slider */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Velocità Tangenziale v_φ:</span>
            <span className="font-mono text-amber-400 font-semibold">{initialTangentialSpeed.toFixed(3)} c</span>
          </div>
          <input
            type="range"
            min="0.18"
            max="0.40"
            step="0.005"
            value={initialTangentialSpeed}
            onChange={(e) => setInitialTangentialSpeed(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span className="text-rose-400">0.18 (Tuffo diretto)</span>
            <span>0.29 (Rosetta)</span>
            <span>0.40 (Quasi circolare)</span>
          </div>
        </div>

        {/* Display options */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showFlammFunnel}
              onChange={(e) => setShowFlammFunnel(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span>Visualizza Reticolo Curvo (Paraboloide di Flamm)</span>
          </label>
          <div className="text-[11px] text-slate-400">
            Traccia scia: <span className="text-slate-200 font-mono">{trailLength} punti</span>
          </div>
        </div>
      </div>

      {/* Physics explanation card */}
      <div className="bg-sky-950/20 border border-sky-900/40 rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed">
        <div className="font-semibold text-sky-300 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          La Dimostrazione dell'Equazione di Binet Relativistica
        </div>
        <p>
          Nella gravità newtoniana classica, la forza attrattiva è rigorosamente proporzionale a <MathView math="1/r^2" />, 
          generando orbite kepleriane perfettamente chiuse (il perielio non ruota). 
          In Relatività Generale, la curvatura dello spaziotempo aggiunge un termine cubico <MathView math="-\frac{3GM L^2}{c^2 r^4}" />. 
          Questo fa sì che l'orbita disegni un <strong>motivo a rosetta</strong> continuo (precessione del perielio). 
          Inoltre, se l'orbita penetra all'interno dell'ISCO (<MathView math="r < 6M" />), la forza centrifuga 
          non è più in grado di contrastare la gravitazione e la particella cade nel buco nero con un tuffo a spirale ineluttabile!
        </p>
      </div>
    </div>
  );
};
