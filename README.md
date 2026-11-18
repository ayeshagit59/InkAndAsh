# Ink&Ash: Ayesha's portfolio

**Product thinking, painted in colour.**

**Live site: [inkandash.vercel.app](https://inkandash.vercel.app)**

<!-- Add a screenshot once you have one: ![Ink&Ash home page](screenshots/home.png) -->

A portfolio for Ayesha Ashraf Sultana (ISB PGP '27, ex-Deloitte). It brings together the products I built at Deloitte, the ideas I've prototyped at ISB, and the things I do off the clock: painting, singing and brewing interesting coffee.

I spent nearly four years at Deloitte turning attorneys' frustrations into working tools. The site is built the way I like to work: start from a real problem, make it something people can use, and give it some personality.

## What's on the site

| Section | What you'll find |
|---|---|
| **Hero** | Name, tagline and a short intro. "Builder by day, painter by night." |
| **Builds, wins and big questions** | Six stories about ideas that became products, proposals and plans: **Booking Guard** (clickable concept prototype), **HSBC** (AI-agent strategy project at ISB), **Thoucentric 5.0** (the winning framework), **HUL Techtonic** (campus-winning packaging idea), **The User-Flow Bot** and **The Database Agent** (two GenAI tools from my Deloitte work). |
| **In numbers** | 350+ attorneys served at Deloitte · Top 5 of 30 teams at Deloitte's GenAI hackathon · 1st of 105 at HUL Techtonic · 1st of 4,000 teams at Thoucentric 5.0 |
| **The gallery** | Acrylics, inks and a lot of night skies, with links to the full collection and the stories behind it on Medium. |
| **Music** | Hindi film vocal covers, posted on Instagram as [My Harmonic Palette](https://www.instagram.com/my_harmonic_palette). A record player on the page plays a short clip. |
| **Coffee** | A tasting journey that started with a coffee omakase at Roast CCX in Hyderabad, plus how I brew at home: South Indian filter coffee, moka pot and AeroPress. |

Each section has its own colour scene, with drifting shapes, large background words and a coffee cup that travels down the page as you scroll.

## Related project

**Booking Guard**, an AI agent concept for independent hotels, has its own repo: [ayeshagit59/BookingGuard](https://github.com/ayeshagit59/BookingGuard).

## Built with

- [Vite](https://vitejs.dev/), [React](https://react.dev/) and TypeScript
- Plain CSS with design tokens (`src/styles/tokens.css`)
- [Framer Motion](https://www.framer.com/motion/) for animation
- Static output, deployed on [Vercel](https://vercel.com/)

## Run it locally

You need Node.js 22 or later.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run art      # rebuild WebP variants and colours from media-src/art-originals/*.jpg
```

To capture screenshots with Playwright:

```bash
CHROMIUM_PATH=/path/to/chromium npm run shots   # saves into screenshots/
```

## Where to edit

| What | Where |
|---|---|
| All copy, stories, links, coffee and music content | `src/content/site.ts` |
| Omakase cards | `omakaseEntries` in `src/content/site.ts` (placeholder entries are hidden in production) |
| Coffee passport notes | `coffeePassport[].myNote` in `src/content/site.ts` (hidden until you replace `[MY_NOTE]`) |
| Paintings: categories, alt text, tile crops (`strip`), colour-drop overrides (`drop`) | `src/content/art.ts` |
| Section colours, shapes, giant words and the travelling cup | `SCENES` in `src/components/Atmosphere.tsx` |
| Colour and spacing tokens | `src/styles/tokens.css` |
| Cover clip (30 s) | `public/audio/cover-clip.mp4` |
| Resume | `public/resume.pdf` |

## Deploying

The site is fully static. Vercel runs `npm run build` and serves the `dist/` folder, so there's no server or environment setup.

## Contact

- Medium: the stories behind the paintings are linked from the gallery on the site
- Instagram: [@my_harmonic_palette](https://www.instagram.com/my_harmonic_palette)
- LinkedIn: linked from the site and my resume
