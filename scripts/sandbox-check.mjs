// Loads the built site (dist/) inside a sandboxed iframe like the published preview and checks what still works.
// Usage: CHROMIUM_PATH=... node scripts/sandbox-check.mjs $PWD/dist screenshots/round3
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
const DIST = process.argv[2];
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".pdf": "application/pdf", ".mp4": "audio/mp4", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff" };
const srv = createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0]);
  if (u === "/host") { r.writeHead(200, { "content-type": "text/html" }); return r.end(`<iframe id=f sandbox="allow-scripts allow-same-origin" src="/index.html" style="width:1400px;height:860px;border:0"></iframe>`); }
  const f = join(DIST, u === "/" ? "index.html" : u);
  if (!existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": types[extname(f)] || "application/octet-stream" }); r.end(readFileSync(f));
}).listen(4789);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const log = [];
p.on("console", (m) => m.type() === "error" && log.push("console: " + m.text().slice(0, 160)));
p.on("popup", () => log.push("popup opened"));
p.on("download", (d) => log.push("download started: " + d.suggestedFilename()));
await p.goto("http://localhost:4789/host"); await p.waitForTimeout(3000);
const f = p.frameLocator("#f");
const fr = p.frames().find((x) => x.url().includes("index.html"));
await f.locator(".nav-links .nav-cta").click(); await p.waitForTimeout(1200);
log.push("talk popover in sandbox: " + (await f.locator(".talk-pop").isVisible()));
await f.locator(".talk-copy").click(); await p.waitForTimeout(400);
log.push("copy status: " + (await f.locator(".talk-status").textContent()));
await p.keyboard.press("Escape");
await fr.evaluate(() => (location.hash = "#/gallery")); await p.waitForTimeout(1500);
await fr.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))); await p.waitForTimeout(1600); log.push("book in sandbox: " + (await fr.evaluate(() => document.querySelector(".bk-foot")?.textContent)));
await fr.evaluate(() => history.back()); await p.waitForTimeout(1000);
log.push("after back: hash='" + (await fr.evaluate(() => location.hash)) + "' art top " + (await fr.evaluate(() => Math.round(document.getElementById("art")?.getBoundingClientRect().top))));
await fr.evaluate(() => document.querySelector(".tt-platter").click()); await p.waitForTimeout(1500);
log.push("clip playing in sandbox: " + (await fr.evaluate(() => !!document.querySelector(".is-playing"))));
console.log(log.join("\n")); await b.close(); srv.close();
