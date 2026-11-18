// Builds WebP width variants for every painting in media-src/art-originals/*.jpg -> public/art/w/<slug>-<width>.webp,
// plus a tiny LQIP and the dominant colour (used by the art tiles' colour drop).
// Never upscales: a width larger than the source is written at the source's own width.
// Pass slugs to redo only those paintings (the rest of art-meta.json is kept): node scripts/process-art.mjs <slug> ...
import { existsSync, readdirSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "media-src/art-originals";
const OUT = "public/art/w";
const WIDTHS = [400, 800, 1200];
mkdirSync(OUT, { recursive: true });

// The painting's most characteristic colour: bucket saturated pixels by hue, take the heaviest bucket,
// then darken until white text on it passes AA (4.5:1).
async function vividColour(img) {
  const { data, info } = await img.clone().resize({ width: 64 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bins = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    const sat = max ? d / max : 0;
    if (sat < 0.35 || max < 0.25) continue;
    let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = ((h * 60) + 360) % 360;
    const bin = bins[Math.floor(h / 30)];
    const w = sat * sat * max;
    bin.w += w; bin.r += r * w; bin.g += g * w; bin.b += b * w;
  }
  const top = bins.reduce((a, c) => (c.w > a.w ? c : a));
  let [r, g, b] = top.w ? [top.r / top.w, top.g / top.w, top.b / top.w] : [0.3, 0.2, 0.5];
  const lum = (x) => { const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * f(x[0]) + 0.7152 * f(x[1]) + 0.0722 * f(x[2]); };
  while (1.05 / (lum([r, g, b]) + 0.05) < 4.6) { r *= 0.94; g *= 0.94; b *= 0.94; }
  return "#" + [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
}

const only = process.argv.slice(2);
const META = "src/content/art-meta.json";
const meta = only.length && existsSync(META) ? JSON.parse(readFileSync(META, "utf8")) : {};
for (const file of readdirSync(SRC).filter((f) => f.endsWith(".jpg") && (!only.length || only.includes(f.replace(/\.jpg$/, ""))))) {
  const slug = file.replace(/\.jpg$/, "");
  const img = sharp(path.join(SRC, file)).rotate();
  const { width, height } = await img.metadata();
  for (const w of WIDTHS) {
    await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(OUT, `${slug}-${w}.webp`));
  }
  // tiny blurred placeholder for the cosmic background + LQIP
  const tiny = await img.clone().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  const hex = await vividColour(img);
  meta[slug] = { width, height, color: hex, lqip: `data:image/webp;base64,${tiny.toString("base64")}` };
  console.log(slug, width, height, meta[slug].color);
}
writeFileSync(META, JSON.stringify(meta, null, 2));
