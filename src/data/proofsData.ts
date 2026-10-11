/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MathProof {
  id: string;
  title: string;
  subtitle: string;
  category: 'Relatività Generale' | 'Ottica Relativistica' | 'Meccanica Orbitale' | 'Fisica Quantistica';
  historicalContext: string;
  summary: string;
  steps: {
    stepNumber: number;
    heading: string;
    description: string;
    formula?: string;
    derivationNotes?: string[];
  }[];
  conclusions: string[];
}

export const MATHEMATICAL_PROOFS: MathProof[] = [
  {
    id: 'schwarzschild-metric',
    title: 'Metrica di Schwarzschild & Raggio dell\'Orizzonte',
    subtitle: 'Soluzione esatta delle equazioni di campo di Einstein nel vuoto statico a simmetria sferica',
    category: 'Relatività Generale',
    historicalContext: 'Karl Schwarzschild ricavò questa prima soluzione esatta alla teoria di Einstein nel 1916 sul fronte russo della Prima Guerra Mondiale, pochi mesi dopo la pubblicazione della Relatività Generale.',
    summary: 'Dimostrazione di come l\'annullamento del tensore di Ricci nel vuoto (R_{μν} = 0) imponga la metrica di Schwarzschild e definisca il raggio critico r_s = 2GM/c^2.',
    steps: [
      {
        stepNumber: 1,
        heading: 'Formulazione dell\'Ansatz Spaziotemporale Statico',
        description: 'Assumiamo uno spaziotempo 4D statico e a simmetria sferica. L\'intervallo invariante ds^2 si scrive in coordinate sferiche (t, r, θ, φ) con due funzioni incognite ν(r) e λ(r):',
        formula: 'ds^2 = -e^{2\\nu(r)} c^2 dt^2 + e^{2\\lambda(r)} dr^2 + r^2 (d\\theta^2 + \\sin^2\\theta d\\phi^2)',
        derivationNotes: [
          'Staticità: I coefficienti metrici non dipendono da t e non vi sono termini d’incrocio dt·dr.',
          'Simmetria sferica: La parte angolare è proporzionale all\'elemento di linea della sfera bidimensionale dΩ^2 = dθ^2 + sin^2θ dφ^2.'
        ]
      },
      {
        stepNumber: 2,
        heading: 'Equazioni di Campo nel Vuoto (Tensore di Ricci)',
        description: 'Nello spazio circostante una massa concentrata, il tensore energia-impulso è nullo (T_{μν} = 0). Le equazioni di Einstein si riducono a:',
        formula: 'R_{\\mu\\nu} = 0',
        derivationNotes: [
          'Calcolando i simboli di Christoffel Γ^α_{μν} associati alla metrica, le componenti non nulle del tensore di Ricci risultano:',
          'R_{00} = e^{2(\\nu-\\lambda)} \\left[ -\\nu\'\' - \\nu\'^2 + \\nu\'\\lambda\' - \\frac{2\\nu\'}{r} \\right] = 0',
          'R_{11} = \\nu\'\' + \\nu\'^2 - \\nu\'\\lambda\' - \\frac{2\\lambda\'}{r} = 0',
          'R_{22} = e^{-2\\lambda} \\left[ 1 + r(\\lambda\' - \\nu\') \\right] - 1 = 0'
        ]
      },
      {
        stepNumber: 3,
        heading: 'Condizione di Collegamento e Relazione ν(r) = -λ(r)',
        description: 'Sommando le combinazioni opportune e dividendo per e^{2(ν-λ)}, otteniamo la relazione fondamentale tra i gradienti metrici:',
        formula: 'R_{00} e^{-2(\\nu-\\lambda)} + R_{11} = -\\frac{2}{r}(\\nu\' + \\lambda\') = 0 \\implies \\nu\'(r) = -\\lambda\'(r)',
        derivationNotes: [
          'Integrando rispetto a r: ν(r) + λ(r) = costante.',
          'Poiché lo spaziotempo deve essere asintoticamente piatto per r → ∞ (metrica di Minkowski), imponiamo ν(∞) = 0 e λ(∞) = 0, da cui segue esattamente: e^{2ν} = e^{-2λ}.'
        ]
      },
      {
        stepNumber: 4,
        heading: 'Integrazione della Componente Angolare R_{22} = 0',
        description: 'Sostituendo λ\' = -ν\' nell\'equazione per R_{22}:',
        formula: 'e^{-2\\lambda} (1 - 2r \\lambda\') = 1 \\iff \\frac{d}{dr}\\left[ r e^{-2\\lambda} \\right] = 1',
        derivationNotes: [
          'Integrando ambo i membri rispetto a r: r e^{-2λ} = r - C, dove C è una costante di integrazione da determinare fisicamente.',
          'Quindi: e^{-2λ} = 1 - \\frac{C}{r} \\quad \\text{e} \\quad e^{2ν} = 1 - \\frac{C}{r}.'
        ]
      },
      {
        stepNumber: 5,
        heading: 'Limite Newtoniano e Determinazione della Costante C',
        description: 'A grande distanza (r ≫ r_s), il potenziale relativistico deve raccordarsi con il potenziale newtoniano classico Φ(r) = -GM/r. In relatività generale, g_{00} = -(1 + 2Φ/c^2):',
        formula: 'g_{00} = -\\left(1 - \\frac{C}{r}\\right) \\approx -\\left(1 - \\frac{2GM}{c^2 r}\\right) \\implies C = \\frac{2GM}{c^2} = r_s',
        derivationNotes: [
          'La costante C è esattamente il Raggio di Schwarzschild r_s.',
          'La metrica completa risultante prende la forma iconica:'
        ]
      },
      {
        stepNumber: 6,
        heading: 'La Metrica di Schwarzschild Definitiva',
        description: 'La soluzione geometrica chiusa dello spaziotempo attorno a una massa non rotante:',
        formula: 'ds^2 = -\\left(1 - \\frac{2GM}{c^2 r}\\right) c^2 dt^2 + \\left(1 - \\frac{2GM}{c^2 r}\\right)^{-1} dr^2 + r^2 d\\Omega^2',
        derivationNotes: [
          'A r = r_s = 2GM/c^2, il termine g_{00} si annulla e g_{rr} diverge. Questo definisce la superficie dell\'Orizzonte degli Eventi.',
          'Sebbene appaia una divergenza in coordinate di Schwarzschild, il tensore invariante di curvatura (invariante di Kretschmann) K = R^{αβγδ} R_{αβγδ} = \\frac{48 G^2 M^2}{c^4 r^6} è finito su r = r_s: la singolarità dell\'orizzonte è solo di coordinate, mentre la vera singolarità fisica risiede unicamente a r = 0!'
        ]
      }
    ],
    conclusions: [
      'Il raggio di Schwarzschild r_s scala linearmente con la massa M: r_s = (2.95 km) × (M / M_☉).',
      'Nulla può fuggire da r < r_s poiché la coordinata temporale e quella spaziale scambiano di segno: cadere verso il centro diventa un destino temporale ineluttabile, non un moto spaziale.'
    ]
  },
  {
    id: 'photon-sphere',
    title: 'Sfera dei Fotoni & Parametro di Impatto Critico',
    subtitle: 'Geodetiche nulle e la fisica dell\'ombra del buco nero',
    category: 'Ottica Relativistica',
    historicalContext: 'Nel 1919 l\'eclissi solare osservata da Arthur Eddington confermò la deflessione di 1.75 arcosecondi della luce. Attorno a un buco nero, la deflessione diventa infinita alla sfera dei fotoni, creando l\'anello brillante visto da EHT.',
    summary: 'Dimostrazione dell\'esistenza di un\'orbita circolare instabile per la luce a r = 3GM/c^2 = 1.5 r_s e derivazione del parametro d\'impatto b_c = 3√3 GM/c^2.',
    steps: [
      {
        stepNumber: 1,
        heading: 'Equazione Geodetica per Fotoni (Geodetiche Nulle)',
        description: 'Per la luce, l\'intervallo proprio è identicamente nullo (ds^2 = 0). Considerando il moto sul piano equatoriale (θ = π/2, dθ = 0):',
        formula: '0 = -\\left(1 - \\frac{2M}{r}\\right) \\left(\\frac{dt}{d\\lambda}\\right)^2 + \\left(1 - \\frac{2M}{r}\\right)^{-1} \\left(\\frac{dr}{d\\lambda}\\right)^2 + r^2 \\left(\\frac{d\\phi}{d\\lambda}\\right)^2',
        derivationNotes: [
          'Poniamo unità geometrizzate G = c = 1 per chiarezza di notazione.',
          'λ è un parametro affine lungo la linea d\'universo del fotone.'
        ]
      },
      {
        stepNumber: 2,
        heading: 'Costanti del Moto: Energia E e Momento Angolare L',
        description: 'Grazie all\'invarianza per traslazioni temporali e rotazioni (vettori di Killing ∂_t e ∂_φ):',
        formula: 'E = \\left(1 - \\frac{2M}{r}\\right) \\frac{dt}{d\\lambda}, \\qquad L = r^2 \\frac{d\\phi}{d\\lambda}',
        derivationNotes: [
          'Definiamo il Parametro d\'Impatto b = L / E, che rappresenta la distanza asintotica del raggio di luce dal centro se proseguisse in linea retta.'
        ]
      },
      {
        stepNumber: 3,
        heading: 'Potenziale Efficace Radiale per la Luce',
        description: 'Sostituendo E ed L nell\'equazione geodetica, otteniamo l\'equazione radiale unidimensionale:',
        formula: '\\frac{1}{E^2} \\left(\\frac{dr}{d\\lambda}\\right)^2 + V_{\\text{eff}}(r) = \\frac{1}{b^2}, \\qquad \\text{con} \\quad V_{\\text{eff}}(r) = \\frac{1}{r^2}\\left(1 - \\frac{2M}{r}\\right)',
        derivationNotes: [
          'A differenza della gravitazione newtoniana pura (dove V ~ 1/r^2), appare il termine cubico -2M/r^3 di origine puramente relativistica!',
          'Questo termine crea una barriera di potenziale con un picco massimo.'
        ]
      },
      {
        stepNumber: 4,
        heading: 'Calcolo dell\'Estremo del Potenziale (Sfera dei Fotoni)',
        description: 'Un\'orbita circolare richiede che la derivata del potenziale si annulli (dV_{eff}/dr = 0):',
        formula: '\\frac{dV_{\\text{eff}}}{dr} = -\\frac{2}{r^3} + \\frac{6M}{r^4} = 0 \\implies r = 3M = \\frac{3GM}{c^2} = 1.5 r_s',
        derivationNotes: [
          'Calcolando la derivata seconda: d^2V_{eff}/dr^2|_{r=3M} = -2 / (81 M^4) < 0.',
          'Essendo la derivata seconda negativa, si tratta di un MASSIMO INSTABILE: un fotone leggermente perturbato verso l\'interno cade nel buco nero; perturbato verso l\'esterno scappa all\'infinito.'
        ]
      },
      {
        stepNumber: 5,
        heading: 'Parametro di Impatto Critico b_crit e Ombra del Buco Nero',
        description: 'Valutiamo il valore di b necessario a raggiungere la cresta del potenziale a r = 3M:',
        formula: '\\frac{1}{b_c^2} = V_{\\text{eff}}(3M) = \\frac{1}{(3M)^2}\\left(1 - \\frac{2M}{3M}\\right) = \\frac{1}{27 M^2} \\implies b_c = 3\\sqrt{3} M \\approx 5.196 M',
        derivationNotes: [
          'In coordinate fisiche: b_c = \\frac{3\\sqrt{3} GM}{c^2} \\approx 2.598 r_s.',
          'Se b < b_c: il fotone supera la barriera e cade ineluttabilmente nell\'orizzonte degli eventi.',
          'Se b > b_c: il fotone viene deflesso (lensing gravitazionale) e torna verso lo spazio infinito.',
          'Questo valore b_c definisce esattamente il raggio apparente dell\'Ombra del Buco Nero osservata dall\'EHT!'
        ]
      }
    ],
    conclusions: [
      'La sfera dei fotoni a r = 1.5 r_s è la superficie teorica dove la luce può orbitare attorno al buco nero.',
      'L\'ombra ottica visibile di un buco nero è considerevolmente più grande dell\'orizzonte degli eventi reale: r_ombra = b_c ≈ 2.6 r_s.'
    ]
  },
  {
    id: 'isco-orbit',
    title: 'ISCO: L\'Orbita Circolare Stabile Più Interna',
    subtitle: 'Limite fondamentale di stabilità per materia e dischi di accrescimento',
    category: 'Meccanica Orbitale',
    historicalContext: 'Determinata formalmente negli anni \'60 per descrivere la fine della spirale di accrescimento di plasma e gas stellare prima del tuffo libero (plunge) nel buco nero.',
    summary: 'Dimostrazione dell\'esistenza del raggio ISCO a r = 6GM/c^2 = 3 r_s per particelle massive e calcolo dell\'efficienza di emissione energetica.',
    steps: [
      {
        stepNumber: 1,
        heading: 'Geodetiche di Tipo Tempo per Particelle con Massa',
        description: 'Per una particella massiva di massa m, l\'intervallo proprio è non-nullo (ds^2 = -c^2 dτ^2). In unità geometrizzate (c=G=1) e per unità di massa:',
        formula: '-1 = -\\left(1 - \\frac{2M}{r}\\right) \\left(\\frac{dt}{d\\tau}\\right)^2 + \\left(1 - \\frac{2M}{r}\\right)^{-1} \\left(\\frac{dr}{d\\tau}\\right)^2 + r^2 \\left(\\frac{d\\phi}{d\\tau}\\right)^2',
        derivationNotes: [
          'τ è il tempo proprio misurato dall\'orologio a bordo della particella orbitante.'
        ]
      },
      {
        stepNumber: 2,
        heading: 'Potenziale Efficace per Particelle con Massa',
        description: 'Introducendo l\'energia specifica Ẽ = dt/dτ (1 - 2M/r) e il momento angolare specifico L̃ = r^2 dφ/dτ:',
        formula: '\\left(\\frac{dr}{d\\tau}\\right)^2 + V_{\\text{eff}}(r) = \\tilde{E}^2, \\qquad \\text{con} \\quad V_{\\text{eff}}(r) = \\left(1 - \\frac{2M}{r}\\right)\\left(1 + \\frac{\\tilde{L}^2}{r^2}\\right)',
        derivationNotes: [
          'Espandendo il prodotto: V_{eff}(r) = 1 - \\frac{2M}{r} + \\frac{\\tilde{L}^2}{r^2} - \\frac{2M\\tilde{L}^2}{r^3}.',
          'Il terzo termine è la barriera centrifuga newtoniana classica; il quarto termine cubico negativo è l\'attrazione relativistica ultra-forte di Einstein!'
        ]
      },
      {
        stepNumber: 3,
        heading: 'Condizioni per Orbita Circolare Stabile',
        description: 'Un\'orbita circolare richiede che la forza radiale efficace si annulli (V\'_{eff} = 0) e che sia un minimo di potenziale (V\'\'_{eff} ≥ 0):',
        formula: 'V\'_{\\text{eff}}(r) = \\frac{2M}{r^2} - \\frac{2\\tilde{L}^2}{r^3} + \\frac{6M\\tilde{L}^2}{r^4} = 0 \\implies \\tilde{L}^2 = \\frac{M r^2}{r - 3M}',
        derivationNotes: [
          'Notiamo subito che affinché L̃^2 > 0 (reale), deve essere r > 3M. A r = 3M il momento angolare diverge (limite ultrarelativistico).'
        ]
      },
      {
        stepNumber: 4,
        heading: 'Il Punto di Flesso Marginale (ISCO)',
        description: 'L\'orbita stabile più interna (ISCO) si verifica quando il minimo locale e il massimo locale del potenziale collidono in un punto di flesso (V\'\'_{eff} = 0):',
        formula: 'V\'\'_{\\text{eff}}(r) = -\\frac{4M}{r^3} + \\frac{6\\tilde{L}^2}{r^4} - \\frac{24M\\tilde{L}^2}{r^5} = 0',
        derivationNotes: [
          'Sostituendo l\'espressione di L̃^2 trovata al passo precedente:',
          '\\frac{2M}{r^3} \\left( -2 + \\frac{3r - 12M}{r - 3M} \\right) = 0 \\implies -2(r - 3M) + 3r - 12M = 0',
          'r - 6M = 0 \\implies r_{\\text{isco}} = 6M = \\frac{6GM}{c^2} = 3 r_s'
        ]
      },
      {
        stepNumber: 5,
        heading: 'Efficienza Energetica di Accrescimento (η)',
        description: 'L\'energia specifica all\'ISCO è l\'energia minima che un frammento di materia può avere in orbita circolare prima di precipitare:',
        formula: '\\tilde{E}_{\\text{isco}} = \\sqrt{V_{\\text{eff}}(6M)} = \\sqrt{\\left(1 - \\frac{2M}{6M}\\right)\\left(1 + \\frac{12M^2}{36M^2}\\right)} = \\sqrt{\\frac{2}{3} \\cdot \\frac{4}{3}} = \\frac{\\sqrt{8}}{3} \\approx 0.9428',
        derivationNotes: [
          'L\'efficienza di conversione massa-energia radiata nel disco prima del tuffo è: η = 1 - Ẽ_{isco} = 1 - 0.9428 = 5.72% (per Schwarzschild non rotante).',
          'Per confronto: la fusione termonucleare nelle stelle converte solo lo 0.7% di massa a riposo in energia. Un buco nero di Schwarzschild è quasi 10 volte più efficiente del Sole!',
          'Per un buco nero di Kerr al limite di spin massimale (a = M), r_{isco} scende a 1M e l\'efficienza sale al colossale 42.3%!'
        ]
      }
    ],
    conclusions: [
      'A r < 6M (3 r_s), nessuna forza centrifuga può sostenere un corpo in orbita stabile: la materia si tuffa (plunge) quasi istantaneamente verso l\'orizzonte.',
      'Questo spiega il bordo interno netto osservato nei dischi di accrescimento attorno ai buchi neri stellari e supermassicci.'
    ]
  },
  {
    id: 'time-dilation-redshift',
    title: 'Dilatazione Temporale Gravitazionale & Spettro Redshift',
    subtitle: 'Come il tempo scorre vicino all\'orizzonte e perché un oggetto che cade sembra congelarsi',
    category: 'Relatività Generale',
    historicalContext: 'Verificata sperimentalmente sulla Terra dall\'esperimento di Pound-Rebka (1959) e fondamentale per la calibrazione quotidiana dei satelliti GPS.',
    summary: 'Rapporto esatto tra tempo proprio dτ e tempo coordinato dt, dimostrazione del redshift infinito all\'orizzonte e spiegazione del tempo di caduta finito secondo la sonda.',
    steps: [
      {
        stepNumber: 1,
        heading: 'Rapporto di Tempo Proprio per un Osservatore Statico',
        description: 'Per un osservatore a posizione fissa nello spazio (dr = dθ = dφ = 0):',
        formula: 'c^2 d\\tau^2 = -ds^2 = \\left(1 - \\frac{r_s}{r}\\right) c^2 dt^2 \\implies \\frac{d\\tau}{dt} = \\sqrt{1 - \\frac{r_s}{r}}',
        derivationNotes: [
          'dt è l\'intervallo di tempo misurato da un osservatore situato a distanza infinita (r → ∞).',
          'dτ è il tempo segnato dall\'orologio proprio posizionato a raggio r dal buco nero.',
          'Quando r si avvicina a r_s, dτ/dt → 0: per l\'osservatore lontano l\'orologio della sonda sembra rallentare fino a fermarsi completamente.'
        ]
      },
      {
        stepNumber: 2,
        heading: 'Gravitational Redshift Factor z',
        description: 'I fotoni emessi a raggio r con frequenza ν_em perdono energia risalendo il pozzo di potenziale gravitazionale:',
        formula: '1 + z = \\frac{\\lambda_{\\text{obs}}}{\\lambda_{\\text{em}}} = \\frac{\\nu_{\\text{em}}}{\\nu_{\\text{obs}}} = \\frac{1}{\\sqrt{1 - \\frac{r_s}{r}}} \\implies z = \\frac{1}{\\sqrt{1 - \\frac{r_s}{r}}} - 1',
        derivationNotes: [
          'All\'avvicinarsi a r = r_s, z → ∞: la lunghezza d\'onda tende a infinito e l\'energia del fotone E = hν tende a zero.',
          'Questo significa che l\'oggetto che cade non resta visibile congelato all\'infinito: la luce emessa subisce un affievolimento esponenziale e un oscuramento spettrale rapidissimo (gravitational dimming).'
        ]
      },
      {
        stepNumber: 3,
        heading: 'Il Tempo di Caduta Radiale (Coordinate di Caduta Libera)',
        description: 'Integrando il tempo coordinato t vs tempo proprio τ per una particella rilasciata dalla quiete a R_0 fino all\'orizzonte r_s:',
        formula: '\\tau_{\\text{caduta}} = \\int_{r_s}^{R_0} \\frac{dr}{\\sqrt{\\frac{2GM}{r} - \\frac{2GM}{R_0}}} < \\infty \\qquad \\text{ma} \\qquad t(r) \\propto -\\frac{r_s}{c} \\ln\\left(\\frac{r - r_s}{r_s}\\right) \\to \\infty',
        derivationNotes: [
          'PARADOSSO RISOLTO: Per la sonda astronauta, il tempo proprio τ di attraversamento dell\'orizzonte è BREVE e FINITO (dell\'ordine di millisecondi per buchi neri stellari, ore per quelli supermassicci).',
          'Per il centro di controllo a terra lontano, i segnali radio richiedono un tempo coordinato t che diverge logaritmicamente a +∞.'
        ]
      }
    ],
    conclusions: [
      'L\'orizzonte degli eventi non è un muro fisico: un osservatore in caduta libera lo attraversa senza incontrare alcuna resistenza locale a r_s.',
      'La discrepanza temporale riflette la curvatura radicale della metrica e il comportamento dei coni di luce che si inclinano verso l\'interno.'
    ]
  },
  {
    id: 'kerr-ergosphere-penrose',
    title: 'Metrica di Kerr, Ergosfera & Processo di Penrose',
    subtitle: 'Frame Dragging, buchi neri rotanti ed estrazione di energia pulita dallo spaziotempo',
    category: 'Relatività Generale',
    historicalContext: 'Roy Kerr scoprì la soluzione rotante nel 1963. Nel 1969 Roger Penrose dimostrò che fino al 29% dell\'energia di massa di un buco nero rotante può essere estratta meccanicamente.',
    summary: 'Analisi della metrica di Kerr in coordinate di Boyer-Lindquist, struttura dell\'ergosfera e bilancio energetico del processo di Penrose.',
    steps: [
      {
        stepNumber: 1,
        heading: 'Metrica di Kerr in Coordinate di Boyer-Lindquist',
        description: 'Uno spaziotempo stazionario e assialsimmetrico con massa M e momento angolare J (parametro di spin a = J/Mc):',
        formula: 'ds^2 = -\\left(1 - \\frac{2Mr}{\\rho^2}\\right) dt^2 - \\frac{4Mar\\sin^2\\theta}{\\rho^2} dt d\\phi + \\frac{\\rho^2}{\\Delta} dr^2 + \\rho^2 d\\theta^2 + \\left(r^2 + a^2 + \\frac{2Ma^2 r\\sin^2\\theta}{\\rho^2}\\right)\\sin^2\\theta d\\phi^2',
        derivationNotes: [
          'Definiamo i coefficienti geometrici: ρ^2 = r^2 + a^2 cos^2θ e Δ = r^2 - 2Mr + a^2.',
          'Il termine di incrocio dt·dφ rappresenta l\'effetto Lense-Thirring (Frame Dragging): lo spaziotempo stesso viene trascinato nella rotazione del buco nero!'
        ]
      },
      {
        stepNumber: 2,
        heading: 'Orizzonte degli Eventi vs Superficie di Limite Statico (Ergosfera)',
        description: 'L\'orizzonte degli eventi corrisponde alla singolarità coordinata radiale Δ = 0, mentre il limite statico corrisponde all\'annullamento di g_{00} = 0:',
        formula: 'r_+ = M + \\sqrt{M^2 - a^2} \\quad (\\text{Orizzonte}), \\qquad r_E(\\theta) = M + \\sqrt{M^2 - a^2\\cos^2\\theta} \\quad (\\text{Ergosfera})',
        derivationNotes: [
          'All\'equatore (θ = π/2), cosθ = 0, quindi: r_E(π/2) = 2M = r_s (più esterno dell\'orizzonte!).',
          'Ai poli (θ = 0, π), r_E = M + sqrt(M^2 - a^2) = r_+ (coincide con l\'orizzonte).',
          'La regione compresa tra r_+ e r_E(θ) è l\'ERGOSFERA: all\'interno dell\'ergosfera, nessun osservatore può rimanere stazionario rispetto a un riferimento all\'infinito, ma è obbligato a co-ruotare col buco nero!'
        ]
      },
      {
        stepNumber: 3,
        heading: 'Il Processo di Penrose e Meccanismo di Estrazione Energetica',
        description: 'Nell\'ergosfera il vettore di Killing temporale ξ^μ = (1, 0, 0, 0) diventa di tipo spazio (g_{00} > 0). L\'energia E = -p_μ ξ^μ misurata da un osservatore asintotico può essere NEGATIVA:',
        formula: 'E_0 = E_1 + E_2 \\quad \\text{con} \\quad E_2 < 0 \\implies E_1 = E_0 - E_2 > E_0',
        derivationNotes: [
          'Se una particella di energia E_0 entra nell\'ergosfera e si spezza in due pezzi:',
          'Il frammento 2 acquisisce momento retrogrado ed energia negativa (E_2 < 0) e cade oltre l\'orizzonte r_+, riducendo lo spin del buco nero.',
          'Il frammento 1 fugge verso l\'infinito con un\'energia E_1 MAGGIORE dell\'energia originaria E_0!',
          'L\'eccesso di energia proviene direttamente dall\'energia cinetica rotazionale del buco nero.'
        ]
      },
      {
        stepNumber: 4,
        heading: 'Massimo Rendimento Teorico',
        description: 'La massa irriducibile M_{irr} stabilita da Christodoulou soddisfa la relazione:',
        formula: 'M^2 = M_{\\text{irr}}^2 + \\frac{J^2}{4 M_{\\text{irr}}^2} \\implies M_{\\text{irr}} = \\frac{1}{\\sqrt{2}} \\sqrt{M^2 + \\sqrt{M^4 - a^2 M^2}}',
        derivationNotes: [
          'Per un buco nero di Kerr massimale (a = M): M_{irr} = M / √2 ≈ 0.707 M.',
          'L\'energia massima estraibile è: ΔE = M - M_{irr} = (1 - 1/√2) M c^2 ≈ 29.3% della massa totale a riposo!',
          'Questo è il motore energetico naturale più potente dell\'universo conosciuto, alimentando i getti dei Quasar.'
        ]
      }
    ],
    conclusions: [
      'Un buco nero rotante non è una trappola definitiva ma una gigantesca batteria gravitazionale cosmica.',
      'Il processo di Penrose e il suo analogo elettromagnetico (meccanismo di Blandford-Znajek) spiegano i getti relativistici lunghi migliaia di anni luce di M87*.'
    ]
  },
  {
    id: 'hawking-thermodynamics',
    title: 'Radiazione di Hawking & Termodinamica dei Buchi Neri',
    subtitle: 'La convergenza rivoluzionaria tra Relatività Generale, Meccanica Quantistica e Termodinamica',
    category: 'Fisica Quantistica',
    historicalContext: 'Nel 1974 Stephen Hawking dimostrò applicando la teoria quantistica dei campi su spaziotempo curvo che i buchi neri non sono completamente neri, ma emettono radiazione termica come un corpo nero perfetto.',
    summary: 'Derivazione della temperatura di Hawking T_H, dell\'entropia di Bekenstein-Hawking S = k_B A / (4 ℓ_P^2) e calcolo dei tempi di evaporazione cosmica.',
    steps: [
      {
        stepNumber: 1,
        heading: 'Gravità Superficiale κ all\'Orizzonte',
        description: 'La gravità superficiale κ misura l\'accelerazione necessaria all\'infinito per trattenere un corpo sull\'orizzonte:',
        formula: '\\kappa = \\lim_{r \\to r_s} \\left[ \\frac{1}{2} \\frac{1}{\\sqrt{-g_{00} g_{rr}}} \\frac{\\partial g_{00}}{\\partial r} \\right] = \\frac{c^4}{4GM}',
        derivationNotes: [
          'Nel vuoto quantistico vicino all\'orizzonte, le fluttuazioni quantistiche generano continuamente coppie virtuali particella-antiparticella.',
          'L\'intenso gradiente gravitazionale separa la coppia prima dell\'annichilazione: una particella a energia negativa (relativa all\'infinito) attraversa l\'orizzonte, mentre l\'altra particella a energia positiva fugge all\'infinito come radiazione termica reale.'
        ]
      },
      {
        stepNumber: 2,
        heading: 'Temperatura di Hawking T_H',
        description: 'La temperatura termica equivalente emessa corrisponde alla gravità superficiale divisa per 2π (effetto Unruh all\'orizzonte):',
        formula: 'T_H = \\frac{\\hbar \\kappa}{2\\pi c k_B} = \\frac{\\hbar c^3}{8\\pi G M k_B}',
        derivationNotes: [
          'Notiamo una proprietà straordinaria: la temperatura è inversamente proporzionale alla massa M!',
          'Più il buco nero è piccolo, più è CALDO e luminoso.',
          'Per una massa solare (M = M_☉): T_H ≈ 6.17 × 10^{-8} K (estremamente più freddo del fondo cosmico di 2.7 K).',
          'Per un micro-buco nero primordiale di 10^{11} kg: T_H ≈ 1.23 × 10^{12} K (emette raggi gamma intensissimi).'
        ]
      },
      {
        stepNumber: 3,
        heading: 'Formula dell\'Entropia di Bekenstein-Hawking',
        description: 'Dalla prima legge della termodinamica dei buchi neri dE = T_H dS e con E = M c^2:',
        formula: 'dS = \\frac{d(M c^2)}{T_H} = \\frac{8\\pi G k_B}{\\hbar c} M dM \\implies S_{BH} = \\frac{4\\pi G k_B}{\\hbar c} \\frac{M^2}{2} = \\frac{k_B c^3 A}{4 G \\hbar} = \\frac{k_B A}{4 \\ell_P^2}',
        derivationNotes: [
          'A = 4π r_s^2 = 16π G^2 M^2 / c^4 è l\'area superficiale dell\'orizzonte.',
          'ℓ_P = √(ℏG/c^3) ≈ 1.616 × 10^{-35} m è la lunghezza di Planck.',
          'L\'entropia di un buco nero è proporzionale alla sua AREA e non al suo volume! Questa formula è la pietra angolare del Principio Olografico della fisica moderna.'
        ]
      },
      {
        stepNumber: 4,
        heading: 'Tasso di Perdita di Massa ed Evaporazione Finale',
        description: 'La potenza emessa secondo la legge di Stefan-Boltzmann per corpo nero P = σ A T_H^4:',
        formula: '-\\frac{dM}{dt} = \\frac{P}{c^2} = \\frac{\\hbar c^4}{15360 \\pi G^2 M^2}',
        derivationNotes: [
          'Separando le variabili e integrando da M_0 a 0:',
          '\\int_0^{M_0} M^2 dM = \\frac{\\hbar c^4}{15360 \\pi G^2} \\int_0^{t_{\\text{evap}}} dt',
          't_{\\text{evap}} = \\frac{5120 \\pi G^2 M_0^3}{\\hbar c^4}'
        ]
      }
    ],
    conclusions: [
      'Un buco nero stellare impiega circa 10^{67} anni per evaporare (molto più dell\'età attuale dell\'universo di 1.38 × 10^{10} anni).',
      'Negli ultimi secondi di vita, il tasso di evaporazione diverge producendo una violenta detonazione termica da gigawatt di radiazione cosmica pura.'
    ]
  }
];
