// Quick look at one section at a few widths: node scripts/round5-peek.mjs <selector> [offset]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const [sel = "#work", off = "0", widths = "1440,390"] = process.argv.slice(2);
mkdirSync("screenshots/round5/peek", { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
for (const w of widths.split(",").map(Number)) {
  const p = await b.newPage({ viewport: { width: w, height: w < 700 ? 844 : 900 } });
  p.on("pageerror", (e) => console.log("pageerror", e.message));
  await p.goto(BASE);
  await p.waitForTimeout(800);
  const y = await p.evaluate(([s, o]) => document.querySelector(s).getBoundingClientRect().top + scrollY + Number(o), [sel, off]);
  await p.evaluate((y) => scrollTo(0, y), y);
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `screenshots/round5/peek/${sel.replace(/\W/g, "")}-${off}-${w}.png` });
  await p.close();
}
await b.close();
