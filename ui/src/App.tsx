/* The landing page, one screen: a dark top bar like the demos', a short summary of vllm-sr with the request flow,
 * an API key field (not wired yet), and one card per demo from demos.ts.
 * Facts here are checked against the Decision API / MoM docs and the vllm-sr Hugging Face model cards (see README.md). */
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight, Brain, Plus, KeyRound, Layers, MessageSquareText, Route, SlidersHorizontal } from "lucide-react";
import { ThemeSwitch, type Theme } from "./components/arc/theme-switch/theme-switch";
import { PasswordField } from "./components/arc/password-field/password-field";
import { DemoCard } from "./DemoCard";
import { DEMOS } from "./demos";
import { DEFAULTS, loadConfig, withTheme, type SiteConfig } from "./config";
import styles from "./App.module.css";
import cardStyles from "./DemoCard.module.css";

const HF = "https://huggingface.co/vllm-sr";
const DECISION = "https://decision.vllm-sr.ai";
const MOM = "https://mom.vllm-sr.ai";

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(() => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"));
  const setTheme = (t: Theme) => {
    const apply = () => { document.documentElement.dataset.theme = t; setThemeState(t); };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition && !reduce) doc.startViewTransition(apply); else apply();
    try { localStorage.setItem("theme", t); } catch { /* private window */ }
  };
  return [theme, setTheme];
}

function useConfig(): SiteConfig | null {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  useEffect(() => { loadConfig().then(setConfig, () => setConfig(DEFAULTS)); }, []);
  return config;
}

/** The request flow, left to right. A pulse runs along the line and lights each step as it passes. */
const FLOW = [
  { icon: MessageSquareText, title: "Request", text: "Text, an image or a video" },
  { icon: Route, title: "Semantic Router", text: "Reads each request by what it means" },
  { icon: Brain, title: "D3 and Vela", text: "Answer typed questions with probabilities" },
  { icon: SlidersHorizontal, title: "Your rules", text: "Thresholds in code pick the path" },
  { icon: Layers, title: "LLM, when needed", text: "Only what passed reaches it" },
];

export function App() {
  const [theme, setTheme] = useTheme();
  const config = useConfig();

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <span className={styles.brand}><Route size={18} strokeWidth={1.75} aria-hidden="true" />vLLM Semantic Router demos</span>
        <nav className={styles.barLinks} aria-label="Hosted APIs">
          <a href={DECISION} target="_top">Decision API</a>
          <a href={MOM} target="_top">MoM</a>
          <a href={HF} target="_top">Models</a>
        </nav>
        <ThemeSwitch theme={theme} iconOnly variant="rise" onThemeChange={(next) => setTheme(next)} />
      </header>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="title">
          <div className={styles.intro}>
            <h1 id="title">Decision models in front of your LLMs</h1>
            <p className={styles.lead}>
              vLLM Semantic Router reads every request before an LLM does. Its decision models, D3 and Vela, answer typed
              questions about the request as probabilities, from one forward pass and no generated text. Your code sets the
              thresholds, so bad inputs and attacks stop early and only the work that needs a large model reaches one.
            </p>
          </div>
          <div className={styles.flow}>
            <span className={styles.track} aria-hidden="true"><span className={styles.pulse} /></span>
            <ol className={styles.flowList} aria-label="How a request flows">
            {FLOW.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className={styles.step} style={{ "--i": i } as CSSProperties}>
                <span className={styles.node}><Icon size={18} strokeWidth={1.75} aria-hidden="true" /></span>
                <span className={styles.stepTitle}>{title}</span>
                <span className={styles.stepText}>{text}</span>
              </li>
            ))}
            </ol>
          </div>
        </section>

        <section className={styles.demos} aria-labelledby="demos-title">
          <div className={styles.demosHead}>
            <div className={styles.demosTitle}>
              <h2 id="demos-title">Live demos</h2>
              <p className={styles.sub}>Each demo shows every decision as it happens, with the model, time and probabilities.</p>
            </div>
            {/* API KEY: a placeholder for now. Not stored or sent anywhere until the demos take a visitor's own key. */}
            <form className={styles.key} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.keyField}>
                <PasswordField label="Your API key" name="api-key" placeholder="Paste a vllm-sr API key" autoComplete="off" spellCheck={false}
                  messages={{ showPassword: "Show key", hidePassword: "Hide key" }} />
              </div>
              <a className={styles.keyLink} href={config?.apiKeyUrl ?? DEFAULTS.apiKeyUrl} target="_top">
                <KeyRound size={16} strokeWidth={1.75} aria-hidden="true" />Get API key<ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </form>
          </div>
          <div className={styles.grid}>
            {DEMOS.map((d) => {
              const url = config?.urls[d.id];
              return <DemoCard key={d.id} demo={d} href={url ? withTheme(url, theme) : null} image={config?.images[d.id] ?? ""} />;
            })}
            {DEMOS.length % 3 !== 0 && <div className={cardStyles.soon}><Plus size={18} strokeWidth={1.75} aria-hidden="true" />More demos soon</div>}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>The hosted APIs are free for research and evaluation.</span>
        <span>One key works for the Decision API and MoM.</span>
      </footer>
    </div>
  );
}
