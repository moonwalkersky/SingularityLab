/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MATHEMATICAL_PROOFS, MathProof } from '../data/proofsData';
import { MathView } from './MathView';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, History, Lightbulb, Sparkles } from 'lucide-react';

export const MathematicalProofs: React.FC = () => {
  const [selectedProofId, setSelectedProofId] = useState<string>(MATHEMATICAL_PROOFS[0].id);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  const currentProof = MATHEMATICAL_PROOFS.find((p) => p.id === selectedProofId) || MATHEMATICAL_PROOFS[0];

  const toggleStep = (stepNum: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<number, boolean> = {};
    currentProof.steps.forEach((s) => {
      allExpanded[s.stepNumber] = true;
    });
    setExpandedSteps(allExpanded);
  };

  const collapseAll = () => {
    setExpandedSteps({});
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-6">
      {/* Proof Selector Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Trattato Matematico & Dimostrazioni Relativistiche
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            6 Dimostrazioni Complete
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MATHEMATICAL_PROOFS.map((proof) => {
            const isSelected = proof.id === currentProof.id;
            return (
              <button
                key={proof.id}
                onClick={() => {
                  setSelectedProofId(proof.id);
                  expandAll();
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all border text-left flex flex-col gap-0.5 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  {proof.category}
                </span>
                <span className="font-semibold text-slate-200">
                  {proof.title.split('&')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Proof Overview Header Card */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400/90 block mb-1">
              {currentProof.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentProof.title}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              {currentProof.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            >
              Espandi tutto
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            >
              Comprimi
            </button>
          </div>
        </div>

        {/* Historical Context Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex items-start gap-2.5">
          <History className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-cyan-300">Contesto Storico:</strong> {currentProof.historicalContext}
          </p>
        </div>

        {/* Abstract / Summary */}
        <p className="text-xs text-slate-400 leading-relaxed">
          {currentProof.summary}
        </p>
      </div>

      {/* Step by Step Derivation */}
      <div className="flex flex-col gap-4">
        {currentProof.steps.map((step) => {
          const isExpanded = expandedSteps[step.stepNumber] !== false;

          return (
            <div
              key={step.stepNumber}
              className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden transition-all"
            >
              {/* Step Header Toggle */}
              <button
                onClick={() => toggleStep(step.stepNumber)}
                className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {step.stepNumber}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {step.heading}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Step Content */}
              {isExpanded && (
                <div className="p-4 sm:p-5 flex flex-col gap-3">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Mathematical Formula Box */}
                  {step.formula && (
                    <div className="bg-[#03060c] border border-amber-500/20 rounded-lg px-4 py-3 my-1">
                      <MathView math={step.formula} display={true} className="text-sm sm:text-base text-amber-300" />
                    </div>
                  )}

                  {/* Derivation Sub-notes */}
                  {step.derivationNotes && step.derivationNotes.length > 0 && (
                    <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-3 space-y-2 mt-1">
                      {step.derivationNotes.map((note, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-amber-400 font-mono mt-0.5">▸</span>
                          <span className="leading-relaxed">
                            {/* Check if note contains KaTeX formulas */}
                            {note.includes('\\') || note.includes('^') || note.includes('_') ? (
                              <MathView math={note} />
                            ) : (
                              note
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Conclusions Card */}
      <div className="bg-gradient-to-r from-amber-950/20 to-slate-950/40 border border-amber-500/30 rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2 text-amber-300 font-semibold text-sm">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          Conclusioni Fisiche Fondamentali
        </div>
        <div className="space-y-2">
          {currentProof.conclusions.map((conc, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
              <span className="text-amber-400 font-mono mt-0.5">•</span>
              <span className="leading-relaxed">{conc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
