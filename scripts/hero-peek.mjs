// Hero screenshots at 1440 and 390: mid-intro and settled, plus a check that nothing overlaps the text.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE_URL || "http://localhost:5173/";
const OUT = process.argv[2] || "screenshots/round7";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const p = await b.newPage({ viewport: { width, height } });
  await p.goto(BASE);
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${OUT}/${name}-hero-mid-intro.png` });
  await p.waitForTimeout(6500);
  await p.screenshot({ path: `${OUT}/${name}-hero-settled.png` });
  const r = await p.evaluate(() => {
    const box = (el) => el.getBoundingClientRect();
    const hit = (a, c) => !(a.right <= c.left || a.left >= c.right || a.bottom <= c.top || a.top >= c.bottom);
    const text = [".hero-name", ".headline", ".hero-tags", ".hero-scroll"].map((s) => [s, box(document.querySelector(s))]);
    const things = [...document.querySelectorAll(".piece")].filter((n) => getComputedStyle(n).display !== "none").map((n) => [n.className.split(" ")[1], box(n.firstElementChild)])
      .concat([...document.querySelectorAll(".tech-code")].map((n, i) => [`code${i}`, box(n)]));
    const nav = box(document.querySelector(".nav-bar") || document.querySelector("header"));
    const clashes = [];
    for (const [a, A] of things) {
      for (const [t, T] of text) if (hit(A, T)) clashes.push(`${a} overlaps ${t}`);
      if (a.startsWith("piece") && A.top < nav.bottom) clashes.push(`${a} under the nav`);
    }
    const pieces = things.filter(([a]) => a.startsWith("piece"));
    for (let i = 0; i < pieces.length; i++) for (let j = i + 1; j < pieces.length; j++) if (hit(pieces[i][1], pieces[j][1])) clashes.push(`${pieces[i][0]} overlaps ${pieces[j][0]}`);
    return { polaroids: [...document.querySelectorAll(".polaroid figcaption")].map((f) => f.textContent), clashes };
  });
  console.log(name, JSON.stringify(r));
  await p.close();
}
await b.close();
