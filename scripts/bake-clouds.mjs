// Bakes the hero's colour clouds: each painting, saturated and heavily blurred, inside a soft-edged
// ellipse with a transparent surround. The page then only moves these images (no live CSS blur,
// which cost ~75ms a frame). Run: node scripts/bake-clouds.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
const S = 256;
const CLOUDS = { "14-materialistic-gifts": "14-materialistic-gifts", "15-the-northern-lights": "15-the-northern-lights", "03-charminar-splash": "03b-charminar-splash", "06-lantern-city": "06-lantern-city" };
mkdirSync("public/hero", { recursive: true });
// opaque in the middle, fading out like a blurred circle's edge; the ellipse is ~1/1.32 of the canvas (CSS scales it back up)
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
  <stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.92"/>
  <stop offset="0.7" stop-color="#fff" stop-opacity="0.45"/><stop offset="0.88" stop-color="#fff" stop-opacity="0.1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <rect width="${S}" height="${S}" fill="url(#g)"/></svg>`);
for (const [slug, file] of Object.entries(CLOUDS)) {
  const base = await sharp(`public/art/w/${file}-400.webp`).resize(S, S, { fit: "cover" }).modulate({ saturation: 1.5 }).blur(16).ensureAlpha().toBuffer();
  await sharp(base).composite([{ input: mask, blend: "dest-in" }]).webp({ quality: 82, alphaQuality: 90 }).toFile(`public/hero/cloud-${slug}.webp`);
  console.log("baked", slug);
}
