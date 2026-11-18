import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import omakaseMeta from "../content/omakase-meta.json";
import { useDialog } from "./useDialog";
import { brewShelf, clipCredit, coverClip, coffeeStory, music, omakaseEntries, type OmakaseEntry, reels, reelUrl, site } from "../content/site";
import { COVER_ART } from "./CoverArt";
import { AeroPress, FilterCoffee, MokaPot } from "./BrewIcons";
import { usePlayer } from "./player";
import { CoffeeCup, MusicNote, PlayIcon, Shellac78 } from "./Props";
import { FadeUp, RevealGroup, revealGroup, revealItem } from "./Reveal";


export function Equalizer({ active, bars = 5 }: { active: boolean; bars?: number }) {
  return (
    <span className={`eq${active ? " eq--on" : ""}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} style={{ animationDelay: `${-i * 0.23}s` }} />
      ))}
    </span>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {muted ? (
        <path d="m16 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}
export { SpeakerIcon };

/* ---------------- music ---------------- */

function ClipPlayer() {
  const { playing, muted, missing, progress, duration, toggle, toggleMute } = usePlayer();
  const secs = duration ? `${Math.round(duration)}-second` : "short";
  const name = coverClip.title || "the cover clip";
  return (
    <div className={`turntable-wrap${playing ? " is-playing" : ""}`}>
      <div className="turntable">
        {missing ? (
          <div className="tt-platter">
            <Shellac78 className="tt-vinyl" />
          </div>
        ) : (
          <button type="button" className="tt-platter" onClick={toggle} aria-pressed={playing} aria-label={playing ? `Pause ${name}` : `Play ${name}, a ${secs} cover clip`}>
            <Shellac78 className="tt-vinyl" />
            <span className="tt-play" aria-hidden="true">
              <PlayIcon playing={playing} />
            </span>
          </button>
        )}
        <svg className="tt-arm" viewBox="0 0 80 200" aria-hidden="true">
          <circle cx="56" cy="22" r="16" fill="#c9a27a" />
          <circle cx="56" cy="22" r="7" fill="#3b2a20" />
          <path d="M56 22 L60 150 L42 180" stroke="#e7d3b8" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="30" y="172" width="22" height="16" rx="3" transform="rotate(-30 41 180)" fill="#f4f1ea" />
        </svg>
        <span className="tt-speed" aria-hidden="true">78</span>
      </div>

      <div className="clip-meta">
        {missing ? (
          <p className="clip-soon">Clip coming soon</p>
        ) : (
          <>
            <div className="clip-row">
              <Equalizer active={playing} bars={9} />
              <span className="clip-bar" aria-hidden="true">
                <span style={{ transform: `scaleX(${progress})` }} />
              </span>
              <span className="clip-time" aria-hidden="true">
                {duration ? fmt(playing || progress ? progress * duration : duration) : ""}
              </span>
              <button type="button" className="icon-btn" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? "Unmute" : "Mute"}>
                <SpeakerIcon muted={muted} />
              </button>
            </div>
            <p className="clip-credit">{clipCredit()}</p>
          </>
        )}
      </div>
    </div>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Spotify-style album row. Each card is one link straight to the reel on Instagram. */
function CoverCarousel() {
  const row = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const [state, setState] = useState({ start: 0, end: 0, atStart: true, atEnd: false, thumb: 1, pos: 0 });

  const measure = useCallback(() => {
    const el = row.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const items = [...el.children] as HTMLElement[];
    const left = el.getBoundingClientRect().left;
    const right = left + el.clientWidth;
    // a card counts as visible when most of it is on screen
    const vis = items
      .map((n, i) => ({ i, r: n.getBoundingClientRect() }))
      .filter(({ r }) => Math.min(r.right, right) - Math.max(r.left, left) > r.width * 0.6)
      .map(({ i }) => i);
    setState({
      start: vis.length ? vis[0] : 0,
      end: vis.length ? vis[vis.length - 1] : 0,
      atStart: el.scrollLeft <= 2,
      atEnd: el.scrollLeft >= max - 2,
      thumb: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1,
      pos: max > 0 ? el.scrollLeft / max : 0,
    });
  }, []);

  useEffect(() => {
    const el = row.current!;
    measure();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = row.current!;
    const card = el.firstElementChild as HTMLElement;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    const per = Math.max(1, Math.floor((el.clientWidth + 1) / step));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * per * step, behavior: reduced ? "auto" : "smooth" });
  };

  const scrollable = state.thumb < 0.999;

  return (
    <div className={`covers${state.atStart ? " covers--start" : ""}${state.atEnd ? " covers--end" : ""}`}>
      <div className="covers-head">
        <h3 className="covers-title">Covers on Instagram</h3>
        {scrollable && (
          <div className="covers-nav">
            <button type="button" className="covers-arrow" onClick={() => page(-1)} disabled={state.atStart} aria-label="Previous songs">
              <Chevron dir="left" />
            </button>
            <button type="button" className="covers-arrow" onClick={() => page(1)} disabled={state.atEnd} aria-label="Next songs">
              <Chevron dir="right" />
            </button>
          </div>
        )}
      </div>

      <div className="covers-viewport">
        <motion.ul
          ref={row}
          className="covers-row"
          aria-label="Song covers"
          variants={revealGroup}
          initial={reduced ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {reels.map((r) => (
            <motion.li key={r.id} className="cover" variants={revealItem}>
              <a href={reelUrl(r.id)} target="_blank" rel="noopener" title={r.credit} aria-label={`${r.song}, cover by Ayesha. Original: ${r.credit}. Opens on Instagram`}>
                <span className="cover-art">
                  {(() => {
                    const Art = COVER_ART[r.cover];
                    return <Art />;
                  })()}
                  <span className="cover-badge" data-tip="Opens on Instagram">
                    <InstagramGlyph />
                    <span aria-hidden="true">↗</span>
                  </span>
                </span>
                <strong className="cover-song">{r.song}</strong>
                <span className="cover-credit">{r.short}</span>
                <span className="cover-chip">Cover by Ayesha</span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {scrollable && (
        <div className="covers-foot" aria-hidden="true">
          <span className="covers-track">
            <span className="covers-thumb" style={{ width: `${state.thumb * 100}%`, left: `${state.pos * (1 - state.thumb) * 100}%` }} />
          </span>
          <span className="covers-count">
            {state.start + 1} to {state.end + 1} of {reels.length}
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------------- coffee ---------------- */

const BREW_ICON = { moka: MokaPot, filter: FilterCoffee, aeropress: AeroPress };

function CupCounter() {
  const [cups, setCups] = useState(1);
  return (
    <div className="cup-counter">
      <button type="button" onClick={() => setCups((c) => c + 1)} aria-label={`Pour another cup. ${cups} so far.`}>
        <CoffeeCup className="cup-counter-icon" />
      </button>
      <p aria-live="polite">
        Powered by coffee. Cups so far: <strong>{cups}</strong>
      </p>
    </div>
  );
}

/* ---------------- the Roast CCX tasting: polaroid prints ---------------- */

const OMAKASE_META = omakaseMeta as Record<string, { width: number; height: number }>;
const TASTING_TILT = [-3, 2.2, -1.4, 2.8];
const TASTING_DROP = [0, 26, 8, 34]; // px: a gently staggered row

const omakaseKey = (o: OmakaseEntry) => o.image.replace(/\.[^.]+$/, "");
const omakaseSrc = (o: OmakaseEntry) => `${import.meta.env.BASE_URL}omakase/${omakaseKey(o)}.webp`;

/** The printed tasting card, used as the print's face until the photo is in the project. */
function TastingCard({ o }: { o: OmakaseEntry }) {
  return (
    <span className="tasting-card">
      <span className="tasting-card-no">Course {o.course}</span>
      <strong>{o.name}</strong>
      <span className="tasting-card-k">Tasting notes</span>
      <span>{o.notes}</span>
      <span className="tasting-card-k">Pairing</span>
      <span>{o.pairing}</span>
    </span>
  );
}

function Tasting() {
  const entries = omakaseEntries.filter((o) => o.published).sort((a, b) => a.course.localeCompare(b.course));
  const [open, setOpen] = useState<OmakaseEntry | null>(null);
  const reduced = useReducedMotion();
  if (!entries.length) return null;

  return (
    <div className="tasting">
      <FadeUp>
        <h4 className="tasting-head">
          A tasting journey at {entries[0].venue} <span>· {entries[0].city}</span>
        </h4>
      </FadeUp>
      <ul className="tasting-row">
        {entries.map((o, i) => {
          const m = OMAKASE_META[omakaseKey(o)];
          // show at 280-360px, never wider than the file itself
          const w = m ? Math.min(m.width, m.width >= m.height ? 360 : 290) : 290;
          return (
            <motion.li
              key={o.course}
              style={{ "--tilt": `${TASTING_TILT[i % 4]}deg`, marginTop: TASTING_DROP[i % 4] } as React.CSSProperties}
              initial={reduced ? false : { opacity: 0, y: 14, filter: "blur(12px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
            >
              <figure className="tasting-print">
                {m ? (
                  <button type="button" className="tasting-photo" onClick={() => setOpen(o)} aria-label={`Course ${o.course}, ${o.name}: view larger`}>
                    <img
                      src={omakaseSrc(o)}
                      width={m.width}
                      height={m.height}
                      style={{ width: w }}
                      alt={`Course ${o.course} at ${o.venue}: ${o.name}, beside its printed tasting card`}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ) : (
                  <TastingCard o={o} />
                )}
                <figcaption>
                  <span className="tasting-no">{o.course}</span> {o.name}
                </figcaption>
              </figure>
            </motion.li>
          );
        })}
      </ul>
      <TastingLightbox entry={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function TastingLightbox({ entry, onClose }: { entry: OmakaseEntry | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, !!entry, onClose);
  const m = entry ? OMAKASE_META[omakaseKey(entry)] : null;
  return createPortal(
    <AnimatePresence>
      {entry && m && (
        <motion.div className="lb-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <div className="sc-scrim" onClick={onClose} />
          <motion.div
            ref={ref}
            className="lb"
            role="dialog"
            aria-modal="true"
            aria-label={`Course ${entry.course}: ${entry.name}`}
            initial={{ scale: 0.96, rotate: -1.5, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.96, rotate: -1.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" className="sc-close" onClick={onClose} aria-label="Close" data-autofocus>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <img src={omakaseSrc(entry)} width={m.width} height={m.height} alt={`Course ${entry.course}: ${entry.name}, beside its printed tasting card`} />
            <p className="lb-cap">
              <strong>
                {entry.course} · {entry.name}
              </strong>
              <span>Tasting notes: {entry.notes}</span>
              <span>Pairing: {entry.pairing}</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function MusicCoffee() {

  return (
    <section className="mc" id="music-coffee" aria-labelledby="mc-title">
      <div className="container">
        <FadeUp className="section-head section-head--light">
          <h2 id="mc-title" className="section-title">
            Music <span className="amp">&amp;</span> <span className="script">coffee</span>
          </h2>
          <p className="section-lede">A small room at the back of the gallery: a record on, something interesting in the cup.</p>
        </FadeUp>

        {/* ---------- music ---------- */}
        <div className="music">
          <FadeUp className="music-intro">
            <p className="eyebrow eyebrow--crema">
              <MusicNote width={14} height={14} /> Music
            </p>
            <h3>Lifelong singer, covers on Instagram.</h3>
            <p>{music.lead}</p>
            <a className="btn-ghost btn-ghost--light" href={site.instagramUrl} target="_blank" rel="noreferrer">
              @my_harmonic_palette ↗
            </a>
          </FadeUp>
          <FadeUp delay={0.1}>
            <ClipPlayer />
          </FadeUp>
        </div>

        <CoverCarousel />

        {/* ---------- coffee ---------- */}
        <div className="coffee">
          {/* her story, then the brew shelf, then the Roast CCX prints */}
          <FadeUp className="coffee-story">
            <p className="eyebrow eyebrow--crema">Coffee</p>
            <p>{coffeeStory}</p>
          </FadeUp>

          <div className="shelf">
            <h4 className="mini-title">How I brew</h4>
            <RevealGroup as="ul" className="shelf-list">
              {brewShelf.map((b) => {
                const Icon = BREW_ICON[b.id];
                return (
                  <motion.li key={b.id} variants={revealItem}>
                    <span className="shelf-icon">
                      <Icon />
                    </span>
                    <strong>{b.name}</strong>
                  </motion.li>
                );
              })}
            </RevealGroup>
          </div>

          <Tasting />

          <CupCounter />
        </div>
      </div>
    </section>
  );
}
