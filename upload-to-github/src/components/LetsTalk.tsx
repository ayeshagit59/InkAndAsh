import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "../content/site";
import { Envelope } from "./Props";

/*
  "Let's talk" opens a small popover with Ayesha's address and a Copy button. It never opens a mail app.
  Anchored under the button on desktop, a centred dialog on phones. Esc, a click outside or the close
  button shuts it; focus moves to Copy on open and goes back to the button on close.
*/
export function LetsTalk() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"" | "ok" | "manual">("");
  const wrap = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState({ top: 0, right: 0 });
  const btn = useRef<HTMLButtonElement>(null);
  const copyBtn = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const id = useId();

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => copyBtn.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // only the popover closes (not the mobile menu around it), so focus can go back to the button
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!wrap.current?.contains(t) && !pop.current?.contains(t)) close(false);
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // "Copied ✓" for two seconds, then back to "Copy email"
  useEffect(() => {
    if (copied !== "ok") return;
    const t = window.setTimeout(() => setCopied(""), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied("ok");
    } catch {
      // clipboard API blocked (e.g. in a sandboxed frame): select the address so it can be copied by hand
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(emailRef.current!);
      sel?.removeAllRanges();
      sel?.addRange(range);
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      setCopied(ok ? "ok" : "manual");
    }
  };

  return (
    <div className="talk" ref={wrap}>
      <button
        ref={btn}
        type="button"
        className="btn-pill nav-cta"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          setCopied("");
          // the popover is portalled (the nav's blur would trap a fixed child), so anchor it to the button here
          const r = btn.current!.getBoundingClientRect();
          setAt({ top: r.bottom + 10, right: Math.max(12, window.innerWidth - r.right) });
          setOpen((o) => !o);
        }}
      >
        <Envelope />
        Let's talk
      </button>
      {createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            ref={pop}
            style={{ "--talk-top": `${at.top}px`, "--talk-right": `${at.right}px` } as React.CSSProperties}
            id={id}
            className="talk-pop"
            role="dialog"
            aria-labelledby={`${id}-t`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(6px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="talk-title" id={`${id}-t`}>
              Let's talk.
            </p>
            <p className="talk-email" ref={emailRef}>
              {site.email}
            </p>
            <button ref={copyBtn} type="button" className="talk-copy" onClick={copy}>
              {copied === "ok" ? "Copied ✓" : "Copy email"}
            </button>
            <p className="talk-status" role="status">
              {copied === "ok" ? <span className="sr-only">Email copied to the clipboard.</span> : copied === "manual" ? "Selected. Press Ctrl+C or ⌘C to copy." : ""}
            </p>
            <button type="button" className="talk-close" onClick={() => close()} aria-label="Close">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </div>
  );
}
