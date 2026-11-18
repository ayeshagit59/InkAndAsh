# Ink&Ash — revision pass (2026-10-29)

## What already exists (kept)
- Vite + React 18 + TypeScript, plain CSS tokens (`src/styles/tokens.css`), Framer Motion. Self-hosted Montserrat, Pinyon Script, Cormorant Garamond.
- All 19 Medium paintings (+ a 2nd Charminar image) downloaded and processed to WebP 400/800/1200 with LQIP (`public/art/w`, `src/content/art-meta.json`), alt text and categories in `src/content/art.ts`.
- Props SVGs (cup, vinyl, brush, mic), ArtImage, brush cursor trail, Playwright scripts.

## Audit findings
- `images/`: the two reference screenshots, the booking-site `.mov` (frames already reviewed), and a new `Untitled.mp4` which is **audio only** (16.5 s AAC), not the card-animation recording.
- Audio: no file named "Zara Zara". Using `public/audio/cover-clip.mp4` (50 s AAC, placed by Ayesha under the target name). Trimmed to 30 s with a 2.5 s fade via AVFoundation, re-encoded 96 kbps → `public/audio/cover-clip.mp4` (AAC, audio only; no MP3 encoder here, and the artifact host serves .mp4 but not .m4a). Original moved to `media-src/`.
- Resume: copied from `~/Downloads/materials/resume/mine/PM_62610793_Latest4_Blue.pdf` → `public/resume.pdf`; facts match Appendix A.

## Changes
- [x] Scroll system: page-length painted gradient (colour stops per section, melts in the padding between sections so text never sits mid-melt) + fixed atmosphere (morphing blobs, giant faint words, travelling cup) driven by scroll
- [x] Hero: one-time intro (fly-in → polaroid borders dissolve → feathered, glowing, drifting), typed headline, ISB PGP '27 / ex-Deloitte tags; remove stage, loop, controls, search, chips, "messy problems" line
- [x] Nav: Home · About · Work · Art · Music & Coffee, Resume viewer, Let's talk mailto, active section
- [x] About: longer personal note, no stats
- [x] Selected Work: six hook cards, blur-to-sharp reveal, summary strip, story drawer (prev/next, Esc, focus trap)
- [x] Art: four tall narrow tiles, hand-tuned crops, colour-drop hover from cursor (dominant colour at build time), Medium links
- [x] Music & Coffee: coffee passport, brew shelf, omakase journal (`omakaseEntries`), cup counter, vinyl clip player with credit, five click-to-load reel embeds, now-playing pill after start
- [x] Footer (no "Say hello"), Resume viewer overlay
- [x] Remove: soundwave dividers, mini-player, hero loop, bento
- [x] Screenshots 1440/390 (+768), console/broken-image/CLS checks, republish artifact

## Status (revision done, 2026-10-29)
- `scripts/screenshots.mjs`: 1440 / 768 / 390, hero mid-intro + settled, every section, three mid-melt positions, open story, resume viewer, reduced motion. No console errors, broken images, overflow or CLS > 0.1.
- `scripts/interactions.mjs`: no autoplay, story drawer (focus, trap, Esc, restore, prev/next), resume viewer, filters (4/4/2/3/4/4 tiles), colour drop, reel facade, clip + pill, contrast, reduced motion. All pass.
- Story word counts: 221, 287, 210, 285, 219, 214.
- Production build hides placeholder omakase entries and `[MY_NOTE]`s (verified in `vite preview`).
- Not measured: Lighthouse (not installed here). Not verifiable headless: the PDF embed (headless Chromium shows the fallback) and Instagram embeds' own content.
- Original art JPGs moved to `media-src/art-originals/` (build is 11 MB, was 19 MB); `npm run art` reads from there.

## Round 3 (2026-10-29)
- [x] Hero polaroids keep white borders + captions (no dissolve/feather/glow)
- [x] Discs: hero LP (purple label), turntable 78 rpm shellac (cream-and-gold label), pill tiny iridescent CD; no discs on music cards
- [x] Right-edge drink cast (filter coffee, moka, AeroPress, salt coffee, espresso; hero uses its own steaming cup) + left-edge brush/knife with per-section paint and a short paint trail (`src/components/Travellers.tsx`, `Atmosphere.tsx`). Both shown ≥1280px only, sized to the side margin so they never sit on text.
- [x] Art tiles: fast retract (200ms) / slow bloom (800ms), per-tile state, correct `sizes` via `coverSizes()`, LQIP removed on load
- [x] Gallery page `#/gallery` (`Gallery.tsx`, `gallery.css`, `content/gallery.ts`)
- [x] Music: album-cover carousel linking to Instagram; no embeds
- [x] `coverClip` in site.ts drives turntable, pill, credit; duration from file; "Clip coming soon" on error
- [x] Resume: PDF rendered at 200 dpi (`npm run resume`) and shown as an image; one Open PDF + one Download; blocked-tab note
- [x] Let's talk: mailto with subject + copy-email popover fallback
- Checks: `scripts/round3.mjs`, `scripts/sandbox-check.mjs`, `scripts/resume-buttons.mjs`; screenshots in `screenshots/round3/`

## Round 4 (2026-10-30)
- [x] Nav scroll-spy: line at 40% of the viewport, Home at the top (Nav.tsx)
- [x] Art filters: per-tile reveal keyed by filter (fixes tiles stuck at opacity 0); every chip ≥ 3 paintings; empty message
- [x] Mouse trail: segments live 300ms, canvas redrawn every frame, cleared on idle/leave/blur
- [x] Clip: Ayesha's new 16.5s file was already at public/audio/cover-clip.mp4; duration read from the file
- [x] About: short copy
- [x] Charminar: one image (the upright 03b photo, aliased in art.ts as 03). Old 03 files and media-src/cover-clip-original.mp4 are unused; delete when convenient
- [x] Selected Work: jigsaw (jigsaw.ts geometry, SelectedWork.tsx), polaroid pop-up (StoryCard.tsx, WorkArt.tsx); StoryDrawer removed
- [x] Gallery: "The Studio Book" (Gallery.tsx, gallery.css): 8 favourite spreads, 2 collage spreads, closing spread; single-page on phones; cross-fade for reduced motion
- [x] Music: illustrated SVG covers (CoverArt.tsx), short credit lines, equal-height cards
- [x] Coffee: story + Roast CCX tasting prints (photos via `npm run omakase` from images/omakase/; tasting-card faces until then) + lightbox
- Checks: scripts/round4.mjs, scripts/book.mjs, scripts/turn-perf.mjs, scripts/sandbox-check.mjs

## Round 5 (published as v8)
- Story copy edits (Thoucentric, HSBC, HUL, both Deloitte stories); HUL title is now "Adaptive packaging for perishables" so the hook is not repeated.
- Story pop-up grows from the clicked piece (FLIP), fixed size, two columns on desktop, staggered reveal, fixed 6px scrollbars (`.thin-scroll`).
- Selected Work: caption left / puzzle right; piece text sits in a safe box (`pieceInsets` in jigsaw.ts) and the hook hides when it cannot fit; bolder summary strip.
- Art: filters removed; first four favourites as 4:5 tiles with a light wash on hover.
- Colour bands between sections (`BANDS` in Atmosphere.tsx) + drifting glows; giant words fade before section edges.
- Book: "fin." removed. Coffee: passport removed; brew shelf titles only, larger icons.
- "Let's talk" is a popover only (no mailto). Resume links are plain links; framed previews show a note.
- Booking Guard prototype: https://booking-guardhotels.vercel.app. Checks: `node scripts/round5.mjs`.
