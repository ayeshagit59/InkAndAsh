import { chromium } from "playwright";
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url);
await p.waitForTimeout(5000);
// freeze the drift at its start so before/after compare the same pose
await p.evaluate(() => document.getAnimations().forEach((a) => { try { a.pause(); a.currentTime = 0; } catch {} }));
await p.waitForTimeout(300);
await p.screenshot({ path: out });
await b.close();
