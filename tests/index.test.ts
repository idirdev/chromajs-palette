import { describe, it, expect } from 'vitest';
import { Color } from '../src/color';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  clamp,
  lerp,
  relativeLuminance,
  contrastRatio,
  normalizeHue,
} from '../src/utils';
import { getHarmonyRule, listHarmonyTypes, harmonyRules } from '../src/harmony';
import {
  checkContrast,
  meetsWCAG,
  findAccessiblePairs,
  suggestAccessibleForeground,
} from '../src/accessibility';

describe('utils - clamp', () => {
  it('clamps value below min', () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('clamps value above max', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('returns value when within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
});

describe('utils - lerp', () => {
  it('returns a at t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns b at t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint at t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });
});

describe('utils - hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses 3-digit shorthand hex', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses without hash prefix', () => {
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('throws on invalid hex', () => {
    expect(() => hexToRgb('#xyz')).toThrow();
  });
});

describe('utils - rgbToHex', () => {
  it('converts pure red', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
  });

  it('converts black', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('converts white', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
  });
});

describe('utils - rgbToHsl and hslToRgb', () => {
  it('converts pure red to HSL', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 });
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('round-trips RGB -> HSL -> RGB', () => {
    const original = { r: 100, g: 150, b: 200 };
    const hsl = rgbToHsl(original);
    const back = hslToRgb(hsl);
    expect(back.r).toBeCloseTo(original.r, 0);
    expect(back.g).toBeCloseTo(original.g, 0);
    expect(back.b).toBeCloseTo(original.b, 0);
  });

  it('converts gray (no saturation)', () => {
    const hsl = rgbToHsl({ r: 128, g: 128, b: 128 });
    expect(hsl.s).toBe(0);
  });
});

describe('utils - relativeLuminance', () => {
  it('black has luminance 0', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0);
  });

  it('white has luminance 1', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1);
  });
});

describe('utils - contrastRatio', () => {
  it('black vs white has max contrast (21:1)', () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('same color has contrast 1:1', () => {
    const ratio = contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
    expect(ratio).toBeCloseTo(1);
  });
});

describe('utils - normalizeHue', () => {
  it('normalizes negative hues', () => {
    expect(normalizeHue(-30)).toBe(330);
  });

  it('normalizes hues > 360', () => {
    expect(normalizeHue(400)).toBe(40);
  });

  it('keeps hues in range', () => {
    expect(normalizeHue(180)).toBe(180);
  });
});

describe('Color class', () => {
  it('creates from hex', () => {
    const c = Color.fromHex('#ff0000');
    expect(c.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(c.hex).toBe('#ff0000');
  });

  it('creates from RGB values', () => {
    const c = Color.fromRgb(0, 255, 0);
    expect(c.hex).toBe('#00ff00');
  });

  it('creates from HSL values', () => {
    const c = Color.fromHsl(0, 100, 50);
    expect(c.rgb.r).toBe(255);
    expect(c.rgb.g).toBe(0);
    expect(c.rgb.b).toBe(0);
  });

  it('parses hex string', () => {
    const c = Color.parse('#0000ff');
    expect(c.rgb).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('parses rgb() string', () => {
    const c = Color.parse('rgb(100, 200, 50)');
    expect(c.rgb).toEqual({ r: 100, g: 200, b: 50 });
  });

  it('parses hsl() string', () => {
    const c = Color.parse('hsl(0, 100, 50)');
    expect(c.rgb.r).toBe(255);
  });

  it('throws on unparseable input', () => {
    expect(() => Color.parse('not-a-color')).toThrow('Cannot parse color');
  });

  it('lighten increases lightness', () => {
    const c = Color.fromHex('#800000');
    const lighter = c.lighten(20);
    expect(lighter.hsl.l).toBeGreaterThan(c.hsl.l);
  });

  it('darken decreases lightness', () => {
    const c = Color.fromHex('#ff8080');
    const darker = c.darken(20);
    expect(darker.hsl.l).toBeLessThan(c.hsl.l);
  });

  it('rotateHue rotates the hue', () => {
    const c = Color.fromHsl(0, 100, 50);
    const rotated = c.rotateHue(120);
    expect(rotated.hsl.h).toBeCloseTo(120, 0);
  });

  it('invert returns the complementary color', () => {
    const c = Color.fromRgb(255, 0, 0);
    const inv = c.invert();
    expect(inv.rgb).toEqual({ r: 0, g: 255, b: 255 });
  });

  it('isLight detects light colors', () => {
    expect(Color.fromHex('#ffffff').isLight()).toBe(true);
    expect(Color.fromHex('#000000').isLight()).toBe(false);
  });

  it('isDark detects dark colors', () => {
    expect(Color.fromHex('#000000').isDark()).toBe(true);
    expect(Color.fromHex('#ffffff').isDark()).toBe(false);
  });

  it('mix blends two colors', () => {
    const white = Color.fromHex('#ffffff');
    const black = Color.fromHex('#000000');
    const gray = white.mix(black, 0.5);
    expect(gray.rgb.r).toBeCloseTo(128, 0);
    expect(gray.rgb.g).toBeCloseTo(128, 0);
    expect(gray.rgb.b).toBeCloseTo(128, 0);
  });

  it('contrastRatio computes contrast against another color', () => {
    const white = Color.fromHex('#ffffff');
    const black = Color.fromHex('#000000');
    expect(white.contrastRatio(black)).toBeCloseTo(21, 0);
  });

  it('toString returns hex', () => {
    const c = Color.fromHex('#abcdef');
    expect(c.toString()).toBe('#abcdef');
  });

  it('alpha returns an rgba string', () => {
    const c = Color.fromRgb(255, 0, 0);
    expect(c.alpha(0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });
});

describe('Harmony rules', () => {
  it('listHarmonyTypes returns all harmony types', () => {
    const types = listHarmonyTypes();
    expect(types).toContain('complementary');
    expect(types).toContain('triadic');
    expect(types).toContain('analogous');
    expect(types).toContain('monochromatic');
    expect(types).toContain('tetradic');
    expect(types).toContain('split-complementary');
  });

  it('complementary offsets are [0, 180]', () => {
    const rule = getHarmonyRule('complementary');
    expect(rule.offsets()).toEqual([0, 180]);
  });

  it('triadic offsets are [0, 120, 240]', () => {
    const rule = getHarmonyRule('triadic');
    expect(rule.offsets()).toEqual([0, 120, 240]);
  });

  it('tetradic offsets are [0, 60, 180, 240]', () => {
    const rule = getHarmonyRule('tetradic');
    expect(rule.offsets()).toEqual([0, 60, 180, 240]);
  });

  it('split-complementary offsets are [0, 150, 210]', () => {
    const rule = getHarmonyRule('split-complementary');
    expect(rule.offsets()).toEqual([0, 150, 210]);
  });

  it('analogous generates offsets based on count', () => {
    const rule = getHarmonyRule('analogous');
    const offsets = rule.offsets(3);
    expect(offsets).toHaveLength(3);
    // For count=3, half=1, so offsets are (-30, 0, 30)
    expect(offsets).toEqual([-30, 0, 30]);
  });

  it('throws for unknown harmony type', () => {
    expect(() => getHarmonyRule('nonexistent' as any)).toThrow('Unknown harmony type');
  });
});

describe('Accessibility - checkContrast', () => {
  it('black on white passes all WCAG levels', () => {
    const result = checkContrast('#000000', '#ffffff');
    expect(result.ratio).toBeCloseTo(21, 0);
    expect(result.AA.normal).toBe(true);
    expect(result.AA.large).toBe(true);
    expect(result.AAA.normal).toBe(true);
    expect(result.AAA.large).toBe(true);
  });

  it('similar colors fail all WCAG levels', () => {
    const result = checkContrast('#cccccc', '#dddddd');
    expect(result.AA.normal).toBe(false);
    expect(result.AAA.normal).toBe(false);
  });
});

describe('Accessibility - meetsWCAG', () => {
  it('returns true for black on white at AA', () => {
    expect(meetsWCAG('#000000', '#ffffff', 'AA')).toBe(true);
  });

  it('returns false for low contrast at AAA', () => {
    expect(meetsWCAG('#888888', '#ffffff', 'AAA')).toBe(false);
  });
});

describe('Accessibility - findAccessiblePairs', () => {
  it('finds accessible pairs from a list of colors', () => {
    const colors = ['#000000', '#ffffff', '#ff0000'];
    const pairs = findAccessiblePairs(colors, 'AA');
    expect(pairs.length).toBeGreaterThan(0);
    // Black and white should definitely be a pair
    const bwPair = pairs.find(
      (p) => (p.foreground === '#000000' && p.background === '#ffffff') ||
             (p.foreground === '#ffffff' && p.background === '#000000')
    );
    expect(bwPair).toBeDefined();
  });

  it('returns pairs sorted by contrast ratio descending', () => {
    const colors = ['#000000', '#ffffff', '#888888'];
    const pairs = findAccessiblePairs(colors, 'AA');
    for (let i = 1; i < pairs.length; i++) {
      expect(pairs[i - 1].contrastRatio).toBeGreaterThanOrEqual(pairs[i].contrastRatio);
    }
  });
});

describe('Accessibility - suggestAccessibleForeground', () => {
  it('suggests black or white for a background without base color', () => {
    const fg = suggestAccessibleForeground('#ffffff');
    // On white background, black provides more contrast
    expect(fg).toBe('#000000');
  });

  it('suggests black for light backgrounds', () => {
    const fg = suggestAccessibleForeground('#eeeeee');
    expect(fg).toBe('#000000');
  });

  it('suggests white for dark backgrounds', () => {
    const fg = suggestAccessibleForeground('#111111');
    expect(fg).toBe('#ffffff');
  });
});
