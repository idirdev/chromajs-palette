/**
 * Color class: parse, convert, and manipulate colors
 */

import { RGB, HSL } from './types';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  clamp,
  contrastRatio as calcContrast,
} from './utils';

/**
 * Immutable Color class supporting hex, RGB, and HSL representations.
 * All manipulation methods return a new Color instance.
 */
export class Color {
  private readonly _rgb: RGB;

  private constructor(rgb: RGB) {
    this._rgb = {
      r: clamp(Math.round(rgb.r), 0, 255),
      g: clamp(Math.round(rgb.g), 0, 255),
      b: clamp(Math.round(rgb.b), 0, 255),
    };
  }

  /** Create a Color from a hex string (#RGB or #RRGGBB) */
  static fromHex(hex: string): Color {
    return new Color(hexToRgb(hex));
  }

  /** Create a Color from RGB values (0-255) */
  static fromRgb(r: number, g: number, b: number): Color {
    return new Color({ r, g, b });
  }

  /** Create a Color from HSL values (h: 0-360, s: 0-100, l: 0-100) */
  static fromHsl(h: number, s: number, l: number): Color {
    return new Color(hslToRgb({ h, s, l }));
  }

  /**
   * Parse a color from various formats:
   * - Hex: "#ff0000", "#f00"
   * - RGB: "rgb(255, 0, 0)"
   * - HSL: "hsl(0, 100%, 50%)"
   */
  static parse(input: string): Color {
    const trimmed = input.trim().toLowerCase();

    // Hex
    if (trimmed.startsWith('#')) {
      return Color.fromHex(trimmed);
    }

    // rgb(r, g, b)
    const rgbMatch = trimmed.match(
      /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/
    );
    if (rgbMatch) {
      return Color.fromRgb(
        parseInt(rgbMatch[1], 10),
        parseInt(rgbMatch[2], 10),
        parseInt(rgbMatch[3], 10)
      );
    }

    // hsl(h, s%, l%)
    const hslMatch = trimmed.match(
      /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*(?:,\s*[\d.]+\s*)?\)$/
    );
    if (hslMatch) {
      return Color.fromHsl(
        parseInt(hslMatch[1], 10),
        parseInt(hslMatch[2], 10),
        parseInt(hslMatch[3], 10)
      );
    }

    throw new Error(`Cannot parse color: "${input}"`);
  }

  /** Get RGB representation */
  get rgb(): RGB {
    return { ...this._rgb };
  }

  /** Get HSL representation */
  get hsl(): HSL {
    return rgbToHsl(this._rgb);
  }

  /** Get hex string representation */
  get hex(): string {
    return rgbToHex(this._rgb);
  }

  /** Lighten the color by a percentage (0-100) */
  lighten(amount: number): Color {
    const hsl = this.hsl;
    hsl.l = clamp(hsl.l + amount, 0, 100);
    return new Color(hslToRgb(hsl));
  }

  /** Darken the color by a percentage (0-100) */
  darken(amount: number): Color {
    return this.lighten(-amount);
  }

  /** Increase saturation by a percentage (0-100) */
  saturate(amount: number): Color {
    const hsl = this.hsl;
    hsl.s = clamp(hsl.s + amount, 0, 100);
    return new Color(hslToRgb(hsl));
  }

  /** Decrease saturation by a percentage (0-100) */
  desaturate(amount: number): Color {
    return this.saturate(-amount);
  }

  /** Set the alpha/opacity (0-1). Returns a CSS rgba() string. */
  alpha(a: number): string {
    const clamped = clamp(a, 0, 1);
    return `rgba(${this._rgb.r}, ${this._rgb.g}, ${this._rgb.b}, ${clamped})`;
  }

  /** Rotate the hue by a number of degrees */
  rotateHue(degrees: number): Color {
    const hsl = this.hsl;
    hsl.h = ((hsl.h + degrees) % 360 + 360) % 360;
    return new Color(hslToRgb(hsl));
  }

  /** Calculate contrast ratio against another color (1-21) */
  contrastRatio(other: Color): number {
    return calcContrast(this._rgb, other._rgb);
  }

  /** Mix this color with another by a given ratio (0 = this, 1 = other) */
  mix(other: Color, ratio: number = 0.5): Color {
    const t = clamp(ratio, 0, 1);
    return new Color({
      r: this._rgb.r + (other._rgb.r - this._rgb.r) * t,
      g: this._rgb.g + (other._rgb.g - this._rgb.g) * t,
      b: this._rgb.b + (other._rgb.b - this._rgb.b) * t,
    });
  }

  /** Get the grayscale equivalent */
  grayscale(): Color {
    return this.desaturate(100);
  }

  /** Invert the color */
  invert(): Color {
    return new Color({
      r: 255 - this._rgb.r,
      g: 255 - this._rgb.g,
      b: 255 - this._rgb.b,
    });
  }

  /** Check if the color is considered "light" (luminance > 0.5) */
  isLight(): boolean {
    const { r, g, b } = this._rgb;
    // Perceived brightness formula
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  }

  /** Check if the color is considered "dark" */
  isDark(): boolean {
    return !this.isLight();
  }

  /** String representation */
  toString(): string {
    return this.hex;
  }
}
