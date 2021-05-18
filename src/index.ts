/**
 * @idirdev/chromajs-palette
 * Color palette generator with accessibility checking and harmony rules.
 */

export { Color } from './color';

export {
  generatePalette,
  generateCustomPalette,
  generateGradient,
  generateAllHarmonies,
  generateRainbow,
} from './palette';

export {
  harmonyRules,
  getHarmonyRule,
  listHarmonyTypes,
} from './harmony';
export type { HarmonyRule } from './harmony';

export {
  checkContrast,
  meetsWCAG,
  findAccessiblePairs,
  suggestAccessibleForeground,
  accessibilityReport,
} from './accessibility';

export {
  clamp,
  lerp,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  relativeLuminance,
  contrastRatio,
  normalizeHue,
} from './utils';

export type {
  RGB,
  HSL,
  RGBA,
  WCAGLevel,
  TextSize,
  ContrastResult,
  AccessiblePair,
  HarmonyType,
  Palette,
} from './types';
