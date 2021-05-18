/**
 * Color harmony rules — defines the angular relationships
 * on the color wheel for each harmony type.
 */

import { HarmonyType } from './types';

/**
 * Each harmony rule returns an array of hue offsets (in degrees)
 * to apply to a base hue. The base hue (0 offset) is always included.
 */
export interface HarmonyRule {
  name: HarmonyType;
  description: string;
  /** Returns hue offsets (degrees) relative to the base hue. Includes 0. */
  offsets: (count?: number) => number[];
}

/** Monochromatic: same hue, vary lightness. Returns [0] for hue (lightness varies separately). */
const monochromatic: HarmonyRule = {
  name: 'monochromatic',
  description: 'Single hue with variations in saturation and lightness',
  offsets: (count = 5) => {
    // All offsets are 0 since we only vary lightness, not hue
    return Array.from({ length: count }, () => 0);
  },
};

/** Analogous: hues adjacent on the wheel (typically 30 degrees apart) */
const analogous: HarmonyRule = {
  name: 'analogous',
  description: 'Colors adjacent on the color wheel (30 degree intervals)',
  offsets: (count = 5) => {
    const step = 30;
    const half = Math.floor(count / 2);
    return Array.from({ length: count }, (_, i) => (i - half) * step);
  },
};

/** Complementary: opposite on the wheel (180 degrees) */
const complementary: HarmonyRule = {
  name: 'complementary',
  description: 'Base color and its opposite on the color wheel',
  offsets: () => [0, 180],
};

/** Triadic: three colors evenly spaced (120 degrees apart) */
const triadic: HarmonyRule = {
  name: 'triadic',
  description: 'Three colors evenly spaced on the color wheel',
  offsets: () => [0, 120, 240],
};

/** Tetradic (rectangular): four colors forming a rectangle on the wheel */
const tetradic: HarmonyRule = {
  name: 'tetradic',
  description: 'Four colors forming a rectangle on the color wheel',
  offsets: () => [0, 60, 180, 240],
};

/** Split-complementary: base + two colors adjacent to its complement */
const splitComplementary: HarmonyRule = {
  name: 'split-complementary',
  description: 'Base color plus two colors adjacent to its complement',
  offsets: () => [0, 150, 210],
};

/** Map of all harmony rules */
export const harmonyRules: Record<HarmonyType, HarmonyRule> = {
  monochromatic,
  analogous,
  complementary,
  triadic,
  tetradic,
  'split-complementary': splitComplementary,
};

/** Get a harmony rule by type */
export function getHarmonyRule(type: HarmonyType): HarmonyRule {
  const rule = harmonyRules[type];
  if (!rule) {
    throw new Error(`Unknown harmony type: ${type}`);
  }
  return rule;
}

/** List all available harmony types */
export function listHarmonyTypes(): HarmonyType[] {
  return Object.keys(harmonyRules) as HarmonyType[];
}
