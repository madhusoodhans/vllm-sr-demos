/* Small drawn previews for the demo cards: what each demo does at a glance, until a screenshot is set in config.json.
 * Purely decorative (aria-hidden); a demo without one falls back to its title initial. */
import type { ReactNode } from "react";
import { Check, ShieldCheck } from "lucide-react";
import styles from "./Previews.module.css";

function ReceiptPreview() {
  return (
    <div className={styles.receiptScene}>
      <div className={styles.paper}>
        <span className={styles.paperHead} />
        {[72, 54, 64, 46].map((w, i) => <span key={i} className={styles.paperLine} style={{ width: `${w}%` }} />)}
        <span className={styles.paperTotal} />
      </div>
      <ul className={styles.checks}>
        {["Receipt", "Readable", "No added text"].map((c) => (
          <li key={c}><Check size={12} strokeWidth={2} />{c}</li>
        ))}
      </ul>
    </div>
  );
}

function ReturnsPreview() {
  return (
    <div className={styles.chatScene}>
      <span className={`${styles.bubble} ${styles.customer}`}>My kettle arrived cracked</span>
      <span className={styles.decision}><ShieldCheck size={12} strokeWidth={2} />In policy</span>
      <span className={`${styles.bubble} ${styles.agent}`}>A refund is on its way</span>
    </div>
  );
}

const PREVIEWS: Record<string, () => ReactNode> = { receipt: ReceiptPreview, returns: ReturnsPreview };

export function Preview({ id, title }: { id: string; title: string }) {
  const Drawn = PREVIEWS[id];
  return <div className={styles.preview} aria-hidden="true">{Drawn ? <Drawn /> : <span className={styles.initial}>{title.charAt(0)}</span>}</div>;
}
