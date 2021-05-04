/**
 * Core types for the chromajs-palette package
 */

/** RGB color representation (0-255 per channel) */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** HSL color representation (h: 0-360, s: 0-100, l: 0-100) */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

/** RGBA color with alpha channel (0-1) */
export interface RGBA extends RGB {
  a: number;
}

/** WCAG conformance levels */
export type WCAGLevel = 'AA' | 'AAA';

/** Text size context for WCAG checks */
export type TextSize = 'normal' | 'large';

/** Result of a WCAG contrast check */
export interface ContrastResult {
  ratio: number;
  AA: { normal: boolean; large: boolean };
  AAA: { normal: boolean; large: boolean };
}

/** An accessible color pair suggestion */
export interface AccessiblePair {
  foreground: string;
  background: string;
  contrastRatio: number;
  passesAA: boolean;
  passesAAA: boolean;
}

/** Palette generation strategy */
export type HarmonyType =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary';

/** A generated palette */
export interface Palette {
  name: string;
  harmony: HarmonyType;
  baseColor: string;
  colors: string[];
}
