// Converts the rendered resume page(s) to WebP for the inline viewer, with a short content hash in each
// file name so a browser never shows a cached older resume:
//   public/resume/resume-page-N-<hash>.webp (full) and resume-page-N-<hash>-900.webp (phones),
// and writes src/content/resume-pages.json, which the viewer reads.
// Run after: swift scripts/render-resume.swift public/resume.pdf media-src/resume
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const src = "media-src/resume";
const pages = [];
const files = readdirSync(src).filter((f) => /^resume-page-\d+\.png$/.test(f)).sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
for (const f of files) {
  const png = readFileSync(`${src}/${f}`);
  const hash = createHash("sha1").update(png).digest("hex").slice(0, 8);
  const name = `${f.replace(".png", "")}-${hash}`;
  const full = await sharp(png).webp({ quality: 84, smartSubsample: true }).toFile(`public/resume/${name}.webp`);
  const small = await sharp(png).resize({ width: 900 }).webp({ quality: 86 }).toFile(`public/resume/${name}-900.webp`);
  pages.push({ full: `resume/${name}.webp`, small: `resume/${name}-900.webp`, width: full.width, height: full.height });
  console.log(name, full.width, full.height, full.size, "|", small.width, small.size);
}
writeFileSync("src/content/resume-pages.json", JSON.stringify(pages, null, 2) + "\n");
