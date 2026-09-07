/**
 * Shared chemistry constants for 3D molecule visualization.
 * Extracted from MoleculeViewer.tsx and MoleculeQuizViewer.tsx to eliminate duplication.
 * These are stable, module-level constants — safe to import anywhere.
 */
import * as THREE from 'three';

// ─── CPK Element Colors (ball-and-stick / space-filling) ─────────────────────
export const ELEMENT_COLORS: Record<string, string> = {
  H: '#ffffff', C: '#2b2b2b', O: '#ff3b30', N: '#2d6cff',
  S: '#ffcc00', P: '#ff9500', Cl: '#34c759', F: '#5ac8fa',
  Br: '#a3331f', I: '#6a0dad', Na: '#ab5cf2', Fe: '#e06633',
};

// ─── Van der Waals Radii (Å) — for Space Fill mode ──────────────────────────
export const ELEMENT_RADII_VDW: Record<string, number> = {
  H: 1.2, C: 1.7, O: 1.52, N: 1.55, S: 1.8, P: 1.8,
  Cl: 1.75, F: 1.47, Br: 1.85, I: 1.98, Na: 2.27, Fe: 2.0,
};

// ─── Ball-and-Stick Radii (scene units) — scaled for visual clarity ───────────
export const BALL_RADII: Record<string, number> = {
  H: 0.32, C: 0.45, O: 0.42, N: 0.43, S: 0.55, P: 0.55,
  Cl: 0.55, F: 0.4, Br: 0.6, I: 0.62, Na: 0.6, Fe: 0.55,
};

// ─── UI Colors ────────────────────────────────────────────────────────────────
export const HIGHLIGHT_COLOR = '#ffcc00';
export const CORRECT_COLOR = '#22c55e';
export const INCORRECT_COLOR = '#ef4444';
export const SELECTED_COLOR = '#ffcc00';
export const BOND_COLOR = '#9aa3b2';

// ─── bondTransform ────────────────────────────────────────────────────────────
/** Computes length, midpoint, and quaternion rotation for a bond cylinder.
 *  Stable, pure function — safe to call at module level or inside renders. */
export function bondTransform(a: [number, number, number], b: [number, number, number]) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return { len, mid, quat };
}
