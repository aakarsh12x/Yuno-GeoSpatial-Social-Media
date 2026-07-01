---
name: Yuno
description: Location-based social network and live City Pulse intelligence layer
colors:
  primary: "#5d4037"
  accent: "#8b4513"
  neutral-bg: "#f8f6f0"
  surface: "#ffffff"
  text-primary: "#1a0f0a"
  text-secondary: "#3e2723"
  border-light: "#e0d7d0"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
---

# Design System: Yuno

## 1. Overview

**Creative North Star: "The Cartographer's Hearth"**

Yuno is a geospatial social network designed to evoke the feeling of a warm, tactile field notebook or a physical map spread across a wood-grain table. The interface rejects sterile, generic SaaS-cream and neon-glowing cyber-hues. Instead, it leans into rich, natural materials—deep leather tones, slate blacks, earthy off-whites, and amber highlights that pulse with live human activity.

The aesthetic balance lies between the classic elegance of physical travel instrumentation and the clean typography of modern product interfaces. Spacing is dense but highly structured, keeping information compact, legible, and immediately actionable for users navigating their city in real-time.

**Key Characteristics:**
- Earthy, high-contrast color scheme anchored in deep leather browns and warm neutrals.
- Tight information density suitable for mobile coordinates, map controls, and dense message lists.
- Micro-interactions that emphasize live city activity with pulsing orange amber tones.

## 2. Colors

The Yuno color palette uses organic browns, creams, and leather highlights to provide warmth, while maintaining strict high contrast for readability.

### Primary
- **Deep Sophisticated Brown** (#5d4037): The main brand anchor. Used for primary call-to-actions, navbar structures, and active elements.

### Secondary
- **Rich Leather Brown** (#8b4513): Accent color. Used for hover states, select indicators, and spark matching actions.
- **Pulsing Amber Orange** (#f97316): The City Pulse indicator. Strictly reserved for real-time live events and map pings.

### Neutral
- **Tactile Warm Cream** (#f8f6f0): The default page background. Evokes the feel of parchment or physical field notebooks.
- **Almost Black-Brown** (#1a0f0a): Primary ink. Ensures deep contrast against warm cream surfaces.
- **Dark Cocoa** (#3e2723): Secondary text for readability on card surfaces.
- **Soft Clay Border** (#e0d7d0): Default border for container outlines.

### Named Rules
**The Rarity of Pulse Rule.** Pulsing amber orange is exclusively used for live real-time activities. No other button, label, indicator, or border may use this hue. It is the signature of city activity.

**The Ink Contrast Rule.** Never use light gray or low-contrast text on cream/sand surfaces. Body text must always use Almost Black-Brown (#1a0f0a) or Dark Cocoa (#3e2723) to guarantee WCAG AA contrast.

## 3. Typography

**Display Font:** Inter, system-ui, sans-serif
**Body Font:** Inter, system-ui, sans-serif
**Label/Mono Font:** ui-monospace, SFMono-Regular, monospace

**Character:** Standard, clean geometric sans-serif that ensures absolute readability at all viewports. Rather than using stylized display fonts that complicate density, hierarchy is achieved purely via weight and size steps.

### Hierarchy
- **Display** (700, 36px, 1.1): Hero copy, splash page headers.
- **Headline** (700, 24px, 1.2): Section headings, page titles.
- **Title** (600, 18px, 1.3): Card headings, dialog headers.
- **Body** (400, 14px, 1.5): Chat copy, activity descriptions. Max line length capped at (70ch).
- **Label** (500, 12px, 1.2): Table columns, tags, stats indicators.

### Named Rules
**The Fixed Ratio Rule.** Heading sizes are set in fixed pixel values or standard rem increments, never fluid viewport width values, preventing text overflow and clipping on mobile screens.

## 4. Elevation

Depth in Yuno is modeled after stacked physical sheets of paper and leather tokens. High-contrast borders are preferred over heavy shadows, keeping the layout clean and readable.

### Shadow Vocabulary
- **Ambient Glow** (`box-shadow: 0 0 15px rgba(93, 64, 55, 0.1)`): Used for card surfaces.
- **Soft Edge** (`box-shadow: 0 1px 4px rgba(26, 15, 10, 0.05)`): For tooltips and dropdown menus.
- **Active Lift** (`box-shadow: 0 4px 12px rgba(26, 15, 10, 0.08)`): Applied on card hover states.

### Named Rules
**The Flat-Rest Rule.** All primary cards and map sidebars sit flat at rest with a 1px border. Shadows are only triggered dynamically when cards are hovered, dragged, or active.

## 5. Components

### Buttons
- **Shape:** Rounded corners with a 8px (0.5rem) border-radius.
- **Primary:** Deep Sophisticated Brown background with white text. Padding is (8px 16px).
- **Hover / Focus:** Transitions to Rich Leather Brown (#8b4513) on hover, with a subtle outline focus ring.

### Chips
- **Style:** Flat background (#f5f2ee) with soft clay border (#e0d7d0) and Dark Cocoa text.
- **State:** Active tags transition to Deep Sophisticated Brown with white text.

### Cards / Containers
- **Corner Style:** Rounded corners (12px).
- **Background:** Solid white (#ffffff).
- **Border:** 1px soft clay border (#e0d7d0).

### Inputs / Fields
- **Style:** Background of (#FDFAF6) with 1px border (#EDE3D7) and 8px border-radius.
- **Focus:** Border transitions to Deep Sophisticated Brown with a soft glow ring.

### Live City Pulse Pin (Signature Component)
- **Style:** A physical round orange badge containing event category icons, surrounded by a pulsing ring (`cityPulsePing` animation).
- **Behavior:** Pulsing animation runs indefinitely on map load; hover expands details inline on the map.

## 6. Do's and Don'ts

### Do:
- **Do** check contrast using a contrast checker for every text element.
- **Do** wrap descriptions and captions in `text-wrap: pretty` to avoid lone words on single lines.
- **Do** collapse navigation bars and panels cleanly on mobile viewports.

### Don't:
- **Don't** use side-stripe borders (e.g. `border-left` thicker than 1px) on alerts or cards.
- **Don't** pair high-saturation neon gradients behind body copy.
- **Don't** use generic card grids repeating the same layout elements with generic icons.
- **Don't** place tiny tracked uppercase text Kickers (eyebrows) above headings on every section.
