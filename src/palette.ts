/**
 * Palette generation: monochromatic, analogous, complementary,
 * triadic, tetradic, split-complementary
 */

import { Color } from './color';
import { HarmonyType, Palette } from './types';
import { getHarmonyRule } from './harmony';
import { normalizeHue, clamp } from './utils';

/**
 * Generate a color palette based on a harmony type and a base color.
 *
 * @param baseHex - Base color in hex format
 * @param harmony - Harmony type to use
 * @param count - Number of colors for variable-count harmonies (monochromatic, analogous)
 * @returns A Palette object containing the generated hex colors
 */
export function generatePalette(
  baseHex: string,
  harmony: HarmonyType,
  count: number = 5
): Palette {
  const base = Color.fromHex(baseHex);
  const rule = getHarmonyRule(harmony);
  const offsets = rule.offsets(count);

  let colors: string[];

  if (harmony === 'monochromatic') {
    colors = generateMonochromatic(base, count);
  } else {
    colors = offsets.map((offset) => {
      const rotated = base.rotateHue(offset);
      return rotated.hex;
    });
  }

  return {
    name: `${harmony} palette from ${baseHex}`,
    harmony,
    baseColor: baseHex,
    colors,
  };
}

/**
 * Generate a monochromatic palette by varying lightness around the base.
 */
function generateMonochromatic(base: Color, count: number): string[] {
  const hsl = base.hsl;
  const colors: string[] = [];

  // Distribute lightness values evenly from dark to light
  const minL = Math.max(10, hsl.l - 35);
  const maxL = Math.min(95, hsl.l + 35);
  const step = count > 1 ? (maxL - minL) / (count - 1) : 0;

  for (let i = 0; i < count; i++) {
    const l = clamp(Math.round(minL + step * i), 0, 100);
    colors.push(Color.fromHsl(hsl.h, hsl.s, l).hex);
  }

  return colors;
}

/**
 * Generate a palette with custom hue offsets.
 */
export function generateCustomPalette(
  baseHex: string,
  hueOffsets: number[]
): string[] {
  const base = Color.fromHex(baseHex);
  return hueOffsets.map((offset) => base.rotateHue(offset).hex);
}

/**
 * Generate a gradient between two colors with a given number of steps.
 */
export function generateGradient(
  startHex: string,
  endHex: string,
  steps: number = 5
): string[] {
  const start = Color.fromHex(startHex);
  const end = Color.fromHex(endHex);
  const colors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0.5 : i / (steps - 1);
    colors.push(start.mix(end, t).hex);
  }

  return colors;
}

/**
 * Generate all harmony palettes for a given base color.
 * Useful for previewing all harmony types at once.
 */
export function generateAllHarmonies(baseHex: string): Palette[] {
  const types: HarmonyType[] = [
    'monochromatic',
    'analogous',
    'complementary',
    'triadic',
    'tetradic',
    'split-complementary',
  ];
  return types.map((type) => generatePalette(baseHex, type));
}

/**
 * Generate a palette of N evenly-spaced hues around the color wheel,
 * maintaining the same saturation and lightness as the base.
 */
export function generateRainbow(baseHex: string, count: number = 12): string[] {
  const base = Color.fromHex(baseHex);
  const hsl = base.hsl;
  const step = 360 / count;
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const hue = normalizeHue(hsl.h + step * i);
    colors.push(Color.fromHsl(hue, hsl.s, hsl.l).hex);
  }

  return colors;
}
