// Performance bisection harness (dev tool).
//
// Inert unless you pass URL flags, so it never affects the real app:
//   ?perf            -> show the live FPS / frame-time HUD (top-left)
//   ?off=glow        -> disable a layer group (adds html.off-glow)
//   ?off=glow,wheelspin,filter  -> disable several at once
//   ?off=all         -> disable every group (flat baseline)
//
// Workflow: load with ?perf, read the FPS. Then add &off=<group> and reload
// to see which group restores the framerate — that's the culprit. If ?off=all
// is STILL janky, the cost is JS/main-thread, not CSS/GPU.

export const PERF_GROUPS = [
  "glow", // every text-shadow + box-shadow (the neon glows)
  "anim", // every CSS animation + transition
  "filter", // every filter / backdrop-filter
  "wheelspin", // the wheel's continuous rotation + its compositor layer
  "wheelshadow", // just the wheel's rim/bloom box-shadow
  "wheelhide", // hide the wheel SVG entirely (tests the SVG's raw cost)
  "felt", // the felt board texture gradients
  "room", // body scanline + floor pseudo-layers
  "cabinet", // cabinet + screen panel shadows / translucent fills
];

export function applyPerfHarness() {
  if (typeof window === "undefined") return { groups: [], perf: false };
  const params = new URLSearchParams(window.location.search);
  const root = document.documentElement;

  const requested = (params.get("off") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const groups = requested.includes("all") ? PERF_GROUPS : requested;

  groups.forEach((g) => {
    if (PERF_GROUPS.includes(g)) root.classList.add(`off-${g}`);
  });

  const perf = params.has("perf");
  if (perf) root.classList.add("perf-on");

  return { groups: groups.filter((g) => PERF_GROUPS.includes(g)), perf };
}

export function perfEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("perf");
}
