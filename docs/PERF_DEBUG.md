# Performance debugging workflow

The neon design is heavy. This harness makes the cost **measurable and
bisectable** so we fix the real culprit instead of guessing. It is inert in the
normal app — it only does anything when you pass URL flags.

> Measure on a **focused** browser tab. Background/inactive tabs throttle
> `requestAnimationFrame`, so the FPS readout (and the animations) will be wrong
> if the tab isn't the active one.

Dev server: from `frontend/`, `bun run dev` → http://127.0.0.1:7174

## 1. See the framerate

Open with `?perf`:

```
http://127.0.0.1:7174/?perf
```

A HUD appears top-left: `FPS`, average frame time, worst frame, and which
layers are currently disabled. Let it sit on the idle screen for a few seconds
and note the steady-state FPS. 60 is smooth; under ~30 is the jank you're
feeling.

## 2. Bisect the cost

Reload with `&off=<group>` and watch whether the FPS recovers. The group that
restores the framerate is the culprit.

| Flag | Disables |
|------|----------|
| `?perf&off=glow` | every `text-shadow` + `box-shadow` (the neon glows) |
| `?perf&off=anim` | every CSS animation/transition |
| `?perf&off=filter` | every `filter` / `backdrop-filter` |
| `?perf&off=wheelspin` | the wheel's continuous rotation + its compositor layer |
| `?perf&off=wheelshadow` | just the wheel's rim/bloom shadow (keeps spinning) |
| `?perf&off=wheelhide` | removes the wheel SVG entirely |
| `?perf&off=felt` | the felt board texture gradients |
| `?perf&off=room` | the scanline + floor layers |
| `?perf&off=cabinet` | the cabinet + screen panel shadows/fills |
| `?perf&off=all` | **flat baseline** — everything above off at once |

Combine groups with commas: `?perf&off=glow,wheelspin`.

## 3. Read the result

- **`off=all` is smooth, full is janky** → the cost is **CSS/GPU** (paint/
  composite). Re-enable groups one at a time from the baseline to find which
  one(s) bring the jank back. Most likely: `glow` (lots of big blurred shadows)
  or the `wheel*` group.
- **`off=all` is STILL janky** → the cost is **JS / main-thread**, not the
  visuals. Next step is profiling renders/timers/audio, not stripping CSS.
- A single group that recovers most of the FPS is the thing to optimize or cut.

## 4. Report back

Note the FPS for: `?perf` (full), `?perf&off=all`, and each suspect group. Four
or five numbers pin the cause precisely, and the fix follows from there.
