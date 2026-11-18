import { useEffect, useState } from "react";
import { nav, site } from "../content/site";
import { LetsTalk } from "./LetsTalk";
import { CoffeeCup } from "./Props";

// sections painted in light paper tones get a light nav
const LIGHT = new Set(["work", "art"]);

export function Nav({ onResume }: { onResume: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scroll-spy: the active section is the last one whose top has passed a line at 40% of the viewport.
  // Near the very top it's always Home.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (window.scrollY < 8) return setActive("home");
      const line = window.innerHeight * 0.4;
      let cur = "home";
      for (const n of nav) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= line) cur = n.id;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = (
    <ul>
      {nav.map((n) => (
        <li key={n.id}>
          <a href={`#${n.id}`} aria-current={active === n.id ? "location" : undefined} onClick={() => setOpen(false)}>
            {n.label}
          </a>
        </li>
      ))}
    </ul>
  );
  const actions = (
    <>
      <button
        type="button"
        className="nav-resume"
        onClick={() => {
          setOpen(false);
          onResume();
        }}
      >
        Resume
      </button>
      <LetsTalk />
    </>
  );

  return (
    <header className={`nav${scrolled ? " nav--scrolled" : ""}${open ? " nav--open" : ""}${LIGHT.has(active) && !open ? " nav--light" : ""}`}>
      <div className="nav-bar">
        <a className="brand" href="#home" aria-label="Ink&Ash, back to top">
          <CoffeeCup className="brand-cup" />
          <span className="brand-text">
            <span className="brand-name">{site.brand}</span>
            <span className="brand-cap">Ayesha</span>
          </span>
        </a>

        <nav className="nav-links" aria-label="Main">
          {links}
          <div className="nav-actions">{actions}</div>
        </nav>

        <button
          type="button"
          className="nav-burger"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>

      <nav id="mobile-menu" className="nav-sheet" hidden={!open} aria-label="Main (mobile)">
        {links}
        <div className="nav-sheet-actions">{actions}</div>
      </nav>
    </header>
  );
}
