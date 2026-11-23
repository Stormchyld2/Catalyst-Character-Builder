# Catalyst Design System — Frost Blue / Obsidian

**Status:** APPROVED — visual direction locked 2026-11-23  
**Applies to:** Catalyst desktop, standalone Catalyst Character Studio, future player-facing and Android UIs.  
**Supersedes:** Earlier draft **amber/gold as the global UI accent** in architecture documents 020–024 and Character Studio proposals. Gold is permissible as an *optional fantasy sheet/dice skin*, not in the application chrome.  
**Implementation status:** Design specification only. Existing inherited LithoMark CSS is NOT yet migrated.

## 1. Identity and color philosophy

Catalyst is a modern multi-system tabletop RPG platform, not exclusively medieval-fantasy software. Use **near-black obsidian**, layered **neutral charcoal/gunmetal**, **bright silver-white typography**, and **Frost Blue** as the single primary accent. Avoid gold, orange, blue-gray legacy controls, gradients on everyday buttons, saturated cyberpunk glow, or large decorated title bars.

Default is **dark mode**. Dark surfaces provide depth through clear elevation; Frost Blue highlights active navigation, the current wizard step, selected options, focus rings, primary actions and relevant data visualizations. Gold is never a required semantic status color.

## 2. Locked dark palette

| Token | Hex | Purpose |
|---|---|---|
| `background.canvas` | `#111214` | app shell/main background |
| `background.sidebar` | `#17191D` | sidebar and secondary rails |
| `surface.panel` | `#202328` | primary cards, panels, dialogs |
| `surface.raised` | `#2C3036` | active panel, input surface, popovers |
| `surface.hover` | `#353B43` | neutral hover states |
| `surface.inset` | `#171A1F` | embedded trays and sheets |
| `text.primary` | `#F0F1F3` | headings, labels, controls, primary data |
| `text.secondary` | `#BCC2CC` | metallic silver text / supporting data |
| `text.muted` | `#A3A9B2` | captions, timestamps and help text |
| `text.disabled` | `#858B95` | unavailable/disabled labeling |
| `border.default` | `#41464E` | panel and input dividers |
| `border.subtle` | `#343941` | low-emphasis separators |
| `accent.primary` | `#6EA9CF` | Frost Blue primary accent |
| `accent.hover` | `#8CC0E1` | accent hover/focus |
| `accent.pressed` | `#4D87B0` | pressed/selected intense state |
| `accent.soft` | `#223646` | selected-row/secondary tint |
| `accent.on` | `#111214` | button label/icon on blue fill |
| `focus.ring` | `#8CC0E1` | visible keyboard focus outline |
| `status.success` | `#74B99A` | successful/saved/completed |
| `status.warning` | `#E5B96A` | caution/attention, NOT brand gold |
| `status.error` | `#E08B8B` | errors/destructive action |
| `status.info` | `#6EA9CF` | info, same as accent |

Use `accent.primary` for primary button fill and `accent.on` for its label. On dark surfaces, Frost Blue works as an accent text/icon color. For small text, verify actual foreground/background contrast using WCAG AA (normal text >= 4.5:1, large text and graphic indicators >= 3:1). If a particular composite fails, use `text.primary` or hover blue instead of forcing blue. Never rely on color alone.

## 3. Semantics and components

- **Navigation:** dark sidebar; current item uses `accent.soft` background, accent icon/left marker and primary text. Other items remain neutral.
- **Buttons:** primary = blue background and dark label; secondary = neutral raised background and primary text; outline = border + primary text; destructive = error color only on genuinely destructive controls.
- **Forms:** neutral raised inputs; subdued borders; focus ring Frost Blue; validation color independent of selected state.
- **Wizard:** blue progress indicator, selected step card, required-choice marker; other steps neutral, completed status uses success color.
- **Character sheets:** large numerical values primarily in `text.primary`; active tab and roll icons blue; damage/condition warnings use semantic statuses.
- **Tables/panels:** selected rows blue-tinted; row hover neutral. Do not color every header or every panel outline blue.
- **Dice tray/3D dice:** chrome uses Frost Blue; optional per-dice thematic skins can use gold/copper/purple, but never change the global accent when a skin is chosen.
- **PDF/GM reference reader:** document pages can retain original page colors; surrounding reader toolbar uses Catalyst tokens.
- **Graphs, charts and maps:** blue is primary emphasis only; additional accessible categorical colors are permitted for data, never interpreted as another brand palette.
- **Print:** clean ink-friendly black/white default; decorative fantasy/genre sheets may use authored themes and accent colors independently from app chrome.

## 4. Typography, geometry and motion

- UI font: **Inter**, bundled locally if distributed, with system sans fallback. Display headings may use a licensed local serif only in a selected sheet/cover theme, not core controls.
- Monospace: system monospaced fallback for dice notation, IDs and calculated formulas.
- Standard UI scale: 14–16px body, 12–13px metadata only when still legible, 20–28px pane/section headings, large numeric values sized by available space.
- Spacing: 4px base; 8/12/16/24/32px common. Minimum target **44×44px** for touch-oriented actions; keyboard focus visible.
- Corner radius: 6px small controls, 8px inputs, 12px cards and dialogs. Do not over-round dense panels.
- Shadows subtle; crisp dividers preferred. No heavy bloom, persistent pulsation, or elaborate skeuomorphism in the app shell.
- Respect reduced-motion preferences; UI transition 120–180ms typically; physics animations may be disabled or reduced.

## 5. Canonical CSS token contract

Use **semantic tokens**; components must never hardcode the raw palette in Svelte markup except truly illustrative/demo assets.

```css
:root,
[data-theme="catalyst-dark"] {
  color-scheme: dark;
  --cat-bg: #111214;
  --cat-sidebar: #17191D;
  --cat-panel: #202328;
  --cat-raised: #2C3036;
  --cat-hover: #353B43;
  --cat-inset: #171A1F;
  --cat-text: #F0F1F3;
  --cat-silver: #BCC2CC;
  --cat-muted: #A3A9B2;
  --cat-disabled: #858B95;
  --cat-border: #41464E;
  --cat-border-subtle: #343941;
  --cat-accent: #6EA9CF;
  --cat-accent-hover: #8CC0E1;
  --cat-accent-pressed: #4D87B0;
  --cat-accent-soft: #223646;
  --cat-on-accent: #111214;
  --cat-focus: #8CC0E1;
  --cat-success: #74B99A;
  --cat-warning: #E5B96A;
  --cat-error: #E08B8B;
  --cat-info: #6EA9CF;
}
```

Both repos must use precisely the same token names and values. Publish this as a versioned shared token manifest before cross-repo UI integration (suggested initial version `1.0.0`). A future light theme must use the same semantic keys with its own tested values; do not derive light colors by inverting dark values.

## 6. Migration and compatibility rules

Catalyst currently contains inherited LithoMark styling under `src/styles/lithomark/` and a stylesheet importing those files. **Do not rename or delete those files without auditing all imports, themes and components**. First introduce the `--cat-*` layer, map legacy semantic aliases through one compatibility stylesheet, migrate component-by-component, run visual and accessibility regressions, then retire unused legacy tokens. Preserve existing project/document data regardless of theme change.

Character Studio can start with the new tokens immediately; no need to copy old LithoMark theme code into the standalone repository.

The design documentation in `020-CAMPAIGN-WIZARD-ARCHITECTURE.md`, `021-CHARACTER-STUDIO-ARCHITECTURE.md` and Character Studio engine plans that mention gold are **superseded for app-wide styling by this document**, but their functional requirements remain valid.

## 7. Release checklist

- Compare both repos' token manifests; no hex or variable drift.
- Confirm visible focus on keyboard/reader controls, disabled labels, error/help messages, progress and selected state.
- Confirm text and non-text contrast on real component background combinations.
- Check standard Windows DPI scaling, 125/150/200%, narrow desktop widths and touch targets.
- Verify the wizard, character sheet, dice tray, modal, sourcebook reader, map tools and GM Console use shared semantic tokens.
- Validate printing does not force a dark background; black/white sheet option is legible.
- Verify system fonts/packaged fonts and icons work entirely offline.
- No code implementation is considered complete until components are visually inspected and tested.

**Decision:** Catalyst = **Obsidian & Frost Blue**, with Silver/Charcoal/Gunmetal neutrals. Global antique gold accent is retired; optional sheet-specific gold remains supported.
