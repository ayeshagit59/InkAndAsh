// Simple line drawings for the brew shelf. Stroke uses currentColor.
const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function MokaPot() {
  return (
    <svg viewBox="0 0 100 120" aria-hidden="true" {...common}>
      <path d="M50 8v6" />
      <path d="M38 14h24l6 40H32z" />
      <path d="M32 54h36" />
      <path d="M34 54l-8 50h48l-8-50" />
      <path d="M26 104h48" />
      <path d="M68 24c12 0 18 6 18 14s-4 12-14 14" />
      <path d="M38 14l-10-4" />
      <path d="M44 72h12M42 84h16" opacity="0.5" />
    </svg>
  );
}

export function FilterCoffee() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" {...common}>
      {/* davara (bowl) */}
      <path d="M10 82h100l-10 22H20z" />
      <path d="M10 82c10-6 90-6 100 0" />
      {/* tumbler standing in it */}
      <path d="M42 30h36l-5 58H47z" />
      <path d="M42 30c6-4 30-4 36 0" />
      <path d="M48 44h24" opacity="0.5" />
      {/* the froth from a high pour */}
      <path d="M60 4c-2 8 2 14 0 22" strokeDasharray="3 5" />
      <path d="M50 30c3-5 7-5 10 0 3-5 7-5 10 0" />
    </svg>
  );
}

export function AeroPress() {
  return (
    <svg viewBox="0 0 100 120" aria-hidden="true" {...common}>
      <path d="M36 6h28v14H36z" />
      <path d="M40 20h20v34H40z" />
      <path d="M32 54h36l-3 40H35z" />
      <path d="M36 66h28M36 76h28M36 86h28" opacity="0.45" />
      <path d="M26 94h48v8H26z" />
      <path d="M30 102h40l-4 12H34z" />
    </svg>
  );
}
