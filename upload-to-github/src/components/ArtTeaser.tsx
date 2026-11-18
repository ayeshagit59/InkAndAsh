import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { bySlug, coverSizes, dropColour, mediumPost } from "../content/art";
import { favourites } from "../content/gallery";
import { ArtImage } from "./ArtImage";
import { Arrow } from "./Props";
import { FadeUp } from "./Reveal";

// the first four favourites, in the book's order
const FEATURED = favourites.slice(0, 4).map((g) => g.slug);

/*
  Four rectangular tiles (4:5). Hover / keyboard focus / first tap lays a light, see-through wash over the
  painting (cream, tinted with the painting's own colour) with its title and "Read on Medium ↗".
  Clicking opens the Medium post in a new tab; on touch, the first tap shows the wash and the second opens.
*/
function Tile({ slug }: { slug: string }) {
  const p = bySlug[slug];
  const [armed, setArmed] = useState(false);

  return (
    <a
      className={`tile${armed ? " tile--on" : ""}`}
      href={mediumPost(p.postId)}
      target="_blank"
      rel="noopener"
      style={{ "--tint": dropColour(slug) } as React.CSSProperties}
      onClick={(e) => {
        if (!window.matchMedia("(hover: hover)").matches && !armed) {
          e.preventDefault();
          setArmed(true);
        }
      }}
      onBlur={() => setArmed(false)}
    >
      <ArtImage
        slug={slug}
        sizes={coverSizes(slug, [
          ["(max-width: 640px)", 180, 225],
          ["(max-width: 1024px)", 230, 290],
          ["", 300, 375],
        ])}
        className="tile-img"
        position={p.tile}
      />
      <span className="tile-wash" aria-hidden="true" />
      <span className="tile-info">
        <span className="tile-title">{p.title}</span>
        <span className="tile-cta">
          Read on Medium <span aria-hidden="true">↗</span>
        </span>
      </span>
      <span className="sr-only"> (opens the Medium post in a new tab)</span>
    </a>
  );
}

export function ArtTeaser() {
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(listRef, { once: true, amount: 0.2 });

  return (
    <section className="art" id="art" aria-labelledby="art-title">
      <div className="container">
        <FadeUp className="art-head">
          <h2 id="art-title" className="section-title">
            The <span className="script">gallery</span>
          </h2>
          <p className="art-lede">Acrylics, inks and a lot of night skies. The full collection, and the stories behind it, live on Medium.</p>
        </FadeUp>

        <ul ref={listRef} className="tiles">
          {FEATURED.map((slug, i) => (
            <motion.li
              key={slug}
              initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(12px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } } : undefined}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.09 }}
            >
              <Tile slug={slug} />
            </motion.li>
          ))}
        </ul>

        <FadeUp className="art-foot">
          <a className="btn-pill" href="#/gallery">
            Explore the full gallery
            <Arrow />
          </a>
        </FadeUp>
      </div>
    </section>
  );
}
