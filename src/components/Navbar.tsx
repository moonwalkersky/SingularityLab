/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExplorePreset: (presetId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onExplorePreset }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-[#04060b]/95 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('simulator3d');
        }}
        className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
      >
        Singularity Lab
      </a>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('simulator3d')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'simulator3d' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Simulatore 3D
        </button>

        <button
          onClick={() => setActiveTab('pathway')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'pathway' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Percorso Guidato
        </button>

        <button
          onClick={() => setActiveTab('geodesics')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'geodesics' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Geodetiche
        </button>

        <button
          onClick={() => setActiveTab('proofs')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'proofs' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Dimostrazioni
        </button>

        <button
          onClick={() => setActiveTab('glossary')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'glossary' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Glossario
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            setActiveTab('simulator3d');
            onExplorePreset('sgr-a');
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          Sagittarius A*
        </button>
      </div>
    </header>
  );
};
