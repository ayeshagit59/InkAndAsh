import meta from "./art-meta.json";



export type Painting = {
  slug: string;
  title: string;
  postId: string;
  date: string;
  alt: string;
  /** object-position for crops: most photos have a hand or a table at the edge */
  focus?: string;
  round?: boolean;
  /** object-position for the home page tiles (4:5), so the best part of the painting shows */
  tile?: string;
  /** colour-drop override when the computed colour picks up the background instead of the painting */
  drop?: string;
};

// Newest first, matching the Medium order. Titles are the post titles.
export const paintings: Painting[] = [
  { slug: "01-journey-called-life", title: "A journey called life", postId: "943c7c66e0fe", date: "2025-11-20", alt: "Small square canvas held up in a hand: a steam train crossing an arched bridge in silhouette against a glowing pink and violet sky", focus: "45% 45%", drop: "#8a2f73" },
  { slug: "02-the-first-wall", title: "The First Wall", postId: "cceba2f60534", date: "2025-10-31", alt: "Wall mural of pink tulips and buds on a curving teal stem, painted on a warm cream wall", drop: "#a3245f" },
  { slug: "03-charminar-splash", title: "A splash on the Charminar", postId: "3c88c0e34284", date: "2025-10-02", alt: "Sketchbook page with the Charminar drawn in black ink over a wash of orange, magenta, yellow and blue", focus: "50% 50%", drop: "#a34a10" },
  { slug: "04-monochrome-whispers", title: "Monochrome Whispers", postId: "e243c64bce9b", date: "2025-09-14", alt: "Black pen zentangle feather and flower on a white spiral sketchbook page", focus: "50% 40%" },
  { slug: "05-endless-blues", title: "Endless blues, Endless views", postId: "ec69fd616f0e", date: "2025-08-28", alt: "Deep blue sky with soft white clouds over a calm blue sea and a strip of golden sand" },
  { slug: "06-lantern-city", title: "Lantern City", postId: "016c9b6847ab", date: "2025-08-20", alt: "Round canvas of a starry pink, green and indigo night with a string of glowing yellow lanterns and a tree silhouette", focus: "55% 50%", round: true },
  { slug: "07-the-new-canvas", title: "The New Canvas", postId: "844533496120", date: "2025-08-05", alt: "Round canvas with a pale full moon over purple mountains and a dark rocky ridge", focus: "50% 55%", round: true, drop: "#5b2fa8" },
  { slug: "08-northern-lights-again", title: "The Northern lights, again !", postId: "93ec19b311da", date: "2025-07-27", alt: "Vertical streaks of blue aurora over a line of white-capped mountains and a dark blue lake" },
  { slug: "09-hostel-days", title: "My Hostel Days", postId: "ac8886121c63", date: "2025-07-21", alt: "Collage of black pen sketchbook drawings: a stone arch, a butterfly, a moonlit forest, a zentangle leaf and a starry mountain", focus: "50% 30%" },
  { slug: "10-scribbling-or-doodling", title: "Scribbling…or Doodling?", postId: "e4d78577a275", date: "2025-07-12", alt: "Collage of doodle pages: black and white paisley, colourful mandalas in green, purple and orange, and a patterned profile of a face", focus: "50% 45%" },
  { slug: "11-is-christmas-over", title: "Is Christmas Over?", postId: "620f37763fe1", date: "2025-07-07", alt: "Round canvas of tall green pine trees under a crescent moon and stars in a deep blue sky", focus: "50% 45%", round: true },
  { slug: "12-the-sky-is-pink", title: "The Sky is Pink", postId: "dfe9103d65b7", date: "2025-06-29", alt: "Black palm tree silhouettes against a sky fading from violet to pink to pale blue", drop: "#7b2f8f" },
  { slug: "13-the-imaginary-party", title: "The Imaginary Party", postId: "62d60b15c8ca", date: "2025-06-23", alt: "Two palm trees framing a red sunset over a blue sea, with a string of coloured party lights and a yellow sun reflected in the water", drop: "#a8202f" },
  { slug: "14-materialistic-gifts", title: "Materialistic Gifts or No?", postId: "d1e12a1ff05e", date: "2025-06-15", alt: "Glowing pink moon in a blue night sky framed by dark branches of pink cherry blossom, with a violet butterfly", drop: "#a3246a", tile: "50% 45%" },
  { slug: "15-the-northern-lights", title: "The Northern Lights", postId: "5e7e51d71412", date: "2025-06-08", alt: "Green and yellow aurora sweeping diagonally across a blue sky above a lake ringed with pine silhouettes", drop: "#1d6a3a" },
  { slug: "16-fairy-land", title: "Tale of the Fairy Land", postId: "16793afacdfe", date: "2025-06-01", alt: "A twisted tree with lilac blossoms on a cliff edge, silhouetted against a huge pale blue moon and a violet sky", focus: "50% 35%", tile: "50% 40%" },
  { slug: "17-sky-full-of-stars", title: "Sky Full of Stars", postId: "4afa07b5701c", date: "2025-05-24", alt: "A bright full moon and sparkling stars over a forest of bare black trees on a deep blue night", focus: "50% 25%", tile: "50% 30%" },
  { slug: "18-sunlight-moonlight", title: "Made of Sunlight, Dreaming in Moonlight", postId: "88d3b5fd3595", date: "2025-05-16", alt: "Silhouette of a woman looking up at a crescent moon in a blue and violet sky, with birds and a bare tree", tile: "50% 42%" },
  { slug: "19-is-painting-all-about-colors", title: "Is Painting all about colors?", postId: "e82004b7df20", date: "2025-05-07", alt: "Sunset over water with palm trees and birds in silhouette against an orange sky, acrylic on canvas" },
];


export const bySlug = Object.fromEntries(paintings.map((p) => [p.slug, p])) as Record<string, Painting>;

type Meta = { width: number; height: number; lqip: string; color: string };
const artMeta = meta as Record<string, Meta>;

export const WIDTHS = [400, 800, 1200] as const;

// Which processed image a painting uses. The Charminar post had two photos; the upright, better-framed
// one (originally "03b") is the only one shown now.
const FILE: Record<string, string> = { "03-charminar-splash": "03b-charminar-splash" };
const file = (slug: string) => FILE[slug] ?? slug;

export function artSrc(slug: string, w: (typeof WIDTHS)[number] = 800) {
  return `${import.meta.env.BASE_URL}art/w/${file(slug)}-${w}.webp`;
}

// each file's real width: a painting smaller than a step is stored at its own size there (never upscaled)
export function artSrcSet(slug: string) {
  const max = artMetaFor(slug).width;
  return WIDTHS.map((w) => `${artSrc(slug, w)} ${Math.min(w, max)}w`).join(", ");
}

export function artMetaFor(slug: string): Meta {
  return artMeta[file(slug)];
}

export function dropColour(slug: string) {
  return bySlug[slug].drop ?? artMetaFor(slug).color;
}

export const mediumPost = (postId: string) => `https://medium.com/p/${postId}`;

/**
 * `sizes` for an image that object-fit: covers a box. The browser has to know the *rendered* width
 * (a tall strip of a landscape painting renders much wider than its box), or it picks a file that's too small.
 * Each rule is [media query or "", box width (px, roughly), box height (px)].
 */
export function coverSizes(slug: string, rules: [string, number, number][]) {
  const m = artMetaFor(slug);
  const aspect = m.width / m.height;
  return rules.map(([mq, w, h]) => `${mq ? mq + " " : ""}${Math.ceil(Math.max(w, h * aspect))}px`).join(", ");
}
