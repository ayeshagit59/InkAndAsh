// Round 8: the book without the ribbon, and painting 19's new picture. node scripts/round8.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const OUT = "screenshots/round8";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const problems = [];
for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const p = await b.newPage({ viewport: { width, height } });
  p.on("pageerror", (e) => problems.push(`[${name}] pageerror ${e.message}`));
  p.on("console", (m) => m.type() === "error" && problems.push(`[${name}] console ${m.text()}`));
  p.on("response", (r) => r.status() >= 400 && problems.push(`[${name}] ${r.status()} ${r.url()}`));
  await p.goto(BASE + "#/gallery");
  await p.waitForTimeout(1500);
  const cover = await p.evaluate(() => {
    const hint = document.querySelector(".bk-cover-hint"), r = hint.getBoundingClientRect();
    // is the hint the top-most thing at its centre and corners?
    const pts = [[r.left + 2, r.top + 2], [r.right - 2, r.bottom - 2], [(r.left + r.right) / 2, (r.top + r.bottom) / 2]];
    const covered = pts.some(([x, y]) => { const el = document.elementFromPoint(x, y); return el && !hint.contains(el) && !el.contains(hint); });
    return { text: hint.textContent, covered, inView: r.top >= 0 && r.bottom <= innerHeight, ribbons: document.querySelectorAll("[class*=ribbon]").length };
  });
  console.log(name, "cover hint:", JSON.stringify(cover));
  if (cover.covered || !cover.inView || cover.ribbons) problems.push(`[${name}] cover ${JSON.stringify(cover)}`);
  await p.screenshot({ path: `${OUT}/${name}-1-cover.png` });
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(1400);
  await p.screenshot({ path: `${OUT}/${name}-2-open.png` });
  // turn until painting 19 is on show
  let found = null;
  for (let i = 0; i < 14 && !found; i++) {
    await p.keyboard.press("ArrowRight");
    await p.waitForTimeout(1400);
    found = await p.evaluate(() => {
      const leaves = [...document.querySelectorAll(".bk-leaf")];
      const turned = leaves.filter((l) => l.classList.contains("is-turned")).length;
      const faces = [leaves[turned]?.querySelector(".bk-face--front"), leaves[turned - 1]?.querySelector(".bk-face--back")].filter(Boolean);
      for (const f of faces) {
        const img = f.querySelector('img[src*="19-is-painting"]');
        if (img) {
          // layout size (offset*), unaffected by the print's tilt
          const r = { width: img.offsetWidth, height: img.offsetHeight };
          return { foot: document.querySelector(".bk-foot")?.textContent, src: img.currentSrc.split("/").pop(), natural: [img.naturalWidth, img.naturalHeight], shown: [Math.round(r.width), Math.round(r.height)], aspect: [(img.naturalWidth / img.naturalHeight).toFixed(3), (r.width / r.height).toFixed(3)], alt: img.alt, label: img.closest(".bk-snap")?.querySelector(".bk-snap-label")?.textContent, href: img.closest("a")?.href, dpr: devicePixelRatio };
        }
      }
      return null;
    });
  }
  console.log(name, "painting 19:", JSON.stringify(found));
  // shown size must not exceed the file's real pixels (accounting for rotation it's close enough to compare boxes)
  if (!found || found.shown[0] * found.dpr > 926 + 1 || Math.abs(found.aspect[0] - found.aspect[1]) > 0.02) problems.push(`[${name}] painting 19 ${JSON.stringify(found)}`);
  await p.screenshot({ path: `${OUT}/${name}-3-collage-19.png` });
  await p.close();
}
await b.close();
console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "No problems");
