// Screenshots for review: hero intro moments, every section, mid-melt transitions, an open story, the resume viewer.
// Needs the dev server:  npm run dev   then   CHROMIUM_PATH=... npm run shots
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const problems = [];

async function scrollToY(page, y) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(900);
}
const topOf = (page, id) => page.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + window.scrollY, id);

for (const [name, width, height] of [["desktop", 1440, 900], ["tablet", 768, 1024], ["mobile", 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("console", (m) => m.type() === "error" && problems.push(`[${name}] console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`[${name}] pageerror: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`[${name}] ${r.status()}: ${r.url()}`));
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  if (name !== "tablet") {
    for (const [label, ms] of [["intro-1", 900], ["intro-2", 1500], ["intro-3", 1600]]) {
      await page.waitForTimeout(ms);
      await page.screenshot({ path: `${OUT}/${name}-hero-${label}.png` });
    }
  }
  await page.waitForTimeout(name === "tablet" ? 7500 : 3600);
  await page.screenshot({ path: `${OUT}/${name}-hero-settled.png` });
  const cls = await page.evaluate(() => window.__cls);
  if (cls > 0.1) problems.push(`[${name}] CLS during load ${cls.toFixed(3)}`);

  for (const id of ["about", "work", "art", "music-coffee", "footer"]) {
    await scrollToY(page, (await topOf(page, id)) + (id === "footer" ? 0 : 60));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${name}-${id}.png` });
  }
  // mid-melt: the boundary in the middle of the viewport
  for (const [a, b] of [["home", "about"], ["about", "work"], ["art", "music-coffee"]]) {
    await scrollToY(page, (await topOf(page, b)) - height / 2);
    await page.screenshot({ path: `${OUT}/${name}-melt-${a}-${b}.png` });
  }
  // coffee + reels deeper in the section
  await scrollToY(page, (await page.evaluate(() => document.querySelector(".coffee").getBoundingClientRect().top + window.scrollY)) - 80);
  await page.screenshot({ path: `${OUT}/${name}-coffee.png` });

  if (name !== "tablet") {
    // story overlay
    await scrollToY(page, await topOf(page, "work"));
    await page.locator(".work-card").nth(3).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${name}-story.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    // resume viewer
    if (name === "mobile") {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.waitForTimeout(300);
      await page.locator(".nav-sheet .nav-resume").click();
    } else {
      await page.locator(".nav-links .nav-resume").click();
    }
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/${name}-resume.png` });
    await page.keyboard.press("Escape");
  }

  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
  broken.forEach((b) => problems.push(`[${name}] broken image: ${b}`));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) problems.push(`[${name}] horizontal overflow ${overflow}px`);
  await page.close();
}

const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await rm.goto(BASE, { waitUntil: "networkidle" });
await rm.waitForTimeout(500);
await rm.screenshot({ path: `${OUT}/desktop-reduced-motion.png` });
await browser.close();
console.log(problems.length ? problems.join("\n") : "No console errors, failed requests, broken images, overflow or CLS > 0.1.");
