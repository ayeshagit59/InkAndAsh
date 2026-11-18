import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// House style for revealing cards (reference C): each item comes from blur to sharp while rising a few pixels,
// staggered ~120ms. Plays once, when the group scrolls into view.
const EASE = [0.22, 1, 0.36, 1] as const;

export const revealGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(12px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.85, ease: EASE } },
};

type Props = { as?: "ul" | "div" | "ol"; className?: string; children: ReactNode; amount?: number };

export function RevealGroup({ as = "div", className, children, amount = 0.2 }: Props) {
  const reduced = useReducedMotion();
  const M = motion[as];
  return (
    <M className={className} variants={revealGroup} initial={reduced ? false : "hidden"} whileInView="show" viewport={{ once: true, amount }}>
      {children}
    </M>
  );
}

/** Section content: fades and rises ~24px as it enters. */
export function FadeUp({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
