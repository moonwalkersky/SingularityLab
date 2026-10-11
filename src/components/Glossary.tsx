/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GLOSSARY_TERMS, GlossaryItem } from '../data/glossaryData';
import { MathView } from './MathView';
import {
  BookOpen,
  Search,
  ShieldAlert,
  Compass,
  Eye,
  Activity,
  RotateCcw,
  Disc,
  Flame,
  Sparkles,
  Clock,
  Layers,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info
} from 'lucide-react';

interface GlossaryProps {
  onSelectTerm?: (termId: string) => void;
}

export const Glossary: React.FC<GlossaryProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => {
    return ['Tutti', 'Geometria dello Spaziotempo', 'Ottica & Lensing', 'Meccanica & Orbite', 'Termodinamica Quantistica'];
  }, []);

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      const matchesCategory = selectedCategory === 'Tutti' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.shortDefinition.toLowerCase().includes(q) ||
        item.fullExplanation.toLowerCase().includes(q) ||
        item.relatedTerms.some((rt) => rt.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4' };
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert {...props} className="w-4 h-4 text-rose-400" />;
      case 'Compass':
        return <Compass {...props} className="w-4 h-4 text-cyan-400" />;
      case 'Eye':
        return <Eye {...props} className="w-4 h-4 text-amber-300" />;
      case 'Activity':
        return <Activity {...props} className="w-4 h-4 text-sky-400" />;
      case 'RotateCcw':
        return <RotateCcw {...props} className="w-4 h-4 text-cyan-300" />;
      case 'Disc':
        return <Disc {...props} className="w-4 h-4 text-indigo-400" />;
      case 'Flame':
        return <Flame {...props} className="w-4 h-4 text-orange-400" />;
      case 'Sparkles':
        return <Sparkles {...props} className="w-4 h-4 text-amber-400" />;
      case 'Clock':
        return <Clock {...props} className="w-4 h-4 text-emerald-400" />;
      case 'Layers':
        return <Layers {...props} className="w-4 h-4 text-rose-300" />;
      case 'AlertTriangle':
        return <AlertTriangle {...props} className="w-4 h-4 text-amber-500" />;
      case 'Zap':
        return <Zap {...props} className="w-4 h-4 text-amber-300" />;
      default:
        return <Info {...props} className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-6">
      {/* Glossary Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Glossario dei Concetti Chiave di Astrofisica Relativistica
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Definizioni rigorose, formule matematiche e significato fisico dei fenomeni simulati
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>{filteredTerms.length} di {GLOSSARY_TERMS.length} termini</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca termine, formula o concetto (es: Ergosfera, Kerr, ISCO, Hawking)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTerms.map((item) => {
          const isExpanded = expandedItems[item.id] !== false;

          return (
            <div
              key={item.id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700/80 transition-all"
            >
              {/* Top: Icon + Term title + Category */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {getIcon(item.iconName)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {item.term}
                      </h4>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title={isExpanded ? 'Riduci spiegazione' : 'Espandi spiegazione completa'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Short definition */}
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {item.shortDefinition}
                </p>

                {/* Mathematical Formula if present */}
                {item.formula && (
                  <div className="my-2.5 bg-[#03060c] border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs text-amber-300 overflow-x-auto">
                    <MathView math={item.formula} display={true} />
                  </div>
                )}

                {/* Detailed explanation (expandable) */}
                {isExpanded && (
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                    <p>{item.fullExplanation}</p>

                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-2.5 text-[11px] text-slate-300">
                      <strong className="text-amber-400 block mb-0.5">Rilevanza Fisica & Osservativa:</strong>
                      {item.physicalSignificance}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom: Related Terms */}
              {item.relatedTerms && item.relatedTerms.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                  <span className="font-mono text-slate-400">Voci correlate:</span>
                  {item.relatedTerms.map((relTerm, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(relTerm)}
                      className="text-amber-400/90 hover:text-amber-300 hover:underline transition-colors"
                    >
                      {relTerm}
                      {idx < item.relatedTerms.length - 1 && <span className="text-slate-600 ml-1">·</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredTerms.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
            Nessun termine trovato per la ricerca "{searchQuery}". Prova con "Kerr", "Ergosfera", o "ISCO".
          </div>
        )}
      </div>
    </div>
  );
};
