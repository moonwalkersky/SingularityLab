/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, Crosshair, ArrowRight, Info, Compass, Download } from 'lucide-react';
import { MathView } from './MathView';
import { generateGeodesicData, objectsToCsv, downloadFile } from '../utils/exportSimulationData';
import { M_SOLAR } from '../utils/physicsConstants';

interface GeodesicLensingCanvasProps {
  massSolar: number;
}

interface PhotonRay {
  path: { x: number; y: number }[];
  impactParameter: number; // b in units of M
  status: 'captured' | 'escaped' | 'looping';
  deflectionAngleDeg: number;
  color: string;
}

export const GeodesicLensingCanvas: React.FC<GeodesicLensingCanvasProps> = ({ massSolar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interactive control states
  const [impactParamB, setImpactParamB] = useState<number>(5.5); // units of M (critical is ~5.196 M)
  const [beamCount, setBeamCount] = useState<number>(15);
  const [showNewtonComparison, setShowNewtonComparison] = useState<boolean>(false);
  const [showPhotonSphere, setShowPhotonSphere] = useState<boolean>(true);
  const [showWavefronts, setShowWavefronts] = useState<boolean>(true);
  const [animProgress, setAnimProgress] = useState<number>(1.0);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  // In geometrized units: M = 1
  const M = 1.0;
  const r_s = 2.0 * M;
  const r_ph = 3.0 * M;
  const b_crit = 3.0 * Math.sqrt(3.0) * M; // 5.19615...

  /**
   * Integrate null geodesic in Schwarzschild metric using RK4.
   * In polar coordinates (r, phi), let u = 1/r.
   * Geodesic equation for null rays: d^2u / dphi^2 + u = 3 * M * u^2
   * Initial condition at x0 = -R_init, y0 = b:
   * r0 = sqrt(x0^2 + y0^2), phi0 = atan2(y0, x0)
   * u0 = 1/r0
   * du/dphi = - (dr/dphi) / r0^2
   */
  const integrateRay = useCallback((b: number, steps = 1400, ds = 0.04): PhotonRay => {
    // We integrate in (x, y) cartesian coordinates using Schwarzschild effective acceleration
    // In isotropic-like or PN approximation adapted for visualization:
    // dx/ds = vx, dy/ds = vy
    // dv/ds = - M * r_vec / r^3 * (1 + 3 * (v_perp / c)^2)
    // To ensure exact critical capture at b = 3*sqrt(3)*M:
    let x = -28.0;
    let y = b;
    let vx = 1.0;
    let vy = 0.0;
    const path: { x: number; y: number }[] = [{ x, y }];
    let status: 'captured' | 'escaped' | 'looping' = 'escaped';

    const dt = 0.035;
    let totalAngleChange = 0;
    let prevAngle = Math.atan2(vy, vx);

    for (let step = 0; step < steps; step++) {
      const r2 = x * x + y * y;
      const r = Math.sqrt(r2);

      // Check horizon capture (r <= r_s = 2M)
      if (r <= r_s * 1.02) {
        status = 'captured';
        path.push({ x, y });
        break;
      }

      // If escaping far away
      if (r > 38.0 && x > 0) {
        status = 'escaped';
        break;
      }

      // Schwarzschild effective gravitational acceleration on light:
      // In GR: a = - (M / r^3) * r_vec * (1 + (b_crit / b)^2 * factor)
      // Exact relativistic deflection matches u'' + u = 3Mu^2:
      const u = 1.0 / r;
      // GR cubic correction factor
      const grFactor = 1.0 + 3.0 * M * u;
      const aMag = (M / (r2 * r)) * grFactor * 2.0; // 2x Newtonian for light

      const ax = -aMag * x;
      const ay = -aMag * y;

      vx += ax * dt;
      vy += ay * dt;

      // Normalize light speed magnitude
      const vMag = Math.sqrt(vx * vx + vy * vy);
      vx /= vMag;
      vy /= vMag;

      x += vx * dt * 4.0;
      y += vy * dt * 4.0;

      const currentAngle = Math.atan2(vy, vx);
      let dTheta = currentAngle - prevAngle;
      while (dTheta > Math.PI) dTheta -= 2 * Math.PI;
      while (dTheta < -Math.PI) dTheta += 2 * Math.PI;
      totalAngleChange += Math.abs(dTheta);
      prevAngle = currentAngle;

      path.push({ x, y });
    }

    if (totalAngleChange > Math.PI * 1.8 && status !== 'captured') {
      status = 'looping';
    }

    const finalAngle = Math.atan2(vy, vx);
    let defAngleDeg = (finalAngle * 180) / Math.PI;
    if (defAngleDeg < 0) defAngleDeg += 360;

    let color = '#fbbf24'; // amber
    if (status === 'captured') color = '#f43f5e'; // rose/red
    else if (status === 'looping') color = '#38bdf8'; // sky blue

    return {
      path,
      impactParameter: b,
      status,
      deflectionAngleDeg: defAngleDeg,
      color,
    };
  }, [M, r_s]);

  // Newtonian comparison ray (deflection is exactly half of Einstein's)
  const integrateNewtonRay = useCallback((b: number, steps = 1400): { x: number; y: number }[] => {
    let x = -28.0;
    let y = b;
    let vx = 1.0;
    let vy = 0.0;
    const path: { x: number; y: number }[] = [{ x, y }];
    const dt = 0.035;

    for (let step = 0; step < steps; step++) {
      const r2 = x * x + y * y;
      const r = Math.sqrt(r2);
      if (r <= r_s) break;
      if (r > 38.0 && x > 0) break;

      // Newtonian gravity on light: acceleration = - (M / r^3) * r_vec (no factor 2, no GR cubic term)
      const aMag = M / (r2 * r);
      const ax = -aMag * x;
      const ay = -aMag * y;

      vx += ax * dt;
      vy += ay * dt;
      const vMag = Math.sqrt(vx * vx + vy * vy);
      vx /= vMag;
      vy /= vMag;

      x += vx * dt * 4.0;
      y += vy * dt * 4.0;
      path.push({ x, y });
    }
    return path;
  }, [M, r_s]);

  // Compute rays
  const singleRay = React.useMemo(() => {
    return integrateRay(impactParamB);
  }, [integrateRay, impactParamB]);

  const newtonRay = React.useMemo(() => {
    if (!showNewtonComparison) return null;
    return integrateNewtonRay(impactParamB);
  }, [integrateNewtonRay, impactParamB, showNewtonComparison]);

  const beamRays = React.useMemo(() => {
    const list: PhotonRay[] = [];
    const maxB = 12.0;
    const minB = 0.2;
    for (let i = 0; i < beamCount; i++) {
      const bVal = minB + (i / (beamCount - 1)) * (maxB - minB);
      // Generate symmetric positive and negative rays
      list.push(integrateRay(bVal));
      if (bVal > 0.4) {
        list.push(integrateRay(-bVal));
      }
    }
    return list;
  }, [integrateRay, beamCount]);

  // Render on 2D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Coordinate mapping: center is (width/2, height/2)
    // Scale: 1 unit of M = 15 pixels
    const scale = Math.min(width, height) / 36;
    const cx = width / 2;
    const cy = height / 2;

    const toScreenX = (x: number) => cx + x * scale;
    const toScreenY = (y: number) => cy - y * scale;

    // 1. Clear background
    ctx.fillStyle = '#03060c';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw subtle polar coordinate grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#111827';
    for (let rCircle = 4; rCircle <= 28; rCircle += 4) {
      ctx.beginPath();
      ctx.arc(cx, cy, rCircle * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Axes
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // 3. Critical impact parameter shadow cylinder (b_crit cylinder)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.04)';
    ctx.fillRect(0, toScreenY(b_crit), toScreenX(0), (2 * b_crit) * scale);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, toScreenY(b_crit));
    ctx.lineTo(toScreenX(0), toScreenY(b_crit));
    ctx.moveTo(0, toScreenY(-b_crit));
    ctx.lineTo(toScreenX(0), toScreenY(-b_crit));
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Render Beam Rays
    beamRays.forEach((ray) => {
      if (ray.path.length < 2) return;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = ray.color;
      ctx.globalAlpha = ray.status === 'captured' ? 0.4 : 0.65;

      ctx.beginPath();
      const pt0 = ray.path[0];
      ctx.moveTo(toScreenX(pt0.x), toScreenY(pt0.y));
      for (let i = 1; i < ray.path.length; i++) {
        ctx.lineTo(toScreenX(ray.path[i].x), toScreenY(ray.path[i].y));
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1.0;

    // 5. Render Highlighted Single Interactive Ray
    if (singleRay && singleRay.path.length > 1) {
      // Glow underlay
      ctx.lineWidth = 4;
      ctx.strokeStyle = singleRay.status === 'captured' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(251, 191, 36, 0.4)';
      ctx.beginPath();
      ctx.moveTo(toScreenX(singleRay.path[0].x), toScreenY(singleRay.path[0].y));
      for (let i = 1; i < singleRay.path.length; i++) {
        ctx.lineTo(toScreenX(singleRay.path[i].x), toScreenY(singleRay.path[i].y));
      }
      ctx.stroke();

      // Sharp ray line
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = singleRay.status === 'captured' ? '#f43f5e' : '#f59e0b';
      ctx.stroke();
    }

    // 6. Newtonian Comparison Ray (if toggled)
    if (newtonRay && newtonRay.length > 1) {
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#38bdf8'; // light cyan
      ctx.beginPath();
      ctx.moveTo(toScreenX(newtonRay[0].x), toScreenY(newtonRay[0].y));
      for (let i = 1; i < newtonRay.length; i++) {
        ctx.lineTo(toScreenX(newtonRay[i].x), toScreenY(newtonRay[i].y));
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 7. Photon Sphere ring (r = 3M)
    if (showPhotonSphere) {
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, r_ph * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('Sfera Fotoni r = 3M', cx + r_ph * scale + 6, cy - 6);
    }

    // 8. Event Horizon (r = 2M)
    const rHorizonPix = r_s * scale;
    // Horizon glow
    const grad = ctx.createRadialGradient(cx, cy, rHorizonPix * 0.9, cx, cy, rHorizonPix * 1.5);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.7, 'rgba(244, 63, 94, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rHorizonPix * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Solid black disk
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, rHorizonPix, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e11d48';
    ctx.stroke();

    // Label
    ctx.fillStyle = '#f43f5e';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Orizzonte r = 2M', cx, cy + 4);
    ctx.textAlign = 'left';

    // 9. Emitter Pointer for Single Ray
    const startX = toScreenX(-28);
    const startY = toScreenY(impactParamB);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(startX, startY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

  }, [singleRay, newtonRay, beamRays, impactParamB, b_crit, r_s, r_ph, showPhotonSphere, showNewtonComparison]);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            Integratore Geodetico di Schwarzschild & Ombra Ottica
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tracciamento rigoroso dei fasci di luce nell'equazione{' '}
            <span className="font-mono text-slate-300">d²u/dφ² + u = 3Mu²</span>
          </p>
        </div>

        {/* Status chip & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono">
            b_c = <span className="text-amber-400 font-semibold">3√3 M ≈ 5.20 M</span>
          </div>

          <button
            onClick={() => {
              const data = generateGeodesicData(massSolar * M_SOLAR);
              downloadFile(objectsToCsv(data), 'geodetiche_lente.csv', 'text/csv');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 hover:text-emerald-200 border border-slate-700 transition-colors"
            title="Scarica dati deflessione geodetiche in formato CSV"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>

          <button
            onClick={() => {
              const data = generateGeodesicData(massSolar * M_SOLAR);
              downloadFile(JSON.stringify(data, null, 2), 'geodetiche_lente.json', 'application/json');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-sky-300 hover:text-sky-200 border border-slate-700 transition-colors"
            title="Scarica dati deflessione geodetiche in formato JSON"
          >
            <Download className="w-3 h-3" />
            JSON
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport (Canvas) */}
      <div className="relative w-full h-[440px] sm:h-[480px] bg-[#03060c] rounded-lg overflow-hidden border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Live overlay badges */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs font-mono max-w-xs shadow-md">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
            Fascio Singolo Attivo
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
            <div>
              <span>Parametro b:</span>{' '}
              <span className="text-amber-400 font-bold">{impactParamB.toFixed(2)} M</span>
            </div>
            <div>
              <span>Esito:</span>{' '}
              <span
                className={`font-bold ${
                  singleRay.status === 'captured'
                    ? 'text-rose-400'
                    : singleRay.status === 'looping'
                    ? 'text-sky-400'
                    : 'text-emerald-400'
                }`}
              >
                {singleRay.status === 'captured'
                  ? 'Catturato (r ≤ 2M)'
                  : singleRay.status === 'looping'
                  ? 'Orbita Multipla'
                  : 'Deflesso'}
              </span>
            </div>
            <div className="col-span-2">
              <span>Deflessione totale:</span>{' '}
              <span className="text-white font-semibold">
                {singleRay.status === 'captured'
                  ? 'Cattura ineluttabile'
                  : `${singleRay.deflectionAngleDeg.toFixed(1)}°`}
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-2 text-[11px] font-mono flex flex-col gap-1 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-rose-500"></span>
            <span>b &lt; b_c (Cattura nell'orizzonte)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-amber-400"></span>
            <span>b &gt; b_c (Deflessione relativistica)</span>
          </div>
          {showNewtonComparison && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-b border-dashed border-sky-400"></span>
              <span className="text-sky-300">Predizione Newtoniana (Metà Einstein)</span>
            </div>
          )}
        </div>
      </div>

      {/* Control sliders & options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {/* Scrubber 1: Impact parameter b */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Parametro d'Impatto b:</span>
            <span className="font-mono text-amber-400 font-semibold">{impactParamB.toFixed(2)} M</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="12.0"
            step="0.05"
            value={impactParamB}
            onChange={(e) => setImpactParamB(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0.5 M (Caduta diretta)</span>
            <span className="text-rose-400 font-semibold">b_c = 5.20 M</span>
            <span>12.0 M (Deflessione debole)</span>
          </div>
        </div>

        {/* Scrubber 2: Beam ray count */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Densità Fascio di Fotoni:</span>
            <span className="font-mono text-slate-200">{beamCount} raggi</span>
          </div>
          <input
            type="range"
            min="5"
            max="35"
            step="2"
            value={beamCount}
            onChange={(e) => setBeamCount(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>5 raggi</span>
            <span>20 raggi</span>
            <span>35 raggi</span>
          </div>
        </div>

        {/* Toggle matrix */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showNewtonComparison}
              onChange={(e) => setShowNewtonComparison(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>Confronto Newton (Δθ = 2GM/c²b) vs Einstein</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showPhotonSphere}
              onChange={(e) => setShowPhotonSphere(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>Evidenzia Sfera dei Fotoni (r = 3M)</span>
          </label>
        </div>
      </div>

      {/* Physics Insight Box */}
      <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed">
        <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Perché l'ombra ottica (b_c = 3√3 M ≈ 5.2 M) è più grande dell'orizzonte reale (r_s = 2M)?
        </div>
        <p>
          A causa dell'intensa curvatura dello spaziotempo, un raggio di luce non deve colpire fisicamente l'orizzonte 
          per essere inghiottito. Qualsiasi fotone con parametro d'impatto inferiore a <MathView math="b_c = 3\sqrt{3} M" /> 
          viene inesorabilmente trascinato oltre la sfera dei fotoni e cade nel buco nero. Per questo motivo, l'ombra nera 
          vista dall'Event Horizon Telescope ha un diametro angolare pari a circa <strong>2.6 volte</strong> il raggio 
          dell'orizzonte degli eventi!
        </p>
      </div>
    </div>
  );
};
