// Frame cost on the home hero: after load, with candidate layers hidden one at a time.
import { chromium } from "playwright";
const URL = process.argv[2] || "https://inkandash.vercel.app/";
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(URL);
await p.waitForTimeout(9000);
const measure = () => p.evaluate(() => new Promise((res) => { const f = []; let last = performance.now(); const tick = (t) => { f.push(t - last); last = t; if (f.length < 40) requestAnimationFrame(tick); else res((f.slice(2).reduce((a, c) => a + c, 0) / (f.length - 2)).toFixed(0)); }; requestAnimationFrame(tick); }));
console.log("hero, settled:", await measure(), "ms/frame");
const sels = await p.evaluate(() => {
  // every element in the hero that animates or uses filters / backdrop blur
  const out = new Set();
  document.querySelectorAll("#home *, .atmosphere *, .page-canvas").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.animationName !== "none" || cs.filter !== "none" || cs.backdropFilter !== "none" || cs.mixBlendMode !== "normal") {
      const cls = typeof el.className === "string" ? el.className.split(" ")[0] : el.tagName;
      out.add(`${cls}|anim:${cs.animationName}|filter:${cs.filter.slice(0, 30)}|bd:${cs.backdropFilter}|blend:${cs.mixBlendMode}`);
    }
  });
  return [...out];
});
console.log(sels.join("\n"));
for (const sel of [".page-canvas", ".atmosphere", ".hero-bg, .cosmic, [class*=nebula], [class*=star]", "#home canvas", "#home [class*=polaroid], #home figure", "#home"]) {
  await p.evaluate((s) => document.querySelectorAll(s).forEach((n) => (n.style.visibility = "hidden")), sel);
  console.log(`hidden ${sel}:`, await measure(), "ms/frame");
  await p.evaluate((s) => document.querySelectorAll(s).forEach((n) => (n.style.visibility = "")), sel);
}
await p.evaluate(() => scrollTo(0, document.getElementById("about").offsetTop + 200));
await p.waitForTimeout(1500);
console.log("about section:", await measure(), "ms/frame");
await b.close();
