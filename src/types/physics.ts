/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BlackHolePreset {
  id: string;
  name: string;
  type: 'supermassive' | 'stellar' | 'intermediate' | 'primordial' | 'theoretical';
  massKg: number;
  massSolar: number;
  spin: number; // a/M, from 0 to 0.998
  distanceLightYears?: number;
  description: string;
  discoveryYear?: number;
  constellation?: string;
}

export interface MetricProperties {
  schwarzschildRadiusMeters: number; // r_s = 2GM/c^2
  photonSphereRadiusMeters: number;   // r_ph = 3GM/c^2 = 1.5 r_s (for a=0)
  iscoRadiusMeters: number;           // r_isco = 6GM/c^2 = 3 r_s (for a=0 prograde)
  kerrEventHorizonMeters: number;     // r_+ = M + sqrt(M^2 - a^2)
  ergosphereEquatorMeters: number;    // r_E(pi/2) = 2M = r_s
  hawkingTemperatureKelvin: number;   // T_H
  evaporationTimeSeconds: number;     // t_evap
  bekensteinEntropyJoulesPerK: number;// S_BH
  gravitationalLuminosityWatts: number; // P_H
}

export interface SimulationState {
  massSolar: number;
  spin: number; // 0 to 0.998
  accretionRate: number; // 0 to 1 (visual brightness)
  showErgosphere: boolean;
  showPhotonSphere: boolean;
  showISCO: boolean;
  showJets: boolean;
  showGrid: boolean;
  cameraDistance: number;
}
