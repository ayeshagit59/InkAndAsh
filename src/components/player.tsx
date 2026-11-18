import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { coverClip } from "../content/site";

// One shared clip (`coverClip` in site.ts): the turntable, the equaliser and the sticky pill all read this.
// Never autoplays. The duration comes from the file itself. If the file is missing or can't be played,
// `missing` is true and the UI hides its controls and shows "Clip coming soon".
type PlayerState = {
  playing: boolean;
  muted: boolean;
  missing: boolean;
  started: boolean; // true once the visitor has pressed play at least once
  progress: number; // 0..1
  duration: number; // seconds, 0 until the file's metadata has loaded
  toggle: () => void;
  stop: () => void;
  toggleMute: () => void;
};

const Ctx = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [missing, setMissing] = useState(false);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = new Audio();
    el.preload = "metadata";
    el.src = coverClip.src;
    const onErr = () => setMissing(true);
    const onMeta = () => (Number.isFinite(el.duration) && el.duration > 0 ? setDuration(el.duration) : setMissing(true));
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onTime = () => el.duration && setProgress(el.currentTime / el.duration);
    el.addEventListener("error", onErr);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    el.addEventListener("timeupdate", onTime);
    audio.current = el;
    return () => {
      el.pause();
      el.removeEventListener("error", onErr);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const toggle = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(
        () => {
          setPlaying(true);
          setStarted(true);
        },
        (err: DOMException) => {
          setPlaying(false);
          if (err?.name === "NotSupportedError") setMissing(true);
        },
      );
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setPlaying(false);
    setProgress(0);
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  useEffect(() => {
    if (audio.current) audio.current.muted = muted;
  }, [muted]);

  const value = useMemo(
    () => ({ playing, muted, missing, started, progress, duration, toggle, stop, toggleMute }),
    [playing, muted, missing, started, progress, duration, toggle, stop, toggleMute],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePlayer outside PlayerProvider");
  return v;
}
