import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { artMetaFor, artSrc, artSrcSet, mediumPost } from "../content/art";
import { favourites, studio, studioLabel, type GalleryEntry } from "../content/gallery";
import { site } from "../content/site";
import { CoffeeCup } from "./Props";
import "./gallery.css";

/*
  The gallery as a scrapbook: "The Studio Book".
  A leather cover swings open about the spine, then pages turn. Every leaf is a two-sided element
  (front + back faces, backface-visibility hidden) rotating about the spine with CSS transitions on
  transform only, so a turn can be interrupted and reversed mid-way, and a drag sets the angle directly.
  Desktop shows spreads (two pages); phones show one page at a time. Reduced motion cross-fades instead.
*/

const TURN_MS = 1100;
const EASE = "cubic-bezier(0.645, 0.045, 0.355, 1)";

type Page = { key: string; node: ReactNode; slug?: string; label: string };
type Leaf = { front: Page; back: Page | null; cover?: boolean };

/* ---------------- page pieces ---------------- */

function Print({ g, w, tilt, tape = "a" }: { g: GalleryEntry; w: number; tilt: number; tape?: "a" | "b" | "corners" }) {
  const m = artMetaFor(g.slug);
  return (
    <figure className={`bk-print bk-print--${tape}`} style={{ "--tilt": `${tilt}deg` } as CSSProperties}>
      <img
        src={artSrc(g.slug, 800)}
        srcSet={artSrcSet(g.slug)}
        sizes={`${Math.round(w)}px`}
        width={m.width}
        height={m.height}
        alt={g.alt}
        // only pages near the open spread are mounted, so load them now: a lazy image would only start
        // loading (and decoding) once it came into view, i.e. in the middle of a turn
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </figure>
  );
}

const Doodle = {
  star: () => (
    <svg className="bk-doodle bk-doodle--star" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 4l4 11 12 1-9 8 3 12-10-7-10 7 3-12-9-8 12-1z" />
    </svg>
  ),
  brush: () => (
    <svg className="bk-doodle bk-doodle--brush" viewBox="0 0 80 24" aria-hidden="true">
      <path d="M4 12c8-6 18-7 24-4l3 4-3 4c-6 3-16 2-24-4zM31 9h14v6H31zM45 10h30c3 0 4 1 4 2s-1 2-4 2H45" />
    </svg>
  ),
  ring: () => <span className="bk-doodle bk-doodle--ring" aria-hidden="true" />,
};

/** One favourite per page: the print (taped in), its label, "Favourite n of 8" and the Medium link. */
function FavPage({ g, i, w }: { g: GalleryEntry; i: number; w: number }) {
  return (
    <div className="bk-page-in bk-fav">
      <Print g={g} w={w * 0.6} tilt={i % 2 ? 1.6 : -1.8} tape={i % 3 === 2 ? "corners" : i % 2 ? "b" : "a"} />
      <p className="bk-hand">{g.title}</p>
      <p className="bk-fav-no">
        Favourite {i + 1} of {favourites.length}
      </p>
      <a className="bk-link" href={mediumPost(g.postId)} target="_blank" rel="noopener">
        Read the story on Medium <span aria-hidden="true">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      {i % 3 === 0 ? <Doodle.star /> : i % 3 === 1 ? <Doodle.ring /> : <Doodle.brush />}
      {i % 2 ? <Doodle.brush /> : <Doodle.star />}
    </div>
  );
}

const TILTS = [-3, 2.4, -1.4, 3.2, -2.6, 1.8];

function CollagePage({ items, heading, w, grid }: { items: GalleryEntry[]; heading?: boolean; w: number; grid?: boolean }) {
  return (
    <div className={`bk-page-in bk-collage${grid ? " bk-collage--grid" : ""}${heading ? " bk-collage--head" : ""}`}>
      {heading && <h2 className="bk-studio-head">More from the studio</h2>}
      {items.map((g, k) => (
        <a key={g.slug} className={`bk-snap${!grid && items.length === 3 && k === 2 ? " bk-snap--wide" : ""}`} href={mediumPost(g.postId)} target="_blank" rel="noopener" aria-label={`${g.title}: read the story on Medium (opens in a new tab)`} style={{ "--tilt": `${TILTS[(k + (heading ? 1 : 0) + g.n) % TILTS.length]}deg` } as CSSProperties}>
          <Print g={g} w={grid ? w * 0.42 : w * 0.5} tilt={0} tape={k % 2 ? "b" : "corners"} />
          <span className="bk-snap-label">{studioLabel[g.slug]}</span>
        </a>
      ))}
      {heading ? <Doodle.ring /> : <Doodle.star />}
    </div>
  );
}

function Cover({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="bk-cover" onClick={onOpen} aria-label="Open The Studio Book">
      <span className="bk-cover-frame" aria-hidden="true" />
      <span className="bk-cover-title">The Studio Book</span>
      <span className="bk-cover-sub">Ink&amp;Ash · paintings, 2025</span>
      <span className="bk-cover-line">My favourites first, then the rest of the studio.</span>
      <span className="bk-cover-hint">Tap to open</span>
    </button>
  );
}

function EndPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="bk-page-in bk-end">
      <p className="bk-end-line">Thanks for wandering through. There's more on Medium.</p>
      <a className="bk-link" href={site.mediumUrl} target="_blank" rel="noopener">
        medium.com/@InkAndAsh <span aria-hidden="true">↗</span>
      </a>
      <button type="button" className="btn-pill bk-close-btn" onClick={onClose}>
        Close the book
      </button>
      <Doodle.ring />
    </div>
  );
}

function EndPaper() {
  return (
    <div className="bk-page-in bk-endpaper">
      <Doodle.brush />
      <Doodle.star />
      <p className="bk-hand bk-hand--soft">with ink &amp; a little ash</p>
    </div>
  );
}

/* ---------------- sizing ---------------- */

function useBookSize() {
  const get = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const single = vw < 820;
    if (single) {
      const w = Math.min(vw - 40, 440);
      const h = Math.min(vh - 190, w * 1.62);
      return { single, w: Math.round(w), h: Math.round(h) };
    }
    let h = Math.min(vh - 200, 680);
    let w = h * 0.74;
    if (2 * w + 220 > vw) {
      w = (vw - 220) / 2;
      h = w / 0.74;
    }
    return { single, w: Math.round(w), h: Math.round(h) };
  };
  const [s, setS] = useState(get);
  useEffect(() => {
    const on = () => setS(get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return s;
}

/* ---------------- the book ---------------- */

export function Gallery() {
  const reduced = !!useReducedMotion();
  const { single, w, h } = useBookSize();
  const [turned, setTurned] = useState(0); // leaves turned; 0 = closed
  const [turning, setTurning] = useState<Record<number, 1 | -1>>({});
  const leafRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timers = useRef<Record<number, number>>({});
  const closing = useRef<number[]>([]);

  const closeBook = useCallback(() => {
    // riffle back to the cover, one leaf at a time
    closing.current.forEach(clearTimeout);
    closing.current = [];
    setTurned((t) => {
      for (let k = 1; k <= t; k++) closing.current.push(window.setTimeout(() => setTurned(t - k), k * 110));
      return t;
    });
  }, []);

  const leaves: Leaf[] = useMemo(() => {
    const F = favourites, S = studio;
    if (single) {
      const pages: Page[] = [
        ...F.map((g, i) => ({ key: `f${i}`, slug: g.slug, label: g.title, node: <FavPage g={g} i={i} w={w} /> })),
        { key: "s0", slug: S[0].slug, label: "More from the studio", node: <CollagePage items={S.slice(0, 3)} heading w={w} grid /> },
        { key: "s1", slug: S[3].slug, label: "More from the studio", node: <CollagePage items={S.slice(3, 7)} w={w} grid /> },
        { key: "s2", slug: S[7].slug, label: "More from the studio", node: <CollagePage items={S.slice(7, 11)} w={w} grid /> },
        { key: "end", label: "The end", node: <EndPage onClose={closeBook} /> },
      ];
      return [{ cover: true, front: { key: "cover", label: "Cover", node: null }, back: null }, ...pages.map((p) => ({ front: p, back: null }))];
    }
    // spreads: [left, right]; favourites two to a spread, one painting per page
    const fav = (i: number): Page => ({ key: `f${i}`, slug: F[i].slug, label: F[i].title, node: <FavPage g={F[i]} i={i} w={w} /> });
    const spreads: [Page, Page][] = [
      ...Array.from({ length: Math.ceil(F.length / 2) }, (_, k): [Page, Page] => [fav(2 * k), fav(2 * k + 1)]),
      [
        { key: "s0", slug: S[0].slug, label: "More from the studio", node: <CollagePage items={S.slice(0, 2)} heading w={w} /> },
        { key: "s1", slug: S[2].slug, label: "More from the studio", node: <CollagePage items={S.slice(2, 5)} w={w} /> },
      ],
      [
        { key: "s2", slug: S[5].slug, label: "More from the studio", node: <CollagePage items={S.slice(5, 8)} w={w} /> },
        { key: "s3", slug: S[8].slug, label: "More from the studio", node: <CollagePage items={S.slice(8, 11)} w={w} /> },
      ],
      [
        { key: "e0", label: "The end", node: <EndPaper /> },
        { key: "e1", label: "The end", node: <EndPage onClose={closeBook} /> },
      ],
    ];
    const out: Leaf[] = [{ cover: true, front: { key: "cover", label: "Cover", node: null }, back: spreads[0][0] }];
    spreads.forEach((sp, k) => out.push({ front: sp[1], back: spreads[k + 1]?.[0] ?? null }));
    return out;
  }, [single, w, closeBook]);

  // the last leaf stays put: its front is the final page
  const maxTurned = leaves.length - 1;
  const spreadCount = maxTurned;

  // turn to an absolute position, decoding the next pages' images first so nothing pops in mid-turn
  const go = useCallback(
    (target: number) => {
      closing.current.forEach(clearTimeout);
      closing.current = [];
      setTurned((cur) => {
        const t = Math.max(0, Math.min(maxTurned, target));
        if (t === cur) return cur;
        const dir: 1 | -1 = t > cur ? 1 : -1;
        const moving = dir > 0 ? Array.from({ length: t - cur }, (_, k) => cur + k) : Array.from({ length: cur - t }, (_, k) => cur - 1 - k);
        setTurning((m) => {
          const n = { ...m };
          moving.forEach((i) => {
            n[i] = dir;
            clearTimeout(timers.current[i]);
            timers.current[i] = window.setTimeout(() => setTurning((x) => {
              const y = { ...x };
              delete y[i];
              return y;
            }), TURN_MS + 60);
          });
          return n;
        });
        return t;
      });
    },
    [maxTurned],
  );

  const next = useCallback(() => go(turned + 1), [go, turned]);
  const prev = useCallback(() => go(turned - 1), [go, turned]);

  // preload + decode images on the pages around the current spread
  useEffect(() => {
    const slugs = new Set<string>();
    for (let k = turned - 1; k <= turned + 2; k++) {
      const L = leaves[k];
      if (!L) continue;
      if (L.front.slug) slugs.add(L.front.slug);
      if (L.back?.slug) slugs.add(L.back.slug);
    }
    slugs.forEach((s) => {
      const im = new Image();
      im.src = artSrc(s, 800);
      im.decode?.().catch(() => {});
    });
  }, [turned, leaves]);

  // keyboard, wheel (one turn per gesture), no page scroll
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    document.title = `The Studio Book · ${site.brand}`;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    let lastWheel = 0;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel < 900) return;
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(acc) > 40) {
        if (acc > 0) next();
        else prev();
        acc = 0;
        lastWheel = now;
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      html.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      document.title = `${site.brand} · ${site.name}`;
    };
  }, [next, prev]);

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
    closing.current.forEach(clearTimeout);
  }, []);

  /* ---- drag / swipe / tap on the pages ---- */
  const drag = useRef<{ x: number; id: number; leaf: number; dir: 1 | -1; active: boolean; angle: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (reduced || turned === 0) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    drag.current = { x: e.clientX, id: e.pointerId, leaf: -1, dir: 1, active: false, angle: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.active) {
      if (Math.abs(dx) < 12) return;
      d.dir = dx < 0 ? 1 : -1;
      d.leaf = d.dir > 0 ? turned : turned - 1;
      if ((d.dir > 0 && turned >= maxTurned) || (d.dir < 0 && turned <= 1)) {
        drag.current = null;
        return;
      }
      d.active = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    const el = leafRefs.current[d.leaf];
    if (!el) return;
    const span = single ? w : w * 1.6;
    const p = Math.max(0, Math.min(1, (d.dir > 0 ? -dx : dx) / span));
    d.angle = d.dir > 0 ? -180 * p : -180 * (1 - p);
    el.style.transition = "none";
    el.style.transform = `rotateY(${d.angle}deg)`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.active) {
      // a tap: outer half of the right page turns forward, outer half of the left page turns back
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      if (single) (x > 0.5 ? next : prev)();
      else if (x > 0.75) next();
      else if (x < 0.25) prev();
      return;
    }
    const el = leafRefs.current[d.leaf];
    const done = d.dir > 0 ? d.angle < -60 : d.angle > -120;
    if (el) {
      // settle from wherever the drag left it with a soft ease-out
      el.style.transition = `transform 520ms cubic-bezier(0.22, 1, 0.36, 1)`;
      requestAnimationFrame(() => {
        el.style.transform = "";
        window.setTimeout(() => (el.style.transition = ""), 560);
      });
    }
    if (done) go(d.dir > 0 ? turned + 1 : turned - 1);
  };

  const open = turned > 0;
  const current = leaves[turned]?.front ?? leaves[0].front;
  const leftPage = !single && turned > 0 ? leaves[turned - 1]?.back : null;
  const washSlug = (single ? current.slug : (leftPage?.slug ?? current.slug)) ?? null;
  const announce = turned === 0 ? "The Studio Book, closed. Press the right arrow to open." : `${single ? "Page" : "Spread"} ${turned} of ${spreadCount}: ${single ? current.label : (leftPage?.label ?? current.label)}`;
  // favourites take one page each on a phone, two to a spread otherwise
  const favSpreads = single ? favourites.length : Math.ceil(favourites.length / 2);
  const section = turned === 0 ? null : turned <= favSpreads ? "fav" : "studio";
  const studioStart = favSpreads + 1;

  const bookStyle = {
    "--pw": `${w}px`,
    "--ph": `${h}px`,
    "--turn": `${TURN_MS}ms`,
    "--ease": EASE,
  } as CSSProperties;

  return (
    <div className={`gallery bk-desk${single ? " bk--single" : ""}`}>
      {/* a faint wash of the painting on show */}
      <div className="bk-wash" aria-hidden="true">
        <AnimatePresence initial={false}>
          {washSlug && (
            <motion.div
              key={washSlug}
              className="bk-wash-layer"
              style={{ backgroundImage: `url(${artSrc(washSlug, 400)})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>

      <header className="gallery-head">
        <a className="brand" href="#home" aria-label="Ink&Ash, home">
          <CoffeeCup className="brand-cup" />
          <span className="brand-text">
            <span className="brand-name">{site.brand}</span>
            <span className="brand-cap">Gallery</span>
          </span>
        </a>
        <nav className="gallery-links" aria-label="Gallery">
          <a href="#art">
            <span aria-hidden="true">←</span> Back<span className="hide-sm"> to home</span>
          </a>
          <a href={site.mediumUrl} target="_blank" rel="noopener">
            Medium <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main id="main" className="bk-stage">
        <h1 className="sr-only">The Studio Book: Ayesha's paintings</h1>
        <div className="bk-row">
          <button type="button" className="bk-arrow" onClick={prev} disabled={turned === 0} aria-label="Previous page">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {reduced ? (
            <ReducedBook leaves={leaves} turned={turned} single={single} style={bookStyle} onOpen={() => go(1)} />
          ) : (
            <div
              className={`bk${open ? " bk--open" : ""}`}
              style={bookStyle}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (drag.current = null)}
            >
              <div className="bk-block" aria-hidden="true" />
              {Object.entries(turning).map(([i, dir]) => (
                <span key={`cast-${i}-${dir}`} className={`bk-cast bk-cast--${dir > 0 ? "fwd" : "back"}`} aria-hidden="true" />
              ))}
              {leaves.map((L, i) => {
                const isTurned = i < turned;
                // turned leaves stack left with the latest on top; unturned stack right with the earliest on top
                const z = turning[i] ? 200 : isTurned ? 100 + i : 100 - i;
                // pages mount well ahead of a turn, so nothing new has to render while a leaf is moving
                const near = i >= turned - 3 && i <= turned + 4;
                return (
                  <div
                    key={L.front.key}
                    ref={(n) => (leafRefs.current[i] = n)}
                    className={`bk-leaf${isTurned ? " is-turned" : ""}${turning[i] ? ` is-turning is-turning--${turning[i] > 0 ? "fwd" : "back"}` : ""}${L.cover ? " bk-leaf--cover" : ""}`}
                    style={{ zIndex: z }}
                    aria-hidden={!(i === turned || i === turned - 1)}
                    {...(i === turned || i === turned - 1 ? {} : { inert: "" })}
                  >
                    <div className="bk-bend">
                      <div className="bk-face bk-face--front">
                        {L.cover ? <Cover onOpen={() => go(1)} /> : <div className="bk-paper bk-paper--right">{near && L.front.node}</div>}
                        {!L.cover && turned === i && i < maxTurned && (
                          <button type="button" className="bk-ear" onClick={next} aria-label="Turn the page" />
                        )}
                        <span className="bk-shade" aria-hidden="true" />
                      </div>
                      <div className="bk-face bk-face--back">
                        {L.back ? <div className="bk-paper bk-paper--left">{near && L.back.node}</div> : <div className={single ? "bk-paper bk-paper--left" : "bk-leather-back"} />}
                        <span className="bk-shade" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button type="button" className="bk-arrow" onClick={next} disabled={turned >= maxTurned} aria-label={turned === 0 ? "Open the book" : "Next page"}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {open && (
            <nav className="bk-tabs" aria-label="Sections of the book" style={bookStyle}>
              <button type="button" className={`bk-tab${section === "fav" ? " is-on" : ""}`} onClick={() => go(1)}>
                Favourites
              </button>
              <button type="button" className={`bk-tab bk-tab--2${section === "studio" ? " is-on" : ""}`} onClick={() => go(studioStart)}>
                More from the studio
              </button>
            </nav>
          )}
        </div>

        <p className="bk-foot">
          {turned === 0 ? "Click the cover or press → to open" : `${single ? "Page" : "Spread"} ${turned} of ${spreadCount}`}
        </p>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </main>
    </div>
  );
}

/** Reduced motion: no 3D, the visible pages simply cross-fade. */
function ReducedBook({ leaves, turned, single, style, onOpen }: { leaves: Leaf[]; turned: number; single: boolean; style: CSSProperties; onOpen: () => void }) {
  const left = !single && turned > 0 ? leaves[turned - 1].back : null;
  const right = leaves[turned].front;
  return (
    <div className={`bk bk--flat${turned > 0 ? " bk--open" : ""}`} style={style}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={turned} className="bk-flat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {turned === 0 ? (
            <div className="bk-flat-page bk-flat-page--cover">
              <Cover onOpen={onOpen} />
            </div>
          ) : (
            <>
              {left && <div className="bk-flat-page bk-paper bk-paper--left">{left.node}</div>}
              <div className="bk-flat-page bk-paper bk-paper--right">{right.node}</div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
