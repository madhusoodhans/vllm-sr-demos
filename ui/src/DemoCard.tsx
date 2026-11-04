/* One demo: image slot, what it does, which decision model it uses, and a link that opens the demo in the same tab. */
import type { ComponentType } from "react";
import { ArrowRight, type LucideProps } from "lucide-react";
import styles from "./DemoCard.module.css";

export interface DemoCardProps {
  /** Names the image slot ("receipt" or "returns"); its path comes from config.json (`receiptImage`, `returnsImage`). */
  slot: string;
  title: string;
  summary: string;
  steps: string[];
  models: string;
  /** The demo's URL from config.json; null while the config loads. */
  href: string | null;
  /** Screenshot path or URL; empty shows the placeholder illustration. */
  image: string;
  action: string;
  placeholder: ComponentType<LucideProps>[];
}

export function DemoCard({ slot, title, summary, steps, models, href, image, action, placeholder }: DemoCardProps) {
  const id = `demo-${slot}`;
  return (
    <article className={styles.card} aria-labelledby={id}>
      {/* IMAGE SLOT: set "<slot>Image" in config.json (for example "images/receipt.png", next to index.html) to show a screenshot here. */}
      <div className={styles.media} data-image-slot={slot}>
        {image ? (
          <img src={image} alt={`${title} screenshot`} loading="lazy" decoding="async" />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            {placeholder.map((Icon, i) => (
              <span key={i} className={styles.phItem}>
                {i > 0 && <ArrowRight size={16} strokeWidth={1.75} className={styles.phArrow} />}
                <span className={styles.phIcon}><Icon size={24} strokeWidth={1.75} /></span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 id={id} className={styles.title}>{title}</h3>
        <p className={styles.summary}>{summary}</p>
        <ol className={styles.steps}>
          {steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <div className={styles.footer}>
          <span className={styles.models}>{models}</span>
          {/* target="_top": the same tab; on a Hugging Face Space the page runs in an iframe, and this leaves it for the demo. */}
          <a className={styles.cta} href={href ?? undefined} target="_top" aria-disabled={href ? undefined : true} data-demo={slot}>
            {action}<ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
