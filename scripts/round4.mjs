// Round 4 checks + screenshots at 1440 and 390. Needs a server (dev or preview).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const OUT = "screenshots/round4";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const notes = [], problems = [];
const wait = (p, ms) => p.waitForTimeout(ms);
const topOf = (p, s) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, s);
const to = (p, y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
const active = (p) => p.evaluate(() => document.querySelector(".nav-links a[aria-current], .nav-sheet a[aria-current]")?.textContent);

for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width, height }, hasTouch: name === "mobile" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => problems.push(`[${name}] pageerror ${e.message}`));
  p.on("console", (m) => m.type() === "error" && problems.push(`[${name}] console ${m.text()}`));
  p.on("response", (r) => r.status() >= 400 && problems.push(`[${name}] ${r.status()} ${r.url()}`));
  await p.goto(BASE);
  await wait(p, 1500);

  // ---- 1a nav scroll-spy, both directions ----
  const seq = [];
  const aboutTop = await topOf(p, "#about");
  for (const y of [0, 60, aboutTop - height * 0.6, aboutTop - height * 0.35, aboutTop + 100, aboutTop - height * 0.6, 30, 0]) {
    await to(p, Math.max(0, y));
    await wait(p, 250);
    seq.push(`${Math.round(y)}:${await active(p)}`);
  }
  notes.push(`[${name}] nav spy (scrollY:active): ${seq.join("  ")}`);
  if (!seq[0].endsWith("Home") || !seq[1].endsWith("Home") || !seq.at(-1).endsWith("Home")) problems.push(`[${name}] nav not Home at top`);
  await to(p, 0); await wait(p, 300);
  await p.screenshot({ path: `${OUT}/${name}-01-nav-top.png`, clip: { x: 0, y: 0, width, height: 120 } });
  await to(p, aboutTop - 120); await wait(p, 500);
  await p.screenshot({ path: `${OUT}/${name}-02-nav-below-hero.png` });

  // ---- 1b art filters ----
  await to(p, (await topOf(p, "#art")) + (name === "mobile" ? 150 : 120));
  await wait(p, 1500);
  const chips = await p.locator(".chip").all();
  for (const [k, c] of chips.entries()) {
    await c.click();
    await wait(p, 1100);
    const r = await p.evaluate(() => [...document.querySelectorAll(".tiles > li")].map((li) => Number(getComputedStyle(li).opacity).toFixed(2)));
    const label = (await c.textContent()).trim();
    notes.push(`[${name}] chip "${label}": ${r.length} tiles, opacity ${r.join(" ")}`);
    if (r.length < 3 || r.some((o) => o !== "1.00")) problems.push(`[${name}] chip "${label}" shows ${r.length} tiles / opacity ${r.join(" ")}`);
    await p.screenshot({ path: `${OUT}/${name}-03-art-chip-${k}.png` });
  }
  // fast switching
  for (let i = 0; i < 14; i++) { await chips[i % chips.length].click(); await wait(p, 60); }
  await chips[5].click();
  await wait(p, 1300);
  const fast = await p.evaluate(() => [...document.querySelectorAll(".tiles > li")].map((li) => Number(getComputedStyle(li).opacity).toFixed(2)).join(" "));
  notes.push(`[${name}] after fast switching (Landscapes): ${fast}`);
  if (fast.split(" ").some((o) => o !== "1.00")) problems.push(`[${name}] tiles stuck after fast switching`);
  await chips[0].click();

  // ---- 1c mouse trail ----
  if (name === "desktop") {
    for (let r = 0; r < 4; r++) for (let x = 100; x < 1300; x += 60) await p.mouse.move(x, 300 + 120 * Math.sin(x / 90 + r), { steps: 1 });
    await wait(p, 120);
    const during = await p.evaluate(() => { const c = document.querySelector(".brush-canvas"); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
    await wait(p, 450);
    const after = await p.evaluate(() => { const c = document.querySelector(".brush-canvas"); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
    notes.push(`[${name}] trail pixels: 120ms after moving ${during}, 450ms later ${after}`);
    if (after !== 0) problems.push(`[${name}] mouse trail left ${after} pixels`);
  }

  // ---- 2 the puzzle + pop-ups ----
  await to(p, (await topOf(p, ".puzzle")) - 120);
  await wait(p, 2200);
  await p.mouse.move(5, 5);
  await p.screenshot({ path: `${OUT}/${name}-04-puzzle-rest.png` });
  if (name === "desktop") {
    const bb = await p.locator(".jp-label--hsbc").boundingBox();
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await wait(p, 500);
    await p.screenshot({ path: `${OUT}/${name}-05-puzzle-hover.png` });
  }
  for (const [id, file] of [["booking-guard", "06-popup-booking-guard"], ["thoucentric", "07-popup-thoucentric"]]) {
    const bb = await p.locator(`.jp-label--${id}`).boundingBox();
    await p.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height * 0.45);
    await wait(p, 900);
    const info = await p.evaluate(() => {
      const d = document.querySelector(".sc");
      const btn = d?.querySelector(".sc-links a, .sc-links button");
      return { open: !!d, title: d?.querySelector(".sc-title")?.textContent, link: btn ? `${btn.tagName} ${btn.textContent.trim()} ${btn.getAttribute("href") ?? ""} ${btn.disabled ? "(disabled)" : ""} ${btn.getAttribute("rel") ?? ""}` : "none", focus: document.activeElement?.getAttribute("aria-label"), scrollLocked: document.documentElement.style.overflow === "hidden" };
    });
    notes.push(`[${name}] pop-up ${id}: ${JSON.stringify(info)}`);
    await p.screenshot({ path: `${OUT}/${name}-${file}.png` });
    await p.keyboard.press("Escape");
    await wait(p, 600);
    const back = await p.evaluate(() => document.activeElement?.className);
    notes.push(`[${name}] after Esc focus is on: ${back}`);
  }
  const badges = await p.evaluate(() => [...document.querySelectorAll(".jp-badge")].map((n) => n.textContent));
  notes.push(`[${name}] piece badges: ${badges.join(", ")}`);

  // ---- 4 music cards ----
  await to(p, (await topOf(p, ".covers")) - 100);
  await wait(p, 1300);
  await p.screenshot({ path: `${OUT}/${name}-08-music-cards.png` });
  const cardH = await p.evaluate(() => [...document.querySelectorAll(".cover a")].map((a) => Math.round(a.getBoundingClientRect().height)).join(" "));
  notes.push(`[${name}] card heights: ${cardH}`);

  // ---- 5 coffee ----
  await to(p, (await topOf(p, ".coffee-story")) - 140);
  await wait(p, 1200);
  await p.screenshot({ path: `${OUT}/${name}-09-coffee-story.png` });
  await to(p, (await topOf(p, ".tasting")) - 90);
  await wait(p, 1600);
  await p.screenshot({ path: `${OUT}/${name}-10-omakase.png` });
  const courses = await p.evaluate(() => [...document.querySelectorAll(".tasting-no")].map((n) => n.textContent).join(" "));
  notes.push(`[${name}] omakase order: ${courses}`);

  // ---- 1e about ----
  await to(p, (await topOf(p, "#about")) + 40);
  await wait(p, 900);
  await p.screenshot({ path: `${OUT}/${name}-11-about.png` });

  // ---- embeds / clip ----
  const misc = await p.evaluate(async () => {
    const a = new Audio(document.querySelector("audio")?.src || "./audio/cover-clip.mp4");
    return { iframes: document.querySelectorAll("iframe, object, embed").length };
  });
  notes.push(`[${name}] iframes/objects: ${misc.iframes}`);
  await ctx.close();
}

// ---- clip duration + a page turn's frame times ----
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE);
  await wait(p, 1500);
  await to(p, (await topOf(p, ".turntable")) - 200);
  await wait(p, 1200);
  notes.push(`[clip] shown duration ${await p.locator(".clip-time").textContent()}, credit "${await p.locator(".clip-credit").textContent()}"`);
  await p.locator(".tt-platter").click();
  await wait(p, 1200);
  notes.push(`[clip] playing: ${await p.evaluate(() => !!document.querySelector(".is-playing"))}`);
  await p.goto(BASE + "#/gallery");
  await wait(p, 1200);
  await p.keyboard.press("ArrowRight");
  await wait(p, 1800);
  const before = await p.locator(".bk-foot").textContent();
  const framesP = p.evaluate(() => new Promise((res) => {
    const ts = [];
    const tick = (t) => { ts.push(t); if (ts.length < 90) requestAnimationFrame(tick); else res(ts); };
    requestAnimationFrame(tick);
  }));
  await p.keyboard.press("ArrowRight"); // a real key press, so the turn is measured
  const frames = await framesP;
  const turning = await p.evaluate(() => document.querySelectorAll(".bk-leaf.is-turning").length);
  notes.push(`[turn] ${before} -> ${await p.locator(".bk-foot").textContent()} (leaves still turning when sampling ended: ${turning})`);
  const d = frames.slice(1).map((t, i) => t - frames[i]);
  const long = d.filter((x) => x > 25).length;
  notes.push(`[turn] ${d.length} frames during a page turn: avg ${(d.reduce((a, x) => a + x, 0) / d.length).toFixed(1)}ms, max ${Math.max(...d).toFixed(1)}ms, frames over 25ms: ${long}`);
  await p.close();
}
await b.close();
console.log(notes.join("\n"));
console.log(problems.length ? "\nPROBLEMS:\n" + problems.join("\n") : "\nNo problems.");
