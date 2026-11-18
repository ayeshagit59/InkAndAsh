import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { bookingGuardPrototypeUrl, site, stories, thoucentricModelUrl, workSummary } from "../content/site";
import { LAYOUTS, pieceInsets, piecePath } from "./jigsaw";
import { Arrow } from "./Props";
import { FadeUp } from "./Reveal";
import { StoryCard, type Origin, type StoryLink } from "./StoryCard";

function Counter({ prefix, value, suffix }: { prefix: string; value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const c = animate(0, value, { duration: value > 100 ? 1.8 : 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className="summary-num">
      <span aria-hidden="true">
        {prefix && <span className="summary-pre">{prefix.trim()}</span>}
        <span className="summary-digits">
          {n.toLocaleString("en-US")}
          {suffix}
        </span>
      </span>
      <span className="sr-only">
        {prefix}
        {value.toLocaleString("en-US")}
        {suffix}
      </span>
    </span>
  );
}

const LINKS: Record<string, StoryLink> = {
  "booking-guard": { label: "Open the prototype", url: bookingGuardPrototypeUrl, soon: "Prototype link coming soon" },
  thoucentric: { label: "See the model", url: thoucentricModelUrl, soon: "Model link coming soon" },
};
const BADGE: Record<string, string> = { "booking-guard": "Prototype", thoucentric: "Model" };
// most lines of hook a piece may show: three on the two small Deloitte pieces, five on Booking Guard, four elsewhere
const SMALL = new Set(["flow-bot", "db-agent"]);
const INSET_PX = 14; // breathing room inside the outline, on top of any socket depth

function useMobile() {
  const q = "(max-width: 640px)";
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

/*
  Six interlocking jigsaw pieces (SVG outlines from jigsaw.ts) forming one rounded square.
  Each piece is a full-board <button> that only takes pointer events on its own painted shape,
  so the tabs and sockets are the real hit areas. Hover / focus lifts a piece and dims the rest.
*/
function Puzzle({ onOpen }: { onOpen: (id: string, from: Origin) => void }) {
  const mobile = useMobile();
  const L = LAYOUTS[mobile ? "mobile" : "desktop"];
  const S = 50; // px per unit in the SVG viewBox
  const board = useRef<HTMLDivElement>(null);
  const inView = useInView(board, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const [hot, setHot] = useState<string | null>(null);
  const byId = Object.fromEntries(stories.map((s) => [s.id, s]));

  // Each piece's text sits in a safe box clear of its outline. Show the hook only where it fits
  // (within the box and its line limit); otherwise the piece keeps just its name and the hook waits in the pop-up.
  useLayoutEffect(() => {
    const el = board.current!;
    const fit = () => {
      el.querySelectorAll<HTMLElement>(".jp-safe").forEach((box) => {
        const hook = box.querySelector<HTMLElement>(".jp-hook");
        if (!hook) return;
        box.classList.remove("jp-safe--tight");
        const lines = Math.round(hook.offsetHeight / parseFloat(getComputedStyle(hook).lineHeight));
        const id = box.dataset.id!;
        const max = SMALL.has(id) ? 3 : id === "booking-guard" ? 5 : 4;
        // layout boxes only (offset*), so the cue's little hover nudge never counts as overflow
        const foot = box.querySelector<HTMLElement>(".jp-foot")!;
        const tall = foot.offsetTop + foot.offsetHeight > box.clientHeight + 1;
        const wide = [...box.children].some((c) => (c as HTMLElement).offsetWidth > box.clientWidth + 1);
        if (lines > max || tall || wide) box.classList.add("jp-safe--tight");
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [mobile]);

  return (
    <div
      ref={board}
      className={`puzzle${hot ? " puzzle--hot" : ""}`}
      style={{ aspectRatio: `${L.W} / ${L.H}` }}
      onPointerLeave={() => setHot(null)}
    >
      {L.rects.map((r, i) => {
        const s = byId[r.id];
        const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
        // pieces slide in from outside the board, along the line from the centre through the piece
        const dx = (cx - L.W / 2) * 9, dy = (cy - L.H / 2) * 9;
        const badge = BADGE[r.id] && LINKS[r.id]?.url ? BADGE[r.id] : null;
        const pct = (v: number, of: number) => `${(v / of) * 100}%`;
        const [it, ir, ib, il] = pieceInsets(L, i);
        const inset = (u: number, of: number) => `calc(${(u / of) * 100}% + ${INSET_PX}px)`;
        return (
          <motion.div
            key={r.id}
            className="jp-wrap"
            style={{ zIndex: hot === r.id ? 2 : 1 }}
            initial={reduced ? false : { opacity: 0, x: dx, y: dy, rotate: (i % 2 ? 1 : -1) * 6, filter: "blur(10px)" }}
            animate={inView ? { opacity: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } } : undefined}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.12 }}
          >
            <button
              type="button"
              className={`jp tone-${s.tone}${hot === r.id ? " jp--hot" : ""}`}
              style={{ transformOrigin: `${pct(cx, L.W)} ${pct(cy, L.H)}` }}
              onClick={(e) => {
                const rect = e.currentTarget.querySelector(".jp-label")!.getBoundingClientRect();
                onOpen(r.id, { x: rect.left, y: rect.top, w: rect.width, h: rect.height });
              }}
              onFocus={() => setHot(r.id)}
              onBlur={() => setHot(null)}
              aria-haspopup="dialog"
              aria-label={`${s.short}: ${s.hook}${badge ? ` Has a ${badge.toLowerCase()} link.` : ""} Read the story.`}
            >
              <svg viewBox={`0 0 ${L.W * S} ${L.H * S}`} aria-hidden="true">
                <path className="jp-shape" d={piecePath(L, i, S)} onPointerEnter={() => setHot(r.id)} />
              </svg>
              <span
                className={`jp-label jp-label--${r.id}`}
                style={{ left: pct(r.x, L.W), top: pct(r.y, L.H), width: pct(r.w, L.W), height: pct(r.h, L.H) }}
                aria-hidden="true"
              >
                <span
                  className={`jp-safe${SMALL.has(r.id) ? " jp-safe--small" : ""}`}
                  data-id={r.id}
                  style={{ top: inset(it, r.h), right: inset(ir, r.w), bottom: inset(ib, r.h), left: inset(il, r.w) }}
                >
                  <span className="jp-tag">{s.short}</span>
                  <span className="jp-hook">{s.hook}</span>
                  <span className="jp-foot">
                    {badge && <span className="jp-badge">{badge} ↗</span>}
                    <span className="jp-cue">
                      {badge ? "Story" : "Read the story"} <Arrow />
                    </span>
                  </span>
                </span>
              </span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

/** A quiet extra under the caption: one link to her GitHub, revealed a beat after the caption. */
function GitHubCard() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="gh-wrap"
      initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
    >
      <a className="gh-card" href={site.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="Ayesha's GitHub profile (opens in a new tab)">
        <svg className="gh-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.4 4.5l-2.8 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="gh-text">
          <span className="gh-line">Curious about the code?</span>
          <span className="gh-link">
            Visit my GitHub <span className="gh-arrow">↗</span>
          </span>
        </span>
      </a>
    </motion.div>
  );
}

export function SelectedWork() {
  const [open, setOpen] = useState<{ id: string; from: Origin } | null>(null);
  const story = stories.find((s) => s.id === open?.id) ?? null;

  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="work-layout">
          <div className="work-aside">
            <FadeUp className="work-caption">
              <h2 id="work-title" className="section-title">
                Builds, wins and <span className="script">big questions</span>
              </h2>
              <span className="work-rule" aria-hidden="true" />
              <p className="work-lede">
                <em>Six stories</em> about ideas that became products, proposals and plans. Pick a piece that makes you <em>curious</em>.
              </p>
              <GitHubCard />
            </FadeUp>
          </div>

          <Puzzle onOpen={(id, from) => setOpen({ id, from })} />
        </div>

        <FadeUp className="summary" delay={0.1}>
          <h3 className="sr-only">In numbers</h3>
          <ul>
            {workSummary.map((w) => (
              <li key={w.label}>
                <Counter prefix={w.prefix} value={w.value} suffix={w.suffix} />
                <span className="summary-label">{w.label}</span>
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>

      <StoryCard story={story} from={open?.from} link={story ? LINKS[story.id] : undefined} onClose={() => setOpen(null)} />
    </section>
  );
}
