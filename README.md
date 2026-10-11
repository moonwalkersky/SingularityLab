# Singularity Lab — Laboratorio Relativistico dei Buchi Neri

Un'applicazione scientifica interattiva e avanzata per lo studio, la visualizzazione tridimensionale e la comprensione matematica e fisica dei buchi neri e della curvatura dello spaziotempo secondo la **Relatività Generale di Albert Einstein**.

---

## Indice

1. [Panoramica del Progetto](#panoramica-del-progetto)
2. [Architettura Tecnica del Software](#architettura-tecnica-del-software)
   - [Stack Tecnologico](#stack-tecnologico)
   - [Struttura delle Cartelle e Moduli](#struttura-delle-cartelle-e-moduli)
3. [Specifiche Funzionali](#specifiche-funzionali)
   - [Simulatore Relativistico 3D (Three.js)](#1-simulatore-relativistico-3d-threejs)
   - [Orbite delle Particelle di Test](#2-orbite-delle-particelle-di-test)
   - [Integratore Geodetico 2D & Lente Gravitazionale](#3-integratore-geodetico-2d--lente-gravitazionale)
   - [Curvatura dello Spaziotempo & Precessione a Rosetta](#4-curvatura-dello-spaziotempo--precessione-a-rosetta)
   - [Dilatazione Temporale Gravitazionale & Effetti di Marea](#5-dilatazione-temporale-gravitazionale--effetti-di-marea)
   - [Termodinamica Quantistica & Radiazione di Hawking](#6-termodinamica-quantistica--radiazione-di-hawking)
   - [Trattato Matematico & Dimostrazioni Formali](#7-trattato-matematico--dimostrazioni-formali)
   - [Percorso Didattico Guidato & Quiz](#8-percorso-didattico-guidato--quiz)
   - [Glossario dei Termini Chiave](#9-glossario-dei-termini-chiave)
   - [Esportazione Dati Scientifici (CSV e JSON)](#10-esportazione-dati-scientifici-csv-e-json)
4. [Fondamenti Fisici e Costanti](#fondamenti-fisici-e-costanti)
5. [Guida all'Installazione, Build e Deploy](#guida-allinstallazione-build-e-deploy)
   - [Requisiti Prerequisiti](#requisiti-prerequisiti)
   - [Installazione Dipendenze](#installazione-dipendenze)
   - [Avvio in Ambiente di Sviluppo](#avvio-in-ambiente-di-sviluppo)
   - [Type Checking e Linting](#type-checking-e-linting)
   - [Build per la Produzione](#build-per-la-produzione)
   - [Anteprima Locale del Build](#anteprima-locale-del-build)
   - [Deploy su Piattaforme Cloud](#deploy-su-piattaforme-cloud)

---

## Panoramica del Progetto

**Singularity Lab** combina simulazioni interattive in tempo reale (renderizzate tramite WebGL e Canvas 2D) con un rigido rigore matematico e formule KaTeX formattate in alta fedeltà. Il tool permette a studenti, ricercatori e appassionati di astrofisica di esplorare:

- Le metriche esatte dello spaziotempo: **Schwarzschild** (statico sferico) e **Kerr** (rotante assialsimmetrico).
- I raggi caratteristici relativistici: Orizzonte degli Eventi ($r_s, r_+$), Sfera dei Fotoni ($r_{\text{ph}}$), Bordo ISCO ($r_{\text{isco}}$) ed Ergosfera ($r_E$).
- L'ottica dei buchi neri: deflessione relativistica dei fotoni, sezione d'urto di cattura ($b_c$) e formazione dell'ombra ottica (EHT).
- L'effetto Doppler beaming e la distorsione gravitazionale della luce del disco di accrescimento.
- Il comportamento dinamico delle particelle di test su orbite circolari stabili, ellittiche precessanti a rosetta o in caduta a spirale (plunge).
- L'influenza dello spin dimensionale $a^* = J/(Mc)$ sul trascinamento dei sistemi di riferimento inerziali (frame dragging).

---

## Architettura Tecnica del Software

### Stack Tecnologico

- **Frontend Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & Bundler**: [Vite 8](https://vitejs.dev/)
- **Rendering 3D WebGL**: [Three.js](https://threejs.org/) (geometrie procedurali, illuminazione ACESFilmic, blending additivo relativistico)
- **Motore Tipografico Matematico**: [KaTeX](https://katex.org/) (rendering in tempo reale LaTeX per formule e simboli tensoriali)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (palette scura scientifica `slate-950`/`obsidian`, disciplina zero-pill, layout responsivo a 1440px)
- **Iconografia**: [Lucide React](https://lucide.dev/)
- **Animazioni UI**: [Motion](https://motion.dev/)

### Struttura delle Cartelle e Moduli

```
singularity-lab/
├── index.html                           # Entry-point HTML con preconnect Google Fonts e CSS KaTeX
├── package.json                         # Configurazione dipendenze e script npm
├── tsconfig.json                        # Configurazione TypeScript strict
├── vite.config.ts                       # Configurazione Vite con Tailwind plugin e alias
├── metadata.json                        # Metadati dell'applet e permessi
├── README.md                            # Documentazione tecnica e architetturale
└── src/
    ├── main.tsx                         # Entry point React root
    ├── index.css                        # Import Tailwind v4 e configurazione font JetBrains Mono / Plus Jakarta Sans
    ├── App.tsx                          # Layout master, state management globale, switch dei tab e modali
    ├── types/
    │   └── physics.ts                   # Interfacce TypeScript (MetricProperties, BlackHolePreset, SimulationState)
    ├── utils/
    │   ├── physicsConstants.ts          # Costanti CODATA (G, c, ħ, k_B), calcolatori Schwarzschild/Kerr, redshift
    │   └── exportSimulationData.ts      # Generatori dataset numerici e serializzatori CSV / JSON per download
    ├── data/
    │   ├── presetsData.ts               # Preset astronomici reali (Sgr A*, M87*, Cygnus X-1, GW150914, Primordiale, Terra)
    │   ├── proofsData.ts                # 6 dimostrazioni matematiche complete passo-passo con note storiche
    │   └── glossaryData.ts              # 16 definizioni scientifiche con formule, icone e collegamenti
    └── components/
        ├── Navbar.tsx                   # Top navigation bar conforme al 3-Zone Contract (Brand | 5 Links | 1 Action)
        ├── PresetBar.tsx                # Selettore preset astronomici, slider di fine-tuning (Massa, Spin) e tasto export
        ├── MathView.tsx                 # Componente wrapper KaTeX con supporto inline e display mode
        ├── BlackHole3D.tsx              # Simulatore 3D Three.js (disco, getti, ergosfera, particelle e orbite di test)
        ├── GeodesicLensingCanvas.tsx    # Ray-tracer 2D relativistico, parametro d'impatto critico bc e confronto con Newton
        ├── SpacetimeCurvatureSim.tsx    # Paraboloide di Flamm, equazione di Binet numerica e precessione a rosetta
        ├── TimeDilationCalculator.tsx   # Orologi gemelli sincronizzati, redshift spettrale e accelerazione di marea
        ├── HawkingRadiationLab.tsx      # Calcolatore termodinamico logaritmico, entropia olografica ed evaporazione
        ├── MathematicalProofs.tsx       # Trattato teorico con step espandibili e formule formali
        ├── GuidedPathway.tsx            # Percorso didattico in 6 passaggi con azioni interattive e quiz di verifica
        ├── Glossary.tsx                 # Glossario navigabile con ricerca in tempo reale, filtri per categoria e icone
        └── ExportDataModal.tsx          # Hub modale per anteprima e download dei dati in formato CSV e JSON
```

---

## Specifiche Funzionali

### 1. Simulatore Relativistico 3D (Three.js)
- **Orizzonte degli Eventi**: Sfera nera a raggio $r_s = 2GM/c^2$ (o raggio esterno di Kerr $r_+$) con assorbimento ottico totale.
- **Disco di Accrescimento**: Texture procedurale con filamenti a spirale e modellazione del **Doppler Beaming relativistico** (amplificazione e blueshift della parte che ruota verso l'osservatore, oscuramento e redshift della parte recedente).
- **Anello Gravitazionale Deformato**: Riproduzione della luce proveniente dal retro del disco, deflessa sopra e sotto l'orizzonte dalla forte curvatura dello spaziotempo.
- **Ergosfera di Kerr**: Sferoide oblato wireframe a raggio equatoriale $r_E(\pi/2) = r_s$ e schiacciamento polare $r_E(0) = r_+$, visibile per buchi neri rotanti ($a^* > 0$).
- **Getti di Plasma Polari**: Colonne collimanti ad alta energia alimentate dal momento angolare lungo l'asse di rotazione.
- **Controlli Telecamera**: Rotazione orbitale libera tramite trascinamento mouse/touch, zoom con rotella e preset istantanei (Inclinata 45°, Equatoriale, Polare dall'alto).

### 2. Orbite delle Particelle di Test
Un selettore dedicato nel viewport 3D permette di inserire una sonda/particella di test e osservarne la traiettoria:
- **Circolare (Stabile)**: Orbita chiusa periodica ad altitudine stabile ($r \approx 3.75\,r_s > r_{\text{isco}}$) con scia azzurra luminosa.
- **Ellittica (Rosetta GR)**: Orbita eccentrica che manifesta la **precessione del perielio relativistica**, tracciando la celebre forma a rosetta nello spazio tridimensionale con scia ambrata ad alta persistenza.
- **Cattura (Plunge a Spirale)**: Traiettoria instabile che oltrepassa il limite ISCO ($r < r_{\text{isco}}$); la particella perde quota a spirale accelerando vorticosamente fino a precipitare oltre l'orizzonte degli eventi con scia scarlatta, per poi rigenerarsi all'apoastro esterno.
- **Disattivata**: Nasconde la sonda e la scia per isolare la geometria pura del buco nero.

### 3. Integratore Geodetico 2D & Lente Gravitazionale
- Integrazione numerica dell'equazione geodetica per la luce in coordinate polari di Schwarzschild:
  $$\frac{d^2u}{d\phi^2} + u = 3Mu^2 \qquad (u = 1/r)$$
- Verifica del **parametro d'impatto critico** $b_c = 3\sqrt{3}M \approx 5.196\,M$:
  - $b < b_c$: Cattura ineluttabile nell'orizzonte degli eventi ($r \le 2M$).
  - $b \approx b_c$: Orbita multipla sulla sfera fotonica ($r = 3M$).
  - $b > b_c$: Deflessione iperbolica relativistica nello spazio infinito.
- **Confronto Storico Newton vs Einstein**: Modalità di confronto che visualizza la deviazione newtoniana pura $\alpha_{\text{newton}} = 2GM/(c^2 b)$, esattamente la metà di quella prevista dalla Relatività Generale e confermata dall'eclissi solare di Eddington nel 1919.

### 4. Curvatura dello Spaziotempo & Precessione a Rosetta
- Visualizzazione del reticolo curvo tramite l'embedding diagram del **Paraboloide di Flamm**:
  $$z(r) = 2\sqrt{r_s(r - r_s)}$$
- Integrazione orbitale dell'equazione di Binet per particelle con massa:
  $$\frac{d^2r}{dt^2} = -\frac{GM}{r^2} + \frac{L^2}{r^3} - \frac{3GM L^2}{c^2 r^4}$$
- Dimostrazione del collasso orbitale spontaneo quando l'orbita penetra all'interno dell'ISCO ($r < 6M$).

### 5. Dilatazione Temporale Gravitazionale & Effetti di Marea
- **Orologi Gemelli Sincronizzati**: Orologio dell'osservatore asintotico a riposo ($dt$) confrontato in tempo reale con l'orologio proprio ($d\tau$) della sonda a distanza $r$:
  $$d\tau = dt \sqrt{1 - \frac{r_s}{r}}$$
- **Redshift Spettrale & Shifter Cromatico**: Calcolo del fattore $z = (1 - r_s/r)^{-1/2} - 1$ con conversione dinamica della lunghezza d'onda da laser blu (460 nm) attraverso il verde, giallo, rosso e fino all'infrarosso invisibile ($z \to \infty$).
- **Accelerazione Differenziale di Marea (Spaghettificazione)**:
  $$\Delta a_{\text{marea}} = \frac{2GM}{r^3} \Delta h \qquad (\Delta h = 1.8\,\text{m})$$
  Confronto quantitativo che dimostra come un buco nero stellare smembri la materia atomica prima dell'orizzonte, mentre un buco nero supermassiccio possieda maree tollerabili all'orizzonte.

### 6. Termodinamica Quantistica & Radiazione di Hawking
- Calcolo continuo su scala logaritmica da buchi neri primordiali ($10^{11}$ kg) a supermassicci ($10^{39}$ kg):
  - **Temperatura di Hawking**: $T_H = \frac{\hbar c^3}{8\pi G M k_B}$
  - **Entropia di Bekenstein-Hawking**: $S_{BH} = \frac{k_B c^3 A}{4 G \hbar} = \frac{k_B A}{4 \ell_P^2}$ (bit olografici)
  - **Potenza Radiata (Stefan-Boltzmann)**: $P = \frac{\hbar c^6}{15360\pi G^2 M^2}$
  - **Tempo Cosmologico di Evaporazione**: $t_{\text{evap}} = \frac{5120\pi G^2 M^3}{\hbar c^4}$
- Rilevazione dello stato termico rispetto al Fondo Cosmico a Microonde ($T_{\text{CMB}} = 2.725\text{ K}$) e simulazione dell'esplosione gamma finale negli ultimi microsecondi.

### 7. Trattato Matematico & Dimostrazioni Formali
Sei trattazioni analitiche complete con passaggi algebrici espandibili in KaTeX:
1. *Metrica di Schwarzschild dalle Equazioni di Campo nel Vuoto ($R_{\mu\nu} = 0$)*
2. *Sfera dei Fotoni e Parametro di Impatto Critico ($ds^2 = 0$)*
3. *Derivazione dell'ISCO dal Potenziale Efficace per Particelle con Massa*
4. *Dilatazione Temporale e Coordinate di Caduta Libera*
5. *Metrica di Kerr, Ergosfera e Processo di Penrose (rendimento 29.3%)*
6. *Gravità Superficiale ed Evaporazione Quantistica di Hawking*

### 8. Percorso Didattico Guidato & Quiz
- Sei tappe pedagogiche progressive:
  1. *Massa e Orizzonte degli Eventi*
  2. *La Traiettoria della Luce e la Sfera Fotonica*
  3. *Il Limite della Materia: Il Raggio ISCO*
  4. *Lo Spaziotempo in Rotazione: Spin ed Ergosfera*
  5. *Dilatazione Temporale e Redshift Gravitazionale*
  6. *Evaporazione Quantistica e Radiazione di Hawking*
- Ogni tappa include una **Sperimentazione Interattiva Consigliata** che applica i parametri target e apre la simulazione appropriata.
- **Quiz Relativistico**: verifica delle competenze con spiegazione concettuale per ogni quesito.

### 9. Glossario dei Termini Chiave
16 schede rigorose dotate di icone esplicative, formule matematiche, categorie di appartenenza e collegamenti ipertestuali a voci correlate, filtrabili con barra di ricerca in tempo reale.

### 10. Esportazione Dati Scientifici (CSV e JSON)
- Modale dedicato con anteprima del codice e copia negli appunti.
- Download diretto dei dati in formato `.csv` o `.json`:
  - **Dilatazione Temporale**: tabella dei valori radiali $r/r_s$, fattori $d\tau/dt$, redshift $z$, lunghezze d'onda e accelerazioni di marea.
  - **Geodetiche**: matrice dei parametri d'impatto $b$, esito dinamico, angoli di deflessione di Einstein e Newton.
  - **Snapshot Metrico**: parametri completi del buco nero attivo in formato compatibile con script Python (Pandas/NumPy) o fogli di calcolo.

---

## Fondamenti Fisici e Costanti

Tutti i calcoli utilizzano le costanti fondamentali standard **CODATA 2022** in unità SI:

| Simbolo | Nome della Costante | Valore Numerico SI |
| :--- | :--- | :--- |
| $G$ | Costante di Gravitazione Universale | $6.67430 \times 10^{-11}\text{ m}^3\text{ kg}^{-1}\text{ s}^{-2}$ |
| $c$ | Velocità della Luce nel Vuoto | $299\,792\,458\text{ m/s}$ |
| $\hbar$ | Costante di Planck Ridotta | $1.054571817 \times 10^{-34}\text{ J}\cdot\text{s}$ |
| $k_B$ | Costante di Boltzmann | $1.380649 \times 10^{-23}\text{ J/K}$ |
| $M_\odot$ | Massa Solare Standard | $1.98847 \times 10^{30}\text{ kg}$ |
| $\ell_P$ | Lunghezza di Planck | $1.616255 \times 10^{-35}\text{ m}$ |

---

## Guida all'Installazione, Build e Deploy

### Requisiti Prerequisiti

- **Node.js**: versione $\ge 18.0.0$ (consigliata versione LTS $\ge 20.x$)
- **npm**: versione $\ge 9.x$

Verifica le versioni installate:
```bash
node -v
npm -v
```

---

### Installazione Dipendenze

Clona il repository o posizionati nella cartella principale del progetto, quindi installa i pacchetti necessari:

```bash
npm install
```

Le dipendenze installate includono:
- `react`, `react-dom`
- `three`, `@types/three`
- `katex`, `@types/katex`
- `lucide-react`, `motion`
- `tailwindcss` (v4), `@tailwindcss/vite`
- `vite`, `typescript`, `tsx`

---

### Avvio in Ambiente di Sviluppo

Avvia il dev server locale di Vite:

```bash
npm run dev
```

L'applicazione sarà accessibile all'indirizzo predefinito:
```
http://localhost:3000
```
*(o alla porta indicata dal terminale, es. `http://localhost:5173`)*.

---

### Type Checking e Linting

Esegui il controllo statico dei tipi TypeScript per verificare l'integrità del codice senza compilazione su disco:

```bash
npm run lint
```

Questo comando esegue internamente:
```bash
tsc --noEmit
```

---

### Build per la Produzione

Per compilare e ottimizzare l'applicazione per la distribuzione in ambiente di produzione:

```bash
npm run build
```

Il processo di build esegue:
1. Validazione statica del codice TypeScript (`tsc`).
2. Bundling e minificazione avanzata di asset JavaScript, CSS e shader WebGL tramite Vite.
3. Generazione dei file statici pronti per il deployment nella cartella `/dist`.

Output tipico:
```
dist/
├── index.html
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    └── ...
```

---

### Anteprima Locale del Build

Per verificare localmente il comportamento del bundle di produzione prima del deploy effettivo:

```bash
npm run preview
```

---

### Deploy su Piattaforme Cloud

#### 1. Deploy su Google Cloud Run / Container Docker
Crea un file `Dockerfile` nella root del progetto:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
Quindi esegui il build e il deploy del container:
```bash
docker build -t singularity-lab .
docker run -p 3000:80 singularity-lab
```

#### 2. Deploy su Vercel
Installa la CLI di Vercel ed effettua il deploy:
```bash
npm install -g vercel
vercel
```
Oppure collega il repository GitHub direttamente alla dashboard di Vercel:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### 3. Deploy su Netlify
Tramite Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```
Oppure tramite configurazione `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 4. Deploy su GitHub Pages
Per effettuare il deploy su GitHub Pages tramite gh-pages:
```bash
npm install -D gh-pages
```
Aggiungi in `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
E distribuisci con:
```bash
npm run deploy
```

---

## Licenza

Questo progetto è rilasciato sotto licenza [Apache-2.0](LICENSE).
Tutti i modelli fisici e le costanti sono conformi agli standard internazionali CODATA e alla letteratura scientifica accreditata di Relatività Generale e Astrofisica Teorica.
