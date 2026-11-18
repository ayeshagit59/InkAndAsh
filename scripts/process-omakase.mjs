// Omakase photos: images/omakase/*.jpg -> public/omakase/*.webp (never upscaled, at most 900px wide)
// and their sizes -> src/content/omakase-meta.json. Run: npm run omakase
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SRC = "images/omakase";
const OUT = "public/omakase";
const meta = {};
if (existsSync(SRC)) {
  mkdirSync(OUT, { recursive: true });
  for (const f of readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))) {
    const base = f.replace(/\.[^.]+$/, "");
    const img = sharp(`${SRC}/${f}`).rotate(); // respect the camera's orientation
    const { width, height } = await img.metadata().then(async (m) => {
      const o = m.orientation && m.orientation >= 5;
      return { width: o ? m.height : m.width, height: o ? m.width : m.height };
    });
    const w = Math.min(width, 900);
    const info = await img.resize({ width: w, withoutEnlargement: true }).webp({ quality: 84 }).toFile(`${OUT}/${base}.webp`);
    meta[base] = { width: info.width, height: info.height };
    console.log(`${OUT}/${base}.webp`, info.width, "x", info.height);
  }
} else console.log(`No ${SRC}/ folder yet; the omakase prints show their tasting cards until the photos arrive.`);
writeFileSync("src/content/omakase-meta.json", JSON.stringify(meta, null, 2) + "\n");
