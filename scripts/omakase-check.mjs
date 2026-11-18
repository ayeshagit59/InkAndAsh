// Omakase prints: screenshots at 1440 and 390, natural sizes (no upscaling), lightbox open/close.
import { chromium } from "playwright";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errs = [];
for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const p = await b.newPage({ viewport: { width, height } });
  p.on("pageerror", (e) => errs.push(`[${name}] ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errs.push(`[${name}] ${m.text()}`));
  p.on("response", (r) => r.status() >= 400 && errs.push(`[${name}] ${r.status()} ${r.url()}`));
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const goTasting = () => p.evaluate(() => window.scrollTo(0, document.querySelector(".tasting").getBoundingClientRect().top + window.scrollY - 90));
  await goTasting();
  await p.waitForTimeout(1500);
  await goTasting();
  await p.waitForFunction(() => [...document.querySelectorAll(".tasting-photo img")].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15000 });
  await p.waitForTimeout(1200);
  console.log("  scrollY", await p.evaluate(() => Math.round(window.scrollY)));
  await p.screenshot({ path: `screenshots/round4/${name}-12-omakase-photos.png`, fullPage: false });
  const sizes = await p.evaluate(() => [...document.querySelectorAll(".tasting-photo img")].map((i) => `${i.getAttribute("src").split("/").pop()} shown ${Math.round(i.getBoundingClientRect().width)}px of ${i.naturalWidth}px`));
  console.log(name, "\n  " + sizes.join("\n  "));
  if (name === "desktop") {
    await p.evaluate(() => window.scrollBy(0, 420));
    await p.waitForTimeout(800);
    await p.screenshot({ path: `screenshots/round4/${name}-13-omakase-photos-lower.png` });
  }
  await p.locator(".tasting-photo").nth(2).click();
  await p.waitForTimeout(800);
  const lb = await p.evaluate(() => ({ open: !!document.querySelector(".lb"), focus: document.activeElement?.getAttribute("aria-label"), cap: document.querySelector(".lb-cap strong")?.textContent }));
  await p.screenshot({ path: `screenshots/round4/${name}-14-omakase-lightbox.png` });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(500);
  console.log("  lightbox:", JSON.stringify(lb), "| closed:", !(await p.locator(".lb").count()), "| focus back:", await p.evaluate(() => document.activeElement?.className));
  await p.close();
}
console.log(errs.join("\n") || "no errors");
await b.close();
