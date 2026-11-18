import { bySlug } from "./art";

// The gallery book (#/gallery). Titles are the Medium post titles.
export type GalleryEntry = {
  slug: string;
  n: number; // painting number, shown as "07 / 19"
  month: string;
  title: string;
  postId: string;
  alt: string;
};

const e = (slug: string, n: number, month: string, title: string, postId: string, alt?: string): GalleryEntry => ({
  slug,
  n,
  month,
  title,
  postId,
  alt: alt ?? bySlug[slug].alt,
});

export const galleryTotal = 19;

export const gallery: GalleryEntry[] = [
  e("01-journey-called-life", 1, "Nov 2025", "A journey called life", "943c7c66e0fe"),
  e("02-the-first-wall", 2, "Oct 2025", "The First Wall", "cceba2f60534"),
  e("03-charminar-splash", 3, "Oct 2025", "A splash on the “Charminar”!", "3c88c0e34284",
    "The Charminar sketchbook page held up in a hand: black ink minarets and arch over a wash of orange, magenta, yellow-green and blue"),
  e("04-monochrome-whispers", 4, "Sep 2025", "Monochrome Whispers", "e243c64bce9b"),
  e("05-endless-blues", 5, "Aug 2025", "Endless blues, Endless views", "ec69fd616f0e"),
  e("06-lantern-city", 6, "Aug 2025", "Lantern City", "016c9b6847ab"),
  e("07-the-new-canvas", 7, "Aug 2025", "The New Canvas!", "844533496120"),
  e("08-northern-lights-again", 8, "Jul 2025", "The Northern lights, again !", "93ec19b311da"),
  e("09-hostel-days", 9, "Jul 2025", "My “Hostel” Days", "ac8886121c63"),
  e("10-scribbling-or-doodling", 10, "Jul 2025", "Scribbling…or Doodling?", "e4d78577a275"),
  e("11-is-christmas-over", 11, "Jul 2025", "Is Christmas Over?", "620f37763fe1"),
  e("12-the-sky-is-pink", 12, "Jun 2025", "The Sky is Pink", "dfe9103d65b7"),
  e("13-the-imaginary-party", 13, "Jun 2025", "The Imaginary Party", "62d60b15c8ca"),
  e("14-materialistic-gifts", 14, "Jun 2025", "Materialistic Gifts or No?", "d1e12a1ff05e"),
  e("15-the-northern-lights", 15, "Jun 2025", "The Northern Lights", "5e7e51d71412"),
  e("16-fairy-land", 16, "Jun 2025", "Tale of the Fairy Land", "16793afacdfe"),
  e("17-sky-full-of-stars", 17, "May 2025", "Sky Full of Stars", "4afa07b5701c"),
  e("18-sunlight-moonlight", 18, "May 2025", "Made of Sunlight, Dreaming in Moonlight", "88d3b5fd3595"),
  e("19-is-painting-all-about-colors", 19, "May 2025", "Is Painting all about colors?", "e82004b7df20"),
];

const bySlugG = Object.fromEntries(gallery.map((g) => [g.slug, g])) as Record<string, GalleryEntry>;

/** The book: eight favourites, two to a spread (one per page on a phone), in this order. */
export const favourites = [
  "18-sunlight-moonlight",
  "17-sky-full-of-stars",
  "16-fairy-land",
  "14-materialistic-gifts",
  "12-the-sky-is-pink",
  "11-is-christmas-over",
  "09-hostel-days",
  "08-northern-lights-again",
].map((s) => bySlugG[s]);

/** "More from the studio": the other eleven, as collage pages. */
export const studio = [
  "01-journey-called-life",
  "02-the-first-wall",
  "03-charminar-splash",
  "04-monochrome-whispers",
  "05-endless-blues",
  "06-lantern-city",
  "07-the-new-canvas",
  "10-scribbling-or-doodling",
  "13-the-imaginary-party",
  "15-the-northern-lights",
  "19-is-painting-all-about-colors",
].map((s) => bySlugG[s]);

/** Short labels for the collage prints. */
export const studioLabel: Record<string, string> = {
  "01-journey-called-life": "the long train",
  "02-the-first-wall": "first wall",
  "03-charminar-splash": "Charminar",
  "04-monochrome-whispers": "just ink",
  "05-endless-blues": "endless blue",
  "06-lantern-city": "lanterns",
  "07-the-new-canvas": "a round moon",
  "10-scribbling-or-doodling": "doodles",
  "13-the-imaginary-party": "party lights",
  "15-the-northern-lights": "aurora",
  "19-is-painting-all-about-colors": "all the colours",
};
