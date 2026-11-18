// Simple original illustrations for the story pop-ups' "photo" area. Decorative (aria-hidden).
// Drawn in light strokes and fills over the story's own colour.
const svg = { viewBox: "0 0 320 180", fill: "none", "aria-hidden": true, className: "story-art" } as const;
const W = "#fff";
const soft = "rgb(255 255 255 / 0.22)";
const line = { stroke: W, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Booking Guard: a hotel key on its tag, beside a calendar with one date held. */
function BookingArt() {
  return (
    <svg {...svg}>
      <rect x="150" y="34" width="120" height="112" rx="12" fill={soft} {...line} />
      <path d="M150 62h120" {...line} />
      <path d="M176 26v16M244 26v16" {...line} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => <circle key={`${r}${c}`} cx={168 + c * 21} cy={80 + r * 18} r="3" fill={W} opacity={0.55} />),
      )}
      <circle cx="210" cy="98" r="11" {...line} />
      <path d="M204 98l4 4 8-8" {...line} />
      {/* key + tag */}
      <circle cx="70" cy="74" r="20" {...line} fill={soft} />
      <circle cx="70" cy="74" r="7" {...line} />
      <path d="M86 86l38 38M108 108l-8 8M118 118l-8 8" {...line} />
      <path d="M52 92l-14 34 26 8 10-30" {...line} fill={soft} />
      <path d="M48 118l16 5" {...line} />
    </svg>
  );
}

/** HSBC: a consent toggle, with limits on what the agent may do. */
function ConsentArt() {
  return (
    <svg {...svg}>
      <rect x="40" y="40" width="240" height="100" rx="16" fill={soft} {...line} />
      <rect x="62" y="66" width="68" height="36" rx="18" fill={W} />
      <circle cx="112" cy="84" r="13" fill="#1f38b0" />
      <path d="M156 70h96M156 88h70M156 106h84" {...line} opacity="0.8" />
      <path d="M150 126h24" {...line} />
      <path d="M262 30c-6 8-14 10-22 10 0 22 8 30 22 36 14-6 22-14 22-36-8 0-16-2-22-10z" {...line} fill="#1f38b0" />
      <path d="M253 54l7 7 12-12" {...line} />
    </svg>
  );
}

/** Thoucentric: scoring bars across factors. */
function ScoresArt() {
  const bars = [70, 112, 54, 128, 92, 80, 40];
  return (
    <svg {...svg}>
      <path d="M50 150h230M50 150V30" {...line} />
      {bars.map((h, i) => (
        <rect key={i} x={64 + i * 30} y={150 - h} width="18" height={h} rx="4" fill={W} opacity={i === 3 ? 1 : 0.45} />
      ))}
      <path d="M64 96c40-30 70-10 110-40s60-10 96-26" {...line} strokeDasharray="5 8" />
      <circle cx="163" cy="22" r="9" fill={W} />
    </svg>
  );
}

/** HUL: a milk carton with a thermometer. */
function MilkArt() {
  return (
    <svg {...svg}>
      <path d="M120 58l16-26h48l16 26v96h-80z" fill={soft} {...line} />
      <path d="M120 58h80M136 32l12 26" {...line} />
      <path d="M140 92c8-10 32-10 40 0" {...line} />
      <path d="M138 120h44" {...line} opacity="0.7" />
      <rect x="226" y="34" width="20" height="96" rx="10" {...line} fill={soft} />
      <circle cx="236" cy="138" r="16" fill={W} />
      <rect x="232" y="70" width="8" height="66" rx="4" fill="#a8216a" />
      <path d="M252 52h12M252 72h12M252 92h12" {...line} />
      <circle cx="84" cy="80" r="22" {...line} />
      <path d="M84 66v14l9 6" {...line} />
    </svg>
  );
}

/** The user-flow bot: a small flowchart. */
function FlowArt() {
  return (
    <svg {...svg}>
      <rect x="128" y="18" width="64" height="30" rx="15" fill={W} />
      <path d="M160 48v18" {...line} />
      <path d="M160 66l30 22-30 22-30-22z" fill={soft} {...line} />
      <path d="M130 88H74v22M190 88h56v22" {...line} />
      <rect x="44" y="110" width="60" height="34" rx="8" fill={soft} {...line} />
      <rect x="216" y="110" width="60" height="34" rx="8" fill={soft} {...line} />
      <path d="M58 127h32M230 127h32" {...line} opacity="0.7" />
    </svg>
  );
}

/** The database agent: stacked cylinders with a sync arrow. */
function DbArt() {
  const cyl = (x: number, o: number) => (
    <g key={x} opacity={o}>
      <ellipse cx={x} cy="52" rx="34" ry="11" fill={W} />
      <path d={`M${x - 34} 52v70c0 6 15 11 34 11s34-5 34-11V52`} fill={soft} {...line} />
      <path d={`M${x - 34} 76c0 6 15 11 34 11s34-5 34-11M${x - 34} 100c0 6 15 11 34 11s34-5 34-11`} {...line} />
    </g>
  );
  return (
    <svg {...svg}>
      {cyl(84, 1)}
      {cyl(236, 0.85)}
      <path d="M130 70c20-22 40-22 60 0" {...line} />
      <path d="M182 60l8 10-12 3" {...line} />
      <path d="M190 112c-20 22-40 22-60 0" {...line} />
      <path d="M138 122l-8-10 12-3" {...line} />
    </svg>
  );
}

export const STORY_ART: Record<string, () => JSX.Element> = {
  "booking-guard": BookingArt,
  hsbc: ConsentArt,
  thoucentric: ScoresArt,
  hul: MilkArt,
  "flow-bot": FlowArt,
  "db-agent": DbArt,
};
