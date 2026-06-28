# Art Brief — Custom Dark 3D House Render for the Energy Tab

**For:** image generator / 3D artist producing the asset
**Used by:** `ha-kiosk/kiosk.html` Energy tab — a dark, flat "glassmorphism" wall dashboard
**Pairs with:** `ENERGY-TAB-BRIEF.md` (the animated flow that sits *on top* of this render)

---

## 1. Objective

A single isometric 3D render of a modern home, themed to match a **dark navy dashboard**, that serves as the static backdrop for an animated energy-flow overlay (Solar / Battery / Grid / Home). It must feel like the Sigenergy app's house view, but in a dark palette consistent with the rest of the dashboard — not bright white.

The render carries **no text and no flow lines** — labels, values, and animated "comet" flows are drawn in code on top. The render's job is purely the house + equipment.

---

## 2. Style & palette

- **Projection:** isometric / 2:1 dimetric, viewed from front-upper-left (same ¾ angle as the Sigenergy app).
- **Mood:** clean, modern, premium, softly glowing — frosted-glass surfaces, subtle teal edge light. Flat-ish shading, no heavy photoreal grit.
- **Background:** fully **transparent** (delivered as PNG with alpha). It will composite onto dashboard navy `#0c1326`. Include a soft contact shadow / ground glow under the house (can be baked or a separate layer).
- **Colour cues** (match dashboard tokens):
  - House body: frosted translucent white / pale blue-grey with teal `#5eead4` rim light
  - Solar panels: deep blue `#3a6ec8`-ish, subtle sheen
  - Battery (SigenStor) + inverter wall units: matte white, like the Sigen app
  - Accent glow: teal `#5eead4`
- **Lighting:** single consistent key light from upper-left; cool night ambience (this is primarily a night-themed render).

---

## 3. What the house must contain

- Modern two-storey home with a **glass-walled upper living area** (sofa visible is a nice touch, as in the app).
- **Solar panels** across the main roof pitch.
- A wall-mounted **SigenStor battery tower + a smaller inverter unit** on an exterior wall (matching the two white units in the Sigen app).
- A **garage** and a ground-floor utility/laundry area (optional but adds realism).
- A clean plinth/base the house sits on.

Generic modern home is fine for v1 (the Sigen app uses a generic house). A later version matching the actual property would need photos/elevations — out of scope for now.

---

## 4. Technical delivery specs

- **Format:** PNG, transparent background, no compression artefacts around edges.
- **Resolution:** ≥ 2000 px wide (this is a wall display; deliver @2x for crispness).
- **No baked text, no cables, no flow dots, no value labels** — overlay handles all of that.
- **Keep these four anchor zones visually clear and note their pixel coordinates on delivery** (the overlay attaches cables here):
  - `SOLAR` — mid-point of the roof panels
  - `BATTERY` — the SigenStor unit
  - `GRID` — grid/meter entry point (suggest bottom-right of the plinth)
  - `HOME` — the living area / a central junction the flows converge on
- **Two variants (preferred):** a **night** render (primary) and a **day** render (brighter sky-less ambience, lit panels) so the dashboard can swap by sun state, as the Sigen app and Genergy dashboards do. Night alone is acceptable for v1.

---

## 5. How it integrates (so the artist knows the constraints)

- The PNG is placed as the Energy-tab background layer.
- An SVG layer on top draws: leader-line labels (Solar/Home/SigenStor/Grid with kW + SoC %), and **animated comet dots** travelling along cables between the four anchors and the home, coloured per source (solar amber, battery purple/teal, grid amber, home cyan), animating only on active flows and in the correct direction (see `ENERGY-TAB-BRIEF.md` sign conventions).
- Therefore the render must leave **breathing room** around the four anchors and avoid busy detail where labels/leader lines will sit (top-left, top-right, bottom-left, bottom-right).

---

## 6. Copy-paste generation prompt (starting point)

```
Isometric 3D render of a modern two-storey home, 2:1 dimetric view from the upper-left,
dark premium night theme on a fully transparent background. Frosted translucent white and
pale blue-grey surfaces with a soft teal (#5eead4) rim light. Glass-walled upper living area
with a faintly visible sofa. Deep blue solar panels across the main roof. A wall-mounted white
SigenStor battery tower and a smaller white inverter unit on an exterior wall. A garage and a
ground-floor laundry area. Clean plinth base with a soft contact shadow. Cool, calm night
lighting from the upper-left. Minimal, clean, flat-ish shading, no photoreal grit. No text,
no labels, no wires, no cables, no UI. Centered, generous margins around all four corners.
High resolution, crisp edges, transparent PNG.
```

> Tip: generate a few variations, pick the one with the clearest corner anchors, then request a matching **day** version with the same camera and composition.

---

## 7. Deliverables & acceptance

1. Night render PNG, transparent, ≥2000px, no text/cables.
2. (Preferred) matching day render, identical camera/composition.
3. Pixel coordinates of the four anchors (Solar, Battery, Grid, Home).
4. Composites cleanly on `#0c1326` with no white halo on edges.
5. Corners/anchors uncluttered enough for labels + leader lines + animated flows.

Once delivered, hand the PNG(s) + anchor coords back to wire the animated flow overlay into the kiosk.
