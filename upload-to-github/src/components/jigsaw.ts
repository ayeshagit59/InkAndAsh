// Jigsaw geometry. Pieces are rectangles on a unit board; every edge shared by two pieces gets one
// rounded tab (a knob on one piece, the matching socket on the other), and the board's four outer
// corners are rounded. Both neighbours compute the same curve from the shared segment, so they always fit.

export type Rect = { id: string; x: number; y: number; w: number; h: number };
type V = [number, number];

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const f = (p: V, s: number) => `${(p[0] * s).toFixed(1)} ${(p[1] * s).toFixed(1)}`;
const EPS = 1e-6;

/**
 * Desktop: a rounded square, 12 x 12 units. Booking Guard is ~40% of it; then HSBC, Thoucentric, HUL, the two Deloitte tools.
 * Mobile: two columns, 12 x 22.8 units, Booking Guard spanning both.
 */
export type Layout = { W: number; H: number; rects: Rect[]; /** "a|b" pairs whose knob goes the other way */ flip?: string[] };

export const LAYOUTS: Record<"desktop" | "mobile", Layout> = {
  desktop: {
    W: 12,
    H: 12,
    // keep Thoucentric's text clear: its knobs point outwards on every side
    flip: ["booking-guard|thoucentric", "thoucentric|db-agent"],
    rects: [
      { id: "booking-guard", x: 0, y: 0, w: 6.8, h: 8.4 },
      { id: "hsbc", x: 6.8, y: 0, w: 5.2, h: 4.6 },
      { id: "thoucentric", x: 6.8, y: 4.6, w: 5.2, h: 3.8 },
      { id: "hul", x: 0, y: 8.4, w: 4.6, h: 3.6 },
      { id: "flow-bot", x: 4.6, y: 8.4, w: 3.7, h: 3.6 },
      { id: "db-agent", x: 8.3, y: 8.4, w: 3.7, h: 3.6 },
    ],
  },
  mobile: {
    W: 12,
    H: 22.8,
    rects: [
      { id: "booking-guard", x: 0, y: 0, w: 12, h: 7.6 },
      { id: "hsbc", x: 0, y: 7.6, w: 6, h: 5.2 },
      { id: "thoucentric", x: 6, y: 7.6, w: 6, h: 5.2 },
      { id: "hul", x: 0, y: 12.8, w: 12, h: 5.4 },
      { id: "flow-bot", x: 0, y: 18.2, w: 6, h: 4.6 },
      { id: "db-agent", x: 6, y: 18.2, w: 6, h: 4.6 },
    ],
  },
};

/** One knob, drawn from `a` to `b` (the neck) bulging along `n` (already signed). */
function tab(a: V, b: V, u: V, n: V, h: number, d: number, s: number) {
  const m = mul(add(a, b), 0.5);
  const p1 = add(add(m, mul(u, -h * 1.35)), mul(n, d * 0.72));
  const p2 = add(m, mul(n, d));
  const p3 = add(add(m, mul(u, h * 1.35)), mul(n, d * 0.72));
  return [
    `C ${f(add(add(a, mul(n, d * 0.32)), mul(u, h * 0.3)), s)} ${f(add(p1, mul(n, -d * 0.32)), s)} ${f(p1, s)}`,
    `C ${f(add(p1, mul(n, d * 0.26)), s)} ${f(add(p2, mul(u, -h * 0.85)), s)} ${f(p2, s)}`,
    `C ${f(add(p2, mul(u, h * 0.85)), s)} ${f(add(p3, mul(n, d * 0.26)), s)} ${f(p3, s)}`,
    `C ${f(add(p3, mul(n, -d * 0.32)), s)} ${f(add(add(b, mul(n, d * 0.32)), mul(u, -h * 0.3)), s)} ${f(b, s)}`,
  ].join(" ");
}

const DIRS: V[] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

type Tab = { m: V; h: number; d: number; /** 1: knob points out of piece i; -1: a socket cut into it */ sign: number };

/** The tabs on edge `e` (0 top, 1 right, 2 bottom, 3 left) of piece `i`, in travel order. */
function edgeTabs(L: Layout, i: number, e: number): Tab[] {
  const { rects } = L;
  const flip = new Set(L.flip ?? []);
  const A = rects[i];
  const P: V = [[A.x, A.y], [A.x + A.w, A.y], [A.x + A.w, A.y + A.h], [A.x, A.y + A.h]][e] as V;
  const u = DIRS[e];
  const horiz = u[1] === 0;

  // neighbours sharing this edge, as [from, to] intervals along the edge line
  const segs: { a: number; b: number; j: number }[] = [];
  rects.forEach((B, j) => {
    if (j === i) return;
    const lineA = horiz ? P[1] : P[0];
    const sideB = horiz ? (e === 0 ? B.y + B.h : B.y) : e === 1 ? B.x : B.x + B.w;
    if (Math.abs(lineA - sideB) > EPS) return;
    const lo = Math.max(horiz ? A.x : A.y, horiz ? B.x : B.y);
    const hi = Math.min(horiz ? A.x + A.w : A.y + A.h, horiz ? B.x + B.w : B.y + B.h);
    if (hi - lo > EPS) segs.push({ a: lo, b: hi, j });
  });
  segs.sort((p, q) => (p.a - q.a) * (horiz ? u[0] : u[1]));

  const tabs: Tab[] = [];
  for (const g of segs) {
    const len = g.b - g.a;
    if (len < 1.8) continue;
    const mid = (g.a + g.b) / 2;
    const h = Math.min(0.42, len * 0.12);
    // which of the pair carries the knob: alternate by index sum so every piece gets a mix
    let owner = (i + g.j) % 2 === 0 ? Math.min(i, g.j) : Math.max(i, g.j);
    const pair = [rects[Math.min(i, g.j)].id, rects[Math.max(i, g.j)].id].join("|");
    if (flip.has(pair)) owner = owner === i ? g.j : i;
    tabs.push({ m: horiz ? [mid, P[1]] : [P[0], mid], h, d: h * 1.75, sign: owner === i ? 1 : -1 });
  }
  return tabs;
}

/**
 * How far into piece `i` its text must stay clear of the outline, per side [top, right, bottom, left], in units:
 * the depth of any socket a neighbour's knob cuts into that side, and a little extra beside a rounded board corner.
 */
export function pieceInsets(L: Layout, i: number, r = 0.9): [number, number, number, number] {
  const A = L.rects[i];
  const out = [0, 1, 2, 3].map((e) => Math.max(0, ...edgeTabs(L, i, e).filter((t) => t.sign < 0).map((t) => t.d))) as [number, number, number, number];
  const atL = A.x < EPS, atT = A.y < EPS, atR = Math.abs(A.x + A.w - L.W) < EPS, atB = Math.abs(A.y + A.h - L.H) < EPS;
  const corner = r * 0.3;
  if ((atT && atL) || (atT && atR)) out[0] = Math.max(out[0], corner);
  if ((atB && atL) || (atB && atR)) out[2] = Math.max(out[2], corner);
  if ((atL && atT) || (atL && atB)) out[3] = Math.max(out[3], corner);
  if ((atR && atT) || (atR && atB)) out[1] = Math.max(out[1], corner);
  return out;
}

/** SVG path for piece `i`, scaled by `s` px per unit. */
export function piecePath(L: Layout, i: number, s: number, r = 0.9) {
  const { rects, W, H } = L;
  const A = rects[i];
  const C: V[] = [
    [A.x, A.y],
    [A.x + A.w, A.y],
    [A.x + A.w, A.y + A.h],
    [A.x, A.y + A.h],
  ];
  const outer = (p: V) => (Math.abs(p[0]) < EPS || Math.abs(p[0] - W) < EPS) && (Math.abs(p[1]) < EPS || Math.abs(p[1] - H) < EPS);
  const dirs = DIRS;
  const start = outer(C[0]) ? add(C[0], mul(dirs[0], r)) : C[0];
  const out: string[] = [`M ${f(start, s)}`];

  for (let e = 0; e < 4; e++) {
    const Q = C[(e + 1) % 4], u = dirs[e];
    const nOut: V = [u[1], -u[0]]; // outward normal for clockwise travel (y down)
    for (const t of edgeTabs(L, i, e)) {
      const a = add(t.m, mul(u, -t.h)), b = add(t.m, mul(u, t.h));
      out.push(`L ${f(a, s)}`, tab(a, b, u, mul(nOut, t.sign), t.h, t.d, s));
    }

    const next = (e + 1) % 4;
    if (outer(Q)) {
      const end = add(Q, mul(u, -r));
      const after = add(Q, mul(dirs[next], r));
      out.push(`L ${f(end, s)}`, `Q ${f(Q, s)} ${f(after, s)}`);
    } else out.push(`L ${f(Q, s)}`);
  }
  out.push("Z");
  return out.join(" ");
}
