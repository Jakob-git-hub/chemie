/**
 * SMILES notation generator for molecules
 * Converts internal graph representation to SMILES string
 */

import type { BuildableAtom, BuildableBond } from './types';

interface AtomWithBonds {
  atom: BuildableAtom;
  bonds: { to: string; order: number }[];
}

/**
 * Generates a SMILES string from atoms and bonds
 * Uses depth-first search to traverse the molecular graph
 */
export function generateSmiles(atoms: BuildableAtom[], bonds: BuildableBond[]): string {
  if (atoms.length === 0) return '';

  // Build adjacency list
  const adjacency: Map<string, AtomWithBonds> = new Map();
  for (const atom of atoms) {
    adjacency.set(atom.id, { atom, bonds: [] });
  }
  for (const bond of bonds) {
    const fromNode = adjacency.get(bond.from);
    const toNode = adjacency.get(bond.to);
    if (fromNode && toNode) {
      fromNode.bonds.push({ to: bond.to, order: bond.order });
      toNode.bonds.push({ to: bond.from, order: bond.order });
    }
  }

  // Find starting atom (prefer C, then heteroatoms with fewer connections)
  let startAtom = atoms.find(a => a.element === 'C') ?? atoms[0];

  // Generate SMILES using DFS
  const visited = new Set<string>();
  const visitedBond = new Set<string>();
  const parts: string[] = [];

  function dfs(atomId: string, fromId: string | null, bondOrder: number | null): void {
    if (visited.has(atomId)) return;
    visited.add(atomId);

    const node = adjacency.get(atomId);
    if (!node) return;

    // Add atom symbol
    const symbol = node.atom.element;
    if (node.atom.charge !== 0) {
      parts.push(`[${symbol}${getChargeNotation(node.atom.charge)}]`);
    } else if (isOrganicSubset(symbol)) {
      parts.push(symbol);
    } else {
      parts.push(`[${symbol}]`);
    }

    // Sort neighbors: non-visited first, prefer ring closures
    const neighbors = node.bonds
      .filter(b => b.to !== fromId)
      .sort((a, b) => {
        if (visited.has(a.to) && !visited.has(b.to)) return 1;
        if (!visited.has(a.to) && visited.has(b.to)) return -1;
        return 0;
      });

    // Process unvisited neighbors
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.to)) {
        const bondSymbol = getBondSymbol(neighbor.order);
        parts.push(bondSymbol);
        dfs(neighbor.to, atomId, neighbor.order);
      }
    }
  }

  dfs(startAtom.id, null, null);

  return parts.join('');
}

/**
 * Checks if element is in the "organic subset" (can be written without brackets)
 */
function isOrganicSubset(element: string): boolean {
  return ['B', 'C', 'N', 'O', 'P', 'S', 'F', 'Cl', 'Br', 'I'].includes(element);
}

/**
 * Converts bond order to SMILES symbol
 */
function getBondSymbol(order: number): string {
  switch (order) {
    case 2: return '=';
    case 3: return '#';
    default: return '';
  }
}

/**
 * Generates charge notation for atoms
 */
function getChargeNotation(charge: number): string {
  if (charge === 0) return '';
  if (charge === 1) return '+';
  if (charge === -1) return '-';
  if (charge > 0) return `${charge}+`;
  if (charge < 0) return `${Math.abs(charge)}-`;
  return '';
}

/**
 * Validates a SMILES string (basic check)
 */
export function isValidSmiles(smiles: string): boolean {
  if (!smiles) return true; // Empty is valid (no atoms)

  let bracketCount = 0;
  for (const char of smiles) {
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
    if (bracketCount < 0) return false;
  }
  return bracketCount === 0;
}
