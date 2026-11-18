import { useEffect, useRef } from "react";
import { DRINKS, TOOLS, type ToolId } from "./Travellers";

/*
  The "colour-melt" scroll.

  Two layers sit behind the content:
  1. PageCanvas: one page-length gradient. Every section owns a solid colour band; the melt happens only
     in the padding between sections, so text always sits on its own section's colour (AA stays true
     mid-scroll) while the page still reads as one continuous painting.
  2. Atmosphere: a fixed layer driven by scroll position like the kombucha reference: soft paint blobs
     that morph shape and colour, a giant faint word per section, and the steaming cup that travels
     down the right side, tilting a little per section.
  Native scroll throughout; we only read scroll position and write transforms / custom properties.
*/

type Blob = { c: string; x: number; y: number; s: number; r: number; shape: number[] };
type Travel = { o: number; r: number; y: number };
type Scene = { id: string; bg: string; via?: string; word: string; blobs: [Blob, Blob, Blob]; cup: Travel; brush: Travel & { tool: ToolId; paint: string } };

const B = (c: string, x: number, y: number, s: number, r: number, shape: number[]): Blob => ({ c, x, y, s, r, shape });

export const SCENES: Scene[] = [
  {
    id: "home",
    bg: "#0b0a1f",
    word: "",
    blobs: [B("#d6338a", -10, -8, 1, 0, [60, 40, 55, 45, 50, 50, 40, 60]), B("#2442c9", 70, 10, 0.9, 20, [45, 55, 60, 40, 55, 45, 50, 50]), B("#8e1bb0", 30, 60, 0.8, -10, [50, 50, 45, 55, 60, 40, 55, 45])],
    // the hero has its own steaming cup among the polaroids, so both travellers wait until About
    cup: { o: 0, r: -6, y: 0 },
    brush: { o: 0, r: 6, y: 0, tool: "round", paint: "#d6338a" },
  },
  {
    id: "about",
    bg: "#24142f",
    via: "#3b1c4a",
    word: "Hello",
    blobs: [B("#8e1bb0", -14, 10, 1.1, 30, [40, 60, 45, 55, 55, 45, 60, 40]), B("#d6338a", 72, 46, 0.85, 60, [55, 45, 40, 60, 45, 55, 50, 50]), B("#2442c9", 40, -20, 0.7, 10, [60, 40, 50, 50, 40, 60, 45, 55])],
    cup: { o: 1, r: -6, y: 0 },
    brush: { o: 1, r: -5, y: -20, tool: "flat", paint: "#c9a2e0" },
  },
  {
    id: "work",
    bg: "#faf5ec",
    via: "#b77fa6",
    word: "Work",
    blobs: [B("#f3c845", -18, 50, 0.9, 80, [55, 45, 60, 40, 45, 55, 40, 60]), B("#c9a2e0", 74, -6, 1, 110, [45, 55, 50, 50, 60, 40, 55, 45]), B("#f07a2b", 50, 70, 0.6, 40, [40, 60, 55, 45, 50, 50, 60, 40])],
    cup: { o: 1, r: 5, y: -10 },
    brush: { o: 1, r: 4, y: 10, tool: "knife", paint: "#f07a2b" },
  },
  {
    id: "art",
    bg: "#f4e8f0",
    word: "Art",
    blobs: [B("#d6338a", -6, -10, 0.95, 140, [60, 40, 40, 60, 55, 45, 45, 55]), B("#2442c9", 76, 40, 0.9, 170, [50, 50, 60, 40, 40, 60, 55, 45]), B("#1f9e94", 20, 66, 0.75, 120, [45, 55, 55, 45, 60, 40, 50, 50])],
    cup: { o: 1, r: -4, y: 6 },
    brush: { o: 1, r: -6, y: -10, tool: "round", paint: "#2442c9" },
  },
  {
    id: "music-coffee",
    bg: "#2a1d16",
    via: "#8a5a3b",
    word: "Coffee",
    blobs: [B("#c9a27a", -12, 20, 1.05, 200, [55, 45, 45, 55, 40, 60, 60, 40]), B("#8e1bb0", 74, -10, 0.8, 230, [40, 60, 55, 45, 50, 50, 45, 55]), B("#e7d3b8", 40, 64, 0.65, 190, [60, 40, 50, 50, 55, 45, 40, 60])],
    cup: { o: 1, r: 8, y: -4 },
    brush: { o: 1, r: 5, y: 6, tool: "flat", paint: "#c9a27a" },
  },
  {
    id: "footer",
    bg: "#0b0a1f",
    via: "#1a1226",
    word: "",
    blobs: [B("#8e1bb0", -10, 40, 0.8, 260, [50, 50, 55, 45, 45, 55, 60, 40]), B("#2442c9", 70, 20, 0.7, 290, [45, 55, 40, 60, 60, 40, 50, 50]), B("#d6338a", 30, 70, 0.5, 250, [55, 45, 60, 40, 50, 50, 45, 55])],
    cup: { o: 1, r: 4, y: 10 },
    brush: { o: 1, r: -3, y: 0, tool: "knife", paint: "#8e1bb0" },
  },
];

/*
  Hand-tuned colour bands, keyed by the section being entered: [colour, 0..1 across the band].
  Dark into light (About -> Work) climbs through indigo, plum and lilac to the paper; Work -> Art is one
  long, barely-there drift from cream to a warm blush (no seam); Art -> Music & Coffee mirrors the first band
  down through lilac and plum into the espresso. `reach` stretches a band past the padding (light-to-light only,
  so no text ever sits on a mid-tone). Other boundaries melt through the scene's `via` colour.
*/
const BANDS: Record<string, { stops: [string, number][]; reach?: number }> = {
  work: { stops: [["#24142f", 0], ["#1e1038", 0.18], ["#4a2466", 0.34], ["#b58ac4", 0.56], ["#e9dceb", 0.8], ["#faf5ec", 1]] },
  art: { stops: [["#faf5ec", 0], ["#f8eeea", 0.55], ["#f4e8f0", 1]], reach: 2.4 },
  "music-coffee": { stops: [["#f4e8f0", 0], ["#e9dceb", 0.2], ["#b58ac4", 0.44], ["#4a2466", 0.66], ["#2e1b2b", 0.84], ["#2a1d16", 1]] },
};

// kept low over the paper sections so muted text stays AA even at a blob's centre
const BLOB_ALPHA = [0.0, 0.42, 0.22, 0.2, 0.32, 0.25];

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a), C = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, C[i], t))).join(" ")}`;
};
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

function sectionEls() {
  return SCENES.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
}

/** The painted page-length background. */
export function PageCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const paint = () => {
      const secs = sectionEls();
      if (secs.length !== SCENES.length) return;
      const docTop = (n: HTMLElement) => n.getBoundingClientRect().top + window.scrollY;
      const stops: string[] = [`${SCENES[0].bg} 0px`];
      for (let i = 0; i < secs.length - 1; i++) {
        const boundary = docTop(secs[i + 1]);
        // melt across the padding on either side of the boundary
        const padA = parseFloat(getComputedStyle(secs[i]).paddingBottom) || 80;
        const padB = parseFloat(getComputedStyle(secs[i + 1]).paddingTop) || 80;
        const band = BANDS[SCENES[i + 1].id];
        const k = 0.92 * (band?.reach ?? 1);
        const from = boundary - padA * k;
        const to = boundary + padB * k;
        if (band) {
          for (const [c, at] of band.stops) stops.push(`${c} ${Math.round(from + (to - from) * at)}px`);
          continue;
        }
        stops.push(`${SCENES[i].bg} ${Math.round(from)}px`);
        if (SCENES[i + 1].via) stops.push(`${SCENES[i + 1].via} ${Math.round((from + to) / 2)}px`);
        stops.push(`${SCENES[i + 1].bg} ${Math.round(to)}px`);
      }
      el.style.backgroundImage = `linear-gradient(to bottom, ${stops.join(", ")})`;
    };
    paint();
    const ro = new ResizeObserver(() => requestAnimationFrame(paint));
    ro.observe(document.body);
    window.addEventListener("resize", paint);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", paint);
    };
  }, []);

  return <div ref={ref} className="page-canvas" aria-hidden="true" />;
}

/** The fixed, scroll-driven atmosphere: blobs, giant words, travelling cup. */
export function Atmosphere() {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cupRef = useRef<HTMLDivElement>(null);
  const drinkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const brushRef = useRef<HTMLDivElement>(null);
  const toolRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trailRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let bounds: number[] = [];
    let raf = 0;
    let trailRaf = 0;
    // the paint trail: points stay where they were laid on the page and fade out over ~0.9s
    const trail: { x: number; y: number; t: number; c: string }[] = [];
    const TRAIL_MS = 900;
    const drawTrail = () => {
      trailRaf = 0;
      const cv = trailRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d")!;
      const now = performance.now();
      while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
      ctx.clearRect(0, 0, cv.width, cv.height);
      const dpr = window.devicePixelRatio || 1;
      ctx.lineCap = "round";
      for (let k = 1; k < trail.length; k++) {
        const a = trail[k - 1], b = trail[k];
        const life = 1 - (now - b.t) / TRAIL_MS;
        if (Math.abs(b.y - a.y) > 200) continue;
        ctx.strokeStyle = b.c;
        ctx.globalAlpha = 0.32 * life;
        ctx.lineWidth = (3 + 4 * life) * dpr;
        ctx.beginPath();
        ctx.moveTo(a.x * dpr, (a.y - window.scrollY) * dpr);
        ctx.lineTo(b.x * dpr, (b.y - window.scrollY) * dpr);
        ctx.stroke();
      }
      if (trail.length) trailRaf = requestAnimationFrame(drawTrail);
    };

    const measure = () => {
      bounds = sectionEls().slice(1).map((n) => n.getBoundingClientRect().top + window.scrollY);
    };

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const center = window.scrollY + vh * 0.5;
      // fractional scene index, melting over ±35% of the viewport around each boundary
      let f = 0;
      for (const b of bounds) f += smooth((center - (b - vh * 0.35)) / (vh * 0.7));
      const i = Math.min(SCENES.length - 1, Math.floor(f));
      const j = Math.min(SCENES.length - 1, i + 1);
      const t = f - i;
      const A = SCENES[i], C = SCENES[j];

      A.blobs.forEach((a, k) => {
        const c = C.blobs[k];
        const n = blobRefs.current[k];
        if (!n) return;
        const x = lerp(a.x, c.x, t), y = lerp(a.y, c.y, t), s = lerp(a.s, c.s, t), r = lerp(a.r, c.r, t);
        const sh = a.shape.map((v, m) => lerp(v, c.shape[m], t).toFixed(1) + "%");
        n.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotate(${r}deg) scale(${s})`;
        n.style.borderRadius = `${sh[0]} ${sh[1]} ${sh[2]} ${sh[3]} / ${sh[4]} ${sh[5]} ${sh[6]} ${sh[7]}`;
        n.style.setProperty("--blob", mix(a.c, c.c, t));
      });
      rootRef.current!.style.setProperty("--blob-alpha", String(lerp(BLOB_ALPHA[i], BLOB_ALPHA[j], t)));

      SCENES.forEach((_, k) => {
        const w = wordRefs.current[k];
        if (!w) return;
        // each giant word also fades out before its section's edges, so no faint lettering sits on a seam
        const top = k === 0 ? -Infinity : bounds[k - 1];
        const bottom = k < bounds.length ? bounds[k] : Infinity;
        const edge = smooth((center - top) / (vh * 0.3)) * smooth((bottom - center) / (vh * 0.3));
        const weight = (k === i ? 1 - t : k === j ? t : 0) * edge;
        w.style.opacity = String(weight);
        w.style.transform = `translate3d(0, ${(k - f) * 16}vh, 0)`;
      });

      const cup = cupRef.current;
      if (cup) {
        const o = lerp(A.cup.o, C.cup.o, t);
        // a little drift within each section, plus the per-section tilt
        const wobble = Math.sin(f * Math.PI) * 6;
        cup.style.opacity = String(o);
        cup.style.transform = `translate3d(${wobble}px, ${lerp(A.cup.y, C.cup.y, t)}px, 0) rotate(${lerp(A.cup.r, C.cup.r, t)}deg)`;
      }
      // one drink per section, cross-faded
      drinkRefs.current.forEach((d, k) => {
        if (d) d.style.opacity = String(k === i ? 1 - t : k === j ? t : 0);
      });

      const brush = brushRef.current;
      if (brush && brush.offsetParent !== null) {
        const sway = Math.sin(f * Math.PI * 2) * 5;
        const y = lerp(A.brush.y, C.brush.y, t) + Math.cos(f * Math.PI * 2) * 14;
        const paint = mix(A.brush.paint, C.brush.paint, t);
        brush.style.opacity = String(lerp(A.brush.o, C.brush.o, t));
        brush.style.transform = `translate3d(${sway}px, ${y}px, 0) rotate(${lerp(A.brush.r, C.brush.r, t)}deg)`;
        brush.style.setProperty("--paint", paint);
        // tools cross-fade where the tool changes; the same tool on both sides stays put
        toolRefs.current.forEach((n) => {
          if (!n) return;
          const id = n.dataset.tool;
          const w = (A.brush.tool === id ? 1 - t : 0) + (C.brush.tool === id ? t : 0);
          n.style.opacity = String(Math.min(1, w));
        });
        // lay paint at the tip, in page coordinates
        const r = brush.getBoundingClientRect();
        const last = trail[trail.length - 1];
        const tip = { x: r.left + r.width / 2, y: r.bottom - 6 + window.scrollY };
        if (!last || Math.abs(tip.y - last.y) > 2) {
          trail.push({ ...tip, t: performance.now(), c: paint });
          if (!trailRaf) trailRaf = requestAnimationFrame(drawTrail);
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const sizeTrail = () => {
      const cv = trailRef.current;
      if (!cv) return;
      const dpr = window.devicePixelRatio || 1;
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
    };
    measure();
    sizeTrail();
    update();
    trail.length = 0; // no stroke on first paint
    const ro = new ResizeObserver(() => {
      measure();
      sizeTrail();
      onScroll();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(trailRaf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="atmosphere" aria-hidden="true">
      {[0, 1, 2].map((k) => (
        <div key={k} ref={(n) => (blobRefs.current[k] = n)} className={`blob blob-${k}`} />
      ))}
      <div className="giant-words">
        {SCENES.map((s, k) => (
          <span key={s.id} ref={(n) => (wordRefs.current[k] = n)} className={`giant-word giant-word--${s.id}`}>
            {s.word}
          </span>
        ))}
      </div>
      <div ref={cupRef} className="travel-cup">
        {DRINKS.map((Drink, k) => (
          <div key={k} ref={(n) => (drinkRefs.current[k] = n)} className="drink" style={{ opacity: k === 0 ? 1 : 0 }}>
            <Drink />
          </div>
        ))}
      </div>
      <canvas ref={trailRef} className="paint-trail" />
      <div ref={brushRef} className="travel-brush" style={{ "--paint": SCENES[0].brush.paint } as React.CSSProperties}>
        {(Object.keys(TOOLS) as ToolId[]).map((id, k) => {
          const Tool = TOOLS[id];
          return (
            <div key={id} ref={(n) => (toolRefs.current[k] = n)} data-tool={id} className="tool" style={{ opacity: id === SCENES[0].brush.tool ? 1 : 0 }}>
              <Tool />
            </div>
          );
        })}
      </div>
    </div>
  );
}
