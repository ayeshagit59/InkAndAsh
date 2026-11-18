import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { type Story } from "../content/site";
import { useDialog } from "./useDialog";
import { STORY_ART } from "./WorkArt";

export type StoryLink = { label: string; url: string; soon: string };
/** The clicked piece's box, in viewport pixels. */
export type Origin = { x: number; y: number; w: number; h: number };

type Props = { story: Story | null; from?: Origin; link?: StoryLink; onClose: () => void };

const EASE = [0.22, 1, 0.36, 1] as const;
const GROW = 0.5; // s, piece -> card
// the card's fixed size; the CSS reads the same numbers from these inline values
const cardSize = () => ({ w: Math.min(window.innerWidth * 0.92, 960), h: Math.min(window.innerHeight * 0.86, 760) });

/*
  A polaroid / paper card for one story that grows out of the puzzle piece that was clicked (a FLIP:
  only transform and opacity animate) and shrinks back into it on close. The piece's colour covers the
  card at first and fades away into the photo area; then the photo, title, hook, chips, story and buttons
  come in one after another from blur to sharp. Desktop: two columns, the story scrolling on its own on the right.
  Focus is trapped inside; Esc, the close button and a backdrop click close it; focus returns to the piece.
*/
export function StoryCard({ story, from, link, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useDialog(ref, !!story, onClose);
  const Art = story ? STORY_ART[story.id] : null;

  const size = cardSize();
  const flip = from
    ? {
        x: from.x + from.w / 2 - window.innerWidth / 2,
        y: from.y + from.h / 2 - window.innerHeight / 2,
        scaleX: from.w / size.w,
        scaleY: from.h / size.h,
      }
    : { x: 0, y: 24, scaleX: 0.9, scaleY: 0.9 };

  // blur-to-sharp fade-up for the n-th element inside, once the card has settled
  let n = 0;
  const rev = () => {
    const i = n++;
    return reduced
      ? {}
      : {
          initial: { opacity: 0, y: 8, filter: "blur(6px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
          transition: { duration: 0.4, ease: EASE, delay: GROW * 0.85 + i * 0.04 },
        };
  };

  return createPortal(
    <AnimatePresence>
      {story && (
        <div className="sc-root" key="story">
          <motion.div
            className="sc-scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.4 }}
          />
          <motion.div
            ref={ref}
            className={`sc tone-${story.tone}`}
            style={{ width: size.w, height: size.h }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sc-title"
            initial={reduced ? { opacity: 0 } : { ...flip, rotate: -2, opacity: 1 }}
            animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { ...flip, rotate: -2, opacity: [1, 1, 0] }}
            transition={reduced ? { duration: 0.2 } : { duration: GROW, ease: EASE, opacity: { duration: GROW, times: [0, 0.85, 1] } }}
          >
            {/* the piece's own colour, fading into the card */}
            {!reduced && (
              <motion.span
                className="sc-from"
                aria-hidden="true"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 1, transition: { duration: GROW * 0.5, ease: "easeOut" } }}
                transition={{ duration: 0.36, delay: GROW * 0.45, ease: "easeOut" }}
              />
            )}

            <button type="button" className="sc-close" onClick={onClose} aria-label="Close story" data-autofocus>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="sc-grid thin-scroll">
              <div className="sc-left thin-scroll">
                <motion.figure className="sc-polaroid" {...rev()}>
                  <div className="sc-photo">{Art && <Art />}</div>
                  <figcaption className="sc-tag">
                    {story.tag} <span>· {story.status}</span>
                  </figcaption>
                </motion.figure>
                <motion.h2 id="sc-title" className="sc-title" {...rev()}>
                  {story.title}
                </motion.h2>
                <motion.p className="sc-hook" {...rev()}>
                  {story.hook}
                </motion.p>
                <motion.ul className="sc-stats" aria-label="Key numbers" {...rev()}>
                  {story.stats.map((st) => (
                    <li key={st.label}>
                      <strong>{st.value}</strong> {st.label}
                    </li>
                  ))}
                </motion.ul>
                {link && (
                  <motion.div className="sc-links" {...rev()}>
                    {link.url ? (
                      <a className="btn-pill" href={link.url} target="_blank" rel="noopener">
                        {link.label} <span aria-hidden="true">↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <button type="button" className="btn-pill sc-soon" disabled>
                        {link.soon}
                      </button>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="sc-rwrap">
              <div className="sc-right thin-scroll" tabIndex={0} aria-label="The story">
                {story.sections.map((sec) => (
                  <section key={sec.label} className="sc-sec">
                    <motion.h3 {...rev()}>{sec.label}</motion.h3>
                    {sec.body.map((p, i) => (
                      <motion.p key={i} {...rev()}>
                        {p}
                      </motion.p>
                    ))}
                  </section>
                ))}
              </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
