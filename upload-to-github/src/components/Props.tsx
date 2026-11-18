// Small hand-drawn-feeling SVG props. Decorative unless a title is passed.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { title?: string };

function a11y(title?: string) {
  return title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
}

export function CoffeeCup({ title, steam = true, ...rest }: P & { steam?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" {...a11y(title)} {...rest}>
      {steam && (
        <g className="steam" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.55">
          <path className="steam-1" d="M44 40c-6-7 6-11 0-19" />
          <path className="steam-2" d="M58 38c-6-8 6-12 0-21" />
          <path className="steam-3" d="M72 40c-6-7 6-11 0-19" />
        </g>
      )}
      {/* saucer */}
      <ellipse cx="58" cy="102" rx="44" ry="8" fill="#e7d3b8" />
      <ellipse cx="58" cy="100" rx="36" ry="5" fill="#d9bf9c" />
      {/* cup */}
      <path d="M24 52h68l-6 36c-1.5 8-8 12-16 12H46c-8 0-14.5-4-16-12z" fill="#faf5ec" stroke="#3b2a20" strokeWidth="3" />
      <path d="M90 60c12 0 16 6 14 13-2 8-10 10-18 9" stroke="#3b2a20" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* coffee + latte art */}
      <ellipse cx="58" cy="52" rx="34" ry="7" fill="#3b2a20" />
      <ellipse cx="58" cy="52" rx="28" ry="5" fill="#8a5a3b" />
      <path d="M50 52c3-4 13-4 16 0-3 3-13 3-16 0z" fill="#e7d3b8" />
      <path d="M38 70c6 2 10 2 14 0" stroke="#8e1bb0" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function VinylRecord({ title, label = "#8e1bb0", ...rest }: P & { label?: string }) {
  return (
    <svg viewBox="0 0 120 120" {...a11y(title)} {...rest}>
      <circle cx="60" cy="60" r="58" fill="#141218" />
      {[50, 44, 38, 32].map((r) => (
        <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#2c2833" strokeWidth="1" />
      ))}
      <path d="M22 38a44 44 0 0 1 22-18" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M98 82a44 44 0 0 1-22 18" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="60" r="20" fill={label} />
      <circle cx="60" cy="60" r="20" fill="url(#vinylLabelShine)" />
      <path d="M48 56c6-5 18-5 24 0" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="60" r="3" fill="#f4f1ea" />
      <defs>
        <radialGradient id="vinylLabelShine" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** A vintage 78 rpm shellac record: brown-black, fine grooves, a cream-and-gold ornate label. */
export function Shellac78({ title, ...rest }: P) {
  return (
    <svg viewBox="0 0 120 120" {...a11y(title)} {...rest}>
      <defs>
        <radialGradient id="shellacBody" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.3" stopColor="#2a1c15" />
          <stop offset="1" stopColor="#120c09" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#shellacBody)" />
      <circle cx="60" cy="60" r="57" fill="none" stroke="#3d2a1f" strokeWidth="1.5" />
      {[52, 49, 46, 43, 40, 37, 34, 31, 28].map((r) => (
        <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#3a2a20" strokeWidth="0.6" />
      ))}
      <path d="M26 30a48 48 0 0 1 30-16" stroke="#e7d3b8" strokeOpacity="0.16" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* the label */}
      <circle cx="60" cy="60" r="22" fill="#f1e4c6" />
      <circle cx="60" cy="60" r="20.5" fill="none" stroke="#b8902f" strokeWidth="1.4" />
      <circle cx="60" cy="60" r="17" fill="none" stroke="#b8902f" strokeWidth="0.6" strokeDasharray="1.4 1.6" />
      <path d="M48 54c4-5 20-5 24 0" stroke="#7a1f2b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M50 67h20M53 71h14" stroke="#b8902f" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M60 41l1.6 3.4 3.4.4-2.6 2.2.8 3.4-3.2-1.8-3.2 1.8.8-3.4-2.6-2.2 3.4-.4z" fill="#b8902f" />
      <circle cx="60" cy="60" r="2.6" fill="#2a1c15" />
    </svg>
  );
}

/** A tiny iridescent CD for the now-playing pill. */
export function TinyCD({ title, ...rest }: P) {
  return (
    <svg viewBox="0 0 40 40" {...a11y(title)} {...rest}>
      <defs>
        <linearGradient id="cdSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9e7ff" />
          <stop offset="0.25" stopColor="#f1c4ff" />
          <stop offset="0.5" stopColor="#fff3c4" />
          <stop offset="0.75" stopColor="#b9f5e6" />
          <stop offset="1" stopColor="#c7c9ff" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#cdSheen)" />
      <path d="M20 1a19 19 0 0 1 13.4 5.6L20 20z" fill="#fff" opacity="0.45" />
      <path d="M20 39a19 19 0 0 1-13.4-5.6L20 20z" fill="#fff" opacity="0.3" />
      <circle cx="20" cy="20" r="7" fill="#e9e7f2" stroke="#ffffff" strokeOpacity="0.8" />
      <circle cx="20" cy="20" r="3" fill="#15123a" />
    </svg>
  );
}

export function Paintbrush({ title, ...rest }: P) {
  return (
    <svg viewBox="0 0 160 40" {...a11y(title)} {...rest}>
      <path d="M4 20c10-9 26-10 34-6l4 6-4 6c-8 4-24 3-34-6z" fill="#d6338a" />
      <path d="M4 20c10-9 26-10 34-6" stroke="#8e1bb0" strokeWidth="2" fill="none" opacity="0.6" />
      <rect x="40" y="13" width="26" height="14" rx="2" fill="#c9cdd6" />
      <rect x="44" y="13" width="3" height="14" fill="#9aa0ad" />
      <rect x="58" y="13" width="3" height="14" fill="#9aa0ad" />
      <path d="M66 14h76c8 0 14 3 14 6s-6 6-14 6H66z" fill="#3b2a20" />
      <path d="M70 17h70" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Microphone({ title, ...rest }: P) {
  return (
    <svg viewBox="0 0 80 140" {...a11y(title)} {...rest}>
      <rect x="22" y="6" width="36" height="58" rx="18" fill="#2a2633" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M24 ${18 + i * 7}h32`} stroke="#4a4556" strokeWidth="2" />
      ))}
      <path d="M30 14c4-4 8-5 12-5" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="20" y="62" width="40" height="8" rx="3" fill="#c9a27a" />
      <path d="M33 70h14l-3 54H36z" fill="#3b2a20" />
      <ellipse cx="40" cy="128" rx="18" ry="5" fill="#2a1d16" />
    </svg>
  );
}

export function MusicNote({ title, ...rest }: P) {
  return (
    <svg viewBox="0 0 48 48" {...a11y(title)} {...rest}>
      <path d="M18 34V10l20-5v24" stroke="currentColor" strokeWidth="3.4" fill="none" strokeLinejoin="round" />
      <ellipse cx="13" cy="35" rx="7" ry="5.5" fill="currentColor" />
      <ellipse cx="33" cy="30" rx="7" ry="5.5" fill="currentColor" />
    </svg>
  );
}

export function Sparkle(props: P) {
  return (
    <svg viewBox="0 0 40 40" {...a11y(props.title)} {...props}>
      <path
        d="M20 2v36M2 20h36M7 7l26 26M33 7 7 33"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Envelope(props: P) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Arrow(props: P) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayIcon({ playing, ...rest }: P & { playing: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...rest}>
      {playing ? (
        <g fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1.2" />
          <rect x="14" y="5" width="4" height="14" rx="1.2" />
        </g>
      ) : (
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" />
      )}
    </svg>
  );
}
