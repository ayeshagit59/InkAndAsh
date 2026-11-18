// The night sky behind the hero. Colour clouds are the paintings themselves:
// each one saturated and heavily blurred ahead of time (public/hero, from scripts/bake-clouds.mjs), so the hero
// glows in her palette. The browser only moves these images; a live CSS blur here made every frame very slow.
// The layer fades out at the bottom so the hero melts into the page canvas below.
const CLOUDS = [
  { slug: "14-materialistic-gifts", cls: "cloud-1" },
  { slug: "15-the-northern-lights", cls: "cloud-2" },
  { slug: "03-charminar-splash", cls: "cloud-3" },
  { slug: "06-lantern-city", cls: "cloud-4" },
];

export function CosmicBackdrop() {
  return (
    <div className="cosmos" aria-hidden="true">
      {CLOUDS.map((c) => (
        <div key={c.slug} className={`cloud ${c.cls}`} style={{ backgroundImage: `url(${import.meta.env.BASE_URL}hero/cloud-${c.slug}.webp)` }} />
      ))}
      <div className="cloud cloud-tint-a" />
      <div className="cloud cloud-tint-b" />
      <div className="stars" />
      <div className="stars stars--far" />
      <div className="cosmos-grain" />
    </div>
  );
}
