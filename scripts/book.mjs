// Screenshots of the gallery book at 1440 and 390: closed, opening, open, mid-turn, a favourite, a collage, the end.
import { chromium } from "playwright";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const OUT = process.argv[2] || "screenshots/round4";
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errs = [];
for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const p = await b.newPage({ viewport: { width, height }, hasTouch: name === "mobile" });
  p.on("pageerror", (e) => errs.push(`[${name}] ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errs.push(`[${name}] ${m.text()}`));
  p.on("response", (r) => r.status() >= 400 && errs.push(`[${name}] ${r.status()} ${r.url()}`));
  await p.goto(BASE + "#/gallery");
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/${name}-book-01-closed.png` });
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(520);
  await p.screenshot({ path: `${OUT}/${name}-book-02-opening.png` });
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${OUT}/${name}-book-03-spread1.png` });
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/${name}-book-04-mid-turn.png` });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/${name}-book-05-spread2.png` });
  await p.locator(".bk-tab--2").click();
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `${OUT}/${name}-book-06-studio.png` });
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/${name}-book-07-studio-2.png` });
  for (let i = 0; i < 4; i++) { await p.keyboard.press("ArrowRight"); await p.waitForTimeout(1300); }
  await p.screenshot({ path: `${OUT}/${name}-book-08-end.png` });
  console.log(name, await p.locator(".bk-foot").textContent(), "| live:", await p.locator("[aria-live]").textContent());
  await p.close();
}
console.log(errs.join("\n") || "no errors");
await b.close();
