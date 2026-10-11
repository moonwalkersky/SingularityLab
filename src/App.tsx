/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PRESETS } from './data/presetsData';
import { BlackHolePreset } from './types/physics';
import { M_SOLAR } from './utils/physicsConstants';
import { Navbar } from './components/Navbar';
import { PresetBar } from './components/PresetBar';
import { BlackHole3D } from './components/BlackHole3D';
import { GeodesicLensingCanvas } from './components/GeodesicLensingCanvas';
import { SpacetimeCurvatureSim } from './components/SpacetimeCurvatureSim';
import { TimeDilationCalculator } from './components/TimeDilationCalculator';
import { HawkingRadiationLab } from './components/HawkingRadiationLab';
import { MathematicalProofs } from './components/MathematicalProofs';
import { Glossary } from './components/Glossary';
import { ExportDataModal } from './components/ExportDataModal';
import { GuidedPathway } from './components/GuidedPathway';
import { Orbit, Compass, Activity, Clock, Sparkles, BookOpen, Library, Download, GraduationCap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator3d');
  const [selectedPreset, setSelectedPreset] = useState<BlackHolePreset>(PRESETS[0]); // Sgr A*
  const [massSolar, setMassSolar] = useState<number>(PRESETS[0].massSolar);
  const [spin, setSpin] = useState<number>(PRESETS[0].spin);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const massKg = massSolar * M_SOLAR;

  const handleSelectPreset = (preset: BlackHolePreset) => {
    setSelectedPreset(preset);
    setMassSolar(preset.massSolar);
    setSpin(preset.spin);
  };

  const handleMassChange = (newMass: number) => {
    setMassSolar(newMass);
  };

  const handleSpinChange = (newSpin: number) => {
    setSpin(newSpin);
  };

  return (
    <div className="min-h-screen bg-[#04060b] text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top 3-Zone Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExplorePreset={(id) => {
          const p = PRESETS.find((item) => item.id === id);
          if (p) handleSelectPreset(p);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Hero Section & Unboxed Editorial Metadata */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Astrofisica Relativistica</span>
            <span aria-hidden="true">·</span>
            <span>Relatività Generale di Einstein</span>
            <span aria-hidden="true">·</span>
            <span>Equazioni di Campo nel Vuoto</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Fisica e Simulazioni dei Buchi Neri
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Esplora il comportamento della materia, della luce e dello spaziotempo curvo attorno a una singolarità gravitazionale. 
            Modelli matematici esatti con visualizzazioni interattive in tempo reale e derivazioni formali delle metriche di Schwarzschild e Kerr.
          </p>
        </section>

        {/* Global Preset & Parameter Scrubber */}
        <PresetBar
          selectedPresetId={selectedPreset.id}
          onSelectPreset={handleSelectPreset}
          massSolar={massSolar}
          onMassChange={handleMassChange}
          spin={spin}
          onSpinChange={handleSpinChange}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />

        {/* Navigation Tabs (Workspace Selector) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('simulator3d')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'simulator3d'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            Simulatore 3D (Three.js)
          </button>

          <button
            onClick={() => setActiveTab('pathway')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'pathway'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Percorso Guidato
          </button>

          <button
            onClick={() => setActiveTab('geodesics')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'geodesics'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Lente & Geodetiche
          </button>

          <button
            onClick={() => setActiveTab('curvature')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'curvature'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Curvatura Spaziotempo
          </button>

          <button
            onClick={() => setActiveTab('timedilation')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'timedilation'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Dilatazione & Marea
          </button>

          <button
            onClick={() => setActiveTab('hawking')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'hawking'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Radiazione di Hawking
          </button>

          <button
            onClick={() => setActiveTab('proofs')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'proofs'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Dimostrazioni Matematiche
          </button>

          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'glossary'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            Glossario Concetti
          </button>
        </div>

        {/* Dynamic Interactive Module Content */}
        <section className="flex flex-col gap-6">
          {activeTab === 'simulator3d' && (
            <BlackHole3D
              massSolar={massSolar}
              spin={spin}
              massKg={massKg}
              name={selectedPreset.name}
            />
          )}

          {activeTab === 'pathway' && (
            <GuidedPathway
              massSolar={massSolar}
              spin={spin}
              presetName={selectedPreset.name}
              onApplySettings={(newMass, newSpin) => {
                setMassSolar(newMass);
                setSpin(newSpin);
              }}
              onNavigateTab={(targetTab) => setActiveTab(targetTab)}
            />
          )}

          {activeTab === 'geodesics' && (
            <GeodesicLensingCanvas massSolar={massSolar} />
          )}

          {activeTab === 'curvature' && (
            <SpacetimeCurvatureSim massSolar={massSolar} />
          )}

          {activeTab === 'timedilation' && (
            <TimeDilationCalculator
              massSolar={massSolar}
              massKg={massKg}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {activeTab === 'hawking' && (
            <HawkingRadiationLab />
          )}

          {activeTab === 'proofs' && (
            <MathematicalProofs />
          )}

          {activeTab === 'glossary' && (
            <Glossary />
          )}
        </section>

        {/* Global Export Data Modal */}
        <ExportDataModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          massKg={massKg}
          spin={spin}
          presetName={selectedPreset.name}
        />

        {/* Astrophysical Reference Overview Banner */}
        <section className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">
              Target Cosmico Attivo: {selectedPreset.name}
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {selectedPreset.description}
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-slate-300 shrink-0">
            {selectedPreset.distanceLightYears ? (
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                Distanza: {selectedPreset.distanceLightYears.toLocaleString('it-IT')} a.l.
              </span>
            ) : null}
            {selectedPreset.constellation && (
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-amber-300">
                {selectedPreset.constellation}
              </span>
            )}
          </div>
        </section>
      </main>

      {/* Clean Scientific Footer */}
      <footer className="border-t border-slate-800/80 bg-[#03060c] py-6 px-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="text-slate-300 font-semibold">Singularity Lab</span> · Laboratorio Interattivo di Fisica Relativistica
            <div className="text-[11px] text-slate-400 mt-0.5">
              Costanti fisiche CODATA 2022 · Metrica di Schwarzschild (1916) · Metrica di Kerr (1963) · Teorema dell'Area di Hawking (1971)
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>G = 6.67430 × 10⁻¹¹ m³·kg⁻¹·s⁻²</span>
            <span>·</span>
            <span>c = 299,792,458 m/s</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
