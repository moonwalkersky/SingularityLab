/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateBlackHoleProperties, calculateTimeDilation, calculateTidalAcceleration, G, C, M_SOLAR } from './physicsConstants';

/**
 * Triggers a browser download of a string content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: 'text/csv' | 'application/json') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Time Dilation & Redshift dataset across radial distance r/r_s
 */
export function generateTimeDilationData(massKg: number, emittedWavelengthNm = 460) {
  const mGeom = (G * massKg) / (C * C);
  const r_s = 2 * mGeom;

  // Discrete sampling points from close to horizon up to 25 r_s
  const rRatios: number[] = [
    1.002, 1.005, 1.01, 1.02, 1.05, 1.10, 1.20, 1.30, 1.40,
    1.50, // Photon sphere
    1.75, 2.00, 2.50,
    3.00, // ISCO
    3.50, 4.00, 5.00, 6.00, 8.00, 10.0, 15.0, 20.0, 25.0
  ];

  return rRatios.map((rRatio) => {
    const radiusMeters = rRatio * r_s;
    const { dilationFactor, timeDelayRatio, redshiftZ } = calculateTimeDilation(rRatio);
    const tidalAccelMs2 = calculateTidalAcceleration(massKg, radiusMeters, 1.8);
    const tidalG = tidalAccelMs2 / 9.80665;
    const obsWavelengthNm = isFinite(redshiftZ) ? emittedWavelengthNm * (1 + redshiftZ) : Infinity;

    return {
      ratio_r_over_rs: Number(rRatio.toFixed(3)),
      radius_km: Number((radiusMeters / 1000).toFixed(2)),
      proper_time_ratio_dtau_over_dt: Number(dilationFactor.toFixed(6)),
      time_delay_factor: isFinite(timeDelayRatio) ? Number(timeDelayRatio.toFixed(3)) : 'Infinity',
      gravitational_redshift_z: isFinite(redshiftZ) ? Number(redshiftZ.toFixed(4)) : 'Infinity',
      emitted_wavelength_nm: emittedWavelengthNm,
      observed_wavelength_nm: isFinite(obsWavelengthNm) ? Number(obsWavelengthNm.toFixed(1)) : 'Infinity',
      tidal_acceleration_ms2: Number(tidalAccelMs2.toExponential(4)),
      tidal_acceleration_g: Number(tidalG.toExponential(4)),
    };
  });
}

/**
 * Generate Geodesic Ray & Lensing deflection dataset
 */
export function generateGeodesicData(massKg: number) {
  const mGeom = (G * massKg) / (C * C);
  const r_s = 2 * mGeom;
  const b_crit_geom = 3 * Math.sqrt(3); // in M

  const impactParameters: number[] = [
    0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0,
    5.196, // b_crit
    5.25, 5.5, 6.0, 7.0, 8.0, 9.0, 10.0, 12.0, 15.0
  ];

  return impactParameters.map((b_over_M) => {
    const isCaptured = b_over_M < b_crit_geom;
    const isLooping = Math.abs(b_over_M - b_crit_geom) < 0.08;

    // Relativistic Einstein deflection angle for large b: ~ 4M / b
    // As b -> b_crit, deflection diverges logarithmically: -2 * ln(b/b_crit - 1)
    let defAngleRad = 0;
    let defAngleDeg = 0;
    let outcome = 'Deflected';

    if (isCaptured) {
      outcome = 'Captured (Horizon plunge)';
      defAngleRad = Infinity;
      defAngleDeg = Infinity;
    } else if (isLooping) {
      outcome = 'Multiple photon sphere orbit';
      defAngleRad = 2 * Math.PI;
      defAngleDeg = 360.0;
    } else {
      const u = b_over_M;
      // Weak to moderate field approximation
      const deltaRad = (4.0 / u) * (1 + (15 * Math.PI) / (16 * u));
      defAngleRad = deltaRad;
      defAngleDeg = (deltaRad * 180) / Math.PI;
    }

    // Newtonian deflection: 2M / b (half of Einstein's)
    const newtonianDeltaRad = isCaptured ? Infinity : 2.0 / b_over_M;
    const newtonianDeltaDeg = isCaptured ? Infinity : (newtonianDeltaRad * 180) / Math.PI;

    return {
      impact_parameter_b_over_M: b_over_M,
      impact_parameter_km: Number(((b_over_M * mGeom) / 1000).toFixed(2)),
      outcome,
      einstein_deflection_deg: isFinite(defAngleDeg) ? Number(defAngleDeg.toFixed(2)) : 'Infinity',
      einstein_deflection_rad: isFinite(defAngleRad) ? Number(defAngleRad.toFixed(4)) : 'Infinity',
      newton_deflection_deg: isFinite(newtonianDeltaDeg) ? Number(newtonianDeltaDeg.toFixed(2)) : 'Infinity',
      gr_excess_ratio: isFinite(defAngleDeg) && isFinite(newtonianDeltaDeg) ? Number((defAngleDeg / newtonianDeltaDeg).toFixed(2)) : 'N/A',
    };
  });
}

/**
 * Generate Complete Metric Properties Snapshot
 */
export function generateMetricSnapshot(massKg: number, spin: number, presetName: string) {
  const props = calculateBlackHoleProperties(massKg, spin);
  const massSolar = massKg / M_SOLAR;

  return {
    metadata: {
      generated_at: new Date().toISOString(),
      system: 'Singularity Lab - Relativistic Black Hole Engine',
      target_name: presetName,
    },
    parameters: {
      mass_solar: massSolar,
      mass_kg: massKg,
      dimensionless_spin_a_star: spin,
    },
    geometric_radii_meters: {
      geometrized_mass_m: props.mGeom,
      schwarzschild_radius_rs: props.r_s,
      kerr_outer_event_horizon_r_plus: props.r_plus,
      kerr_inner_cauchy_horizon_r_minus: props.r_minus,
      ergosphere_equatorial_radius_re: props.r_ergosphere_equator,
      photon_sphere_radius_r_ph: props.r_photon,
      isco_prograde_radius_r_isco: props.r_isco_prograde,
      critical_impact_parameter_bc: props.b_crit,
      horizon_surface_area_m2: props.horizonArea,
    },
    thermodynamic_properties: {
      hawking_temperature_kelvin: props.hawkingTemp,
      evaporation_lifetime_seconds: props.evapTimeSeconds,
      evaporation_lifetime_years: props.evapTimeSeconds / 31557600,
      radiated_power_watts: props.hawkingPowerWatts,
      bekenstein_hawking_entropy_joules_per_kelvin: props.entropy,
    },
  };
}

/**
 * Helper to convert array of objects into standard CSV string
 */
export function objectsToCsv(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => {
    return headers
      .map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '';
        const stringVal = String(val);
        // Escape quotes
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      })
      .join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
