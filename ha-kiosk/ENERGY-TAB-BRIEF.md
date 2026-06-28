# Design/Build Brief — Live Animated Energy Tab (Mockup B)

**For:** Claude design / implementer
**Target file:** `ha-kiosk/kiosk.html` → existing `renderEnergy()` function (~line 893)
**Status:** Upgrade an existing view, not a greenfield build. Match the existing kiosk visual language exactly.

---

## 1. Objective

Turn approved **Mockup B** into the live, animated **Energy** tab on the wall kiosk. It must be visually indistinguishable from the rest of the dashboard (same glass cards, palette, fonts, motion) and update in real time from Home Assistant. No native-HA styling, no third-party Lovelace cards — this is hand-coded into the existing kiosk app.

The kiosk already has a basic `renderEnergy()` with a flow diagram, `node()`/`flowLine()` helpers, a `flowDash` CSS animation, and tiles. **Reuse and extend these — do not introduce a framework or new card library.**

---

## 2. Tech context

- Single-page hand-coded HTML/JS/CSS app served from HA at `/config/www/kiosk/index.html` (source: `ha-kiosk/kiosk.html`).
- Live data via the existing HA WebSocket client in the app (`ha.val(entity)`, `ha.attr(entity, attr)`); state pushes arrive continuously (Sigenergy updates roughly every 5s). No polling to add.
- Config object: entities are mapped in the `C.energy` block (~line 353). Already wired to the IDs below.

---

## 3. Data mapping (verified live against HA API)

```
solar_power    sensor.sigen_plant_pv_power                  kW
battery_soc    sensor.sigen_plant_battery_state_of_charge   %
battery_power  sensor.sigen_plant_battery_power             kW   (+ = charging, − = discharging)
grid_power     sensor.sigen_plant_grid_active_power         kW   (+ = importing, − = exporting)
home_power     sensor.sigen_plant_consumed_power            kW   ← USE DIRECTLY (do not compute solar−bat−grid)
yield_today    sensor.sigen_plant_daily_pv_energy           kWh
```

**Sign conventions are load-bearing for the animation — get these right:**
- `battery_power` > 0 → charging (flow Solar/Grid → Battery, colour purple). < 0 → discharging (flow Battery → Home, colour teal).
- `grid_power` > 0 → importing (flow Grid → Home, colour amber/grey). < 0 → exporting (flow Solar → Grid, colour teal).
- ⚠️ Grid export direction is **still unverified in daylight** — confirm Grid → export lights teal when real solar export occurs; flip sign if reversed.

### Helper sensors to create (HA template sensors, behind the scenes)
```
kWh_remaining        = battery_soc% × sensor.sigen_plant_rated_energy_capacity (32.24 kWh)
time_to_empty/full   = kWh_remaining ÷ |battery_power|   (label "to empty" if discharging, "to full" if charging)
self_sufficiency_pct = (1 − daily_grid_import ÷ daily_load) × 100, clamped 0–100
                       using sensor.sigen_plant_daily_grid_import_energy and sensor.sigen_plant_daily_load_consumption
```

---

## 4. Layout (matches Mockup B)

- Two columns inside the Energy content area: **left** = power-flow diagram (~46%), **right** = glance tiles (~54%).
- Flow diagram: four nodes — SOLAR (top), BATTERY (left), GRID (right), HOME (bottom) — connected Solar↔Home, Solar↔Battery, Solar↔Grid, plus Battery→Home and Grid→Home when those are the active sources.
- Right column tiles, top to bottom: **Solar Generation** (hero), **Battery** (SoC + rate + bar), then a row of **Grid** + **Yield Today**, then **Self-sufficiency today**.
- Header: title "Energy" + sub "Live power flow", consistent with other tab headers.

---

## 5. Design tokens (reuse existing kiosk variables — do not hardcode new hex)

| Token | Value | Usage |
|---|---|---|
| `--teal` | `#5eead4` | Solar gen, discharge, export, positive accents |
| battery purple | `#7c83ff` | Battery node, SoC bar, charging flow |
| `--amber` | `#ffae3d` | Solar node, yield, grid import |
| home cyan | `#38e0ff` | Home node, self-sufficiency |
| grid grey | `#9fb0d8` | Grid node neutral |
| `--tm` (muted) | `#8ea0cc` | Labels, units, small-caps |
| Card surface | `rgba(255,255,255,.04)` + `1px solid rgba(140,160,210,.14)` | All tiles |
| Card radius | 14–18px | Tiles / panel |
| Number font | `'Space Grotesk'`, 500–600 | All metric values |
| Label font | `'Manrope'`, small-caps, letter-spacing ~0.8–1.5px | All labels |

---

## 6. Animation / motion

| Element | Trigger | Animation | Duration / easing |
|---|---|---|---|
| Flow connectors | Flow active (≠0) | Marching dashes ("comet") along the line, coloured by source. Reuse existing `flowDash` keyframe | 1.2s linear infinite |
| Connector visibility | Per-flow direction | Each line animates only when its flow is non-zero; idle lines are static faint grey | — |
| Metric values | State update | Tween number from old→new value, don't hard-jump | ~300ms ease-out |
| SoC bar width | SoC update | Animate width | ~400ms ease |
| Low SoC | SoC < threshold (e.g. 20%) | Battery node/bar pulse | gentle 1.5s loop |

Direction logic per state:
- **Day, charging, exporting:** Solar→Home, Solar→Battery, Solar→Grid all animate.
- **Night, discharging:** Battery→Home animates; Solar node dim; Solar lines static.
- **Importing:** Grid→Home animates amber.

---

## 7. States & edge cases

- **Pending / unavailable:** if any core entity is `null`, `unavailable`, or `unknown` → keep the existing "Sigenergy not yet connected" placeholder; show `—` for that tile rather than `NaN`.
- **Night:** solar = 0 → solar node dim, no solar flows, hero "Solar Generation" reads `0.0 kW`.
- **Number format:** power 1 decimal (kW), SoC integer (%), yield 1 decimal (kWh). Always round; never show float artefacts.
- **Grid ≈ 0:** below ±0.05 kW treat as idle (no grid flow animation).
- **Self-sufficiency:** clamp 0–100; if daily_load = 0 show `—`.

---

## 8. Responsive

Primary target is the fixed wall display (~1800px wide, landscape). Two-column layout as drawn. Below ~900px content width, stack flow diagram above tiles (single column). No mobile-specific work required unless the kiosk is also viewed on a phone.

---

## 9. Accessibility

- Flow SVG: `role="img"` with a `<title>`/`<desc>` summarising current flow ("Solar 6.4 kW: feeding home, charging battery, exporting to grid").
- Tiles: each value paired with a visible text label (already the case); colour never the sole carrier of meaning (charge/discharge also indicated by sign and arrow).

---

## 10. Acceptance criteria

1. Renders inside the existing Energy tab using existing kiosk tokens/fonts — pixel-consistent with Mockup B and the rest of the dashboard.
2. Pulls live values from the six entities above; updates within a few seconds of HA state changes.
3. Home value uses `sensor.sigen_plant_consumed_power` directly (not computed).
4. Flow animations reflect correct direction per the sign conventions; export verified in daylight.
5. Numbers tween, SoC bar animates, low-SoC pulses; no hard jumps or float artefacts.
6. Night and pending/unavailable states render cleanly (no `NaN`, no empty diagram).
7. Three helper sensors created and wired (kWh remaining, time-to-empty/full, self-sufficiency).

---

## Reference

- Mockup B (approved): the "Energy tab" widget shared in chat.
- Existing code: `renderEnergy()`, `node()`, `flowLine()`, `flowDash` keyframe, `C.energy` config block in `kiosk.html`.
- Community pattern reference: `SpengeSec/Genergy-Dashboard` (for element choices only — not its visual style).
