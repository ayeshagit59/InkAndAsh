// Round 6 checks + screenshots. Needs a server: BASE_URL=http://localhost:5173/ node scripts/round6.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const OUT = "screenshots/round6";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, ignoreDefaultArgs: ["--hide-scrollbars"] });
const notes = [], problems = [];
const wait = (p, ms) => p.waitForTimeout(ms);
const topOf = (p, s) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, s);
const to = (p, y) => p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
const watch = (p, name) => {
  p.on("pageerror", (e) => problems.push(`[${name}] pageerror ${e.message}`));
  p.on("console", (m) => m.type() === "error" && problems.push(`[${name}] console ${m.text()}`));
  p.on("response", (r) => r.status() >= 400 && problems.push(`[${name}] ${r.status()} ${r.url()}`));
};

/* ---------- the Work heading fits on one or two lines ---------- */
for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
  const p = await b.newPage({ viewport: { width, height } });
  watch(p, `heading ${width}`);
  await p.goto(BASE);
  await wait(p, 600);
  await to(p, (await topOf(p, "#work-title")) - 160);
  await wait(p, 1800);
  const r = await p.evaluate(() => {
    const h = document.getElementById("work-title");
    const range = document.createRange();
    range.selectNodeContents(h);
    // group the text boxes by line (the script word sits in a taller box, so allow for that)
    const tops = [...range.getClientRects()].map((x) => (x.top + x.bottom) / 2).sort((a, c) => a - c);
    const lines = tops.filter((t, i) => i === 0 || t - tops[i - 1] > parseFloat(getComputedStyle(h).fontSize) * 0.6).length;
    return { text: h.textContent, lines, label: document.getElementById("work").getAttribute("aria-labelledby") };
  });
  notes.push(`[${width}] work heading "${r.text}" on ${r.lines} line(s)`);
  if (r.lines > 2) problems.push(`[${width}] work heading on ${r.lines} lines`);
  await p.screenshot({ path: `${OUT}/heading-${width}.png` });
  await p.close();
}

for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width, height }, hasTouch: name === "mobile" });
  const p = await ctx.newPage();
  watch(p, name);
  await p.goto(BASE);
  await wait(p, 1200);

  // ---- About ----
  await to(p, (await topOf(p, "#about")) + (name === "mobile" ? 60 : 80));
  await wait(p, 1800);
  const about = await p.evaluate(() => {
    const s = document.getElementById("about");
    return { label: s.getAttribute("aria-label"), text: s.innerText.replace(/\s+/g, " ").trim(), paras: [...s.querySelectorAll(".about-p")].length, h: s.querySelectorAll("h2").length };
  });
  notes.push(`[${name}] about (aria-label ${about.label}, ${about.paras} body paragraphs): ${about.text}`);
  if (about.label !== "About" || about.text.includes(";") || /\bAbout\b/.test(about.text) || !about.text.startsWith("Hi,") || about.paras !== 2) problems.push(`[${name}] about: ${JSON.stringify(about)}`);
  await p.screenshot({ path: `${OUT}/${name}-01-about.png` });
  // nav "About" still scrolls there and highlights
  if (name === "desktop") {
    await to(p, 0);
    await wait(p, 300);
    await p.locator('.nav-links a[href="#about"]').click();
    await wait(p, 1200);
    const cur = await p.evaluate(() => [document.querySelector(".nav-links a[aria-current]")?.textContent, Math.round(document.getElementById("about").getBoundingClientRect().top)]);
    notes.push(`[desktop] nav About -> active "${cur[0]}", section top at ${cur[1]}px`);
    if (cur[0] !== "About") problems.push(`[desktop] nav About not active after click: ${cur[0]}`);
  }

  // ---- Art section ----
  await to(p, (await topOf(p, "#art")) + (name === "mobile" ? 40 : 60));
  await wait(p, 2600);
  const art = await p.evaluate(() => {
    const s = document.getElementById("art");
    const h = document.getElementById("art-title").getBoundingClientRect(), l = s.querySelector(".art-lede").getBoundingClientRect();
    return {
      lede: s.querySelector(".art-lede").textContent, ledeGap: Math.round(l.top - h.bottom), ledeLeft: Math.round(l.left - h.left),
      tiles: [...s.querySelectorAll(".tile")].map((a) => ({ title: a.querySelector(".tile-title").textContent, href: a.href, rel: a.rel, w: Math.round(a.getBoundingClientRect().width), share: (a.getBoundingClientRect().width / s.getBoundingClientRect().width * 100).toFixed(0) + "%", ratio: (a.offsetWidth / a.offsetHeight).toFixed(2) })),
      strip: !!s.querySelector(".medium-links") || s.innerText.includes("Latest on Medium"),
      tech: !!s.querySelector(".tech-bg[aria-hidden=true]") && getComputedStyle(s.querySelector(".tech-bg")).pointerEvents,
    };
  });
  notes.push(`[${name}] art lede "${art.lede}" (${art.ledeGap}px under the heading, left offset ${art.ledeLeft}px); tiles ${art.tiles.map((t) => `${t.title} ${t.w}px=${t.share} r${t.ratio} ${t.href} ${t.rel}`).join(" | ")}; tech layer pointer-events ${art.tech}`);
  if (art.strip) problems.push(`[${name}] "Latest on Medium" strip still there`);
  if (art.tiles.map((t) => t.title).join("|") !== "The Northern lights, again !|The Imaginary Party") problems.push(`[${name}] art tiles: ${art.tiles.map((t) => t.title)}`);
  if (art.tech !== "none") problems.push(`[${name}] tech layer pointer-events ${art.tech}`);
  await p.screenshot({ path: `${OUT}/${name}-02-art-rest.png` });
  if (name === "desktop") {
    for (const k of [0, 1]) {
      await p.locator("#art .tile").nth(k).hover();
      await wait(p, 450);
      await p.screenshot({ path: `${OUT}/${name}-03-art-hover-${k + 1}.png` });
    }
    await p.mouse.move(5, 5);
    // tech layer: frame rate on screen, and paused off screen
    const fps = await p.evaluate(() => new Promise((res) => { const f = []; let last = performance.now(); const tick = (t) => { f.push(t - last); last = t; if (f.length < 90) requestAnimationFrame(tick); else res(f.slice(2)); }; requestAnimationFrame(tick); }));
    const avg = fps.reduce((a, c) => a + c, 0) / fps.length;
    notes.push(`[desktop] art section on screen: avg ${avg.toFixed(1)}ms/frame, max ${Math.max(...fps).toFixed(1)}ms, frames over 25ms ${fps.filter((x) => x > 25).length}/${fps.length}`);
    await to(p, 0);
    await wait(p, 800);
    const off1 = await p.evaluate(() => [document.querySelector(".tech-bg").classList.contains("is-paused"), [...document.querySelectorAll(".tech-code")].map((c) => c.textContent).join("|"), getComputedStyle(document.querySelector(".tech-sym")).animationPlayState]);
    await wait(p, 1500);
    const off2 = await p.evaluate(() => [...document.querySelectorAll(".tech-code")].map((c) => c.textContent).join("|"));
    notes.push(`[desktop] tech layer off screen: paused class ${off1[0]}, symbols ${off1[2]}, code text unchanged over 1.5s: ${off1[1] === off2}`);
    if (!off1[0] || off1[2] !== "paused" || off1[1] !== off2) problems.push(`[desktop] tech layer keeps running off screen`);
  } else {
    await p.locator("#art .tile").first().tap();
    await wait(p, 450);
    const on = await p.evaluate(() => [document.querySelectorAll("#art .tile--on").length, location.hash]);
    if (on[0] !== 1) problems.push(`[mobile] first tap did not show the layer`);
    await p.screenshot({ path: `${OUT}/${name}-03-art-tap.png` });
  }

  // ---- resume viewer ----
  await to(p, 0);
  await wait(p, 400);
  if (name === "mobile") { await p.locator(".nav-burger").click(); await wait(p, 400); }
  await p.locator(name === "mobile" ? ".nav-sheet .nav-resume" : ".nav-links .nav-resume").click();
  await wait(p, 1500);
  const rv = await p.evaluate(() => {
    const img = document.querySelector(".resume-page"), sc = document.querySelector(".resume-scroll"), box = document.querySelector(".resume").getBoundingClientRect();
    const links = [...document.querySelectorAll(".resume-actions a")].map((a) => `${a.textContent.trim()}: ${a.getAttribute("href")}${a.hasAttribute("download") ? " download=" + a.getAttribute("download") : ""}`);
    return { src: img.currentSrc.split("/").pop(), natural: img.naturalWidth, shown: Math.round(img.getBoundingClientRect().width), fits: box.width <= innerWidth && box.height <= innerHeight, scrolls: sc.scrollHeight > sc.clientHeight, overflowX: sc.scrollWidth > sc.clientWidth + 1, links };
  });
  notes.push(`[${name}] resume viewer: ${JSON.stringify(rv)}`);
  if (!/fa20c5fe/.test(rv.src) || !rv.natural || !rv.fits || (name === "desktop" && !rv.scrolls) || rv.overflowX) problems.push(`[${name}] resume viewer ${JSON.stringify(rv)}`);
  await p.screenshot({ path: `${OUT}/${name}-04-resume.png` });
  await p.locator(".resume-scroll").evaluate((s) => (s.scrollTop = s.scrollHeight / 2));
  await wait(p, 300);
  await p.screenshot({ path: `${OUT}/${name}-05-resume-scrolled.png` });
  if (name === "mobile") {
    await p.locator(".resume-zoom").click();
    await wait(p, 600);
    const z = await p.evaluate(() => { const sc = document.querySelector(".resume-scroll"); sc.scrollTop = 400; return [sc.scrollHeight > sc.clientHeight, sc.scrollTop, sc.scrollWidth > sc.clientWidth]; });
    notes.push(`[mobile] resume zoomed in: scrolls down ${z[0]} (scrollTop ${z[1]}), scrolls sideways ${z[2]}`);
    if (!z[0]) problems.push("[mobile] zoomed resume does not scroll");
    await p.screenshot({ path: `${OUT}/${name}-06-resume-zoomed.png` });
  }
  const pdf = await p.evaluate(async () => { const r = await fetch("resume.pdf", { cache: "no-store" }); return [r.status, (await r.arrayBuffer()).byteLength]; });
  notes.push(`[${name}] resume.pdf fetch: ${pdf}`);
  if (pdf[0] !== 200 || pdf[1] !== 112105) problems.push(`[${name}] resume.pdf ${pdf}`);
  await p.keyboard.press("Escape");

  // ---- the book ----
  await p.goto(BASE + "#/gallery");
  await wait(p, 1300);
  await p.screenshot({ path: `${OUT}/${name}-10-book-cover.png` });
  const seen = [];
  for (let i = 1; i < 30; i++) {
    await p.keyboard.press("ArrowRight");
    await wait(p, 1300);
    const r = await p.evaluate(() => {
      const leaves = [...document.querySelectorAll(".bk-leaf")];
      const turned = leaves.filter((l) => l.classList.contains("is-turned")).length;
      const out = [];
      const grab = (face, side) => face && face.querySelectorAll("img").forEach((im) => out.push({ side, src: im.getAttribute("src"), ok: im.complete && im.naturalWidth > 0 }));
      const single = document.querySelector(".bk--single");
      if (!single) grab(leaves[turned - 1]?.querySelector(".bk-face--back"), "left");
      grab(leaves[turned]?.querySelector(".bk-face--front"), single ? "page" : "right");
      const favs = [...document.querySelectorAll(".bk-leaf:not([inert]) .bk-fav")].map((f) => f.innerText.replace(/\s+/g, " ").trim());
      return { turned, out, foot: document.querySelector(".bk-foot")?.textContent, live: document.querySelector(".bk-stage [aria-live], [aria-live]")?.textContent, tab: document.querySelector(".bk-tab.is-on")?.textContent, favs };
    });
    for (const o of r.out) seen.push({ spread: r.turned, ...o, slug: o.src.split("/").pop().replace(/-\d+\.webp$/, "").replace("03b-", "03-") });
    if (i <= (name === "mobile" ? 8 : 4) || i === (name === "mobile" ? 9 : 5)) {
      notes.push(`[${name}] ${r.foot} | tab ${r.tab} | ${r.favs.join(" // ") || "(collage)"}`);
      await p.screenshot({ path: `${OUT}/${name}-1${i < 10 ? i : "x" + i}-book-${r.turned}.png` });
    }
    if (await p.locator(".bk-arrow").nth(1).isDisabled()) { await p.screenshot({ path: `${OUT}/${name}-19-book-back.png` }); notes.push(`[${name}] last: ${r.foot}`); break; }
  }
  // the index tabs land on the right spreads
  await p.locator(".bk-tab").nth(1).click();
  await wait(p, 2600);
  const t2 = await p.evaluate(() => document.querySelector(".bk-foot")?.textContent);
  await p.locator(".bk-tab").nth(0).click();
  await wait(p, 2600);
  const t1 = await p.evaluate(() => document.querySelector(".bk-foot")?.textContent);
  notes.push(`[${name}] tabs: Favourites -> "${t1}", More from the studio -> "${t2}"`);
  const bySlug = {};
  for (const s of seen) (bySlug[s.slug] ??= []).push(s);
  const rows = Object.entries(bySlug).sort().map(([k, l]) => `| ${k} | ${l.map((s) => `${name === "mobile" ? "page" : "spread"} ${s.spread}${name === "mobile" ? "" : ", " + s.side}`).join("; ")} |`);
  writeFileSync(`${OUT}/book-images-${name}.md`, `| Painting | Where |\n|---|---|\n${rows.join("\n")}\n`);
  const dup = Object.entries(bySlug).filter(([, l]) => l.length !== 1).map(([k]) => k), broken = seen.filter((s) => !s.ok).map((s) => s.slug);
  notes.push(`[${name}] book: ${Object.keys(bySlug).length}/19 paintings, duplicates ${dup.join(",") || "none"}, broken ${broken.join(",") || "none"}`);
  if (Object.keys(bySlug).length !== 19 || dup.length || broken.length) problems.push(`[${name}] book images ${Object.keys(bySlug).length} dup ${dup} broken ${broken}`);
  await ctx.close();
}

/* ---------- reduced motion: tech layer is a still frame ---------- */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  watch(p, "reduced");
  await p.goto(BASE);
  await to(p, (await topOf(p, "#art")) + 60);
  await wait(p, 1500);
  const a = await p.evaluate(() => [[...document.querySelectorAll(".tech-code")].map((c) => c.textContent).join("|"), getComputedStyle(document.querySelector(".tech-sym")).animationName]);
  await wait(p, 1500);
  const c = await p.evaluate(() => [...document.querySelectorAll(".tech-code")].map((c) => c.textContent).join("|"));
  notes.push(`[reduced] code fully shown and still: ${a[0] === c && a[0].length > 40}, symbol animation ${a[1]}`);
  if (a[0] !== c || a[1] !== "none") problems.push(`[reduced] tech layer moves`);
  await p.screenshot({ path: `${OUT}/reduced-art.png` });
  await ctx.close();
}

await b.close();
console.log(notes.join("\n"));
console.log(problems.length ? "\nPROBLEMS:\n" + problems.join("\n") : "\nNo problems");
