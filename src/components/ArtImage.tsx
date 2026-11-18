import { useState } from "react";
import { artMetaFor, artSrc, artSrcSet, bySlug } from "../content/art";

type Props = {
  slug: string;
  sizes: string;
  className?: string;
  eager?: boolean;
  /** decorative copies (e.g. repeated in the hero scatter) pass alt="" */
  alt?: string;
  /** object-position override, e.g. the art tiles' hand-picked strip */
  position?: string;
  /** fallback `src` width for browsers without srcset */
  src?: 400 | 800 | 1200;
};

export function ArtImage({ slug, sizes, className, eager, alt, position, src }: Props) {
  const p = bySlug[slug];
  const m = artMetaFor(slug);
  // the blurred placeholder sits behind the image only until the real file has decoded
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      className={className}
      src={artSrc(slug, src ?? 800)}
      srcSet={artSrcSet(slug)}
      sizes={sizes}
      width={m.width}
      height={m.height}
      alt={alt ?? p.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onLoad={() => setLoaded(true)}
      ref={(n) => {
        if (n?.complete && n.naturalWidth && !loaded) setLoaded(true);
      }}
      style={{
        objectPosition: position ?? p.focus ?? "50% 50%",
        backgroundImage: loaded ? undefined : `url(${m.lqip})`,
        backgroundSize: "cover",
      }}
    />
  );
}
