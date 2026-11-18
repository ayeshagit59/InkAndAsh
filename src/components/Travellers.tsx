// The two scroll travellers: a cast of drinks on the right edge and a painter's tool on the left.
// Each section gets its own drink and tool; Atmosphere cross-fades between them. All decorative.
import { CoffeeCup } from "./Props";

const ink = "#3b2a20";
const steel = "#c9cdd6";
const steelDark = "#9aa0ad";
const glass = "rgb(255 255 255 / 0.18)";
const glassEdge = "rgb(255 255 255 / 0.7)";

const svg = { viewBox: "0 0 120 140", fill: "none", "aria-hidden": true } as const;

/** Hero: the original steaming cup. */
export function SteamingCup() {
  return <CoffeeCup className="drink-svg" viewBox="0 -10 120 140" />;
}

/** About: South Indian filter coffee, pulled between the steel tumbler and the davara. */
export function FilterPour() {
  return (
    <svg {...svg} className="drink-svg drink-filter">
      {/* the tumbler, held high and tilting as it pours */}
      <g className="fp-tumbler">
        <path d="M64 8h30l-4 40H68z" fill={steel} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M66 18h26" stroke={steelDark} strokeWidth="2" />
        <path d="M70 12l2 32" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* the long pour */}
      <path className="fp-stream" d="M68 46c-6 18-10 36-12 58" stroke="#a87b55" strokeWidth="4" strokeLinecap="round" />
      {/* davara: the wide, lipped bowl */}
      <path d="M14 104h92l-9 22c-1 3-4 5-7 5H30c-3 0-6-2-7-5z" fill={steel} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="60" cy="104" rx="46" ry="7" fill="#7a5134" stroke={ink} strokeWidth="2.5" />
      <path d="M26 116h68" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
      {/* froth */}
      <g className="fp-froth" fill="#e7d3b8">
        <circle cx="48" cy="103" r="4" />
        <circle cx="57" cy="101" r="5" />
        <circle cx="67" cy="103" r="3.5" />
        <circle cx="74" cy="104" r="2.5" />
        <circle cx="41" cy="105" r="2.5" />
      </g>
    </svg>
  );
}

/** Work: a moka pot, bubbling at the spout. */
export function MokaBrew() {
  return (
    <svg {...svg} className="drink-svg drink-moka">
      <g className="mk-puffs" fill="#f6f2ff">
        <circle className="mk-puff mk-puff-1" cx="30" cy="30" r="6" />
        <circle className="mk-puff mk-puff-2" cx="24" cy="22" r="4.5" />
        <circle className="mk-puff mk-puff-3" cx="34" cy="16" r="3.5" />
      </g>
      {/* lid knob + upper chamber */}
      <rect x="54" y="26" width="12" height="6" rx="2" fill="#3b2a20" />
      <path d="M40 34h40l6 36H34z" fill={steel} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      {/* spout */}
      <path d="M40 34l-12-6 4 12z" fill={steel} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      {/* waist + boiler */}
      <path d="M34 70h52" stroke={ink} strokeWidth="3" />
      <path d="M36 72l-8 50h64l-8-50z" fill="#dfe2e8" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 78l-4 38M60 78v38M72 78l4 38" stroke={steelDark} strokeWidth="2" />
      {/* black handle */}
      <path d="M80 38c14 0 20 8 18 18-2 9-8 13-16 13" stroke={ink} strokeWidth="6" strokeLinecap="round" />
      {/* coffee bubbling up at the spout */}
      <g fill="#6b4329">
        <circle className="mk-bubble mk-bubble-1" cx="33" cy="32" r="3" />
        <circle className="mk-bubble mk-bubble-2" cx="37" cy="34" r="2.2" />
        <circle className="mk-bubble mk-bubble-3" cx="30" cy="35" r="1.8" />
      </g>
    </svg>
  );
}

/** Art: an AeroPress over a glass cup, dripping slowly. */
export function AeroDrip() {
  return (
    <svg {...svg} className="drink-svg drink-aero">
      {/* plunger + chamber */}
      <rect x="44" y="4" width="32" height="8" rx="3" fill="#2a2633" />
      <rect x="50" y="12" width="20" height="16" fill="#4a4556" />
      <path d="M40 28h40v34H40z" fill="rgb(160 150 180 / 0.55)" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 46h40v16H40z" fill="#5a3a26" opacity="0.9" />
      <path d="M44 36h6M44 42h6" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
      {/* filter cap */}
      <path d="M36 62h48l-4 6H40z" fill="#2a2633" />
      {/* the drip */}
      <circle className="ae-drip" cx="60" cy="72" r="2.6" fill="#5a3a26" />
      {/* glass cup */}
      <path d="M32 82h56l-6 44c-.5 4-3 6-7 6H45c-4 0-6.5-2-7-6z" fill={glass} stroke={glassEdge} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M36 102h48l-3 24c-.5 3-2.5 4.5-5.5 4.5H44.5c-3 0-5-1.5-5.5-4.5z" fill="#5a3a26" />
      <ellipse cx="60" cy="102" rx="24" ry="3.5" fill="#7a5134" />
      <ellipse className="ae-ripple" cx="60" cy="102" rx="6" ry="1.4" stroke="#c9a27a" strokeWidth="1.4" />
      <path d="M40 88l2 30" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Music & Coffee: Vietnamese salt coffee, cream folding slowly into it. */
export function SaltCoffee() {
  return (
    <svg {...svg} className="drink-svg drink-salt">
      <defs>
        <clipPath id="salt-glass">
          <path d="M34 30h52l-6 94c-.3 4-3 7-7 7H47c-4 0-6.7-3-7-7z" />
        </clipPath>
      </defs>
      <g clipPath="url(#salt-glass)">
        <rect x="30" y="30" width="60" height="110" fill="#3b2216" />
        {/* the salted cream cap */}
        <path d="M30 30h60v26c-10 4-20-2-30 2s-20 2-30-2z" fill="#f1e2c8" />
        {/* cream folding down into the coffee */}
        <path className="sc-fold sc-fold-1" d="M40 58c8 10 0 18 8 26s14-2 18 8" stroke="#e7d3b8" strokeWidth="5" strokeLinecap="round" />
        <path className="sc-fold sc-fold-2" d="M74 56c-6 10 2 16-6 24s-12 4-14 12" stroke="#c9a27a" strokeWidth="4" strokeLinecap="round" />
      </g>
      <path d="M34 30h52l-6 94c-.3 4-3 7-7 7H47c-4 0-6.7-3-7-7z" fill={glass} stroke={glassEdge} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 38l3 80" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
      {/* a few salt flakes */}
      <g fill="#fff">
        <rect x="52" y="34" width="2.4" height="2.4" transform="rotate(20 53 35)" />
        <rect x="62" y="37" width="2" height="2" transform="rotate(-15 63 38)" />
        <rect x="70" y="33" width="2.2" height="2.2" transform="rotate(35 71 34)" />
      </g>
    </svg>
  );
}

/** Footer: a small espresso shot, crema shimmering. */
export function EspressoShot() {
  return (
    <svg {...svg} className="drink-svg drink-espresso">
      <defs>
        <linearGradient id="crema-shine" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="crema-clip">
          <ellipse cx="58" cy="78" rx="24" ry="5" />
        </clipPath>
      </defs>
      <path className="es-wisp" d="M58 66c-6-8 6-12 0-22s6-12 0-20" stroke="#f6f2ff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="58" cy="118" rx="40" ry="7" fill="#e7d3b8" />
      <ellipse cx="58" cy="116" rx="30" ry="4" fill="#d9bf9c" />
      <path d="M32 78h52l-5 26c-1 7-6 11-13 11H50c-7 0-12-4-13-11z" fill="#faf5ec" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M83 84c9 0 12 5 10 10-1.5 5-7 7-12 6" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="58" cy="78" rx="26" ry="6" fill={ink} />
      <ellipse cx="58" cy="78" rx="24" ry="5" fill="#b9814f" />
      <g clipPath="url(#crema-clip)">
        <rect className="es-shimmer" x="20" y="70" width="20" height="16" fill="url(#crema-shine)" />
      </g>
    </svg>
  );
}

export const DRINKS = [SteamingCup, FilterPour, MokaBrew, AeroDrip, SaltCoffee, EspressoShot];

/* ---------------- the painter's tools (tip at the bottom; the paint takes --paint) ---------------- */

const toolSvg = { viewBox: "0 0 40 200", fill: "none", "aria-hidden": true } as const;

export function RoundBrush() {
  return (
    <svg {...toolSvg} className="tool-svg">
      <path d="M17 6h6c2 0 3 1 3 3l-2 100h-8L14 9c0-2 1-3 3-3z" fill="#3b2a20" />
      <path d="M18 14l1 80" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
      <rect x="14" y="108" width="12" height="30" rx="2" fill={steel} />
      <path d="M14 116h12M14 130h12" stroke={steelDark} strokeWidth="2" />
      <path d="M14 138c-2 18 2 34 6 48 4-14 8-30 6-48z" fill="#e7d3b8" />
      <path className="tool-paint" d="M14.6 158c1 10 3 20 5.4 28 2.4-8 4.4-18 5.4-28-3 2-8 2-10.8 0z" />
    </svg>
  );
}

export function FlatBrush() {
  return (
    <svg {...toolSvg} className="tool-svg">
      <path d="M16 4h8c2 0 3 1 3 3l-2 96H15L13 7c0-2 1-3 3-3z" fill="#6a3fc4" />
      <path d="M17 12l1 80" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 102h14l2 36H11z" fill={steel} />
      <path d="M12 112h16M11.5 126h17" stroke={steelDark} strokeWidth="2" />
      <path d="M11 138h18l1 40H10z" fill="#e7d3b8" />
      <path className="tool-paint" d="M10.3 164h19.4l.3 22c-6 2-14 2-20 0z" />
    </svg>
  );
}

export function PaletteKnife() {
  return (
    <svg {...toolSvg} className="tool-svg">
      <rect x="14" y="4" width="12" height="74" rx="6" fill="#8a5a3b" />
      <path d="M17 12v56" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
      <rect x="15" y="76" width="10" height="10" rx="2" fill={steelDark} />
      {/* the cranked neck, then the trowel blade */}
      <path d="M20 86v14l-6 10" stroke={steelDark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 110c-6 10-8 34-2 72 1 4 4 4 6 0 8-30 10-56 2-72z" fill={steel} stroke={steelDark} strokeWidth="1.5" />
      <path className="tool-paint" d="M10.6 150c0 10 .4 20 1.4 32 1 4 4 4 6 0 3-10 5-22 6-32-4 3-9 3-13.4 0z" />
    </svg>
  );
}

export const TOOLS = { round: RoundBrush, flat: FlatBrush, knife: PaletteKnife };
export type ToolId = keyof typeof TOOLS;
