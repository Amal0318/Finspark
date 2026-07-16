---
name: Sentinel Elite
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#504532'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#827560'
  outline-variant: '#d4c5ac'
  surface-tint: '#7a5900'
  primary: '#7a5900'
  on-primary: '#ffffff'
  primary-container: '#febe10'
  on-primary-container: '#6c4f00'
  inverse-primary: '#fcbc0b'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#c8c8c8'
  on-tertiary-container: '#525454'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdea1'
  primary-fixed-dim: '#fcbc0b'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  metric-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  metric-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is engineered for luxury enterprise banking, where mission-critical precision meets an ultra-premium aesthetic. The brand personality is authoritative, secure, and sophisticated, designed to instill absolute confidence in high-net-worth institutional users.

The visual style is **Corporate / Modern** with a high-end editorial influence. It utilizes a stark, high-contrast palette—deep blacks and pure whites—punctuated by a prestigious gold accent. The interface prioritizes clarity and "breathing room," using generous whitespace to signal exclusivity and reduce cognitive load during complex financial operations. Every interaction should feel intentional, weighted, and frictionless, avoiding any "playful" or "game-like" flourishes in favor of a clean, architectural rigor.

## Colors

The palette is anchored by **Night Black** and **Pure White**, creating a high-contrast foundation that mirrors executive stationery and premium physical banking environments.

- **Real Madrid Gold (#FEBE10)**: Used exclusively as a precision tool for primary actions, focus states, and highlighting key financial health indicators.
- **Surface Strategy**: The primary workspace is White (#FFFFFF), while the secondary background (#F2F2F2) is reserved for grouping content or defining subtle background regions. The Sidebar is strictly Night Black (#1A1A1A) to provide a structural "anchor" to the application.
- **Typography Tiers**: Near Black for maximum legibility on headers; Medium Grey for metadata and secondary labels to maintain hierarchy without clutter.

## Typography

This system uses **Inter** for its systematic, utilitarian clarity. The hierarchy is divided into three distinct functional categories:

1.  **Metrics**: Extra Bold weight used for currency amounts and primary data points. These are the most important elements on any financial dashboard.
2.  **Headings**: Bold weight, utilizing slightly tighter letter-spacing at larger sizes to maintain a "locked-in" professional feel.
3.  **UI & Body**: Regular for long-form data; Medium for UI labels and button text to ensure legibility against high-contrast backgrounds.

For mobile devices, `metric-xl` and `headline-lg` should scale down by 25% to fit narrower viewports while maintaining their relative visual weight.

## Layout & Spacing

The design system operates on a strict **8px grid**, ensuring all components and containers are mathematically harmonized. 

- **Desktop Layout**: Utilizes a 12-column fluid grid for the main content area, anchored by a fixed 280px sidebar in Night Black. 
- **Spacing Rhythm**: Generous use of `xl` (32px) and `2xl` (48px) spacing between major sections to prevent data density from feeling overwhelming.
- **Density**: While the overall feel is spacious, data tables should utilize a "Compact" 8px vertical padding to ensure maximum information visibility without scrolling, while the cards containing those tables use 24px internal padding.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Shadows**. 

- **Base Layer**: Secondary Background (#F2F2F2).
- **Component Layer**: Cards and containers use Pure White (#FFFFFF) to pop against the grey background.
- **Shadow Profile**: Shadows must be extremely subtle. Use a large blur radius (24px - 32px) with very low opacity (4-6%) using a neutral tint to avoid "dirty" looking shadows. 
- **Interactive Depth**: Primary buttons and active cards may use a slightly more pronounced shadow on hover to simulate physical elevation, but must never feel "neomorphic" or "squishy."

## Shapes

The shape language is defined by **Large Rounded Corners (16px)** for all primary containers and cards. This softens the high-contrast professional aesthetic, making the enterprise environment feel modern and accessible rather than archaic.

- **Small Components**: Inputs, buttons, and chips use a `rounded-md` (8px) radius to maintain a precise, functional look.
- **Structural Elements**: The main application sidebar and large dashboard cards use the signature `rounded-xl` (16px) radius.

## Components

### Buttons
- **Primary**: Real Madrid Gold (#FEBE10) background with Night Black (#1A1A1A) text. 8px corner radius.
- **Secondary**: Night Black background with White text for high-importance alternative actions.
- **Ghost**: Transparent background with a thin #E8E8E8 border, intended for low-priority actions.

### Input Fields
Clean, 1px #E8E8E8 border that transitions to #FEBE10 on focus. Background is always Pure White. Labels are positioned above the field in `label-sm` Medium Grey.

### Cards
White background, 16px corner radius, and a 1px #ECECEC border. Used to group metrics, charts, and transaction lists. Shadows are only applied to the "Base" cards, not nested ones.

### Chips & Status Indicators
Small, 4px rounded components. Semantic statuses (Success, Warning, Critical) should use a light tinted background with high-contrast text of the same hue for maximum readability and a premium feel (e.g., Success: 10% opacity green background with 100% opacity green text).

### Navigation
Sidebar items in the Night Black area use a Medium Grey text that transitions to White on hover. The active state is indicated by a vertical Gold bar on the far left edge and White text.