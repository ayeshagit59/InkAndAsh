// Outside any sandbox: "Open PDF" opens a tab and "Download" downloads the file. Needs the dev server.
import { chromium } from "playwright";
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(process.env.BASE_URL || "http://localhost:5173/");
await p.waitForTimeout(1500);
await p.locator(".nav-links .nav-resume").click();
await p.waitForTimeout(1000);
const [tab] = await Promise.all([ctx.waitForEvent("page"), p.getByRole("link", { name: "Open PDF" }).click()]);
console.log("Open PDF opened:", tab.url(), "| blocked note shown:", await p.locator(".resume-blocked").isVisible());
const [dl] = await Promise.all([p.waitForEvent("download"), p.getByRole("link", { name: "Download" }).click()]);
console.log("Download:", dl.suggestedFilename(), (await dl.failure()) ?? "ok");
await b.close();
