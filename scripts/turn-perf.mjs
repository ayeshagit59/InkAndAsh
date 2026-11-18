// Page-turn smoothness: records a Chromium performance trace across three page turns and reports long frames.
import { chromium } from "playwright";
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto((process.env.BASE_URL || "http://localhost:5173/") + "#/gallery");
await p.waitForTimeout(1200);
await p.keyboard.press("ArrowRight");
await p.waitForTimeout(1800);
const cdp = await p.context().newCDPSession(p);
const events = [];
cdp.on("Tracing.dataCollected", (e) => events.push(...e.value));
const done = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
await cdp.send("Tracing.start", { categories: "devtools.timeline,disabled-by-default-devtools.timeline.frame" });
const rafP = p.evaluate(() => new Promise((res) => { const ts = []; const t0 = performance.now(); const tick = (t) => { ts.push(t); if (t - t0 < 3600) requestAnimationFrame(tick); else res(ts); }; requestAnimationFrame(tick); }));
for (let i = 0; i < 3; i++) { await p.keyboard.press("ArrowRight"); await p.waitForTimeout(1200); }
const ts = await rafP;
await cdp.send("Tracing.end");
await done;
const d = ts.slice(1).map((t, i) => t - ts[i]);
const tasks = events.filter((e) => e.name === "RunTask" && e.dur > 50000).length;
console.log(`rAF over 3 turns: ${d.length} frames, avg ${(d.reduce((a, x) => a + x, 0) / d.length).toFixed(1)}ms, max ${Math.max(...d).toFixed(1)}ms, >25ms: ${d.filter((x) => x > 25).length}; main-thread tasks over 50ms in the trace: ${tasks}`);
console.log("now at:", await p.locator(".bk-foot").textContent());
await b.close();
