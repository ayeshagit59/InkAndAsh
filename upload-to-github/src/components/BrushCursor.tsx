import { useEffect, useRef } from "react";

// Faint paint-brush trail that follows the pointer on desktop. Off for touch / coarse pointers and reduced motion.
// Every segment lives ~300ms; the canvas is cleared and redrawn each frame, so nothing accumulates.
// The loop stops (and the canvas is wiped) once the last segment has faded, the pointer leaves, or the window blurs.
const COLORS = ["#8e1bb0", "#d6338a", "#2442c9", "#1f9e94", "#f3c845", "#f07a2b"];
const LIFE = 300; // ms

type Seg = { x0: number; y0: number; x1: number; y1: number; w: number; c: string; t: number };

export function BrushCursor() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = ref.current;
    if (!fine || reduced || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const segs: Seg[] = [];
    let last: { x: number; y: number } | null = null;
    let hue = 0;
    let raf = 0;

    const clear = () => {
      segs.length = 0;
      last = null;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    };

    const frame = () => {
      raf = 0;
      const now = performance.now();
      while (segs.length && now - segs[0].t > LIFE) segs.shift();
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.lineCap = "round";
      for (const s of segs) {
        const k = 1 - (now - s.t) / LIFE;
        ctx.globalAlpha = 0.24 * k;
        ctx.strokeStyle = s.c;
        ctx.lineWidth = s.w * (0.4 + 0.6 * k);
        ctx.beginPath();
        ctx.moveTo(s.x0, s.y0);
        ctx.lineTo(s.x1, s.y1);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (segs.length) raf = requestAnimationFrame(frame);
      else last = null; // idle: the next move starts a fresh stroke
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const p = { x: e.clientX, y: e.clientY };
      if (last) {
        const d = Math.hypot(p.x - last.x, p.y - last.y);
        if (d > 1.5) {
          hue = (hue + d * 0.004) % COLORS.length;
          segs.push({ x0: last.x, y0: last.y, x1: p.x, y1: p.y, w: Math.max(2, 9 - d * 0.12), c: COLORS[Math.floor(hue)], t: performance.now() });
        }
      }
      last = p;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      clear();
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", stop);
    window.addEventListener("blur", stop);
    window.addEventListener("resize", resize);
    return () => {
      stop();
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", stop);
      window.removeEventListener("blur", stop);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="brush-canvas" aria-hidden="true" />;
}
