import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { coverClip } from "../content/site";
import { Equalizer, SpeakerIcon } from "./MusicCoffee";
import { usePlayer } from "./player";
import { PlayIcon, TinyCD } from "./Props";

// Sticky "now playing" pill. Appears only once the clip has started; never if the file is missing.
export function MiniPlayer() {
  const { playing, muted, missing, started, toggle, stop, toggleMute } = usePlayer();
  const [closed, setClosed] = useState(false);
  const show = started && !missing && !closed;

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          className={`mini${playing ? " mini--on" : ""}`}
          aria-label="Now playing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <TinyCD className="mini-disc" />
          <div className="mini-text">
            <span className="mini-kicker">{playing ? "Now playing" : "Paused"}</span>
            <span className="mini-title">{[coverClip.title, "cover by Ayesha"].filter(Boolean).join(" · ")}</span>
          </div>
          <Equalizer active={playing} />
          <button type="button" className="mini-btn" onClick={toggle} aria-label={playing ? "Pause" : "Play"} aria-pressed={playing}>
            <PlayIcon playing={playing} />
          </button>
          <button type="button" className="mini-btn mini-btn--ghost" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} aria-pressed={muted}>
            <SpeakerIcon muted={muted} />
          </button>
          <button
            type="button"
            className="mini-btn mini-btn--ghost"
            onClick={() => {
              stop();
              setClosed(true);
            }}
            aria-label="Stop and close the player"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
