/**
 * WCAG accessibility: contrast checking (AA/AAA) and accessible pair suggestions
 */

import { Color } from './color';
import { ContrastResult, AccessiblePair, WCAGLevel, TextSize } from './types';
import { contrastRatio, hexToRgb } from './utils';

/**
 * WCAG 2.1 minimum contrast ratio thresholds:
 * - AA normal text: 4.5:1
 * - AA large text:  3:1
 * - AAA normal text: 7:1
 * - AAA large text:  4.5:1
 */
const THRESHOLDS = {
  AA: { normal: 4.5, large: 3.0 },
  AAA: { normal: 7.0, large: 4.5 },
} as const;

/**
 * Check the WCAG contrast between two colors.
 * Returns the ratio and pass/fail status for all AA/AAA and normal/large combinations.
 */
export function checkContrast(foregroundHex: string, backgroundHex: string): ContrastResult {
  const fg = hexToRgb(foregroundHex);
  const bg = hexToRgb(backgroundHex);
  const ratio = contrastRatio(fg, bg);

  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: {
      normal: ratio >= THRESHOLDS.AA.normal,
      large: ratio >= THRESHOLDS.AA.large,
    },
    AAA: {
      normal: ratio >= THRESHOLDS.AAA.normal,
      large: ratio >= THRESHOLDS.AAA.large,
    },
  };
}

/**
 * Check if a foreground/background pair meets a specific WCAG level and text size.
 */
export function meetsWCAG(
  foregroundHex: string,
  backgroundHex: string,
  level: WCAGLevel = 'AA',
  textSize: TextSize = 'normal'
): boolean {
  const fg = hexToRgb(foregroundHex);
  const bg = hexToRgb(backgroundHex);
  const ratio = contrastRatio(fg, bg);
  return ratio >= THRESHOLDS[level][textSize];
}

/**
 * Given a list of candidate colors, find all pairs that meet the specified WCAG level.
 * Returns pairs sorted by contrast ratio (highest first).
 */
export function findAccessiblePairs(
  colors: string[],
  level: WCAGLevel = 'AA',
  textSize: TextSize = 'normal'
): AccessiblePair[] {
  const pairs: AccessiblePair[] = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const fg = hexToRgb(colors[i]);
      const bg = hexToRgb(colors[j]);
      const ratio = contrastRatio(fg, bg);

      const passesAA =
        ratio >= THRESHOLDS.AA[textSize];
      const passesAAA =
        ratio >= THRESHOLDS.AAA[textSize];

      if (
        (level === 'AA' && passesAA) ||
        (level === 'AAA' && passesAAA)
      ) {
        pairs.push({
          foreground: colors[i],
          background: colors[j],
          contrastRatio: Math.round(ratio * 100) / 100,
          passesAA,
          passesAAA,
        });

        // Also add the reverse pair
        pairs.push({
          foreground: colors[j],
          background: colors[i],
          contrastRatio: Math.round(ratio * 100) / 100,
          passesAA,
          passesAAA,
        });
      }
    }
  }

  return pairs.sort((a, b) => b.contrastRatio - a.contrastRatio);
}

/**
 * Suggest an accessible foreground color for a given background.
 * Tries to find the best contrast by adjusting lightness of the base color.
 * Falls back to black or white if needed.
 */
export function suggestAccessibleForeground(
  backgroundHex: string,
  baseHex?: string,
  level: WCAGLevel = 'AA'
): string {
  const bg = Color.fromHex(backgroundHex);
  const threshold = THRESHOLDS[level].normal;

  // If no base color, simply choose black or white
  if (!baseHex) {
    const whiteRatio = bg.contrastRatio(Color.fromHex('#ffffff'));
    const blackRatio = bg.contrastRatio(Color.fromHex('#000000'));
    return whiteRatio >= blackRatio ? '#ffffff' : '#000000';
  }

  // Try adjusting lightness of the base color
  const base = Color.fromHex(baseHex);

  // Try darkening first, then lightening
  for (let amount = 0; amount <= 100; amount += 5) {
    const darkened = base.darken(amount);
    if (darkened.contrastRatio(bg) >= threshold) {
      return darkened.hex;
    }

    const lightened = base.lighten(amount);
    if (lightened.contrastRatio(bg) >= threshold) {
      return lightened.hex;
    }
  }

  // Fallback to black or white
  const whiteRatio = bg.contrastRatio(Color.fromHex('#ffffff'));
  const blackRatio = bg.contrastRatio(Color.fromHex('#000000'));
  return whiteRatio >= blackRatio ? '#ffffff' : '#000000';
}

/**
 * Generate an accessibility report for a palette of colors.
 * Tests every pair and returns a summary.
 */
export function accessibilityReport(colors: string[]): {
  totalPairs: number;
  passingAA: number;
  passingAAA: number;
  failingAll: number;
  pairs: Array<{
    fg: string;
    bg: string;
    ratio: number;
    aa: boolean;
    aaa: boolean;
  }>;
} {
  const pairs: Array<{
    fg: string;
    bg: string;
    ratio: number;
    aa: boolean;
    aaa: boolean;
  }> = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < colors.length; j++) {
      if (i === j) continue;
      const fg = hexToRgb(colors[i]);
      const bg = hexToRgb(colors[j]);
      const ratio = Math.round(contrastRatio(fg, bg) * 100) / 100;
      pairs.push({
        fg: colors[i],
        bg: colors[j],
        ratio,
        aa: ratio >= THRESHOLDS.AA.normal,
        aaa: ratio >= THRESHOLDS.AAA.normal,
      });
    }
  }

  return {
    totalPairs: pairs.length,
    passingAA: pairs.filter((p) => p.aa).length,
    passingAAA: pairs.filter((p) => p.aaa).length,
    failingAll: pairs.filter((p) => !p.aa).length,
    pairs,
  };
}
