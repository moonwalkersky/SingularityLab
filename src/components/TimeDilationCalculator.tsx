/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, AlertTriangle, Eye, Gauge, ShieldCheck, Flame, Download } from 'lucide-react';
import { calculateTimeDilation, calculateTidalAcceleration, formatScientific, formatTimeSpan, G, C, M_SOLAR } from '../utils/physicsConstants';
import { generateTimeDilationData, objectsToCsv, downloadFile } from '../utils/exportSimulationData';
import { MathView } from './MathView';

interface TimeDilationCalculatorProps {
  massSolar: number;
  massKg: number;
  onOpenExportModal?: () => void;
}

export const TimeDilationCalculator: React.FC<TimeDilationCalculatorProps> = ({ massSolar, massKg, onOpenExportModal }) => {
  // Distance from center as a ratio of Schwarzschild radius r / r_s
  const [rRatio, setRRatio] = useState<number>(2.5); // 2.5 r_s
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [emittedWavelengthNm, setEmittedWavelengthNm] = useState<number>(460); // 460nm (Blue light)

  // Synchronized clock timers
  const [coordSeconds, setCoordSeconds] = useState<number>(0);
  const [properSeconds, setProperSeconds] = useState<number>(0);

  // Compute metrics
  const mGeom = (G * massKg) / (C * C);
  const r_s = 2 * mGeom;
  const currentRadiusMeters = rRatio * r_s;

  const { dilationFactor, timeDelayRatio, redshiftZ } = useMemo(() => {
    return calculateTimeDilation(rRatio);
  }, [rRatio]);

  // Tidal acceleration across 1.8m human
  const tidalAccelMs2 = useMemo(() => {
    return calculateTidalAcceleration(massKg, currentRadiusMeters, 1.8);
  }, [massKg, currentRadiusMeters]);

  const tidalInG = tidalAccelMs2 / 9.80665;

  // Running clock effect
  const prevTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    let animId: number;
    const tick = (now: number) => {
      const deltaSec = (now - prevTimeRef.current) / 1000;
      prevTimeRef.current = now;

      if (isRunning) {
        setCoordSeconds((prev) => prev + deltaSec);
        setProperSeconds((prev) => prev + deltaSec * dilationFactor);
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, dilationFactor]);

  // Observed wavelength and EM band
  const observedWavelengthNm = useMemo(() => {
    if (!isFinite(redshiftZ)) return Infinity;
    return emittedWavelengthNm * (1 + redshiftZ);
  }, [emittedWavelengthNm, redshiftZ]);

  const emBand = useMemo(() => {
    const w = observedWavelengthNm;
    if (!isFinite(w)) return { name: 'Oscuramento Infinito (Orizzonte)', color: '#000000', visible: false };
    if (w < 380) return { name: 'Ultravioletto', color: '#818cf8', visible: false };
    if (w <= 450) return { name: 'Viola / Indaco', color: '#6366f1', visible: true };
    if (w <= 495) return { name: 'Blu', color: '#38bdf8', visible: true };
    if (w <= 570) return { name: 'Verde', color: '#10b981', visible: true };
    if (w <= 590) return { name: 'Giallo', color: '#eab308', visible: true };
    if (w <= 620) return { name: 'Arancione', color: '#f97316', visible: true };
    if (w <= 750) return { name: 'Rosso Scuro', color: '#ef4444', visible: true };
    if (w <= 100000) return { name: 'Infrarosso (Invisibile ad occhio umano)', color: '#991b1b', visible: false };
    if (w <= 10000000) return { name: 'Microonde', color: '#450a0a', visible: false };
    return { name: 'Onde Radio', color: '#18181b', visible: false };
  }, [observedWavelengthNm]);

  const resetClocks = () => {
    setCoordSeconds(0);
    setProperSeconds(0);
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
      {/* Module Title */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Dilatazione Temporale Relativistica & Forze di Marea (Spaghettificazione)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisi del tempo proprio <MathView math="d\tau = \sqrt{1 - r_s/r} dt" /> e del redshift spettrale
          </p>
        </div>

        {/* Play/Pause/Reset clocks & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" /> Pausa Orologi
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" /> Avvia Orologi
              </>
            )}
          </button>
          <button
            onClick={resetClocks}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Azzera orologi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="text-slate-700">|</span>

          {/* Quick download buttons */}
          <button
            onClick={() => {
              const data = generateTimeDilationData(massKg, emittedWavelengthNm);
              downloadFile(objectsToCsv(data), 'dilatazione_temporale.csv', 'text/csv');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 hover:text-emerald-200 border border-slate-700 transition-colors"
            title="Scarica dati tabella in formato CSV"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>

          <button
            onClick={() => {
              const data = generateTimeDilationData(massKg, emittedWavelengthNm);
              downloadFile(JSON.stringify(data, null, 2), 'dilatazione_temporale.json', 'application/json');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-sky-300 hover:text-sky-200 border border-slate-700 transition-colors"
            title="Scarica dati completi in formato JSON"
          >
            <Download className="w-3 h-3" />
            JSON
          </button>
        </div>
      </div>

      {/* Main Interactive Distance Scrubber */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-medium">Posizione della Sonda (Distanza dal Centro):</span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-amber-400 font-bold text-sm">{rRatio.toFixed(3)} r_s</span>
            <span className="text-slate-400">
              ({(currentRadiusMeters / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })} km)
            </span>
          </div>
        </div>

        <input
          type="range"
          min="1.001"
          max="10.0"
          step="0.005"
          value={rRatio}
          onChange={(e) => setRRatio(parseFloat(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
          <span className="text-rose-400 font-semibold">1.001 r_s (Poco sopra l'orizzonte)</span>
          <span className="text-amber-300">1.500 r_s (Sfera dei Fotoni)</span>
          <span className="text-sky-400">3.000 r_s (ISCO)</span>
          <span>10.0 r_s (Campo debole)</span>
        </div>
      </div>

      {/* Synchronized Twin Clocks Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Clock 1: Distant Observer */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Osservatore Lontano (Terra / r → ∞)
              </span>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                TEMPO COORDINATO dt
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-white tracking-tight my-2">
              {coordSeconds.toFixed(2)} <span className="text-sm font-normal text-slate-400">secondi</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
            Per questo osservatore il tempo scorre indisturbato a ritmo standard. Guarda la sonda avvicinarsi all'orizzonte.
          </p>
        </div>

        {/* Clock 2: Probe at Radius r */}
        <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Sonda a {rRatio.toFixed(2)} r_s
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                TEMPO PROPRIO dτ
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-amber-300 tracking-tight my-2">
              {properSeconds.toFixed(2)} <span className="text-sm font-normal text-amber-400/80">secondi</span>
            </div>
          </div>
          <div className="border-t border-slate-800/80 pt-2 text-xs flex items-center justify-between font-mono">
            <span className="text-slate-400">Fattore di rallentamento:</span>
            <span className="text-amber-400 font-bold">
              {isFinite(timeDelayRatio) ? `${timeDelayRatio.toFixed(2)}× più lento` : 'Tempo Fermo (∞)'}
            </span>
          </div>
        </div>
      </div>

      {/* Relativistic Redshift and Tidal Forces Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Redshift & Spectrum Shifter */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-rose-400" />
              Spostamento Verso il Rosso Gravitazionale (Redshift)
            </span>
            <span className="text-xs font-mono text-rose-400 font-bold">
              z = {isFinite(redshiftZ) ? redshiftZ.toFixed(3) : '∞'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>Luce emessa a bordo:</span>
              <span className="text-sky-300">{emittedWavelengthNm} nm (Laser Blu)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>Luce ricevuta a terra:</span>
              <span className="text-rose-400 font-bold">
                {isFinite(observedWavelengthNm)
                  ? `${observedWavelengthNm.toLocaleString('it-IT', { maximumFractionDigits: 1 })} nm`
                  : 'Frequenza zero (invisibile)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>Banda Elettromagnetica:</span>
              <span
                className="font-bold px-2 py-0.5 rounded text-[11px]"
                style={{ backgroundColor: `${emBand.color}30`, color: emBand.color }}
              >
                {emBand.name}
              </span>
            </div>
          </div>

          {/* Visual Color Spectrum Strip Preview */}
          <div className="mt-1">
            <div className="text-[10px] text-slate-400 mb-1">Aspetto visivo del raggio di luce visto dalla Terra:</div>
            <div
              className="h-7 w-full rounded-md border border-slate-700 flex items-center justify-center font-mono text-xs font-bold transition-all"
              style={{
                backgroundColor: emBand.visible ? emBand.color : '#05070c',
                color: emBand.visible ? '#ffffff' : '#64748b',
              }}
            >
              {emBand.visible ? 'Visibile' : 'Fuori dallo spettro visibile'}
            </div>
          </div>
        </div>

        {/* Tidal Force & Spaghettification */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Forze di Marea su Corpo Umano (1.8m)
              </span>
              <span className="text-xs font-mono text-slate-300">
                Δa_marea
              </span>
            </div>

            <div className="my-2 space-y-1">
              <div className="text-2xl font-mono font-bold text-white">
                {formatScientific(tidalInG, 1)} <span className="text-xs text-slate-400 font-normal">g terrestri</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Differenziale di trazione testa-piedi: {formatScientific(tidalAccelMs2, 1)} m/s²
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            {tidalInG > 10 ? (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-900/40">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Spaghettificazione letale:</strong> Il gradiente di marea smembra qualsiasi struttura biologica e atomica.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/40">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Maree tollerabili:</strong> Per buchi neri supermassicci, l'orizzonte è così vasto che un astronauta lo attraversa illeso!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Physics explanation */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed">
        <span className="font-semibold text-amber-400">Perché non vediamo mai un oggetto toccare l'orizzonte? </span>
        Quando la sonda si avvicina a <MathView math="r = r_s" />, ogni segnale emesso subisce un ritardo temporale coordinato 
        che diverge verso l'infinito. Contemporaneamente, il redshift gravitazionale sposta la lunghezza d'onda verso valori infiniti 
        (energia del fotone <MathView math="E = h\nu \to 0" />). L'oggetto svanisce non perché si congela per sempre, ma perché si 
        spegne rapidamente nello spettro infrarosso e radio invisibile, oscurandosi per sempre!
      </div>
    </div>
  );
};
