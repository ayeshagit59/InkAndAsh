import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

/*
  A quiet hint of the builder behind the paintings, in the hero: a faint circuit grid with a few
  softly pulsing nodes, a handful of drifting symbols, and short lines of code that type out and fade.
  Texture only (about 6-13% opacity, feathered edges), aria-hidden, no pointer events.
  CSS animations touch only transform and opacity; the typing swaps a few characters of text every ~70ms.
  Everything pauses while the section is off-screen, and reduced motion gets one still frame.
*/

const SNIPPETS = [
  ["def reconcile(db, master):", "    return diff(db, master)"],
  ["SELECT idea FROM problems", "WHERE impact > 0;"],
  ["const colour = mix(ink, ash);", "paint(canvas, colour);"],
  ["for night in sky:", "    add(stars, night)"],
  ["if (user.stuck) ship(fix);"],
];

// positions (percent of the hero) stay around the edges, clear of the name, headline and tags
const SYMBOLS = [
  { t: "{ }", x: 8, y: 18, d: 26, s: 1.1 },
  { t: "</>", x: 88, y: 10, d: 31, s: 1 },
  { t: "=>", x: 38, y: 90, d: 24, s: 0.9 },
  { t: "01", x: 14, y: 70, d: 29, s: 0.85 },
  { t: "</>", x: 24, y: 10, d: 34, s: 0.8 },
  { t: "{ }", x: 92, y: 84, d: 27, s: 0.95 },
];

const NODES = [
  [12, 30], [20, 80], [86, 26], [90, 62], [76, 88], [30, 90], [6, 56],
];

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

/** The backdrop across the hero: circuit grid, glowing nodes, drifting symbols. */
export function TechBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref);
  return (
    <div ref={ref} className={`tech-bg${on ? "" : " is-paused"}`} aria-hidden="true">
      <svg className="tech-grid" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="tech-cells" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="1000" height="600" fill="url(#tech-cells)" opacity="0.55" />
        {/* a few circuit traces with right-angle bends */}
        <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M120 180h160v120h100" />
          <path d="M500 156v80h130v90" />
          <path d="M380 372h-80v144" />
          <path d="M630 324h150v-120" />
          <path d="M700 504h-140v-90" />
          <path d="M220 516v-80h-70" />
        </g>
        <g fill="currentColor">
          {[[280, 180], [380, 300], [500, 156], [630, 326], [780, 204], [300, 516], [560, 414], [150, 436]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.4" />
          ))}
        </g>
      </svg>
      {NODES.map(([x, y], k) => (
        <span key={k} className="tech-node" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-k * 1.3}s` } as CSSProperties} />
      ))}
      {SYMBOLS.map((s, k) => (
        <span
          key={k}
          className={`tech-sym tech-sym--${k % 3}`}
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: `${s.s * 22}px`, animationDuration: `${s.d}s`, animationDelay: `${-k * 4}s` } as CSSProperties}
        >
          {s.t}
        </span>
      ))}
    </div>
  );
}

/** One slot of code that types itself out, holds, fades, then moves on to the next snippet. */
function CodeSlot({ start, active, still }: { start: number; active: boolean; still: boolean }) {
  const [k, setK] = useState(start);
  // characters shown; slots start a little apart (a negative count is a short wait before typing)
  const [n, setN] = useState(still ? Infinity : -start * 9);
  const [fading, setFading] = useState(false);
  const lines = SNIPPETS[k % SNIPPETS.length];
  const total = lines.reduce((a, l) => a + l.length, 0);

  useEffect(() => {
    if (still || !active) return;
    let t: number;
    if (n < total) t = window.setTimeout(() => setN((c) => c + 1), 55 + Math.random() * 60);
    else if (!fading) t = window.setTimeout(() => setFading(true), 3200);
    else
      t = window.setTimeout(() => {
        setK((c) => c + 4);
        setN(0);
        setFading(false);
      }, 900);
    return () => clearTimeout(t);
  }, [n, total, fading, active, still]);

  let left = n;
  return (
    <code className={`tech-code${fading ? " is-fading" : ""}`}>
      {lines.map((l, i) => {
        const shown = l.slice(0, Math.max(0, left));
        left -= l.length;
        const typing = !still && left < 0 && shown.length < l.length && (i === 0 || n > lines[0].length);
        return (
          <span key={i} className="tech-line">
            {shown}
            {typing && <span className="tech-caret" />}
          </span>
        );
      })}
    </code>
  );
}

/** A small block of typing code lines; `starts` picks each slot's first snippet (and staggers them). */
export function CodeTyper({ className, starts }: { className: string; starts: number[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref);
  const [still] = useState(reducedMotion);
  return (
    <div ref={ref} className={`tech-codes ${className}`} aria-hidden="true">
      {starts.map((st) => (
        <CodeSlot key={st} start={st} active={on} still={still} />
      ))}
    </div>
  );
}
