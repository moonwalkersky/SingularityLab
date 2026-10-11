/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Fundamental Physical Constants (CODATA SI Units)
export const G = 6.67430e-11;       // Gravitational constant [m^3 kg^-1 s^-2]
export const C = 299792458;         // Speed of light [m s^-1]
export const H_BAR = 1.054571817e-34; // Reduced Planck constant [J s]
export const K_B = 1.380649e-23;    // Boltzmann constant [J K^-1]
export const M_SOLAR = 1.98847e30;  // Solar mass [kg]
export const PLANCK_LENGTH = 1.616255e-35; // Planck length [m]

/**
 * Calculates relativistic properties for a black hole given mass (kg) and dimensionless spin (a/M in [0, 1])
 */
export function calculateBlackHoleProperties(massKg: number, spinParam = 0) {
  // Clamped spin parameter (extremal Kerr limit is a/M = 1, astrophysical Thorne limit ~0.998)
  const aClamped = Math.max(0, Math.min(0.998, spinParam));
  
  // Geometrized mass M in meters: M_geom = G * M / c^2
  const mGeom = (G * massKg) / (C * C);

  // Schwarzschild radius (for a=0): r_s = 2 * M_geom
  const r_s = 2 * mGeom;

  // Kerr Outer Event Horizon: r_+ = M + sqrt(M^2 - a^2)
  // in meters: mGeom * (1 + sqrt(1 - aClamped^2))
  const r_plus = mGeom * (1 + Math.sqrt(Math.max(0, 1 - aClamped * aClamped)));

  // Kerr Inner (Cauchy) Horizon: r_- = M - sqrt(M^2 - a^2)
  const r_minus = mGeom * (1 - Math.sqrt(Math.max(0, 1 - aClamped * aClamped)));

  // Ergosphere outer boundary at equatorial plane (theta = pi/2): r_E(pi/2) = 2 * M_geom = r_s
  const r_ergosphere_equator = r_s;

  // Innermost Stable Circular Orbit (ISCO) for Kerr (prograde):
  // Formula by Bardeen, Press, Teukolsky (1972)
  const z1 = 1 + Math.cbrt(1 - aClamped * aClamped) * (Math.cbrt(1 + aClamped) + Math.cbrt(1 - aClamped));
  const z2 = Math.sqrt(3 * aClamped * aClamped + z1 * z1);
  const r_isco_prograde = mGeom * (3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2)));

  // Photon sphere for non-rotating is 1.5 * r_s = 3 * M_geom
  // For Kerr equatorial prograde: 2M * (1 + cos(2/3 * arccos(-a)))
  const r_photon = aClamped === 0
    ? 1.5 * r_s
    : 2 * mGeom * (1 + Math.cos((2 / 3) * Math.acos(-aClamped)));

  // Critical impact parameter for photon capture: b_c = 3 * sqrt(3) * M_geom (for Schwarzschild)
  const b_crit = 3 * Math.sqrt(3) * mGeom;

  // Hawking Temperature: T_H = (hbar * c^3) / (8 * pi * G * M * k_B) [Kelvin]
  const hawkingTemp = (H_BAR * Math.pow(C, 3)) / (8 * Math.PI * G * massKg * K_B);

  // Bekenstein-Hawking Entropy: S_BH = (k_B * c^3 * A) / (4 * G * hbar)
  // Horizon area A = 4 * pi * (r_+^2 + (a*M)^2)
  const aMeter = aClamped * mGeom;
  const horizonArea = 4 * Math.PI * (r_plus * r_plus + aMeter * aMeter);
  const entropy = (K_B * Math.pow(C, 3) * horizonArea) / (4 * G * H_BAR);

  // Hawking Evaporation Time: t_evap = (5120 * pi * G^2 * M^3) / (hbar * c^4) [seconds]
  const evapTimeSeconds = (5120 * Math.PI * Math.pow(G, 2) * Math.pow(massKg, 3)) / (H_BAR * Math.pow(C, 4));

  // Hawking Power (Luminosity): P = (hbar * c^6) / (15360 * pi * G^2 * M^2) [Watts]
  const hawkingPowerWatts = (H_BAR * Math.pow(C, 6)) / (15360 * Math.PI * Math.pow(G, 2) * Math.pow(massKg, 2));

  return {
    mGeom,
    r_s,
    r_plus,
    r_minus,
    r_ergosphere_equator,
    r_photon,
    r_isco_prograde,
    b_crit,
    hawkingTemp,
    entropy,
    evapTimeSeconds,
    hawkingPowerWatts,
    horizonArea,
  };
}

/**
 * Calculates gravitational time dilation factor: dtau / dt = sqrt(1 - r_s / r)
 */
export function calculateTimeDilation(r_over_rs: number): {
  dilationFactor: number;
  timeDelayRatio: number;
  redshiftZ: number;
} {
  if (r_over_rs <= 1.0000001) {
    return {
      dilationFactor: 0,
      timeDelayRatio: Infinity,
      redshiftZ: Infinity,
    };
  }
  const factor = Math.sqrt(1 - 1 / r_over_rs);
  const redshiftZ = (1 / factor) - 1;
  return {
    dilationFactor: factor, // probe clock speed relative to coordinate clock
    timeDelayRatio: 1 / factor, // how many coordinate seconds pass for 1 probe second
    redshiftZ,
  };
}

/**
 * Differential tidal acceleration across a 1.8-meter human body:
 * Delta a_tidal = (2 * G * M / r^3) * Delta h
 */
export function calculateTidalAcceleration(massKg: number, radiusMeters: number, bodyHeightMeters = 1.8): number {
  if (radiusMeters <= 0) return Infinity;
  return (2 * G * massKg * bodyHeightMeters) / Math.pow(radiusMeters, 3);
}

/**
 * Format numbers cleanly with scientific notation when needed
 */
export function formatScientific(num: number, digits = 2): string {
  if (!isFinite(num)) return '∞';
  if (num === 0) return '0';
  const abs = Math.abs(num);
  if (abs >= 0.01 && abs < 10000) {
    return num.toLocaleString('it-IT', { maximumFractionDigits: digits, minimumFractionDigits: digits });
  }
  const exp = num.toExponential(digits);
  const [mantissa, exponent] = exp.split('e');
  return `${mantissa} × 10^{${parseInt(exponent, 10)}}`;
}

/**
 * Format human duration (years, days, etc.)
 */
export function formatTimeSpan(seconds: number): string {
  if (!isFinite(seconds)) return 'Infinito (orizzonte)';
  if (seconds < 1e-6) return `${(seconds * 1e9).toFixed(2)} ns`;
  if (seconds < 1e-3) return `${(seconds * 1e6).toFixed(2)} µs`;
  if (seconds < 1) return `${(seconds * 1e3).toFixed(2)} ms`;
  if (seconds < 60) return `${seconds.toFixed(2)} secondi`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minuti`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} ore`;
  if (seconds < 31557600) return `${(seconds / 86400).toFixed(1)} giorni`;
  
  const years = seconds / 31557600;
  if (years < 1000) return `${years.toFixed(1)} anni`;
  if (years < 1e6) return `${(years / 1000).toFixed(1)} millenni`;
  const exp = years.toExponential(2);
  const [m, e] = exp.split('e');
  return `${m} × 10^{${parseInt(e, 10)}} anni`;
}
