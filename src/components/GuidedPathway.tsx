/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MathView } from './MathView';
import { calculateBlackHoleProperties, formatScientific, M_SOLAR } from '../utils/physicsConstants';
import {
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Orbit,
  Compass,
  Activity,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface GuidedPathwayProps {
  massSolar: number;
  spin: number;
  presetName: string;
  onApplySettings: (massSolar: number, spin: number) => void;
  onNavigateTab: (tabId: string) => void;
}

interface PathwayStep {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  icon: any;
  formula: string;
  conceptSummary: string;
  deepExplanation: string;
  interactiveScenario: {
    prompt: string;
    actionLabel: string;
    targetMass: number;
    targetSpin: number;
    targetTab: string;
    explanation: string;
  };
  keyTakeaways: string[];
}

export const GuidedPathway: React.FC<GuidedPathwayProps> = ({
  massSolar,
  spin,
  presetName,
  onApplySettings,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({ 0: true });
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});

  const currentMetric = calculateBlackHoleProperties(massSolar * M_SOLAR, spin);

  const steps: PathwayStep[] = [
    {
      id: 0,
      title: 'Massa e Orizzonte degli Eventi',
      subtitle: 'La massa determina la scala metrica assoluta dello spaziotempo',
      category: 'Geometria Relativistica',
      icon: Activity,
      formula: 'r_s = \\frac{2GM}{c^2} = (2.953\\,\\text{km}) \\times \\left(\\frac{M}{M_\\odot}\\right)',
      conceptSummary:
        'In relatività generale, la massa non genera una forza a distanza newtoniana, ma curva la geometria quadridimensionale. Il raggio di Schwarzschild definisce il confine causale oltre il quale la velocità di fuga supera la luce.',
      deepExplanation:
        'A differenza di una stella ordinaria la cui densità determina la dimensione, un buco nero non ha una superficie materiale. Qualsiasi massa concentrata al di sotto del proprio raggio rs genera un collasso gravitazionale inarrestabile. La relazione è strettamente lineare: raddoppiare la massa raddoppia esattamente il raggio dell\'orizzonte.',
      interactiveScenario: {
        prompt: 'Confronta la scala dimensionale: passa da un buco nero stellare da 20 masse solari al gigante Sagittarius A* (4.3 milioni di masse solari).',
        actionLabel: 'Imposta Sagittarius A* (4.3 × 10⁶ M_☉)',
        targetMass: 4.297e6,
        targetSpin: 0.90,
        targetTab: 'simulator3d',
        explanation: 'Il raggio passa da 59 km (la dimensione di una città) a 12.7 milioni di chilometri (metà dell\'orbita di Mercurio)!',
      },
      keyTakeaways: [
        'Ogni massa ha un raggio di Schwarzschild associato: per la Terra è di appena 8.87 mm, per il Sole è di circa 2.95 km.',
        'Nulla può arrestare la caduta verso il centro una volta superato rs: la coordinata temporale e quella spaziale invertono i ruoli metrici.',
      ],
    },
    {
      id: 1,
      title: 'La Traiettoria della Luce e la Sfera Fotonica',
      subtitle: 'Perché la luce può orbitare attorno al buco nero a r = 1.5 r_s',
      category: 'Ottica Relativistica',
      icon: Compass,
      formula: 'r_{\\text{ph}} = \\frac{3GM}{c^2} = 1.5\\,r_s, \\qquad b_c = 3\\sqrt{3}M \\approx 2.6\\,r_s',
      conceptSummary:
        'La curvatura dello spaziotempo deflette i raggi di luce (fotoni). A una distanza precisa pari a 1.5 volte il raggio dell\'orizzonte, la curvatura è così intensa che i fotoni possono compiere un\'orbita circolare chiusa.',
      deepExplanation:
        'L\'orbita dei fotoni a r = 3M è instabile: corrisponde al massimo del potenziale efficace per geodetiche nulle. Un fotone che sfiora questa cresta con parametro d\'impatto b < bc cade dentro; se b > bc viene deflesso via. Questo parametro critico bc = 3√3 M spiega perché l\'ombra osservata dall\'EHT misura circa 2.6 volte il raggio dell\'orizzonte reale.',
      interactiveScenario: {
        prompt: 'Osserva nel simulatore 2D come i fotoni con parametro b < 5.20 M precipitano dentro la singolarità, mentre a b > 5.20 M vengono deflessi.',
        actionLabel: 'Apri Simulatore Geodetiche e Ombra',
        targetMass: massSolar,
        targetSpin: spin,
        targetTab: 'geodesics',
        explanation: 'L\'ombra ottica è la sezione d\'urto di cattura dei fotoni provenienti dallo sfondo cosmico.',
      },
      keyTakeaways: [
        'I fotoni sulla sfera fotonica possono fare orbite multiple, generando gli anelli di Einstein concentrici.',
        'L\'ombra ottica è sempre significativamente più grande dell\'orizzonte fisico.',
      ],
    },
    {
      id: 2,
      title: 'Il Limite della Materia: Il Raggio ISCO',
      subtitle: 'La fine delle orbite circolari stabili per particelle con massa',
      category: 'Meccanica Orbitale',
      icon: Orbit,
      formula: 'r_{\\text{isco}} = \\frac{6GM}{c^2} = 3\\,r_s \\quad (\\text{Schwarzschild statico})',
      conceptSummary:
        'Mentre nella fisica classica un pianeta può orbitare a qualsiasi distanza con velocità sufficiente, nella relatività generale non esistono orbite circolari stabili per materia a r < 6M.',
      deepExplanation:
        'Nel potenziale efficace per particelle con massa compare un termine attrattivo cubico relativistico (-2ML²/r³). All\'interno di r_isco = 6M, la forza centrifuga perde la capacità di controbilanciare la gravità. Il gas del disco di accrescimento che raggiunge l\'ISCO si stacca e precipita in tuffo libero (plunge) quasi istantaneamente verso l\'orizzonte.',
      interactiveScenario: {
        prompt: 'Attiva nel simulatore di curvatura la particella di test per osservare l\'orbita a rosetta e il collasso spontaneo a spirale dentro ISCO.',
        actionLabel: 'Sperimenta Precessione e Tuffo ISCO',
        targetMass: massSolar,
        targetSpin: spin,
        targetTab: 'curvature',
        explanation: 'L\'ISCO determina il bordo interno scuro del disco di accrescimento di plasma!',
      },
      keyTakeaways: [
        'Il disco di accrescimento termina bruscamente a r = 3 r_s (per buco nero non rotante).',
        'L\'efficienza di conversione di massa a riposo in radiazione raggiunge il 5.7% (Schwarzschild) e fino al 42% (Kerr massimale).',
      ],
    },
    {
      id: 3,
      title: 'Lo Spaziotempo in Rotazione: Spin ed Ergosfera',
      subtitle: 'La metrica di Kerr e il trascinamento vorticoso dello spaziotempo',
      category: 'Buchi Neri Rotanti',
      icon: Flame,
      formula: 'r_E(\\theta) = M + \\sqrt{M^2 - a^2\\cos^2\\theta}, \\qquad r_+ = M + \\sqrt{M^2 - a^2}',
      conceptSummary:
        'Quando una stella collassa ruotando, conserva il momento angolare formando un buco nero di Kerr. Lo spin trascina lo spaziotempo stesso (effetto Lense-Thirring) creando una regione esterna detta Ergosfera.',
      deepExplanation:
        'All\'interno dell\'ergosfera, la metrica impone che nessun corpo possa rimanere in quiete rispetto all\'infinito: tutti gli oggetti sono obbligati a ruotare nello stesso verso del buco nero. Tuttavia, poiché l\'ergosfera si trova FUORI dall\'orizzonte degli eventi, una navicella spaziale o una particella può entrarvi ed uscirne con un eccesso di energia cinetica estrattiva (Processo di Penrose).',
      interactiveScenario: {
        prompt: 'Aumenta lo spin a = 0.97 per osservare la comparsa dell\'ergosfera oblata e l\'innesco dei getti relativistici polari.',
        actionLabel: 'Imposta Cygnus X-1 ad Alto Spin (a* = 0.97)',
        targetMass: 21.2,
        targetSpin: 0.97,
        targetTab: 'simulator3d',
        explanation: 'L\'ergosfera all\'equatore misura esattamente rs, mentre ai poli coincide con l\'orizzonte degli eventi!',
      },
      keyTakeaways: [
        'Lo spin massimo consentito dalla relatività generale è a* = 1.0 (limite di Thorne astrofisico ~0.998).',
        'Il processo di Penrose permette di estrarre fino al 29.3% dell\'energia di massa a riposo dal buco nero.',
      ],
    },
    {
      id: 4,
      title: 'Dilatazione Temporale Gravitazionale e Redshift',
      subtitle: 'Come il tempo scorre per chi cade e per chi osserva da lontano',
      category: 'Relatività del Tempo',
      icon: Clock,
      formula: 'd\\tau = dt \\sqrt{1 - \\frac{r_s}{r}}, \\qquad 1 + z = \\frac{1}{\\sqrt{1 - \\frac{r_s}{r}}}',
      conceptSummary:
        'Il tempo scorre più lentamente vicino a un campo gravitazionale. Sull\'orizzonte, il tempo coordinato di un osservatore lontano sembra fermarsi, ma per chi cade il tempo proprio trascorre normalmente.',
      deepExplanation:
        'Questo non significa che un astronauta rimanga congelato all\'infinito davanti ai nostri occhi: i fotoni emessi subiscono un redshift gravitazionale infinito (z → ∞). La lunghezza d\'onda si allunga progressivamente nello spettro infrarosso e radio, e la luminosità cala esponenzialmente in frazioni di secondo (gravitational dimming), facendo svanire l\'oggetto nel buio cosmico.',
      interactiveScenario: {
        prompt: 'Verifica con gli orologi gemelli sincronizzati il ritardo temporale e lo shift cromatico della luce emessa dalla sonda.',
        actionLabel: 'Apri Calcolatore di Dilatazione Temporale',
        targetMass: massSolar,
        targetSpin: spin,
        targetTab: 'timedilation',
        explanation: 'Per buchi neri supermassicci, l\'astronauta attraversa l\'orizzonte senza subire spaghettificazione fatale!',
      },
      keyTakeaways: [
        'L\'orizzonte non è una barriera solida: l\'attraversamento locale avviene in un tempo proprio finito e privo di singolarità.',
        'La spaghettificazione è letale per buchi neri stellari ma trascurabile per quelli supermassicci.',
      ],
    },
    {
      id: 5,
      title: 'Evaporazione Quantistica e Radiazione di Hawking',
      subtitle: 'Il destino ultimo dei buchi neri e il ponte quantistico',
      category: 'Termodinamica Quantistica',
      icon: Sparkles,
      formula: 'T_H = \\frac{\\hbar c^3}{8\\pi G M k_B}, \\qquad S_{\\text{BH}} = \\frac{k_B A}{4\\ell_P^2}, \\qquad t_{\\text{evap}} \\propto M^3',
      conceptSummary:
        'Applicando la teoria quantistica dei campi allo spaziotempo curvo, Stephen Hawking dimostrò che i buchi neri non sono eterni: emettono radiazione termica di corpo nero e perdono massa.',
      deepExplanation:
        'La temperatura di Hawking è inversamente proporzionale alla massa: buchi neri microscopici sono incandescenti ed evaporano in una frazione di secondo, mentre buchi neri stellari sono più freddi del fondo cosmico (T_H < 2.72 K) e accumulano temporaneamente massa. Nei microsecondi finali, un buco nero esplode in una deflagrazione di raggi gamma.',
      interactiveScenario: {
        prompt: 'Esplora sul calcolatore logaritmico l\'evaporazione di un micro buco nero primordiale da 10¹¹ kg rispetto a uno stellare.',
        actionLabel: 'Apri Laboratorio Termodinamico di Hawking',
        targetMass: massSolar,
        targetSpin: spin,
        targetTab: 'hawking',
        explanation: 'Un buco nero stellare impiega oltre 10⁶⁷ anni a evaporare, superando di gran lunga l\'età dell\'universo!',
      },
      keyTakeaways: [
        'L\'entropia di un buco nero è proporzionale all\'area dell\'orizzonte (Principio Olografico).',
        'L\'evaporazione accelera drammaticamente man mano che la massa diminuisce.',
      ],
    },
  ];

  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setCompletedSteps((prev) => ({ ...prev, [nextIdx]: true }));
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Educational Quiz Questions
  const quizQuestions = [
    {
      id: 0,
      question: 'Se la massa di un buco nero raddoppia, cosa accade al suo raggio di Schwarzschild rs?',
      options: [
        'Resta invariato',
        'Raddoppia esattamente (scala linearmente)',
        'Quadruplica (scala col quadrato)',
        'Dimezza per la densità maggiore',
      ],
      correctIndex: 1,
      explanation: 'Poiché rs = 2GM/c², il raggio è direttamente proporzionale alla massa M.',
    },
    {
      id: 1,
      question: 'Cos\'è l\'Ergosfera in un buco nero di Kerr rotante?',
      options: [
        'Il punto di singolarità centrale',
        'La regione dove la materia smette di emettere luce',
        'La regione esterna all\'orizzonte dove lo spaziotempo è trascinato e nessun corpo può stare fermo',
        'La zona in cui i fotoni fuggono a velocità superiore a c',
      ],
      correctIndex: 2,
      explanation: 'Nell\'ergosfera, il frame-dragging impone a qualsiasi corpo di ruotare concordemente col buco nero.',
    },
    {
      id: 2,
      question: 'Perché l\'ombra ottica vista dai telescopi EHT è più grande dell\'orizzonte degli eventi?',
      options: [
        'A causa di un difetto ottico delle lenti dei radiotelescopi',
        'Perché i fotoni con parametro d\'impatto fino a bc = 3√3 M ≈ 2.6 rs vengono catturati',
        'Perché la luce viene respinta dalla pressione di radiazione',
        'Perché l\'orizzonte pulsa continuamente nel tempo',
      ],
      correctIndex: 1,
      explanation: 'Tutti i raggi di luce con parametro d\'impatto b < 3√3 M cadono nella sfera fotonica e vengono assorbiti.',
    },
  ];

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-6">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            Percorso Didattico Guidato: Dalla Massa allo Spaziotempo Curvo
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            6 passaggi didattici interattivi per padroneggiare la fisica e la matematica dei buchi neri
          </p>
        </div>

        {/* Target Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Target attivo:</span>
          <span className="text-amber-300 font-semibold">{presetName}</span>
          <span className="text-slate-400">({formatScientific(massSolar, 1)} M_☉, a* = {spin.toFixed(2)})</span>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((st, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isCompleted = completedSteps[idx];
          const IconComp = st.icon;

          return (
            <button
              key={st.id}
              onClick={() => {
                setCurrentStepIndex(idx);
                setCompletedSteps((prev) => ({ ...prev, [idx]: true }));
              }}
              className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                  : isCompleted
                  ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-slate-950/30 border-slate-900 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-400">PASSO {idx + 1}</span>
                <IconComp className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400' : 'text-slate-400'}`} />
              </div>
              <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                {st.title.split(':')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Active Step Stage Card */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 sm:p-6 flex flex-col gap-4">
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Passo {currentStep.id + 1} di {steps.length}</span>
              <span aria-hidden="true">·</span>
              <span>{currentStep.category}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {currentStep.title}
            </h2>
            <p className="text-sm text-slate-300 mt-0.5">
              {currentStep.subtitle}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0 self-start">
            <currentStep.icon className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Formula Display Box */}
        <div className="bg-[#03060c] border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="overflow-x-auto">
            <MathView math={currentStep.formula} display={true} className="text-base text-amber-300" />
          </div>
          <div className="text-[11px] font-mono text-slate-400 sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
            <div>Valore per {presetName}:</div>
            <div className="text-slate-200 font-semibold mt-0.5">
              r_s = {(currentMetric.r_s / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })} km
            </div>
            <div className="text-cyan-300 font-semibold">
              r_+ = {(currentMetric.r_plus / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })} km
            </div>
          </div>
        </div>

        {/* Conceptual Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-4">
            <strong className="text-white block mb-1.5 font-semibold">Principio Fondamentale:</strong>
            <p>{currentStep.conceptSummary}</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-4">
            <strong className="text-amber-400 block mb-1.5 font-semibold">Approfondimento Fisico:</strong>
            <p>{currentStep.deepExplanation}</p>
          </div>
        </div>

        {/* Interactive Scenario Action Card */}
        <div className="bg-gradient-to-r from-amber-950/20 to-sky-950/20 border border-amber-500/30 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-amber-300 font-mono font-semibold">
              Sperimentazione Interattiva Consigliata
            </div>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              {currentStep.interactiveScenario.prompt}
            </p>
            <div className="text-[11px] text-slate-400 italic">
              {currentStep.interactiveScenario.explanation}
            </div>
          </div>

          <button
            onClick={() => {
              onApplySettings(
                currentStep.interactiveScenario.targetMass,
                currentStep.interactiveScenario.targetSpin
              );
              onNavigateTab(currentStep.interactiveScenario.targetTab);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>{currentStep.interactiveScenario.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Key Takeaways Bullet List */}
        <div className="border-t border-slate-800/80 pt-3 flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Punti Chiave da Ricordare:</span>
          {currentStep.keyTakeaways.map((point, pIdx) => (
            <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Stepper Navigation Footer Buttons */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-500'
                : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Passo Precedente
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {currentStepIndex + 1} / {steps.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentStepIndex === steps.length - 1
                ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
            }`}
          >
            Passo Successivo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Comprehension Check (Quiz Section) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            Verifica delle Competenze Relativistiche
          </h4>
          <span className="text-xs text-slate-400 font-mono">3 Domande Rapide</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quizQuestions.map((q) => {
            const userAnswer = quizAnswers[q.id];
            const isAnswered = userAnswer !== undefined && userAnswer !== null;
            const isCorrect = isAnswered && userAnswer === q.correctIndex;

            return (
              <div
                key={q.id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200 mb-2 leading-snug">
                    {q.question}
                  </div>

                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = userAnswer === oIdx;
                      let btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800';
                      if (isAnswered) {
                        if (oIdx === q.correctIndex) {
                          btnStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-semibold';
                        } else if (isOptionSelected) {
                          btnStyle = 'bg-rose-950/40 border-rose-500/50 text-rose-300';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                          }}
                          className={`w-full text-left p-2 rounded-lg border text-[11px] transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isAnswered && (
                  <div
                    className={`p-2 rounded-lg text-[11px] border leading-relaxed ${
                      isCorrect
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                    }`}
                  >
                    {isCorrect ? '✓ Risposta Corretta! ' : 'ℹ Nota: '}
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
