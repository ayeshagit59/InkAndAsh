import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useState, type CSSProperties } from "react";
import { hero, site } from "../content/site";
import { ArtImage } from "./ArtImage";
import { CosmicBackdrop } from "./CosmicBackdrop";
import { CoffeeCup, VinylRecord } from "./Props";
import { CodeTyper, TechBackdrop } from "./TechLayer";
import "./hero.css";

/*
  One-time intro (about 6.5s), then a still hero:
  1. two paintings (as polaroids, split left and right), the cup and the vinyl fly in one by one from the edges
  2. "Product thinking," types itself; the italic line arrives; the tags fade in last
  3. everything settles: the paintings stay as white-bordered polaroid prints on the sky, slowly drifting
  Behind them, a quiet tech layer (TechLayer.tsx): faint circuit grid, drifting symbols, code typing in two corners.
  Scrolling during the intro finishes it instantly. Reduced motion shows the final state.
*/

const L1 = hero.line1;
const T_TYPE = 1050; // ms, when typing starts
const CHAR = 52;
const T_LINE2 = T_TYPE + L1.length * CHAR + 200;
const T_TAGS = T_LINE2 + 900;
const T_SETTLE = T_TAGS + 300;
const T_DONE = T_SETTLE + 1900;

const spring: Transition = { type: "spring", stiffness: 110, damping: 16, mass: 0.9 };
const ease = [0.22, 1, 0.36, 1] as const;

type Piece = {
  id: string;
  kind: "art" | "cup" | "vinyl";
  slug?: string;
  label?: string;
  x: string; y: string; w: number; r: number;
  from: [number, number];
  drift: number; // seconds per idle drift cycle
  mobile?: boolean;
};

const PIECES: Piece[] = [
  { id: "b", kind: "art", slug: "15-the-northern-lights", label: "Northern Lights", x: "6%", y: "22%", w: 246, r: -6, from: [-340, 120], drift: 21, mobile: true },
  { id: "d", kind: "art", slug: "13-the-imaginary-party", label: "Imaginary Party", x: "76%", y: "36%", w: 236, r: 5, from: [340, 200], drift: 23, mobile: true },
  { id: "e", kind: "cup", x: "29%", y: "73%", w: 104, r: 6, from: [-200, 260], drift: 15 },
  { id: "f", kind: "vinyl", x: "63%", y: "12%", w: 98, r: 0, from: [240, -220], drift: 25 },
];

function PieceView({ p, index, settled, instant }: { p: Piece; index: number; settled: boolean; instant: boolean }) {
  const style = { left: p.x, top: p.y, width: p.w, "--drift": `${p.drift}s` } as CSSProperties;
  const enter = instant ? { duration: 0 } : { ...spring, delay: 0.2 + index * 0.13 };

  return (
    <div className={`piece piece--${p.kind}${p.mobile ? "" : " piece--desktop"}${settled ? " piece--drift" : ""}`} style={style}>
      <motion.div
        initial={instant ? false : { x: p.from[0], y: p.from[1], rotate: p.r - 22, opacity: 0, scale: 0.9 }}
        animate={{ x: 0, y: 0, rotate: p.r, opacity: 1, scale: 1 }}
        transition={enter}
      >
        {p.kind === "art" && p.slug ? (
          <figure className="polaroid">
            <ArtImage slug={p.slug} sizes={`${p.w * 2}px`} eager alt="" />
            <figcaption>{p.label}</figcaption>
          </figure>
        ) : p.kind === "cup" ? (
          <CoffeeCup className="prop" />
        ) : (
          <VinylRecord className="prop prop-vinyl" />
        )}
      </motion.div>
    </div>
  );
}

export function Hero() {
  const reduced = !!useReducedMotion();
  const [instant, setInstant] = useState(reduced);
  const [typed, setTyped] = useState(reduced ? L1.length : 0);
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(reduced ? 3 : 0); // 1 line2, 2 tags, 3 settled

  // the intro clock
  useEffect(() => {
    if (instant) {
      setTyped(L1.length);
      setStage(3);
      return;
    }
    const timers: number[] = [];
    for (let i = 1; i <= L1.length; i++) timers.push(window.setTimeout(() => setTyped(i), T_TYPE + i * CHAR));
    timers.push(window.setTimeout(() => setStage(1), T_LINE2));
    timers.push(window.setTimeout(() => setStage(2), T_TAGS));
    timers.push(window.setTimeout(() => setStage(3), T_SETTLE));
    return () => timers.forEach(clearTimeout);
  }, [instant]);

  // scrolling during the intro finishes it at once
  useEffect(() => {
    if (instant) return;
    const finish = () => window.scrollY > 4 && setInstant(true);
    const done = window.setTimeout(() => window.removeEventListener("scroll", finish), T_DONE);
    window.addEventListener("scroll", finish, { passive: true });
    return () => {
      clearTimeout(done);
      window.removeEventListener("scroll", finish);
    };
  }, [instant]);

  const settled = stage >= 3;
  const fade = (on: boolean, y = 12): object =>
    instant ? { initial: false, animate: { opacity: 1, y: 0, filter: "blur(0px)" } } : { initial: { opacity: 0, y, filter: "blur(8px)" }, animate: on ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}, transition: { duration: 0.9, ease } };

  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <CosmicBackdrop />
      <TechBackdrop />
      <CodeTyper className="tech-codes--a" starts={[0, 2]} />
      <CodeTyper className="tech-codes--b" starts={[1, 3]} />

      <div className="cluster" aria-hidden="true">
        {PIECES.map((p, i) => (
          <PieceView key={`${p.id}-${instant ? "s" : "i"}`} p={p} index={i} settled={settled} instant={instant} />
        ))}
      </div>

      <div className="hero-center">
        <motion.p className="hero-name" {...fade(true, 8)} transition={instant ? undefined : { duration: 1, ease, delay: 0.5 }}>
          {site.name}
        </motion.p>

        <h1 id="hero-title" className="headline">
          <span className="sr-only">
            {hero.line1} {hero.line2}
          </span>
          <span className="hl-1" aria-hidden="true">
            {L1.slice(0, typed)}
            {typed < L1.length && <span className="caret" />}
            {typed === 0 && <span className="ghost">.</span>}
          </span>
          <motion.span className="hl-2" aria-hidden="true" {...fade(stage >= 1, 18)}>
            {hero.line2}
          </motion.span>
        </h1>

        <motion.ul className="hero-tags" {...fade(stage >= 2, 8)}>
          {hero.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </motion.ul>
      </div>

      <a className="hero-scroll" href="#about" aria-label="Scroll to About">
        <span />
      </a>
    </section>
  );
}
