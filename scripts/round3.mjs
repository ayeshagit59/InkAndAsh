// Round 3 checks + screenshots at 1440 and 390.
// Needs a server: npm run dev (or vite preview) then  CHROMIUM_PATH=... node scripts/round3.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:5173/";
const OUT = "screenshots/round3";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const problems = [];
const notes = [];
const wait = (p, ms) => p.waitForTimeout(ms);
const topOf = (page, sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);
const scrollTo = (page, y) => page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);

for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: name === "mobile" });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && problems.push(`[${name}] console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`[${name}] pageerror: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`[${name}] ${r.status()}: ${r.url()}`));
  page.on("requestfailed", (r) => !r.url().startsWith("mailto:") && problems.push(`[${name}] failed: ${r.url()} ${r.failure()?.errorText}`));

  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  // ---- hero ----
  await wait(page, 1500);
  await page.screenshot({ path: `${OUT}/${name}-01-hero-mid-intro.png` });
  await wait(page, 5200);
  await page.screenshot({ path: `${OUT}/${name}-02-hero-settled.png` });
  const pol = await page.evaluate(() => [...document.querySelectorAll(".polaroid")].filter((f) => f.offsetParent).map((f) => getComputedStyle(f).backgroundColor));
  notes.push(`[${name}] polaroid backgrounds settled: ${[...new Set(pol)].join(", ")}`);
  const autoplay = await page.evaluate(() => [...document.querySelectorAll("audio,video")].some((m) => !m.paused));
  if (autoplay) problems.push(`[${name}] media playing on load`);

  // ---- each section: its drink + the brush ----
  const sections = ["about", "work", "art", "music-coffee", "footer"];
  for (const [k, id] of sections.entries()) {
    await scrollTo(page, (await topOf(page, `#${id}`)) + (id === "footer" ? 0 : 140));
    await wait(page, 900);
    await page.screenshot({ path: `${OUT}/${name}-0${3 + k}-${id}.png` });
    if (name === "desktop") {
      const o = await page.evaluate(() => [...document.querySelectorAll(".drink")].map((d) => Number(getComputedStyle(d).opacity).toFixed(2)).join(" "));
      const tool = await page.evaluate(() => [...document.querySelectorAll(".tool")].map((d) => `${d.dataset.tool}:${Number(getComputedStyle(d).opacity).toFixed(2)}`).join(" "));
      notes.push(`[${name}] ${id}: drinks ${o} | tools ${tool}`);
    }
  }
  // text overlap: travellers vs. any text block in view
  if (name === "desktop") {
    for (const id of ["about", "work", "art", "music-coffee"]) {
      await scrollTo(page, (await topOf(page, `#${id}`)) + 300);
      await wait(page, 500);
      const hit = await page.evaluate(() => {
        const boxes = [".travel-cup", ".travel-brush"].map((s) => document.querySelector(s).getBoundingClientRect());
        const texts = [...document.querySelectorAll("main p, main h2, main h3, main h4, main li, main a, main button")].filter((n) => n.offsetParent);
        return texts
          .filter((t) => {
            const r = t.getBoundingClientRect();
            return boxes.some((b) => r.right > b.left + 4 && r.left < b.right - 4 && r.bottom > b.top + 4 && r.top < b.bottom - 4 && r.width < 1200);
          })
          .map((t) => t.className || t.tagName)
          .slice(0, 4);
      });
      if (hit.length) problems.push(`[${name}] traveller overlaps text in ${id}: ${hit.join(", ")}`);
    }
  }

  // ---- art tiles: sharpness + fast pointer sweep ----
  await scrollTo(page, (await topOf(page, "#art")) + 200);
  await wait(page, 1500);
  const srcs = await page.evaluate(() =>
    [...document.querySelectorAll(".tile-img")].map((i) => {
      const r = i.getBoundingClientRect();
      const w = Math.max(r.width, r.height * (i.naturalWidth / i.naturalHeight));
      return `${i.currentSrc.split("/").pop()} drawn@${Math.round(w)}css natural ${i.naturalWidth} bg:${i.style.backgroundImage ? "lqip" : "none"}`;
    }),
  );
  notes.push(`[${name}] tiles: ${srcs.join(" | ")}`);
  if (name === "desktop") {
    const tiles = await page.locator(".tile").all();
    const boxes = await Promise.all(tiles.map((t) => t.boundingBox()));
    const y = boxes[0].y + boxes[0].height * 0.55;
    // fast sweep across all four, three times
    for (let r = 0; r < 3; r++) {
      for (const b of boxes) await page.mouse.move(b.x + b.width / 2, y, { steps: 2 });
      for (const b of [...boxes].reverse()) await page.mouse.move(b.x + b.width / 2, y, { steps: 2 });
    }
    await page.mouse.move(boxes[2].x + boxes[2].width / 2, y, { steps: 3 });
    await wait(page, 260);
    await page.screenshot({ path: `${OUT}/${name}-08-tiles-fast-sweep-260ms.png` });
    const mid = await page.evaluate(() => [...document.querySelectorAll(".tile-drop")].map((d) => new DOMMatrix(getComputedStyle(d).transform).a.toFixed(2)).join(" "));
    await wait(page, 700);
    const end = await page.evaluate(() => [...document.querySelectorAll(".tile-drop")].map((d) => new DOMMatrix(getComputedStyle(d).transform).a.toFixed(2)).join(" "));
    await page.screenshot({ path: `${OUT}/${name}-09-tiles-after-sweep.png` });
    notes.push(`[${name}] drop scales after sweep, resting on tile 3: +260ms ${mid}  +960ms ${end}`);
    if (end !== "0.00 0.00 1.00 0.00") problems.push(`[${name}] tile drops not settled: ${end}`);
    await page.mouse.move(5, 5);
    await wait(page, 300);
    const out = await page.evaluate(() => [...document.querySelectorAll(".tile-drop")].map((d) => new DOMMatrix(getComputedStyle(d).transform).a.toFixed(2)).join(" "));
    if (out !== "0.00 0.00 0.00 0.00") problems.push(`[${name}] tiles stuck after leaving: ${out}`);
  }

  // ---- music carousel, both ends ----
  await scrollTo(page, (await topOf(page, ".covers")) - 120);
  await wait(page, 1200);
  await page.screenshot({ path: `${OUT}/${name}-10-covers-start.png` });
  const counter1 = await page.locator(".covers-count").textContent().catch(() => "(none)");
  for (let i = 0; i < 6; i++) {
    const next = page.getByRole("button", { name: "Next songs" });
    if (!(await next.isVisible()) || (await next.isDisabled())) break;
    await next.click();
    await wait(page, 700);
  }
  await page.screenshot({ path: `${OUT}/${name}-11-covers-end.png` });
  const counter2 = await page.locator(".covers-count").textContent().catch(() => "(none)");
  const lastVisible = await page.evaluate(() => {
    const row = document.querySelector(".covers-row").getBoundingClientRect();
    const last = document.querySelector(".cover:last-child").getBoundingClientRect();
    return last.right <= row.right + 1 && last.left >= row.left - 1;
  });
  notes.push(`[${name}] covers counter: "${counter1}" -> "${counter2}", last card fully visible at end: ${lastVisible}`);
  if (!lastVisible) problems.push(`[${name}] fifth cover not fully reachable`);
  const links = await page.evaluate(() => [...document.querySelectorAll(".cover a")].map((a) => `${a.getAttribute("aria-label")} -> ${a.href} [${a.target} ${a.rel}]`));
  notes.push(...links.map((l) => `[${name}] ${l}`));

  // ---- Let's talk ----
  const talk = name === "mobile" ? page.locator(".nav-sheet .nav-cta") : page.locator(".nav-links .nav-cta");
  if (name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await wait(page, 300);
  }
  notes.push(`[${name}] Let's talk href: ${await talk.getAttribute("href")}`);
  await talk.click();
  await wait(page, 1100);
  const popOpen = await page.locator(".talk-pop").isVisible().catch(() => false);
  if (popOpen) {
    await page.locator(".talk-copy:visible").click();
    await wait(page, 300);
    notes.push(`[${name}] popover opened (mailto had no handler here); copy status: "${await page.locator(".talk-status:visible").textContent()}"`);
  } else notes.push(`[${name}] popover did not open`);
  await page.screenshot({ path: `${OUT}/${name}-13-lets-talk.png` });
  await page.keyboard.press("Escape");

  // ---- no third-party embeds anywhere ----
  const embeds = await page.evaluate(() => ({ iframes: document.querySelectorAll("iframe").length, objects: document.querySelectorAll("object,embed").length, insta: document.documentElement.innerHTML.includes("/embed") }));
  notes.push(`[${name}] embeds on home: ${JSON.stringify(embeds)}`);

  // ---- gallery ----
  await page.goto(BASE + "#/gallery", { waitUntil: "domcontentloaded" });
  await wait(page, 1500);
  const rooms = await page.locator("[data-room]").count();
  for (const [k, i] of [0, 7, 15].entries()) {
    await scrollTo(page, await topOf(page, `[data-room="${i}"]`));
    await wait(page, 1700);
    await page.screenshot({ path: `${OUT}/${name}-1${4 + k}-gallery-room-${i}.png` });
  }
  // mid cross-fade: halfway between two rooms
  await scrollTo(page, (await topOf(page, `[data-room="9"]`)) - height / 2 + 4);
  await wait(page, 500);
  await page.screenshot({ path: `${OUT}/${name}-17-gallery-mid-crossfade.png` });
  const g = await page.evaluate(() => ({
    counter: document.querySelector(".gallery-counter").textContent,
    on: [...document.querySelectorAll(".gallery-bg-layer")].map((l) => Number(getComputedStyle(l).opacity).toFixed(2)).filter((o) => o !== "0.00"),
    broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
  }));
  notes.push(`[${name}] gallery: ${rooms} rooms, ${JSON.stringify(g)}`);
  // Back button returns home at Art
  await page.goBack();
  await wait(page, 1200);
  const back = await page.evaluate(() => ({ hash: location.hash, artTop: Math.round(document.getElementById("art")?.getBoundingClientRect().top ?? -1) }));
  notes.push(`[${name}] back from gallery: ${JSON.stringify(back)}`);
  await page.screenshot({ path: `${OUT}/${name}-18-back-to-art.png` });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) problems.push(`[${name}] horizontal overflow ${overflow}px`);
  await ctx.close();
}

// ---- clip: plays only on click; pill shows the tiny CD ----
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await wait(page, 7000);
  await scrollTo(page, (await topOf(page, ".turntable")) - 200);
  await wait(page, 800);
  const dur = await page.locator(".clip-time").textContent();
  await page.locator(".tt-platter").click();
  await wait(page, 1500);
  await page.screenshot({ path: `${OUT}/desktop-19-clip-playing.png` });
  notes.push(`[clip] label "${await page.locator(".tt-platter").getAttribute("aria-label")}", time shown before play "${dur}", credit "${await page.locator(".clip-credit").textContent()}", pill: ${await page.locator(".mini").isVisible()}`);
  await page.close();
}

await browser.close();
console.log(notes.join("\n"));
console.log(problems.length ? `\nPROBLEMS:\n${problems.join("\n")}` : "\nNo problems.");
