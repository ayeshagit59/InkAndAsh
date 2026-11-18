import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2] || "http://localhost:5173/");
await p.waitForTimeout(8000);
const m = () => p.evaluate(() => new Promise((res) => { const f = []; let last = performance.now(); const tick = (t) => { f.push(t - last); last = t; if (f.length < 60) requestAnimationFrame(tick); else res((f.slice(2).reduce((a, c) => a + c, 0) / (f.length - 2)).toFixed(1)); }; requestAnimationFrame(tick); }));
const set = (css) => p.evaluate((c) => { let s = document.getElementById("probe"); if (!s) { s = document.createElement("style"); s.id = "probe"; document.head.appendChild(s); } s.textContent = c; }, css);
for (const [k, css] of [["all on", ""], ["no tech layer", "#home .tech-bg, #home .tech-codes { display: none }"], ["no mask", "#home .tech-bg { mask-image: none; -webkit-mask-image: none }"], ["no drifting symbols", "#home .tech-sym { display: none }"], ["no node pulses", "#home .tech-node { display: none }"], ["no code", "#home .tech-codes { display: none }"], ["no caret", "#home .tech-caret { display: none }"]]) {
  await set(css);
  await p.waitForTimeout(300);
  console.log(k, await m(), "ms");
}
await b.close();
