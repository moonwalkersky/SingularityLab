/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  FileJson,
  FileSpreadsheet,
  Copy,
  Check,
  Database,
  Clock,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  generateTimeDilationData,
  generateGeodesicData,
  generateMetricSnapshot,
  objectsToCsv,
  downloadFile
} from '../utils/exportSimulationData';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  massKg: number;
  spin: number;
  presetName: string;
}

type DatasetType = 'timedilation' | 'geodesics' | 'metric';

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  massKg,
  spin,
  presetName,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetType>('timedilation');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [copied, setCopied] = useState(false);

  // Generate data based on active selection
  const rawData = useMemo(() => {
    switch (selectedDataset) {
      case 'timedilation':
        return generateTimeDilationData(massKg);
      case 'geodesics':
        return generateGeodesicData(massKg);
      case 'metric':
        return generateMetricSnapshot(massKg, spin, presetName);
    }
  }, [selectedDataset, massKg, spin, presetName]);

  // Serialized content for preview and download
  const formattedContent = useMemo(() => {
    if (format === 'json') {
      return JSON.stringify(rawData, null, 2);
    } else {
      // CSV format
      if (Array.isArray(rawData)) {
        return objectsToCsv(rawData);
      } else {
        // Flat object (metric snapshot) -> convert key/value table
        const flatRows: Record<string, any>[] = [];
        const flatten = (obj: Record<string, any>, prefix = '') => {
          for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (typeof val === 'object' && val !== null) {
              flatten(val, `${prefix}${key}_`);
            } else {
              flatRows.push({ property: `${prefix}${key}`, value: val });
            }
          }
        };
        flatten(rawData);
        return objectsToCsv(flatRows);
      }
    }
  }, [rawData, format]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const filenamePrefix = `${presetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${selectedDataset}`;
    const filename = `${filenamePrefix}.${format}`;
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    downloadFile(formattedContent, filename, mimeType);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-3xl bg-[#070b14] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Esporta Dati Scientifici della Simulazione
              </h3>
              <p className="text-xs text-slate-400">
                Download dei dataset numerici generati dal modello relativistico per {presetName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Dataset Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
            <button
              onClick={() => setSelectedDataset('timedilation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedDataset === 'timedilation'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Dilatazione & Marea
            </button>

            <button
              onClick={() => setSelectedDataset('geodesics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedDataset === 'geodesics'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Geodetiche & Deflessione
            </button>

            <button
              onClick={() => setSelectedDataset('metric')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedDataset === 'metric'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Snapshot Metrica
            </button>
          </div>

          {/* Format Toggle (CSV vs JSON) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setFormat('csv')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                format === 'csv'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                format === 'json'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              JSON
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Anteprima dati generati ({format.toUpperCase()}):</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copiato negli appunti!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copia contenuto
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-[#03060c] border border-slate-800/80 rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed max-h-[360px] scrollbar-thin">
            <pre className="whitespace-pre-wrap">{formattedContent}</pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 hidden sm:block">
            Formato conforme per analisi in Python (Pandas/NumPy), MATLAB o fogli di calcolo.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              Annulla
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-md"
            >
              <Download className="w-4 h-4" />
              Scarica {format.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
