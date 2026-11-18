import { MotionConfig } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { About } from "./components/About";
import { ArtTeaser } from "./components/ArtTeaser";
import { Atmosphere, PageCanvas } from "./components/Atmosphere";
import { BrushCursor } from "./components/BrushCursor";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { Hero } from "./components/Hero";
import { MiniPlayer } from "./components/MiniPlayer";
import { MusicCoffee } from "./components/MusicCoffee";
import { Nav } from "./components/Nav";
import { PlayerProvider } from "./components/player";
import { ResumeViewer } from "./components/ResumeViewer";
import { SelectedWork } from "./components/SelectedWork";

// Hash routing, so it works on any static host and inside the sandboxed preview: "#/gallery" is the gallery,
// anything else (including "#about" style section links) is the home page.
const isGallery = () => window.location.hash.startsWith("#/gallery");

function useRoute() {
  const [gallery, setGallery] = useState(isGallery);
  useEffect(() => {
    const on = () => setGallery(isGallery());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return gallery ? "gallery" : "home";
}

export function App() {
  const [resumeOpen, setResumeOpen] = useState(false);
  const closeResume = useCallback(() => setResumeOpen(false), []);
  const route = useRoute();
  const prev = useRef(route);

  // entering the gallery starts at the top; leaving it (Back button or link) lands on the Art section
  useLayoutEffect(() => {
    if (prev.current === route) return;
    if (route === "gallery") window.scrollTo(0, 0);
    else {
      const id = window.location.hash.slice(1);
      const target = (id && document.getElementById(id)) || document.getElementById("art");
      target?.scrollIntoView({ block: "start" });
    }
    prev.current = route;
  }, [route]);

  return (
    <MotionConfig reducedMotion="user">
      <PlayerProvider>
        {route === "gallery" ? (
          <Gallery />
        ) : (
          <>
            <a className="skip-link" href="#about">
              Skip to content
            </a>
            <Nav onResume={() => setResumeOpen(true)} />
            <div className="page">
              <PageCanvas />
              <Atmosphere />
              <main id="main">
                <Hero />
                <About />
                <SelectedWork />
                <ArtTeaser />
                <MusicCoffee />
              </main>
              <Footer />
            </div>
          </>
        )}
        <MiniPlayer />
        <ResumeViewer open={resumeOpen} onClose={closeResume} />
        <BrushCursor />
      </PlayerProvider>
    </MotionConfig>
  );
}
