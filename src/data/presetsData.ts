/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlackHolePreset } from '../types/physics';
import { M_SOLAR } from '../utils/physicsConstants';

export const PRESETS: BlackHolePreset[] = [
  {
    id: 'sgr-a',
    name: 'Sagittarius A*',
    type: 'supermassive',
    massSolar: 4.297e6,
    massKg: 4.297e6 * M_SOLAR,
    spin: 0.90, // Recenti misure EHT e polarizzazione stimano spin molto elevato
    distanceLightYears: 26673,
    description: 'Il buco nero supermassiccio al centro della nostra Via Lattea, immortalato dall\'Event Horizon Telescope (EHT).',
    discoveryYear: 1974,
    constellation: 'Sagittario',
  },
  {
    id: 'm87-star',
    name: 'M87* (Messier 87)',
    type: 'supermassive',
    massSolar: 6.5e9,
    massKg: 6.5e9 * M_SOLAR,
    spin: 0.94,
    distanceLightYears: 53.5e6,
    description: 'La celebre prima ombra di buco nero fotografata nel 2019. Possiede un colossale getto relativistico di 5000 anni luce.',
    discoveryYear: 1781,
    constellation: 'Vergine',
  },
  {
    id: 'cyg-x1',
    name: 'Cygnus X-1',
    type: 'stellar',
    massSolar: 21.2,
    massKg: 21.2 * M_SOLAR,
    spin: 0.97, // Quasi massimale
    distanceLightYears: 7200,
    description: 'Il primo candidato buco nero stellare identificato nella storia dell\'astronomia a raggi X, in sistema binario con una stella supergigante blu HDE 226868.',
    discoveryYear: 1964,
    constellation: 'Cigno',
  },
  {
    id: 'gw150914',
    name: 'GW150914 (Residuo)',
    type: 'stellar',
    massSolar: 62.0,
    massKg: 62.0 * M_SOLAR,
    spin: 0.69,
    distanceLightYears: 1.3e9,
    description: 'Il buco nero risultante dalla prima fusione di onde gravitazionali rilevata da LIGO/Virgo nel 2015, convertendo 3 masse solari in pura energia gravitazionale.',
    discoveryYear: 2015,
    constellation: 'Reticolo / Orologio',
  },
  {
    id: 'primordial',
    name: 'Buco Nero Primordiale (Asteroidale)',
    type: 'primordial',
    massSolar: 5.0e-19, // ~ 10^11 kg (massa di una montagna o asteroide)
    massKg: 1.0e12,
    spin: 0.05,
    distanceLightYears: 0,
    description: 'Ipotetico micro-buco nero formatosi nelle prime frazioni di secondo dopo il Big Bang. Raggio dell\'orizzonte sub-atomico (femtometri), irradia Hawking ad alta intensità.',
    discoveryYear: 1971,
    constellation: 'Teorico',
  },
  {
    id: 'earth-mass',
    name: 'Massa Terrestre Teorica',
    type: 'theoretical',
    massSolar: 3.003e-6, // ~ 5.972e24 kg
    massKg: 5.972e24,
    spin: 0.0,
    distanceLightYears: 0,
    description: 'Se la Terra venisse compressa fino a diventare un buco nero, il suo orizzonte degli eventi misurerebbe appena 8.87 millimetri di raggio (la dimensione di una moneta).',
    discoveryYear: 1916,
    constellation: 'Sistema Solare (Simulazione)',
  }
];
