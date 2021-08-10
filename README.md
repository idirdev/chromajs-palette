# 🎨 ChromaJS Palette

> Lab project — color palette exploration and accessibility contrast analysis.

A zero-dependency color palette generator for TypeScript. Parse and manipulate colors, generate harmonious palettes, and check WCAG accessibility compliance.

## Installation

```bash
npm install @idirdev/chromajs-palette
```

## Quick Start

```typescript
import { Color, generatePalette, checkContrast, suggestAccessibleForeground } from '@idirdev/chromajs-palette';

// Parse and manipulate colors
const teal = Color.fromHex('#2DD4A8');
console.log(teal.lighten(20).hex);        // lighter teal
console.log(teal.darken(15).hex);         // darker teal
console.log(teal.hsl);                    // { h: 163, s: 67, l: 50 }

// Generate palettes
const palette = generatePalette('#2DD4A8', 'triadic');
console.log(palette.colors);             // 3 triadic hex colors

// Check accessibility
const result = checkContrast('#2DD4A8', '#1a1a2e');
console.log(result.ratio);               // contrast ratio
console.log(result.AA.normal);           // true/false for AA normal text

// Suggest accessible foreground
const fg = suggestAccessibleForeground('#1a1a2e', '#2DD4A8');
console.log(fg);                          // accessible variant of teal on dark bg
```

## API Reference

### Color Class (`color.ts`)

| Method | Description |
|--------|-------------|
| `Color.fromHex(hex)` | Create from hex string |
| `Color.fromRgb(r, g, b)` | Create from RGB values |
| `Color.fromHsl(h, s, l)` | Create from HSL values |
| `Color.parse(str)` | Parse hex, `rgb()`, or `hsl()` strings |
| `.lighten(amount)` | Lighten by percentage (0-100) |
| `.darken(amount)` | Darken by percentage (0-100) |
| `.saturate(amount)` | Increase saturation |
| `.desaturate(amount)` | Decrease saturation |
| `.alpha(a)` | Get `rgba()` string with alpha |
| `.rotateHue(deg)` | Rotate hue on color wheel |
| `.contrastRatio(other)` | WCAG contrast ratio (1-21) |
| `.mix(other, ratio)` | Mix with another color |
| `.invert()` | Invert the color |
| `.isLight()` / `.isDark()` | Check perceived brightness |

### Palette Generation (`palette.ts`)

| Function | Description |
|----------|-------------|
| `generatePalette(hex, harmony, count?)` | Generate a harmony-based palette |
| `generateCustomPalette(hex, offsets)` | Custom hue offsets |
| `generateGradient(start, end, steps)` | Linear gradient between two colors |
| `generateAllHarmonies(hex)` | Preview all 6 harmony types |
| `generateRainbow(hex, count)` | Evenly-spaced hues around the wheel |

### Harmony Types

- **monochromatic** — same hue, varied lightness
- **analogous** — adjacent hues (30 degree steps)
- **complementary** — opposite on the wheel (180 degrees)
- **triadic** — three evenly spaced (120 degrees)
- **tetradic** — four colors in a rectangle
- **split-complementary** — base + neighbors of complement

### Accessibility (`accessibility.ts`)

| Function | Description |
|----------|-------------|
| `checkContrast(fg, bg)` | Full WCAG contrast check (AA/AAA, normal/large) |
| `meetsWCAG(fg, bg, level?, size?)` | Boolean check for specific level |
| `findAccessiblePairs(colors, level?)` | Find all accessible pairs from a set |
| `suggestAccessibleForeground(bg, base?, level?)` | Suggest accessible foreground |
| `accessibilityReport(colors)` | Full report for a palette |

### Utilities (`utils.ts`)

| Function | Description |
|----------|-------------|
| `hexToRgb(hex)` | Parse hex to RGB |
| `rgbToHex(rgb)` | Convert RGB to hex |
| `rgbToHsl(rgb)` | Convert RGB to HSL |
| `hslToRgb(hsl)` | Convert HSL to RGB |
| `relativeLuminance(rgb)` | WCAG relative luminance |
| `contrastRatio(a, b)` | Raw contrast ratio |
| `clamp(val, min, max)` | Clamp a number |
| `lerp(a, b, t)` | Linear interpolation |

## License

MIT

---

## Français

**ChromaJS Palette** est une bibliothèque TypeScript sans dépendance pour la génération de palettes de couleurs et l'analyse d'accessibilité. Elle permet d'analyser et de manipuler des couleurs, de générer des palettes harmonieuses (monochromatique, analogique, complémentaire, triadique, etc.) et de vérifier la conformité WCAG pour l'accessibilité des contrastes.

### Installation

```bash
npm install @idirdev/chromajs-palette
```

### Utilisation

```typescript
import { Color, generatePalette, checkContrast } from '@idirdev/chromajs-palette';

const couleur = Color.fromHex('#2DD4A8');
const palette = generatePalette('#2DD4A8', 'triadic');
const contraste = checkContrast('#2DD4A8', '#1a1a2e');
console.log(contraste.AA.normal); // true/false pour le texte normal AA
```

