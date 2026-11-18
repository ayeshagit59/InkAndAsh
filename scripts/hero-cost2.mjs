import { chromium } from "playwright";
const URL = process.argv[2] || "https://inkandash.vercel.app/";
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(URL);
await p.waitForTimeout(9000);
const measure = () => p.evaluate(() => new Promise((res) => { const f = []; let last = performance.now(); const tick = (t) => { f.push(t - last); last = t; if (f.length < 30) requestAnimationFrame(tick); else res((f.slice(2).reduce((a, c) => a + c, 0) / (f.length - 2)).toFixed(0)); }; requestAnimationFrame(tick); }));
console.log("all on:", await measure());
const groups = { clouds: ".cloud", stars: ".stars", grain: ".cosmos-grain", "spinning disc": "#home svg", polaroids: "#home .polaroid, #home [class*=pol]", "hero text": ".hero-name, .hl-2, .hero-tags, .hero h1" };
for (const [k, s] of Object.entries(groups)) {
  const n = await p.evaluate((s) => { const l = document.querySelectorAll(s); l.forEach((x) => (x.style.display = "none")); return l.length; }, s);
  console.log(`without ${k} (${n}):`, await measure());
  await p.evaluate((s) => document.querySelectorAll(s).forEach((x) => (x.style.display = "")), s);
}
const all = Object.values(groups).join(",");
await p.evaluate((s) => document.querySelectorAll(s).forEach((x) => (x.style.display = "none")), ".cloud,.stars,.cosmos-grain");
console.log("without clouds+stars+grain:", await measure());
console.log(await p.evaluate(() => [...document.querySelectorAll("#home > *, #home > * > *")].map((e) => `${e.tagName}.${typeof e.className === "string" ? e.className : ""}`).slice(0, 30).join("  ")));
await b.close();
