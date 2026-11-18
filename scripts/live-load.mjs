import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const reqs = [];
const t0 = Date.now();
p.on("requestfinished", async (r) => { const s = await r.sizes().catch(() => ({})); reqs.push([Date.now() - t0, r.url().replace("https://inkandash.vercel.app", ""), s.responseBodySize]); });
p.on("requestfailed", (r) => reqs.push([Date.now() - t0, "FAILED " + r.url(), 0]));
p.on("console", (m) => m.type() === "error" && console.log("console", m.text()));
await p.addInitScript(() => {
  window.__long = []; window.__frames = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: "longtask", buffered: true });
  let last = performance.now(); const tick = (t) => { window.__frames.push([Math.round(t), Math.round(t - last)]); last = t; if (t < 8000) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
});
await p.goto("https://inkandash.vercel.app/", { waitUntil: "commit" });
for (const ms of [500, 1500, 3000, 6000]) { await p.waitForTimeout(ms - (Date.now() - t0) > 0 ? ms - (Date.now() - t0) : 0); await p.screenshot({ path: `/private/tmp/claude-501/-Users-ayesha-sultana-my-site-prototyping-session/ef6482ea-0ff9-4c2d-8f09-8eb1a17d1717/scratchpad/live-${ms}.png` }); }
await p.waitForTimeout(2500);
const { long, frames } = await p.evaluate(() => ({ long: window.__long, frames: window.__frames.filter((f) => f[1] > 50) }));
console.log("long tasks (start,ms):", JSON.stringify(long));
console.log("frames >50ms (at,ms):", JSON.stringify(frames));
reqs.sort((a, b) => a[0] - b[0]);
let total = 0; for (const r of reqs) total += r[2] || 0;
console.log("requests:", reqs.length, "total KB", Math.round(total / 1024));
for (const r of reqs) if ((r[2] || 0) > 60000 || r[1].startsWith("FAILED")) console.log(r[0] + "ms", Math.round((r[2] || 0) / 1024) + "KB", r[1].slice(0, 90));
await b.close();
