// Round 9: the GitHub card under the Work caption, and the resume feature removed.
// Needs a server: BASE_URL=http://localhost:5173/ node scripts/round9.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const OUT = "screenshots/round9";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const notes = [], problems = [];
const wait = (p, ms) => p.waitForTimeout(ms);
const topOf = (p, s) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, s);
const to = (p, y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
const watch = (p, name) => {
  p.on("pageerror", (e) => problems.push(`[${name}] pageerror ${e.message}`));
  p.on("console", (m) => m.type() === "error" && problems.push(`[${name}] console ${m.text()}`));
  p.on("response", (r) => r.status() >= 400 && problems.push(`[${name}] ${r.status()} ${r.url()}`));
  p.on("request", (r) => /resume/i.test(r.url()) && problems.push(`[${name}] requested ${r.url()}`));
};

/* ---------- the nav at four widths ---------- */
for (const [width, height] of [[1440, 900], [1024, 800], [768, 1024], [390, 844]]) {
  const p = await b.newPage({ viewport: { width, height } });
  watch(p, `nav ${width}`);
  await p.goto(BASE);
  await wait(p, 1200);
  await to(p, 200);
  await wait(p, 600);
  const desktopNav = await p.locator(".nav-links").isVisible();
  if (!desktopNav) {
    await p.locator(".nav-burger").click();
    await wait(p, 500);
  }
  const nav = await p.evaluate((d) => {
    const root = document.querySelector(d ? ".nav-links" : ".nav-sheet");
    const items = [...root.querySelectorAll("ul a")].map((a) => a.textContent.trim());
    const rects = [...root.querySelectorAll("ul a, .nav-cta")].map((a) => a.getBoundingClientRect());
    const gaps = d ? rects.slice(1).map((r, i) => Math.round(r.left - rects[i].right)) : [];
    return { items, cta: root.querySelector(".nav-cta")?.textContent.trim(), gaps, resume: /resume/i.test(document.querySelector("header").innerText) };
  }, desktopNav);
  notes.push(`[${width}] ${desktopNav ? "nav" : "menu"}: ${nav.items.join(" · ")} + "${nav.cta}"${nav.gaps.length ? `, gaps ${nav.gaps.join("/")}px` : ""}`);
  if (nav.items.join("|") !== "Home|About|Work|Art|Music & Coffee" || nav.resume || nav.cta !== "Let's talk") problems.push(`[${width}] nav ${JSON.stringify(nav)}`);
  await p.screenshot({ path: `${OUT}/nav-${width}.png`, clip: desktopNav ? { x: 0, y: 0, width, height: 90 } : undefined });
  await p.close();
}

/* ---------- the GitHub card, and the sticky block's height ---------- */
for (const [label, width, height] of [["1440", 1440, 900], ["1440x800", 1440, 800], ["1366x768", 1366, 768], ["768", 768, 1024], ["390", 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width, height }, hasTouch: width < 700 });
  const p = await ctx.newPage();
  watch(p, label);
  await p.goto(BASE);
  await wait(p, 900);
  const puzzleTop = await topOf(p, ".puzzle");
  await to(p, width > 1024 ? puzzleTop - 60 : (await topOf(p, "#work-title")) - 110);
  await wait(p, 2600);
  const r = await p.evaluate(() => {
    const cap = document.querySelector(".work-caption").getBoundingClientRect();
    const head = document.getElementById("work-title").getBoundingClientRect();
    const card = document.querySelector(".gh-card"), c = card.getBoundingClientRect();
    const lede = document.querySelector(".work-lede").getBoundingClientRect();
    const strip = document.querySelector(".summary").getBoundingClientRect();
    const nav = document.querySelector(".nav-bar, header").getBoundingClientRect();
    return {
      href: card.href, target: card.target, rel: card.rel, name: card.getAttribute("aria-label"), text: card.innerText.replace(/\s+/g, " "),
      size: [Math.round(c.width), Math.round(c.height)], under: Math.round(c.top - lede.bottom), sameBlock: !!card.closest(".work-caption"),
      headTop: Math.round(head.top), cardBottom: Math.round(c.bottom), navBottom: Math.round(nav.bottom), vh: innerHeight,
      clearOfStrip: c.bottom <= strip.top, opacity: getComputedStyle(card.closest(".gh-wrap")).opacity,
      centredWithCaption: Math.abs((c.left + c.right) / 2 - (lede.left + lede.right) / 2) < 2,
    };
  });
  notes.push(`[${label}] github card ${r.size.join("x")}px, ${r.under}px under the caption, in the sticky block ${r.sameBlock}; heading top ${r.headTop}px (nav ends ${r.navBottom}), card bottom ${r.cardBottom}px of ${r.vh}; "${r.text}" -> ${r.href} ${r.target} ${r.rel}`);
  if (r.href !== "https://github.com/ayeshagit59" || r.target !== "_blank" || r.rel !== "noopener noreferrer" || !r.name) problems.push(`[${label}] card link ${JSON.stringify(r)}`);
  if (r.size[1] > 110 || r.size[0] < 250 || r.size[0] > 320) problems.push(`[${label}] card size ${r.size}`);
  if (!r.sameBlock || r.opacity !== "1" || !r.clearOfStrip) problems.push(`[${label}] card placement ${JSON.stringify(r)}`);
  if (width > 1024 && (r.headTop < r.navBottom || r.cardBottom > r.vh)) problems.push(`[${label}] sticky block does not fit: heading ${r.headTop} vs nav ${r.navBottom}, card bottom ${r.cardBottom} vs ${r.vh}`);
  await p.screenshot({ path: `${OUT}/work-${label}.png` });
  if (label === "1440" || label === "390" || label === "768") {
    if (width < 700) await p.locator(".gh-card").focus();
    else await p.locator(".gh-card").hover();
    await wait(p, 450);
    const h = await p.evaluate(() => { const c = document.querySelector(".gh-card"); return [getComputedStyle(c).transform, getComputedStyle(c).borderColor, getComputedStyle(c.querySelector(".gh-arrow")).transform]; });
    notes.push(`[${label}] card ${width < 700 ? "focused" : "hovered"}: transform ${h[0]}, border ${h[1]}, arrow ${h[2]}`);
    if (!/-3\)$/.test(h[0])) problems.push(`[${label}] card did not lift: ${h[0]}`);
    await p.screenshot({ path: `${OUT}/work-${label}-${width < 700 ? "focus" : "hover"}.png` });
  }
  // nothing anywhere on the page mentions a resume
  const txt = await p.evaluate(() => [document.body.innerText, [...document.querySelectorAll("[aria-label],[alt],[title],a[href]")].map((e) => [e.getAttribute("aria-label"), e.getAttribute("alt"), e.getAttribute("title"), e.getAttribute("href")].join(" ")).join(" ")].join(" "));
  if (/resume|\bCV\b/i.test(txt)) problems.push(`[${label}] page still mentions a resume`);
  if (label === "1440") {
    // scroll-spy still walks through every section
    const seen = [];
    for (const id of ["home", "about", "work", "art", "music-coffee"]) {
      await p.locator(`.nav-links a[href="#${id}"]`).click();
      await wait(p, 1200);
      seen.push(await p.evaluate(() => document.querySelector(".nav-links a[aria-current]")?.textContent));
    }
    notes.push(`[1440] scroll-spy after each nav click: ${seen.join(" · ")}`);
    if (seen.join("|") !== "Home|About|Work|Art|Music & Coffee") problems.push(`[1440] scroll-spy ${seen}`);
  }
  await ctx.close();
}

/* reduced motion: no lift */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(BASE);
  await to(p, (await topOf(p, ".puzzle")) - 60);
  await wait(p, 1200);
  await p.locator(".gh-card").hover();
  await wait(p, 400);
  const t = await p.evaluate(() => getComputedStyle(document.querySelector(".gh-card")).transform);
  notes.push(`[reduced] card transform on hover: ${t}`);
  if (t !== "none") problems.push(`[reduced] card moves: ${t}`);
  await ctx.close();
}

await b.close();
console.log(notes.join("\n"));
console.log(problems.length ? "\nPROBLEMS:\n" + problems.join("\n") : "\nNo problems");
