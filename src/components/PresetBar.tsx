/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRESETS } from '../data/presetsData';
import { BlackHolePreset } from '../types/physics';
import { Sparkles, Sliders, Compass, Orbit, Download } from 'lucide-react';
import { formatScientific } from '../utils/physicsConstants';

interface PresetBarProps {
  selectedPresetId: string;
  onSelectPreset: (preset: BlackHolePreset) => void;
  massSolar: number;
  onMassChange: (mass: number) => void;
  spin: number;
  onSpinChange: (spin: number) => void;
  onOpenExportModal?: () => void;
}

export const PresetBar: React.FC<PresetBarProps> = ({
  selectedPresetId,
  onSelectPreset,
  massSolar,
  onMassChange,
  spin,
  onSpinChange,
  onOpenExportModal,
}) => {
  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Top: Astrophysical Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-amber-400" />
            Configurazioni Cosmiche Reali
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Dati da EHT, LIGO e Chandra
            </span>
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-medium transition-colors"
                title="Esporta i dati numerici e le metriche delle simulazioni attive in CSV o JSON"
              >
                <Download className="w-3 h-3 text-amber-400" />
                Esporta Dati CSV/JSON
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className={`text-xs font-semibold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {preset.constellation || preset.type}
                  </div>
                </div>

                <div className="mt-2 text-[11px] font-mono text-slate-300">
                  {formatScientific(preset.massSolar, 1)} M_☉
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Fine-Tuning Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
        {/* Mass Slider */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-amber-400" />
              Massa del Buco Nero (Scala Solare):
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {formatScientific(massSolar, 2)} M_☉
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="100"
              step="0.5"
              value={massSolar > 100 ? 100 : massSolar}
              onChange={(e) => onMassChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>3 M_☉ (Limite Oppenheimer-Volkoff)</span>
            <span>20 M_☉ (Stellare)</span>
            <span>&gt;10⁶ M_☉ (Supermassiccio via preset)</span>
          </div>
        </div>

        {/* Spin Parameter Slider */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-cyan-400" />
              Parametro di Spin Dimensionale a* = J / (M c):
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {spin.toFixed(3)}
            </span>
          </div>

          <input
            type="range"
            min="0.0"
            max="0.998"
            step="0.01"
            value={spin}
            onChange={(e) => onSpinChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0.0 (Schwarzschild statico)</span>
            <span>0.50 (Kerr moderato)</span>
            <span className="text-cyan-300 font-semibold">0.998 (Limite Thorne)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
