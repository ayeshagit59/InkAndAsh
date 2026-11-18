// Quick look at one part of the page: node scripts/peek.mjs <selector> <out.png> [width] [hoverSelector] [clickSelector]
import { chromium } from "playwright";
const [sel, out, width = "1440", hover, click] = process.argv.slice(2);
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage({ viewport: { width: +width, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto(process.env.URL || "http://localhost:5173/");
await p.waitForTimeout(800);
await p.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "start" }), sel);
await p.waitForTimeout(2200);
if (hover) { const bx = await p.locator(hover).first().boundingBox(); await p.mouse.move(bx.x + bx.width * 0.3, bx.y + bx.height * 0.35); await p.waitForTimeout(600); }
if (click) { await p.locator(click).first().click({ position: { x: 60, y: 60 }, force: true }); await p.waitForTimeout(900); }
await p.screenshot({ path: out });
console.log(errs.join("\n") || "no errors");
await b.close();
