# STYLE.md — Design System Reference
> Extracted from portfolio-website-PRD-v2.md. This file exists to be loaded every session (via CLAUDE.md `@STYLE.md` import) so these constants don't get lost in a long document. Source of truth for scope/content is still the PRD — this is just the visual cheat sheet.

## Fonts
| Use | Font |
|---|---|
| Headings/bold | Bricolage Grotesque Bold |
| Body/regular | Space Grotesk |
Both are Google Fonts — load via `<link>` CDN tag. No local files, no npm.

**Disregard "Special Gothic Regular":** an old font specimen (`80c0f054-b37e-43d1-90ce-2ab85f7e0eee.png`) showed this alongside Bricolage Grotesque Bold — confirmed by the user to be a leftover from an earlier, since-abandoned option, not part of the design system. Bricolage Grotesque + Space Grotesk are the only two fonts in use.

## Typography Scale
| Style | Size | Weight/Font | Letter spacing | Line height |
|---|---|---|---|---|
| Hero | 72px | Bricolage Bold | -3px | 82px |
| Heading 1 | 50px | Bricolage Bold | -3px | 50px |
| Heading 2 | 40px | Bricolage Bold | -0.8px | — |
| Heading 3 | 32px | Bricolage Semibold | -0.5px | — |
| Heading 4 | 26px | Bricolage Semibold | -0.5px | — |
| Heading 5 | 24px | Bricolage Regular | -0.3px | — |
| Heading 6 | 20px | Bricolage Bold | -3% | — |
| Eyebrow | 16px | Space Grotesk Semibold, all caps | +1px | — |
| Labels | 14px | Space Grotesk (weight 440), all caps | 0 | — |
| Body LG | 20px | Space Grotesk Regular | -3% | 36px |
| Body | 16px | Space Grotesk Regular | -3% | 30px |
| Body SM | 14px | Space Grotesk Regular | -3% | 20px |

**Units in code:** font-sizes are `rem` throughout. Letter-spacing values above are listed in px/% for readability (matching the original spec), but implement them as `em` relative to that row's own font-size (e.g. Heading 2's `-0.8px` at 40px → `-0.02em`), not flat `px`/`rem`. `em` is the right unit here specifically because letter-spacing should scale with the element's own rendered size, not the document root — this also avoids the mobile-vs-desktop tightness mismatch a fixed px value causes when a heading's size changes across breakpoints (see Hero, which has no separate mobile value defined below — its `-3px` is desktop-only; implement its em equivalent off the 72px desktop size).

## Spacing Scale
12px base unit, multiples up to 132px: `12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132`. Consistent with this scale — e.g. button padding (36/12) and card corner radius conventions below use the same base unit. Define as CSS custom properties (`--space-1: 12px` through `--space-11: 132px`) rather than hardcoding.

**Units in code:** define the tokens in `rem`, not raw `px` (`--space-1: 0.75rem` /* 12px */ through `--space-11: 8.25rem` /* 132px */). Values above are the design spec in px for readability, but implementing in rem means spacing scales along with the user's root font-size/browser zoom instead of staying fixed — same reasoning as the type scale below.

## Color Tokens
Define these as CSS custom properties in `:root` — never hardcode hex values in component CSS.
```css
:root {
  --color-green: #A2B445;
  --color-green-light: #BBC48F;
  --color-green-dark: #667326;
  --color-pink: #FF007F;
  --color-pink-light: #FD8EBD;
  --color-pink-dark: #C90064;
  --color-yellow: #FDAF04;
  --color-yellow-light: #E6C374;
  --color-blue: #B5DFED;
  --color-cream: #FAF4ED;
  --color-sand: #E0D9CF;
  --color-forest: #3F4D33;
  --color-dark: #2C2C2C;
}
```

## Grid Pattern ("the grid" — used in hero, footer, and elsewhere)
- Stroke: `#ffffff`, 0.5px
- Grid size: 30px
- Opacity: 10%
- Background it sits on: `#131412`

## Hero Text Gradient
The home hero heading (index.html) uses one crisp gradient-clipped text
layer — no glow/blur duplicates. An earlier version of this spec called
for three stacked layers (normal blend + two blurred/blended duplicates
at hard-light/color-dodge, 50px blur), matching the original PRD
reference screenshots below. That layered-glow version was removed per
feedback: it read as a colourful halo glowing outward from the text
rather than gradient color living inside the letterforms, and it visually
competed with the chromatic-aberration effect added alongside it (see
`.home-hero__heading-glitch` in style.css). The gradient stops/colors
themselves are unchanged, only the glow layers are gone.

**Original glow-layer reference (superseded, kept for history):**
`portfolio-website-PRD/Screenshot_2026-07-26_at_6.10.54_PM.png` and
`..._6.10.33_PM.png`.

## Primary Background Gradient — LOCKED IN
**Technique: a `conic-gradient` on a nested layer, not layered radial circles.** Several early passes tried building this from separately-positioned blurred ellipses/circles (which is how the original PRD construction file — `..._6.19.19_PM.png` — was actually built in Figma), but that approach kept fighting itself: paint order, per-shape overlap math, and per-breakpoint blur tuning all needed constant rework, and it never read as genuinely *blended* — always more like several distinct soft blobs sitting next to each other. A conic-gradient transitions continuously through every color stop by construction, which is what "blended/merging" actually needed. The color sequence/technique (a smooth multi-stop sweep, softened afterward) is adapted from `assets/css/style.css`'s `.hero__headline` — an earlier design draft not otherwise used on this page, but which happened to already have a soft multi-color conic sweep worth reusing here. **This gradient is shared site-wide**: every project page (mental-health-campaign, myhealthnb-launch, breastfeeding-guide, sexual-health-campaign) uses this identical `.bg-gradient-primary`/`.hero-gradient-layer` background on its hero, same as About — confirmed by the user; an earlier draft of this note incorrectly said project pages used their own per-project accent colors instead, which is wrong.

**Markup:** a dedicated `<div class="hero-gradient-layer" aria-hidden="true"></div>` as the first child of `.about-hero` (not a pseudo-element) — see why below.

**Why two layers, not one:** two requirements turned out to need different reference sizes, and no single element can satisfy both:
1. The conic-gradient's color-wheel geometry needs a **fixed height** to look the same across breakpoints — `.about-hero`'s real height swings from ~133px (tablet) to ~262px (desktop), and conic angles are computed against whatever box they're painted on, so a height tied to the real box distorted the color spread differently at every width (this is why colors looked fine on desktop but collapsed to almost nothing on mobile/tablet at one point).
2. The fade-to-transparent **mask** has to finish exactly at the section's real, breakpoint-correct edge, or `overflow:hidden` clips it mid-fade, producing a hard line. A mask sized against a *fixed* height (per #1) doesn't reliably finish by the time a *shorter real box* clips it — this is exactly what reintroduced the hard line at tablet/mobile widths after the fixed-height fix went in.

Solution: split into an outer layer (sized to the real box, owns the mask + `overflow:hidden`) and an inner `::before` (fixed height, owns the conic-gradient + blur), so each gets the reference size it actually needs.

```css
.hero-gradient-layer {
  position: absolute;
  inset: 0; /* real box — mask always finishes fading at the real edge, whatever that is at this breakpoint */
  overflow: hidden;
  opacity: 0.55;
  mask-image: radial-gradient(ellipse 70% 100% at 50% 0%, black 0%, black 50%, transparent 95%);
  -webkit-mask-image: radial-gradient(ellipse 70% 100% at 50% 0%, black 0%, black 50%, transparent 95%);
  pointer-events: none;
}
.hero-gradient-layer::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 0;
  height: clamp(220px, 20vw, 320px); /* fixed — keeps color-wheel proportions consistent across breakpoints */
  filter: blur(clamp(90px, 9vw, 160px));
  background: conic-gradient(from 0deg at 50% 0%,
    #A2B445 90deg, #A2B445 100deg,
    #FDAF04 125deg, #FDAF04 145deg,
    #E0D9CF 160deg,
    #FF007F 175deg, #FF007F 235deg,
    #00E5FF 255deg, #00E5FF 265deg,
    #A2B445 270deg, #A2B445 290deg, #A2B445 360deg
  );
}
.bg-gradient-primary::after {
  /* flat cream tint, lives on .bg-gradient-primary directly (NOT inside
     .hero-gradient-layer) so it's unaffected by the gradient layer's own
     opacity/mask — a simple, separate wash over the whole section. */
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-cream);
  opacity: 0.5;
  pointer-events: none;
}
```

**Reading direction is easy to get backwards:** the center sits at the top edge, so only the bottom half of the wheel is visible — but with the center at the *top*, increasing angle sweeps right→down→left (90deg=right, 180deg=bottom, 270deg=left). That means increasing angle is right-to-left on screen. An early attempt listed color stops in increasing-angle order to match a requested left-to-right sequence and got it exactly backwards. To get a specific left-to-right reading, write the stops in *decreasing*-angle order (270deg down to 90deg).

**Color order/weighting, left-to-right on screen** (i.e. decreasing angle, 270deg→90deg): cyan (small) → pink (largest span by far — the dominant color, widened into what used to be yellow/green's territory) → a white/sand blend (`#E0D9CF`, a brief single-point transition, not its own held zone) → yellow (small) → green (smaller still), landing at both visible edges. **Cyan must not sit at either visible edge** — it peaks at 255-265deg, with the true left edge (270deg) sitting in the green zone instead. Cyan bookending both edges (an earlier, evenly-spaced attempt) read as heavier/cooler; a small green touch at each edge instead, with pink dominating the width, is what gives the intended light/airy feel.

**Blur** is `vw`-based with `clamp()` guardrails, not a fixed px value — a fixed blur radius is proportionally much softer on a large hero than a small one, so an earlier fixed-px version looked fine on a 1280px test viewport and nearly invisible on an actual laptop-width window or mobile.

**Mask ellipse height cap:** keep the "fully transparent" stop (currently 95%) landing at or before 100% of `.hero-gradient-layer`'s own height (the real box, since that's what the mask is now sized against) — push it much past ~105% and the fade won't finish before `overflow:hidden` clips it, reintroducing the hard line this mask exists to prevent.

**Verify against:** `portfolio-website-PRD/Screenshot_2026-07-26_at_6.18.43_PM.png` (final result) and `..._6.19.19_PM.png` (construction breakdown, labeled "gradient bkg" in the Figma layer — this is what an earlier code comment meant by "gradient-bkg.jpg," which isn't a separate file in this repo).

## Context Pop-up (hover-context popup, not buttons/cards)
- Max width: 230px
- Corner rounding: 12px
- Drop shadows:
  - Green shadow: x -3px, y -3px, 90% opacity
  - Pink shadow: x 3px, y 3px, 90% opacity
- Background: dark
- Text: light
- Hover rule: near screen edges, ensure hover text/tooltips don't shift off-screen unreadable
- **Entrance/positioning:** implemented as two nested elements, not one — `#cursor-context` (outer) only ever gets a `translate` set by JS on every mousemove and has **no transition of any kind** on it, so it can never visibly slide/travel to catch up with the cursor. `#cursor-context__inner` (the actual visible box — background, padding, shadow, text all live here) has no position of its own; it only does the entrance animation, a scale-pop from the center (`transform-origin: center`, `scale` `0.7 → 1` over `120ms ease-out`, opacity itself not transitioned). Putting both on the *same* element was tried first and caused a visible slide/chase even with position nominally untransitioned — keep them on separate elements for any future hover-following component, not just separate CSS properties.

## Buttons (primary, e.g. "View Work")
Typography: Space Grotesk Medium, 12px (confirmed smaller than the reference's 16px — matches Link Button size), line-height auto, letter-spacing 5%, center-aligned.
Padding: 36px horizontal, 12px vertical.

Three states, confirmed order default → hover → clicked:
- **Corner radius:** none (sharp corners)
- **Default (outline):** no fill, stroke `--color-green-light` (Green 02), inside position, weight 1.5, no shadow.
- **Hover:** fill `--color-green-light` (BBC48F) 100%, stroke `--color-cream` (FAF4ED) 100% inside weight 1.5, drop shadow x5 y5 blur 0 spread 0 color `--color-green` 100%.
- **Clicked:** fill `--color-green-light` (BBC48F) 100%, stroke `--color-green` (A2B445) 100% inside weight 1.5.

**Icons:** every button/link gets an icon indicating what it does, on the trailing (right) side of the label — the one exception is header/footer nav links (WORK/ABOUT/CONTACT-style), which stay plain text. Mapping so far:
- Copy-to-clipboard actions (any "Email"/"Copy Email" button or link): inline SVG copy icon (`.icon-copy` class — sized `1em` so it tracks the surrounding text size; use `display:inline-block` on it if the parent has `text-decoration:underline`, so the underline doesn't draw across the icon)
- Downloads (e.g. "Download CV"): `↓` (down arrow), not `→`
- "Go to" navigation actions (e.g. "View Work", "More About Me"): `→` (right arrow)
- External links that leave the site (e.g. mobile-nav LinkedIn/Dribbble): `→` (right arrow, horizontal — same as "go to" navigation, not diagonal, per feedback)
- New action types: pick an icon that reads as that specific action, keep it trailing, keep this list updated

## Link Button (underlined, e.g. "MORE ABOUT ME →" / "DOWNLOAD RESUME →")
Distinct from the primary button above — no box, just underlined text that changes color per state.

Typography: Space Grotesk Bold, 12px, letter-spacing 6%, uppercase, underlined (3px offset).

Three states, confirmed order default → hover → clicked — goes *brighter* on hover, not darker:
- **Default:** `--color-green-dark` (667326)
- **Hover:** `--color-green` (A2B445) — brighter/more saturated than default
- **Clicked:** `--color-forest` (3F4D33) — darkest of the three

Reference: shared directly in conversation (not a saved file in this repo) — a two-column "link button" mockup showing this default → brighter → darkest progression.

## Nav Links (Header/Footer Buttons)
Distinct from primary buttons above — these are text nav links (e.g. WORK / ABOUT / CONTACT), not filled CTAs.

Typography: Bricolage Grotesque SemiBold, 14px (confirmed smaller than the reference's 16px — reads better in practice), line-height auto, letter-spacing -0.5px, left-aligned.
Sizing: hug content (width 86px / height 31px in the reference, but hug-based so this scales with text), gap 10px, padding 12px horizontal / 6px vertical, corner radius 0.

Also applies to the footer's Email/LinkedIn/TikTok/Dribbble links, but one size down: Bricolage (not Space Grotesk) at 12px, matching the Buttons/Link Button size rather than the header nav's 14px.

Four states — corrected after review (hover has no fill, and its stroke is `--color-green` not `--color-green-dark`; clicked was already right):
- **Default:** plain text, no fill, no stroke.
- **Hover:** no fill, stroke `--color-green` (A2B445), inside, weight 1.
- **Clicked:** fill `--color-green` (A2B445) at 30% opacity, stroke `--color-green-dark` (667326, "Green 04" in the reference), inside, weight 1.
- **Active (current page):** text color `--color-pink`, underlined — no fill/stroke box.

Verify against: `menu-buttons.jpg` (as attached).

## Project Cards
Image size: 360×518px, can scale but must maintain aspect ratio.
- **Default:** image only, no border. Caption below: Heading 6 style, then Labels style beneath.
- **Hover:** stroke `--color-dark` (Background/Dark), inside, weight 2px. Drop shadow x5 y5 blur 0 spread 0 color `--color-yellow-light` (Yellow 05). Caption's Heading 6 text gets a highlight background in yellow (same pattern as the pink custom-highlight effect, yellow variant instead of pink).

Verify against: `cards.png` and `buttons.png` (as attached) alongside `portfolio-website-PRD/Screenshot_2026-07-26_at_5.03.30_PM.png` (desktop) / `..._5.05.52_PM.png` (mobile).

## Custom Cursor & Highlight
- Size: 18px at rest, 12px on click
- Highlight background: `--color-pink-light` at 30% opacity
- Highlight text: `--color-pink`
- Applies on hover over: project thumbnails/cards, specific text/links, images, interactive feedback states
- Treat as extensible — new hover-context elements will be added over time

## Animation Timing
No fixed values specified — default to **200ms, ease-in-out** for hover/click transitions (buttons, cards, cursor) and **300ms ease-in-out** for larger movements (mobile menu slide-in, carousel transitions) unless a specific instance clearly needs to feel snappier or slower. Adjust by feel once built — this is a starting point, not a hard rule.

## Focus States (accessibility)
Not specified in the design files — recommended default: a visible 2px solid outline in `--color-pink` (or `--color-green-dark` on light backgrounds where pink fails contrast), offset 2px from the element, applied via `:focus-visible` so it only shows for keyboard navigation, not mouse clicks. Never remove the default outline without providing this replacement. Check outline color against its background meets 3:1 contrast minimum per WCAG.

## Navigation
- Sticky header (visible on scroll)
- Hamburger menu below tablet breakpoint, min width 390px
- Mobile menu: slides in from right, background darkens to `--color-dark` at 20%, blurs
- **Logo/brand links home**: everywhere the logo or the icon/name/title lockup appears — header brand block, footer logo, mobile-nav logo — it links to `/index.html`. Applies site-wide, not just this page.

## Carousels
- Manual navigation only — no auto-advance
- Horizontal (sexual-health-campaign.html): arrows + swipe, 4 images
- Vertical (breastfeeding-guide.html): section fills the viewport (100vh/100dvh). On scroll, snaps one image at a time (CSS `scroll-snap-type: y mandatory` on the container, `scroll-snap-align: start` per image is the natural implementation). Once the last image is reached, scrolling continues as normal page scroll past the section — this is controlled snap-scrolling, not a traditional arrow/dot carousel.

## Contact Interactions
- "Email" link: copies address to clipboard (NOT `mailto:`), shows "Copied!" confirmation on click
- "LinkedIn" link: shows "open link" on hover, opens new tab on click
- Reference: `PopUp-email1.png` (hover), `PopUp-email2.png` (clicked), `PopUp-linkedin.png` (hover)

## Analytics
GA4 tracking ID: `G-DXP7KQ58ZQ` (added after initial PRD — not yet in the PRD source doc, only here. Worth adding to the PRD too for consistency, since STYLE.md is meant to be a distilled cheat-sheet, not the sole record.)

## Breakpoints
The CSS is mobile-first. These are the boundaries actually load-bearing in `style.css` — corrected here after an audit found the values below didn't match what an earlier draft of this section described (Mobile ≤480 / Tablet ≤768 / Desktop 1024+, a three-tier plan the code was never actually built against):
- **769px** (`min-width`) — the one real mobile→tablet/desktop switch-over, used throughout for layout, typography and spacing. A handful of `max-width: 768px` blocks exist alongside it for the mobile-only side of the same boundary.
- **1024px** (`min-width`) — desktop-only refinements layered on top of the 769px tier (a small number of rules).
- **426px** (`min-width`) — one small-mobile-only refinement; not a general-purpose tier, don't reach for it by default.
- **`hover: none`** — used instead of a width breakpoint to detect touch devices (restores the native cursor on touch, see Custom Cursor & Highlight above).

If a genuine three-tier 480/768/1024 system is wanted going forward, that's a CSS refactor across every breakpoint in the file, not a doc correction — treat it as its own task with full visual re-verification against the reference images, not a drive-by change.

---
**How to use this file:** Add `@STYLE.md` to your `CLAUDE.md` imports so it's loaded automatically every session. When prompting for a specific visual element, still explicitly tell Claude Code to open the referenced screenshot file directly (e.g. "read portfolio-website-PRD/Screenshot_2026-07-26_at_6.19.19_PM.png") — this file gives it the numbers, but the image gives it the actual shapes/composition.
