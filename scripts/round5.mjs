// Round 5 checks + screenshots. Needs a server (dev or preview): BASE_URL=http://localhost:5173/ node scripts/round5.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const OUT = "screenshots/round5";
mkdirSync(OUT, { recursive: true });
// show real scrollbars (headless hides them by default) so the scrollbar checks mean something
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

/* ---------- 1. puzzle text stays inside its piece, at four widths ---------- */
for (const [width, height] of [[1440, 900], [1024, 800], [768, 1024], [390, 844]]) {
  const p = await b.newPage({ viewport: { width, height } });
  watch(p, `fit ${width}`);
  await p.goto(BASE);
  await wait(p, 600);
  await to(p, (await topOf(p, ".puzzle")) - 90);
  await wait(p, 2400);
  const r = await p.evaluate(() =>
    [...document.querySelectorAll(".jp")].map((btn) => {
      const label = btn.querySelector(".jp-label"), safe = btn.querySelector(".jp-safe"), path = btn.querySelector(".jp-shape"), svg = btn.querySelector("svg");
      const L = label.getBoundingClientRect(), S = safe.getBoundingClientRect(), V = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const inShape = (x, y) => path.isPointInFill(new DOMPoint(((x - V.left) * vb.width) / V.width, ((y - V.top) * vb.height) / V.height));
      const els = [...safe.querySelectorAll(".jp-tag, .jp-hook, .jp-badge, .jp-cue")].filter((e) => getComputedStyle(e).display !== "none");
      const bad = [];
      for (const e of els) {
        // the cue rests 4px low and fades in on hover; check where it will be when visible
        const R = e.getBoundingClientRect(), dy = e.classList.contains("jp-cue") ? -4 : 0;
        const box = { l: R.left, t: R.top + dy, r: R.right, b: R.bottom + dy };
        if (box.l < S.left - 0.5 || box.r > S.right + 0.5 || box.t < S.top - 0.5 || box.b > S.bottom + 0.5) bad.push(`${e.className} outside safe box`);
        if (box.l < L.left || box.r > L.right || box.t < L.top || box.b > L.bottom) bad.push(`${e.className} outside piece box`);
        const pts = [[box.l, box.t], [box.r, box.t], [box.l, box.b], [box.r, box.b], [(box.l + box.r) / 2, box.t], [(box.l + box.r) / 2, box.b], [box.l, (box.t + box.b) / 2], [box.r, (box.t + box.b) / 2]];
        if (pts.some(([x, y]) => !inShape(x, y))) bad.push(`${e.className} touches the outline`);
      }
      return { id: safe.dataset.id, hook: !safe.classList.contains("jp-safe--tight"), bad };
    }),
  );
  notes.push(`[${width}] pieces: ${r.map((x) => `${x.id}${x.hook ? "+hook" : " (tag only)"}`).join(", ")}`);
  for (const x of r) for (const m of x.bad) problems.push(`[${width}] ${x.id}: ${m}`);
  await p.locator(".puzzle").screenshot({ path: `${OUT}/puzzle-${width}.png` });
  await p.close();
}

/* ---------- 2. the main pass at 1440 and 390 ---------- */
for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width, height }, hasTouch: name === "mobile" });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(BASE).origin });
  const p = await ctx.newPage();
  watch(p, name);
  await p.goto(BASE);
  await wait(p, 1200);

  // ---- Selected Work with the caption, and the summary strip ----
  await to(p, (await topOf(p, "#work")) + (name === "mobile" ? 120 : 150));
  await wait(p, 2600);
  await p.screenshot({ path: `${OUT}/${name}-01-work.png` });
  await to(p, (await topOf(p, ".summary")) - height / 2 + 100);
  await wait(p, 2600);
  const nums = await p.evaluate(() => [...document.querySelectorAll(".summary-num > [aria-hidden]")].map((n) => n.textContent.replace(/\s+/g, " ").trim()));
  notes.push(`[${name}] summary strip: ${nums.join(" | ")}`);
  if (nums.join("|") !== "350+|Top5|1st of105|1st of4,000") problems.push(`[${name}] summary values: ${nums.join("|")}`);
  await p.locator(".summary").screenshot({ path: `${OUT}/${name}-02-summary.png` });

  // ---- one pop-up per story ----
  const ids = await p.evaluate(() => [...document.querySelectorAll(".jp-safe")].map((s) => s.dataset.id));
  for (const id of ids) {
    await to(p, (await topOf(p, ".puzzle")) - 90);
    await wait(p, 400);
    const piece = p.locator(`.jp:has(.jp-safe[data-id="${id}"])`);
    // click inside the piece's own shape (the centre of its text box)
    const sb = await piece.locator(".jp-safe").boundingBox();
    await p.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2);
    await wait(p, 1500);
    const card = await p.evaluate(() => {
      const c = document.querySelector(".sc").getBoundingClientRect();
      return { w: Math.round(c.width), h: Math.round(c.height), title: document.querySelector(".sc-title").textContent, tag: document.querySelector(".sc-tag").textContent, focus: document.activeElement?.className };
    });
    notes.push(`[${name}] ${id}: card ${card.w}x${card.h}, "${card.title}", tag "${card.tag}", focus ${card.focus}`);
    const expectW = Math.round(Math.min(width * 0.92, 960)), expectH = Math.round(Math.min(height * 0.86, 760));
    if (Math.abs(card.w - expectW) > 1 || Math.abs(card.h - expectH) > 1) problems.push(`[${name}] ${id} card is ${card.w}x${card.h}, expected ${expectW}x${expectH}`);
    await p.screenshot({ path: `${OUT}/${name}-03-story-${id}-open.png` });

    // scrollbar: hover, then drag; the bar must stay 6px and never sit on the text
    const scroller = name === "mobile" ? ".sc-grid" : ".sc-right";
    const geo = () =>
      p.evaluate((sel) => {
        const s = document.querySelector(sel), r = s.getBoundingClientRect();
        const text = s.querySelector(".sc-sec p").getBoundingClientRect();
        return { bar: s.offsetWidth - s.clientWidth, right: r.right, top: r.top, gap: Math.round(r.right - (s.offsetWidth - s.clientWidth) - text.right), scrollTop: s.scrollTop, scrollable: s.scrollHeight > s.clientHeight };
      }, scroller);
    const g0 = await geo();
    await p.mouse.move(g0.right - 3, g0.top + 30);
    await wait(p, 500);
    const g1 = await geo();
    await p.screenshot({ path: `${OUT}/${name}-04-story-${id}-bar-hover.png` });
    await p.mouse.down();
    await p.mouse.move(g0.right - 3, g0.top + 150, { steps: 8 });
    await wait(p, 300);
    const g2 = await geo();
    await p.screenshot({ path: `${OUT}/${name}-05-story-${id}-bar-drag.png` });
    await p.mouse.up();
    await wait(p, 300);
    notes.push(`[${name}] ${id} scrollbar px rest/hover/drag: ${g0.bar}/${g1.bar}/${g2.bar}, text-to-bar gap ${g0.gap}px, scrolled by drag ${g2.scrollTop}px${g0.scrollable ? "" : " (fits, no scrolling)"}`);
    if (g0.bar > 6 || g1.bar !== g0.bar || g2.bar !== g0.bar) problems.push(`[${name}] ${id} scrollbar width changed ${g0.bar}/${g1.bar}/${g2.bar}`);
    if (g0.gap < 8) problems.push(`[${name}] ${id} text within ${g0.gap}px of the scrollbar`);
    if (g0.scrollable && g2.scrollTop < 20) problems.push(`[${name}] ${id} drag on the scrollbar did not scroll`);
    // mid-scroll shot
    await p.evaluate((sel) => { const s = document.querySelector(sel); s.scrollTop = (s.scrollHeight - s.clientHeight) / 2; }, scroller);
    await wait(p, 200);
    await p.screenshot({ path: `${OUT}/${name}-06-story-${id}-mid.png` });

    if (id === "booking-guard") {
      const link = await p.evaluate(() => { const a = document.querySelector(".sc-links a"); return a ? `${a.textContent.trim()} -> ${a.href} target=${a.target} rel=${a.rel}` : document.querySelector(".sc-links")?.textContent; });
      notes.push(`[${name}] Booking Guard button: ${link}`);
      if (!link?.includes("https://booking-guardhotels.vercel.app/ target=_blank rel=noopener")) problems.push(`[${name}] Booking Guard link wrong: ${link}`);
    }
    await p.keyboard.press("Escape");
    await wait(p, 900);
    const back = await p.evaluate(() => [document.querySelectorAll(".sc").length, document.activeElement?.querySelector?.(".jp-safe")?.dataset.id]);
    if (back[0] !== 0 || back[1] !== id) problems.push(`[${name}] ${id} after Esc: cards ${back[0]}, focus on ${back[1]}`);
  }
  const badge = await p.evaluate(() => [...document.querySelectorAll(".jp-badge")].map((n) => `${n.closest(".jp-safe").dataset.id}: ${n.textContent}`).join(", "));
  notes.push(`[${name}] puzzle badges: ${badge}`);
  if (!badge.includes("booking-guard: Prototype ↗")) problems.push(`[${name}] Booking Guard badge missing`);

  // ---- frame timing while a pop-up opens and closes ----
  if (name === "desktop") {
    for (let run = 0; run < 2; run++) {
      await to(p, (await topOf(p, ".puzzle")) - 90);
      await wait(p, 600);
      await p.evaluate(() => { window.__f = []; let last = performance.now(); const tick = (t) => { window.__f.push(t - last); last = t; if (window.__f.length < 150) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
      const sb = await p.locator('.jp-safe[data-id="hsbc"]').boundingBox();
      await p.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2);
      await wait(p, 1100);
      await p.keyboard.press("Escape");
      await wait(p, 1400);
      const f = await p.evaluate(() => window.__f.slice(2));
      const avg = f.reduce((a, c) => a + c, 0) / f.length;
      notes.push(`[desktop] open+close frames (run ${run + 1}): ${f.length}, avg ${avg.toFixed(1)}ms, max ${Math.max(...f).toFixed(1)}ms, over 25ms: ${f.filter((x) => x > 25).length}`);
    }
  }

  // ---- home Art tiles, at rest and on hover ----
  await to(p, (await topOf(p, "#art")) + (name === "mobile" ? 60 : 90));
  await wait(p, 2200);
  await p.screenshot({ path: `${OUT}/${name}-07-art-rest.png` });
  const tiles = await p.evaluate(() => [...document.querySelectorAll(".tile")].map((a) => ({ title: a.querySelector(".tile-title").textContent, href: a.href, rel: a.rel, target: a.target, ratio: (a.offsetWidth / a.offsetHeight).toFixed(2), radius: getComputedStyle(a).borderTopLeftRadius, img: (() => { const i = a.querySelector("img"); return `${i.currentSrc.split("/").pop()} (${i.naturalWidth}px for ${Math.round(i.getBoundingClientRect().width * devicePixelRatio)}px)`; })() })));
  notes.push(`[${name}] art tiles: ${tiles.map((t) => `${t.title} [${t.ratio}, r ${t.radius}, ${t.img}, ${t.href} ${t.target} ${t.rel}]`).join(" · ")}`);
  if (tiles.length !== 4 || tiles.map((t) => t.title).join("|") !== "Made of Sunlight, Dreaming in Moonlight|Sky Full of Stars|Tale of the Fairy Land|Materialistic Gifts or No?") problems.push(`[${name}] art tiles wrong: ${tiles.map((t) => t.title).join("|")}`);
  if (await p.locator(".chip, .filter-bar, .tiles-empty").count()) problems.push(`[${name}] filter chips still on the page`);
  if (name === "desktop") {
    await p.locator(".tile").first().hover();
    await wait(p, 450);
    const st = await p.evaluate(() => { const a = document.querySelector(".tile"); return [getComputedStyle(a.querySelector(".tile-wash")).opacity, getComputedStyle(a.querySelector(".tile-info")).opacity, getComputedStyle(a.querySelector("img")).transform, getComputedStyle(a.querySelector("img")).filter]; });
    notes.push(`[desktop] tile hover: wash ${st[0]}, text ${st[1]}, img transform ${st[2]}, filter ${st[3]}`);
    if (st[0] !== "1" || st[1] !== "1" || st[2] !== "none") problems.push(`[desktop] tile hover state ${st.join(" ")}`);
    await p.screenshot({ path: `${OUT}/${name}-08-art-hover.png` });
  } else {
    await p.locator(".tile").nth(1).tap();
    await wait(p, 450);
    const on = await p.evaluate(() => [document.querySelector(".tile:nth-child(1)") && document.querySelectorAll(".tile--on").length, location.href]);
    notes.push(`[mobile] first tap on a tile: ${on[0]} tile showing the layer, still on ${on[1]}`);
    if (on[0] !== 1) problems.push(`[mobile] first tap did not show the layer`);
    await p.screenshot({ path: `${OUT}/${name}-08-art-tap.png` });
  }

  // ---- every section boundary ----
  for (const [k, [a, z]] of [["home", "about"], ["about", "work"], ["work", "art"], ["art", "music-coffee"], ["music-coffee", "footer"]].entries()) {
    const y = await p.evaluate((z) => { const n = document.getElementById(z) ?? document.querySelector("footer"); return n.getBoundingClientRect().top + scrollY; }, z);
    await to(p, y - height / 2);
    await wait(p, 900);
    await p.screenshot({ path: `${OUT}/${name}-09-boundary-${k + 1}-${a}-to-${z}.png` });
  }

  // ---- coffee area ----
  if (await p.locator(".passport, .stamp").count()) problems.push(`[${name}] coffee passport still present`);
  if ((await p.content()).includes("A passport, stamped")) problems.push(`[${name}] passport caption still present`);
  await to(p, (await topOf(p, ".coffee")) - 100);
  await wait(p, 2200);
  const shelf = await p.evaluate(() => [...document.querySelectorAll(".shelf-list > li")].map((li) => `${li.textContent.trim()} ${Math.round(li.getBoundingClientRect().height)}px, icon ${Math.round(li.querySelector(".shelf-icon").getBoundingClientRect().width)}px`));
  notes.push(`[${name}] brew shelf: ${shelf.join(" · ")}`);
  if (new Set(shelf.map((s) => s.match(/ (\d+)px,/)[1])).size !== 1) problems.push(`[${name}] shelf cards differ in height`);
  await p.screenshot({ path: `${OUT}/${name}-10-coffee.png` });
  await to(p, (await topOf(p, ".shelf")) - 80);
  await wait(p, 1400);
  await p.screenshot({ path: `${OUT}/${name}-11-shelf.png` });

  // ---- Let's talk ----
  await to(p, 0);
  await wait(p, 500);
  if (name === "mobile") {
    await p.locator(".nav-burger").click();
    await wait(p, 400);
  }
  const talk = p.locator(name === "mobile" ? ".nav-sheet .nav-cta" : ".nav-links .nav-cta");
  await talk.click();
  await wait(p, 500);
  const pop = await p.evaluate(() => { const d = document.querySelector(".talk-pop"); return d && { text: d.innerText.replace(/\s+/g, " "), role: d.getAttribute("role"), focus: document.activeElement?.textContent, mailto: document.querySelectorAll('a[href^="mailto"]').length }; });
  notes.push(`[${name}] Let's talk popover: ${JSON.stringify(pop)}`);
  if (!pop || pop.mailto || !pop.text.includes("ayeshasanjeeedasana@gmail.com") || pop.focus !== "Copy email") problems.push(`[${name}] popover state ${JSON.stringify(pop)}`);
  await p.screenshot({ path: `${OUT}/${name}-12-talk.png` });
  await p.locator(".talk-copy").click();
  await wait(p, 300);
  const copied = [await p.locator(".talk-copy").textContent(), await p.evaluate(() => navigator.clipboard.readText().catch(() => "?"))];
  await wait(p, 2200);
  copied.push(await p.locator(".talk-copy").textContent());
  notes.push(`[${name}] copy: "${copied[0]}", clipboard "${copied[1]}", after 2s "${copied[2]}"`);
  if (copied[0] !== "Copied ✓" || copied[2] !== "Copy email") problems.push(`[${name}] copy states ${copied.join(" / ")}`);
  await p.keyboard.press("Escape");
  await wait(p, 400);
  const after = await p.evaluate(() => [document.querySelectorAll(".talk-pop").length, document.activeElement?.textContent?.trim()]);
  if (after[0] !== 0 || after[1] !== "Let's talk") problems.push(`[${name}] after Esc: ${after}`);

  // ---- the book's back cover ----
  await p.goto(BASE + "#/gallery");
  await wait(p, 1200);
  for (let i = 0; i < 30; i++) {
    const dis = await p.locator(".bk-arrow").nth(1).isDisabled();
    if (dis) break;
    await p.keyboard.press("ArrowRight");
    await wait(p, 1250);
  }
  const end = await p.evaluate(() => { const e = document.querySelector(".bk-end"); return e && e.innerText.replace(/\s+/g, " "); });
  notes.push(`[${name}] back cover: ${end}`);
  if (!end || /fin\./.test(end) || !end.includes("Thanks for wandering through. There's more on Medium.")) problems.push(`[${name}] back cover text: ${end}`);
  await p.screenshot({ path: `${OUT}/${name}-13-book-back.png` });
  await ctx.close();
}

/* ---------- 3. every painting in the book exactly once ---------- */
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  watch(p, "book");
  await p.goto(BASE + "#/gallery");
  await wait(p, 1000);
  const seen = [];
  const read = () =>
    p.evaluate(() => {
      const leaves = [...document.querySelectorAll(".bk-leaf")];
      const turned = leaves.filter((l) => l.classList.contains("is-turned")).length;
      const out = [];
      const grab = (face, side) => face && face.querySelectorAll("img").forEach((i) => out.push({ side, src: i.getAttribute("src"), ok: i.complete && i.naturalWidth > 0 }));
      grab(leaves[turned - 1]?.querySelector(".bk-face--back"), "left");
      grab(leaves[turned]?.querySelector(".bk-face--front"), "right");
      return { turned, out };
    });
  for (let i = 0; i < 30; i++) {
    await p.keyboard.press("ArrowRight");
    await wait(p, 1300);
    const r = await read();
    for (const o of r.out) seen.push({ spread: r.turned, ...o, slug: o.src.split("/").pop().replace(/-\d+\.webp$/, "").replace("03b-", "03-") });
    if (await p.locator(".bk-arrow").nth(1).isDisabled()) break;
  }
  const rows = [], dup = [], broken = [];
  const bySlug = {};
  for (const s of seen) (bySlug[s.slug] ??= []).push(s);
  for (const [slug, list] of Object.entries(bySlug).sort()) {
    rows.push(`| ${slug} | ${list.map((s) => `spread ${s.spread}, ${s.side} page`).join("; ")} |`);
    if (list.length !== 1) dup.push(slug);
    if (list.some((s) => !s.ok)) broken.push(slug);
  }
  const all = 19;
  writeFileSync(`${OUT}/book-images.md`, `| Painting | Where in the book (desktop spreads) |\n|---|---|\n${rows.join("\n")}\n`);
  notes.push(`[book] ${Object.keys(bySlug).length} of ${all} paintings found, duplicates: ${dup.join(", ") || "none"}, broken: ${broken.join(", ") || "none"}`);
  if (Object.keys(bySlug).length !== all || dup.length || broken.length) problems.push(`[book] images: ${Object.keys(bySlug).length} found, dup ${dup}, broken ${broken}`);
  await p.close();
}

/* ---------- 4. reduced motion: the pop-up only cross-fades ---------- */
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  watch(p, "reduced");
  await p.goto(BASE);
  await wait(p, 800);
  await to(p, (await topOf(p, ".puzzle")) - 90);
  await wait(p, 600);
  const sb = await p.locator('.jp-safe[data-id="thoucentric"]').boundingBox();
  await p.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await wait(p, 60);
  const mid = await p.evaluate(() => getComputedStyle(document.querySelector(".sc")).transform);
  await wait(p, 500);
  notes.push(`[reduced] card transform while opening: ${mid}; overlay from piece: ${await p.locator(".sc-from").count()}`);
  if (mid !== "none" && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(mid)) problems.push(`[reduced] card moves: ${mid}`);
  await ctx.close();
}

await b.close();
console.log(notes.join("\n"));
console.log(problems.length ? "\nPROBLEMS:\n" + problems.join("\n") : "\nNo problems");
