import { useEffect, useState } from "react";

// Live FPS / frame-time readout. Mounted only when ?perf is in the URL.
// Read it on a FOCUSED browser tab — background tabs throttle rAF and lie.
export default function PerfHud() {
  const [s, setS] = useState({ fps: 0, ms: 0, worst: 0 });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let acc = 0;
    let worst = 0;
    let reportAt = last;

    const loop = (now) => {
      const d = now - last;
      last = now;
      frames += 1;
      acc += d;
      if (d > worst) worst = d;
      if (now - reportAt >= 500) {
        setS({
          fps: Math.round((frames * 1000) / acc),
          ms: +(acc / frames).toFixed(1),
          worst: +worst.toFixed(0),
        });
        frames = 0;
        acc = 0;
        worst = 0;
        reportAt = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const color = s.fps >= 55 ? "#1ae67a" : s.fps >= 30 ? "#ffd23f" : "#ff4d6d";
  const off = (document.documentElement.className.match(/off-[\w]+/g) || [])
    .map((c) => c.replace("off-", ""))
    .join(", ");

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        left: 8,
        zIndex: 99999,
        pointerEvents: "none",
        font: "12px/1.5 ui-monospace, Menlo, monospace",
        color,
        background: "rgba(0,0,0,0.8)",
        border: `1px solid ${color}`,
        borderRadius: 6,
        padding: "6px 10px",
        whiteSpace: "pre",
      }}
    >
      {`FPS ${s.fps}   avg ${s.ms}ms   worst ${s.worst}ms\noff: ${
        off || "none (full effects)"
      }`}
    </div>
  );
}
