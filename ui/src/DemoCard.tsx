/* One demo card: a tinted preview (or a screenshot from config.json), title, one-line summary, models, and
 * "Show more" that opens the steps over the preview. The link opens the demo in the same tab, carrying the theme. */
import { useId, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motionTokens } from "./components/arc/lib/motion-tokens";
import type { Demo } from "./demos";
import { Preview } from "./Previews";
import styles from "./DemoCard.module.css";

/** onOpen runs before the link is followed; it may call preventDefault (no API key yet). */
export function DemoCard({ demo, href, image, onOpen }: { demo: Demo; href: string | null; image: string; onOpen?: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const panelId = useId();
  const titleId = `demo-${demo.id}`;
  return (
    <article className={styles.card} aria-labelledby={titleId} data-tone={demo.tone}>
      {/* IMAGE SLOT: set "<id>Image" in config.json (for example "images/receipt.png", next to index.html) to show a screenshot. */}
      <div className={styles.media} data-image-slot={demo.id}>
        {image ? <img src={image} alt={`${demo.title} screenshot`} loading="lazy" decoding="async" /> : <Preview id={demo.id} title={demo.title} />}
      </div>
      {/* "Show more" opens the steps over the preview and summary (the buttons stay), so the card keeps its size and the page stays one screen. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={panelId} className={styles.more}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={reduced ? { duration: 0 } : { y: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
            <ol className={styles.steps}>
              {demo.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 id={titleId} className={styles.title}>{demo.title}</h3>
          <ul className={styles.models} aria-label="Decision models">
            {demo.models.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
        <p className={styles.summary}>{demo.summary}</p>
        <div className={styles.footer}>
          <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
            {open ? "Show less" : "Show more"}
            <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" className={styles.chevron} />
          </button>
          {/* target="_top": on a Hugging Face Space the page runs in an iframe, and this leaves it for the demo. */}
          <a className={styles.cta} href={href ?? undefined} target="_top" aria-disabled={href ? undefined : true} data-demo={demo.id} onClick={onOpen}
            aria-label={`${demo.action}: ${demo.title}`}>
            {demo.action}<ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
