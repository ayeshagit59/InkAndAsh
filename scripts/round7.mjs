// Round 7 (round 6 correction) checks + screenshots. Needs a server: BASE_URL=http://localhost:5173/ node scripts/round7.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const OUT = "screenshots/round7";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const notes = [], problems = [];
const wait = (p, ms) => p.waitForTimeout(ms);
const topOf = (p, s) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, s);
const to = (p, y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
const frames = (p) => p.evaluate(() => new Promise((res) => { const f = []; let last = performance.now(); const tick = (t) => { f.push(t - last); last = t; if (f.length < 90) requestAnimationFrame(tick); else res(f.slice(2)); }; requestAnimationFrame(tick); }));

for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width, height }, hasTouch: name === "mobile" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => problems.push(`[${name}] pageerror ${e.message}`));
  p.on("console", (m) => m.type() === "error" && problems.push(`[${name}] console ${m.text()}`));
  p.on("response", (r) => r.status() >= 400 && problems.push(`[${name}] ${r.status()} ${r.url()}`));
  await p.goto(BASE);
  await wait(p, 8000);

  // ---- hero ----
  const hero = await p.evaluate(() => ({
    polaroids: [...document.querySelectorAll("#home .polaroid figcaption")].map((f) => f.textContent),
    imgs: [...document.querySelectorAll("#home .polaroid img")].map((i) => i.currentSrc.split("/").pop()),
    tech: [!!document.querySelector("#home .tech-bg[aria-hidden=true]"), document.querySelectorAll("#home .tech-codes[aria-hidden=true]").length, getComputedStyle(document.querySelector("#home .tech-bg")).pointerEvents],
  }));
  notes.push(`[${name}] hero polaroids ${hero.polaroids.join(", ")} (${hero.imgs.join(", ")}); tech layer present ${hero.tech[0]}, code blocks ${hero.tech[1]}, pointer-events ${hero.tech[2]}`);
  if (hero.polaroids.join("|") !== "Northern Lights|Imaginary Party") problems.push(`[${name}] hero polaroids ${hero.polaroids}`);
  if (name === "desktop") {
    const f = await frames(p);
    const avg = f.reduce((a, c) => a + c, 0) / f.length;
    notes.push(`[desktop] hero with tech layer: avg ${avg.toFixed(1)}ms/frame, max ${Math.max(...f).toFixed(1)}ms, over 25ms ${f.filter((x) => x > 25).length}/${f.length}`);
    await to(p, (await topOf(p, "#about")) + 200);
    await wait(p, 800);
    const a = await p.evaluate(() => [document.querySelector("#home .tech-bg").classList.contains("is-paused"), getComputedStyle(document.querySelector("#home .tech-sym")).animationPlayState, [...document.querySelectorAll("#home .tech-code")].map((c) => c.textContent).join("|")]);
    await wait(p, 1500);
    const c = await p.evaluate(() => [...document.querySelectorAll("#home .tech-code")].map((c) => c.textContent).join("|"));
    notes.push(`[desktop] hero tech layer off screen: paused ${a[0]}, symbols ${a[1]}, code unchanged ${a[2] === c}`);
    if (!a[0] || a[1] !== "paused" || a[2] !== c) problems.push("[desktop] hero tech layer runs off screen");
  }

  // ---- About and the Work heading, unchanged ----
  await to(p, (await topOf(p, "#about")) + (name === "mobile" ? 60 : 80));
  await wait(p, 1500);
  await p.screenshot({ path: `${OUT}/${name}-01-about.png` });
  await to(p, (await topOf(p, "#work-title")) - 160);
  await wait(p, 2000);
  await p.screenshot({ path: `${OUT}/${name}-02-work.png` });
  const w = await p.evaluate(() => [document.getElementById("about").innerText.replace(/\s+/g, " ").trim().slice(0, 40), document.getElementById("work-title").textContent]);
  notes.push(`[${name}] about starts "${w[0]}…", work heading "${w[1]}"`);

  // ---- The gallery section ----
  await to(p, (await topOf(p, "#art")) + (name === "mobile" ? 40 : 60));
  await wait(p, 2500);
  const art = await p.evaluate(() => {
    const s = document.getElementById("art"), h = document.getElementById("art-title").getBoundingClientRect(), l = s.querySelector(".art-lede").getBoundingClientRect();
    return {
      lede: s.querySelector(".art-lede").textContent, gap: Math.round(l.top - h.bottom), left: Math.round(l.left - h.left),
      tiles: [...s.querySelectorAll(".tile")].map((a) => ({ t: a.querySelector(".tile-title").textContent, href: a.href, rel: a.rel, target: a.target, ratio: (a.offsetWidth / a.offsetHeight).toFixed(2), r: getComputedStyle(a).borderTopLeftRadius, top: Math.round(a.getBoundingClientRect().top) })),
      tech: s.querySelectorAll("[class*=tech]").length,
      strip: s.innerText.includes("Latest on Medium"),
      foot: Math.round(s.querySelector(".art-foot").getBoundingClientRect().top - s.querySelector(".tiles").getBoundingClientRect().bottom),
    };
  });
  notes.push(`[${name}] gallery lede (${art.gap}px under heading, left ${art.left}px): "${art.lede}"`);
  notes.push(`[${name}] gallery tiles: ${art.tiles.map((t) => `${t.t} [${t.ratio}, r ${t.r}, row y ${t.top}, ${t.href} ${t.target} ${t.rel}]`).join(" · ")}; tech elements in section: ${art.tech}; button ${art.foot}px below tiles`);
  if (art.tiles.map((t) => t.t).join("|") !== "Made of Sunlight, Dreaming in Moonlight|Sky Full of Stars|Tale of the Fairy Land|Materialistic Gifts or No?") problems.push(`[${name}] gallery tiles ${art.tiles.map((t) => t.t)}`);
  if (art.tech || art.strip) problems.push(`[${name}] gallery still has tech layer (${art.tech}) or strip (${art.strip})`);
  await p.screenshot({ path: `${OUT}/${name}-03-gallery-rest.png` });
  if (name === "desktop") {
    for (let k = 0; k < 4; k++) {
      await p.locator("#art .tile").nth(k).hover();
      await wait(p, 420);
      const st = await p.evaluate((k) => { const a = document.querySelectorAll("#art .tile")[k]; return [getComputedStyle(a.querySelector(".tile-wash")).opacity, getComputedStyle(a.querySelector(".tile-info")).opacity]; }, k);
      if (st.join() !== "1,1") problems.push(`[desktop] tile ${k + 1} hover ${st}`);
      await p.screenshot({ path: `${OUT}/${name}-04-gallery-hover-${k + 1}.png` });
    }
    await p.mouse.move(5, 5);
  } else {
    await p.locator("#art .tile").first().tap();
    await wait(p, 420);
    const on = await p.evaluate(() => [document.querySelectorAll("#art .tile--on").length, location.href]);
    notes.push(`[mobile] first tap: ${on[0]} tile showing its layer, still on ${on[1]}`);
    if (on[0] !== 1) problems.push("[mobile] first tap did not show the layer");
    await p.screenshot({ path: `${OUT}/${name}-04-gallery-tap.png` });
  }

  // ---- the transitions either side of it ----
  for (const [k, z] of [["work-to-art", "art"], ["art-to-music", "music-coffee"]]) {
    await to(p, (await topOf(p, `#${z}`)) - height / 2);
    await wait(p, 900);
    await p.screenshot({ path: `${OUT}/${name}-05-${k}.png` });
  }
  await ctx.close();
}

/* reduced motion: one still frame in the hero */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(BASE);
  await wait(p, 1200);
  const a = await p.evaluate(() => [[...document.querySelectorAll("#home .tech-code")].map((c) => c.textContent).join("|"), getComputedStyle(document.querySelector("#home .tech-sym")).animationName]);
  await wait(p, 1500);
  const c = await p.evaluate(() => [...document.querySelectorAll("#home .tech-code")].map((c) => c.textContent).join("|"));
  notes.push(`[reduced] hero code fully shown and still ${a[0] === c && a[0].length > 40}, symbol animation ${a[1]}`);
  if (a[0] !== c || a[1] !== "none") problems.push("[reduced] hero tech layer moves");
  await p.screenshot({ path: `${OUT}/reduced-hero.png` });
  await ctx.close();
}

await b.close();
console.log(notes.join("\n"));
console.log(problems.length ? "\nPROBLEMS:\n" + problems.join("\n") : "\nNo problems");
