// Original illustrated covers for the song cards: flat shapes, soft gradients, one style across the set.
// Square, decorative (the card's link carries the name). Fine grain is added in CSS over every cover.
type Art = () => JSX.Element;

const Frame = ({ id, from, to, children }: { id: string; from: string; to: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 200 200" className="cover-svg" aria-hidden="true">
    <defs>
      <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={from} />
        <stop offset="1" stopColor={to} />
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill={`url(#bg-${id})`} />
    {children}
  </svg>
);

/** Tere Paas Main: headphones resting over a crescent moon. Rose and amber. */
const Headphones: Art = () => (
  <Frame id="hp" from="#f3a6a0" to="#c9573e">
    <circle cx="100" cy="98" r="58" fill="#ffd9a0" />
    <circle cx="122" cy="84" r="54" fill="#e98577" />
    <path d="M44 118V96a56 56 0 0 1 112 0v22" fill="none" stroke="#7a2e2a" strokeWidth="9" strokeLinecap="round" />
    <rect x="30" y="108" width="28" height="46" rx="12" fill="#7a2e2a" />
    <rect x="142" y="108" width="28" height="46" rx="12" fill="#7a2e2a" />
    <rect x="36" y="114" width="12" height="34" rx="6" fill="#ffb07a" />
    <rect x="152" y="114" width="12" height="34" rx="6" fill="#ffb07a" />
    <circle cx="160" cy="40" r="2.4" fill="#fff4e0" />
    <circle cx="40" cy="52" r="1.8" fill="#fff4e0" />
  </Frame>
);

/** Tere Bina: a standing microphone and one bright star. Deep indigo and silver. */
const Microphone: Art = () => (
  <Frame id="mic" from="#2a2f7a" to="#0d0f2e">
    <path d="M150 34l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="#e8ecff" />
    <circle cx="150" cy="49" r="22" fill="#e8ecff" opacity="0.12" />
    <circle cx="44" cy="40" r="1.6" fill="#c7cbe8" />
    <circle cx="70" cy="24" r="1.2" fill="#c7cbe8" />
    <rect x="80" y="44" width="40" height="62" rx="20" fill="#c7cbe8" />
    {[56, 66, 76, 86, 96].map((y) => (
      <path key={y} d={`M84 ${y}h32`} stroke="#8d93bf" strokeWidth="2" />
    ))}
    <path d="M70 92a30 30 0 0 0 60 0" fill="none" stroke="#aeb3d8" strokeWidth="5" strokeLinecap="round" />
    <path d="M100 122v44" stroke="#aeb3d8" strokeWidth="6" strokeLinecap="round" />
    <path d="M74 170h52" stroke="#aeb3d8" strokeWidth="7" strokeLinecap="round" />
  </Frame>
);

/** Ye Raate Ye Mausam: a retro cassette over flowing river waves. Teal and gold. */
const Cassette: Art = () => (
  <Frame id="cas" from="#1d8a83" to="#0b3d44">
    <path d="M0 150c25-12 50-12 75 0s50 12 75 0 35-10 50-6v56H0z" fill="#0f5a5c" />
    <path d="M0 166c25-10 50-10 75 0s50 10 75 0 35-8 50-5" fill="none" stroke="#f1c75b" strokeWidth="3" opacity="0.8" />
    <path d="M0 182c25-10 50-10 75 0s50 10 75 0 35-8 50-5" fill="none" stroke="#7fd1c4" strokeWidth="2.5" opacity="0.7" />
    <rect x="36" y="46" width="128" height="84" rx="10" fill="#f1c75b" />
    <rect x="48" y="56" width="104" height="30" rx="5" fill="#fff4d6" />
    <path d="M56 66h60M56 75h40" stroke="#c99a2e" strokeWidth="3" strokeLinecap="round" />
    <rect x="58" y="94" width="84" height="24" rx="12" fill="#0b3d44" />
    <circle cx="74" cy="106" r="8" fill="#f1c75b" />
    <circle cx="126" cy="106" r="8" fill="#f1c75b" />
    <circle cx="74" cy="106" r="3" fill="#0b3d44" />
    <circle cx="126" cy="106" r="3" fill="#0b3d44" />
  </Frame>
);

/** Agar Tum Saath Ho: a piano keyboard with two notes rising and entwining. Magenta and violet. */
const Piano: Art = () => (
  <Frame id="pno" from="#d6338a" to="#4b1d8f">
    <path d="M62 120C70 80 120 96 100 60s36-30 40-6" fill="none" stroke="#ffd1ec" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    <path d="M128 118C116 80 74 94 96 58s-30-32-38-8" fill="none" stroke="#e3c8ff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    <g fill="#fff">
      <ellipse cx="136" cy="54" rx="9" ry="7" transform="rotate(-20 136 54)" />
      <path d="M144 51V24" stroke="#fff" strokeWidth="3" />
      <ellipse cx="60" cy="52" rx="9" ry="7" transform="rotate(-20 60 52)" />
      <path d="M68 49V22l14 6" stroke="#fff" strokeWidth="3" fill="none" />
    </g>
    <rect x="20" y="130" width="160" height="50" rx="6" fill="#fff6fb" />
    {[0, 1, 2, 3, 4, 5, 6].map((k) => (
      <path key={k} d={`M${40 + k * 20} 130v50`} stroke="#d9bfd9" strokeWidth="1.5" />
    ))}
    {[0, 1, 3, 4, 5].map((k) => (
      <rect key={k} x={33 + k * 20} y="130" width="12" height="30" rx="2" fill="#3a1450" />
    ))}
  </Frame>
);

/** Abhi Na Jao Chhod Kar: a vintage gramophone horn. Warm sepia, cream and gold. */
const Gramophone: Art = () => (
  <Frame id="gram" from="#e9d3ad" to="#9b6a3e">
    <path d="M86 112L150 40c14 10 22 28 20 46z" fill="#c99a3e" />
    <path d="M150 40c14 10 22 28 20 46" fill="none" stroke="#7a5326" strokeWidth="4" />
    <path d="M86 112L150 40M86 112l84-26M86 112l74-58" stroke="#a87b33" strokeWidth="2" />
    <path d="M86 112c-6 6-12 10-22 10" fill="none" stroke="#5b3a1e" strokeWidth="5" strokeLinecap="round" />
    <rect x="40" y="132" width="110" height="38" rx="5" fill="#6e4423" />
    <rect x="40" y="132" width="110" height="8" fill="#82542d" />
    <ellipse cx="80" cy="132" rx="40" ry="7" fill="#2a1a0f" />
    <ellipse cx="80" cy="132" rx="12" ry="2.5" fill="#d8b46a" />
    <circle cx="140" cy="152" r="5" fill="#d8b46a" />
    <path d="M30 70c8-4 14 2 10 8M44 58c6-4 12 0 9 6" fill="none" stroke="#fff3dc" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
  </Frame>
);

export const COVER_ART: Record<string, Art> = {
  headphones: Headphones,
  microphone: Microphone,
  cassette: Cassette,
  piano: Piano,
  gramophone: Gramophone,
};
