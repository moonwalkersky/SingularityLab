/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sparkles, Flame, ShieldAlert, Zap, Layers, Thermometer, Clock, Database } from 'lucide-react';
import { calculateBlackHoleProperties, formatScientific, formatTimeSpan, M_SOLAR, K_B, PLANCK_LENGTH } from '../utils/physicsConstants';
import { MathView } from './MathView';

export const HawkingRadiationLab: React.FC = () => {
  // Logarithmic exponent for mass in kg: from 10^5 kg to 10^40 kg
  // Solar mass is ~ 1.989e30 kg (exp = 30.3)
  const [logMassExp, setLogMassExp] = useState<number>(31); // ~ 10 M_solar

  const massKg = useMemo(() => Math.pow(10, logMassExp), [logMassExp]);
  const massSolar = useMemo(() => massKg / M_SOLAR, [massKg]);

  const props = useMemo(() => {
    return calculateBlackHoleProperties(massKg, 0);
  }, [massKg]);

  // CMB temperature in Kelvin
  const T_CMB = 2.725;
  const isEvaporatingNow = props.hawkingTemp > T_CMB;

  // Information content in bits: S / (k_B * ln(2)) = A / (4 * ln(2) * l_P^2)
  const bitsOfInformation = useMemo(() => {
    const area = props.horizonArea;
    const lP2 = PLANCK_LENGTH * PLANCK_LENGTH;
    return area / (4 * Math.LN2 * lP2);
  }, [props]);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Termodinamica dei Buchi Neri & Radiazione di Hawking
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Esplora l'effetto tunnel quantistico al bordo dell'orizzonte e l'evaporazione su scale cosmologiche
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEvaporatingNow ? (
            <span className="text-xs font-mono px-3 py-1 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Evaporazione Attiva (T_H &gt; T_CMB)
            </span>
          ) : (
            <span className="text-xs font-mono px-3 py-1 rounded bg-sky-950/40 border border-sky-800/40 text-sky-300 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-sky-400" />
              Assorbe Radiazione Cosmica (T_H &lt; 2.72 K)
            </span>
          )}
        </div>
      </div>

      {/* Logarithmic Mass Slider */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-medium">Scala di Massa del Buco Nero (Logaritmica):</span>
          <div className="font-mono text-emerald-400 font-bold text-sm">
            {formatScientific(massKg, 1)} kg{' '}
            <span className="text-slate-400 text-xs font-normal">
              ({formatScientific(massSolar, 2)} M_☉)
            </span>
          </div>
        </div>

        <input
          type="range"
          min="8"
          max="40"
          step="0.2"
          value={logMassExp}
          onChange={(e) => setLogMassExp(parseFloat(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
          <button
            onClick={() => setLogMassExp(11)}
            className="hover:text-emerald-400 text-left transition-colors"
          >
            10¹¹ kg (Primordiale)
          </button>
          <button
            onClick={() => setLogMassExp(25)}
            className="hover:text-emerald-400 text-center transition-colors"
          >
            10²⁵ kg (Terra)
          </button>
          <button
            onClick={() => setLogMassExp(30.3)}
            className="hover:text-emerald-400 text-center transition-colors"
          >
            ~2×10³⁰ kg (1 M_☉)
          </button>
          <button
            onClick={() => setLogMassExp(37)}
            className="hover:text-emerald-400 text-right transition-colors"
          >
            10³⁷ kg (Supermassiccio)
          </button>
        </div>
      </div>

      {/* Thermodynamic Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Hawking Temperature */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
              Temperatura T_H
            </span>
            <div className="text-2xl font-mono font-bold text-white my-2">
              {formatScientific(props.hawkingTemp, 2)}{' '}
              <span className="text-sm font-normal text-slate-400">K</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            Inversamente proporzionale alla massa: <MathView math="T_H \propto 1/M" />. Più il buco nero rimpicciolisce, più diventa rovente!
          </div>
        </div>

        {/* Metric 2: Evaporation Lifetime */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Tempo di Evaporazione
            </span>
            <div className="text-xl font-mono font-bold text-white my-2">
              {formatTimeSpan(props.evapTimeSeconds)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            Scala cubica: <MathView math="t_{\text{evap}} \propto M^3" />. Per buchi neri stellari è superiore all'età dell'universo.
          </div>
        </div>

        {/* Metric 3: Radiated Power (Stefan-Boltzmann) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Potenza Radiata P
            </span>
            <div className="text-2xl font-mono font-bold text-white my-2">
              {formatScientific(props.hawkingPowerWatts, 2)}{' '}
              <span className="text-sm font-normal text-slate-400">Watt</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            Legge Stefan-Boltzmann: <MathView math="P \propto 1/M^2" />. Negli ultimi secondi, la potenza diverge in un lampo gamma!
          </div>
        </div>

        {/* Metric 4: Bekenstein-Hawking Entropy */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Entropia & Bit Olografici
            </span>
            <div className="text-xl font-mono font-bold text-white my-2">
              {formatScientific(bitsOfInformation, 2)}{' '}
              <span className="text-sm font-normal text-slate-400">bit</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            Area in unità di Planck: <MathView math="S = \frac{k_B A}{4 \ell_P^2}" />. Ogni bit occupa 4 aree di Planck.
          </div>
        </div>
      </div>

      {/* Physics Deep Dive Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3 text-xs">
          <div className="font-semibold text-emerald-300 mb-1">
            Buco Nero Primordiale (10¹¹ kg)
          </div>
          <p className="text-slate-300 leading-relaxed">
            Ha la massa di una montagna racchiusa in una frazione del diametro di un protone. 
            Temperatura: <strong>~10¹² Kelvin</strong>. 
            Emette centinaia di megawatt di raggi gamma e neutrini, ed è candidato naturale per spiegare esplosioni cosmiche primordiali.
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3 text-xs">
          <div className="font-semibold text-sky-300 mb-1">
            Buco Nero Stellare (10 M_☉)
          </div>
          <p className="text-slate-300 leading-relaxed">
            Temperatura: <strong>~6 × 10⁻⁹ K</strong> (un miliardesimo di grado sopra lo zero assoluto). 
            Poiché il fondo cosmico CMB è a 2.725 K, questo buco nero è un <em>assorbitore netto</em> di energia termica: 
            non evaporerà finché l'universo non si sarà espanso e raffreddato a sufficienza!
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3 text-xs">
          <div className="font-semibold text-amber-300 mb-1">
            La Catastrofe dell'Evaporazione Finale
          </div>
          <p className="text-slate-300 leading-relaxed">
            Quando un buco nero scende a 1000 tonnellate negli ultimi 0.1 secondi di vita, la temperatura supera la scala di Planck. 
            Rilascia 10²² Joule (l'equivalente di milioni di testate termonucleari simultanee) in una detonazione di particelle elementari pura.
          </p>
        </div>
      </div>
    </div>
  );
};
