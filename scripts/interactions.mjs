// Smoke test: stories, resume viewer, art filters + colour drop, reels facade, clip + pill, reduced motion, contrast.
import { chromium } from "playwright";
const BASE = process.env.BASE_URL || "http://localhost:5173";
const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && !/instagram/i.test(m.text()) && errors.push(m.text()));
await page.goto(BASE, { waitUntil: "networkidle" });
const log = (k, v) => console.log(k.padEnd(40), v);

log("autoplay: audio playing on load", await page.evaluate(() => [...document.querySelectorAll("audio")].some((a) => !a.paused)));
log("pill hidden before play", (await page.locator(".mini").count()) === 0);

// stories
await page.locator("#work").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
const card = page.locator(".work-card").first();
await card.click();
await page.waitForTimeout(700);
log("story opens as dialog", await page.getByRole("dialog").isVisible());
log("focus inside dialog", await page.evaluate(() => !!document.activeElement.closest('[role="dialog"]')));
await page.getByRole("button", { name: /Next/ }).click();
await page.waitForTimeout(500);
log("next story title", await page.locator(".drawer-title").innerText());
for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
log("focus trapped after 12 tabs", await page.evaluate(() => !!document.activeElement.closest('[role="dialog"]')));
await page.keyboard.press("Escape");
await page.waitForTimeout(600);
log("Esc closes, focus back on card", await page.evaluate(() => document.activeElement.classList.contains("work-card")));

// story word counts
const counts = await page.evaluate(async () => {
  const out = [];
  for (let i = 0; i < 6; i++) {
    document.querySelectorAll(".work-card")[i].click();
    await new Promise((r) => setTimeout(r, 700));
    const t = [...document.querySelectorAll(".drawer-sec p")].map((p) => p.innerText).join(" ");
    out.push(t.split(/\s+/).filter(Boolean).length);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await new Promise((r) => setTimeout(r, 600));
  }
  return out;
});
log("story word counts (200-320)", counts.join(", "));

// resume
await page.locator(".nav-links .nav-resume").click();
await page.waitForTimeout(700);
log("resume dialog + download link", (await page.getByRole("dialog", { name: "Resume" }).isVisible()) + " / " + (await page.locator(".resume a[download]").getAttribute("href")));
await page.keyboard.press("Escape");
await page.waitForTimeout(500);
log("resume closed, focus on Resume button", await page.evaluate(() => document.activeElement.textContent.trim()));

// art
await page.locator("#art").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
for (const f of ["Night skies", "Mandala & doodle", "Pen & ink", "Landscapes", "Acrylic", "All"]) {
  await page.getByRole("button", { name: f, exact: true }).click();
  await page.waitForTimeout(800);
  log(`filter ${f}`, `${await page.locator(".tiles .tile").count()} tiles`);
}
const tile = page.locator(".tile").nth(1);
const box = await tile.boundingBox();
await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.7);
await page.waitForTimeout(900);
log("hover: colour drop + CTA visible", await tile.evaluate((t) => t.classList.contains("tile--drop") && getComputedStyle(t.querySelector(".tile-cta")).opacity === "1"));
log("tile href", await tile.getAttribute("href"));
await tile.screenshot({ path: "screenshots/desktop-art-drop.png" });
await page.mouse.move(5, 5);

// reels facade
await page.locator(".reels").scrollIntoViewIfNeeded();
log("iframes before click", await page.locator(".reels iframe").count());
await page.locator(".reel-facade").first().click();
await page.waitForTimeout(500);
log("iframe src after click", await page.locator(".reels iframe").first().getAttribute("src"));

// clip
await page.locator(".tt-platter").scrollIntoViewIfNeeded();
await page.locator(".tt-platter").click();
await page.waitForTimeout(1500);
log("clip playing + pill shown", (await page.locator(".is-playing").count()) + " / " + (await page.locator(".mini").count()));
log("credit line", await page.locator(".clip-credit").innerText());
await page.locator(".music").screenshot({ path: "screenshots/desktop-music-playing.png" });
await page.getByRole("button", { name: "Stop and close the player" }).click();
await page.waitForTimeout(600);
log("pill closed", (await page.locator(".mini").count()) === 0);

// contrast of body text on each section's base colour, worst case with the blob tint on top
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const mix = (a, b, t) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, "0")).join("");
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return ((x + 0.05) / (y + 0.05)).toFixed(2); };
for (const [sec, fg, bg, blob, a] of [
  ["about body", "#e9e1f5", "#24142f", "#d6338a", 0.42],
  ["work body", "#221d2e", "#faf5ec", "#c9a2e0", 0.34],
  ["work muted", "#6b6475", "#faf5ec", "#c9a2e0", 0.34],
  ["art body", "#221d2e", "#f4e8f0", "#2442c9", 0.3],
  ["music body", "#e7d3b8", "#2a1d16", "#c9a27a", 0.32],
  ["footer muted", "#c8c1dc", "#0b0a1f", "#2442c9", 0.25],
]) log(`contrast ${sec} (plain / under blob)`, `${ratio(fg, bg)} / ${ratio(fg, mix(bg, blob, a))}`);

// reduced motion
const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await rm.goto(BASE, { waitUntil: "networkidle" });
await rm.waitForTimeout(300);
log("reduced: headline complete at once", (await rm.locator(".hl-1").innerText()) === "Product thinking,");
log("reduced: atmosphere hidden", await rm.evaluate(() => getComputedStyle(document.querySelector(".atmosphere")).display === "none"));

console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no page errors");
await browser.close();
