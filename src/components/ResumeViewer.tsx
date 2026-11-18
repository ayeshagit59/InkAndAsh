import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import resumePages from "../content/resume-pages.json";
import { site } from "../content/site";
import { useDialog } from "./useDialog";

const RESUME_ALT =
  "Ayesha Ashraf Sultana's one-page resume. Education: Indian School of Business, PGP in Information Systems, 2026 to 2027; " +
  "GITAM, B.Tech in Computer Science, CGPA 9.34 of 10. Work: Deloitte USI, Senior Analyst, IT Application Development, " +
  "June 2025 to April 2026, and Analyst, June 2022 to May 2025; internships at Deloitte USI and Talent Serve. " +
  "Also lists awards, hackathon wins, certifications and interests. Open the PDF for selectable text.";

export function ResumeViewer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useDialog(ref, open, onClose);
  useEffect(() => {
    if (!open) {
      setZoom(false);
      setBlocked(false);
    }
  }, [open]);

  // Both buttons are plain links to the PDF. Inside a framed preview (which may block new tabs and downloads)
  // we also show a short note, without stopping the link, so a blocked click never fails silently.
  const noteIfFramed = () => {
    let framed = true;
    try {
      framed = window.self !== window.top;
    } catch {
      framed = true;
    }
    if (framed) setBlocked(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="resume-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="resume-scrim" onClick={onClose} />
          <motion.div
            ref={ref}
            className="resume"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-title"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="resume-bar">
              <h2 id="resume-title">Resume</h2>
              <div className="resume-actions">
                <a
                  className="btn-pill btn-pill--quiet"
                  href={site.resumeUrl}
                  target="_blank"
                  rel="noopener"
                  onClick={noteIfFramed}
                >
                  Open PDF
                </a>
                <a
                  className="btn-pill"
                  href={site.resumeUrl}
                  download="Ayesha-Ashraf-Sultana-Resume.pdf"
                  onClick={noteIfFramed}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 4v11m0 0 5-5m-5 5-5-5M5 20h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Download
                </a>
                <button
                  type="button"
                  className="drawer-close"
                  onClick={onClose}
                  aria-label="Close resume"
                  data-autofocus
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 6l12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {blocked && (
              <p className="resume-blocked" role="status">
                If nothing opened, this preview is blocking new tabs and downloads. Both work when the site is open in its own browser tab.
              </p>
            )}
            {/* the PDF, pre-rendered to an image at build time (npm run resume), so it shows inside sandboxed frames too */}
            <div
              className="resume-scroll thin-scroll"
              tabIndex={0}
              aria-label="Resume, scrollable"
            >
              <button
                type="button"
                className="resume-zoom"
                aria-pressed={zoom}
                onClick={() => setZoom((z) => !z)}
                aria-label={zoom ? "Zoom out" : "Zoom in to read"}
              >
                {resumePages.map((pg, i) => (
                  <img
                    key={pg.full}
                    className="resume-page"
                    src={`${import.meta.env.BASE_URL}${pg.full}`}
                    srcSet={`${import.meta.env.BASE_URL}${pg.small} 900w, ${import.meta.env.BASE_URL}${pg.full} ${pg.width}w`}
                    sizes="(max-width: 640px) 100vw, 940px"
                    width={pg.width}
                    height={pg.height}
                    alt={i === 0 ? RESUME_ALT : `Resume, page ${i + 1}`}
                  />
                ))}
              </button>
              <p className="resume-hint">
                {zoom
                  ? "Tap the page to zoom out."
                  : "Tap the page to zoom in."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
