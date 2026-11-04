/* The landing page: a dark top bar like the demos', a centred summary of vllm-sr with the request flow, the API key
 * that a demo needs before it opens (see apiKey.ts), one card per demo from demos.ts, and tiles to explore further.
 * Facts here are checked against the Decision API / MoM docs and the vllm-sr Hugging Face model cards (see README.md). */
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowUpRight, BookOpen, Brain, ChevronRight, FlaskConical, Sailboat, Scan, ShieldCheck, Sparkles, Plus, KeyRound, Layers, MessageSquareText, Route, SlidersHorizontal } from "lucide-react";
import { ThemeSwitch, type Theme } from "./components/arc/theme-switch/theme-switch";
import { PasswordField } from "./components/arc/password-field/password-field";
import { Dialog, DialogClose, DialogContent } from "./components/arc/dialog/dialog";
import { checkKey, loadKey, saveKey, type KeyProblem } from "./apiKey";
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

const SPACES = "https://huggingface.co/spaces/vllm-sr";
const COLLECTIONS = "https://huggingface.co/collections/vllm-sr";

/** Tiles under the demos: the vllm-sr Spaces on Hugging Face, then the model collections and docs.
 *  Descriptions follow each Space's or collection's own Hugging Face summary. */
const EXPLORE = [
  {
    label: "More demos on Hugging Face",
    links: [
      { icon: Sparkles, title: "Decision 3.0", text: "Try the D3 decision models live, on your own text and images.", href: `${SPACES}/Decision-3.0` },
      { icon: Scan, title: "Decision Box gallery", text: "Find one figure in a crowded painting, live on D3.", href: `${SPACES}/Decision-Box` },
      { icon: FlaskConical, title: "Decision 2.0 studio", text: "One pass, many decisions, across six Decision 2.0 models.", href: `${SPACES}/decision-studio` },
      { icon: ShieldCheck, title: "Vela 3.0 studio", text: "Point at it, extract it, check it, with a small encoder on CPU.", href: `${SPACES}/vela3-studio` },
    ],
  },
  {
    label: "Models and docs",
    links: [
      { icon: Brain, title: "D3 models", text: "The Decision 3.0 family on Hugging Face, from edge to ultra.", href: `${COLLECTIONS}/decision-30-6aca5f47b0d942380f6e4a64` },
      { icon: Sailboat, title: "Vela models", text: "Open routing models, 0.3B to 27B: the router's decisions in one call.", href: `${COLLECTIONS}/vela-30-6ad1c430eb1718eb4754edcd` },
      { icon: BookOpen, title: "API docs", text: "Requests, question types, keys and limits for the Decision API and MoM.", href: "https://app.vllm-sr.ai/docs" },
      { icon: Route, title: "vLLM Semantic Router", text: "Get a free key and try the hosted APIs in the browser.", href: "https://app.vllm-sr.ai/" },
    ],
  },
];

/** The request flow, left to right, with lit chevrons between the steps. */
const FLOW = [
  { icon: MessageSquareText, title: "Request", text: "Text, an image or a video" },
  { icon: Route, title: "Semantic Router", text: "Reads each request by what it means" },
  { icon: Brain, title: "D3 and Vela", text: "Answer typed questions with probabilities" },
  { icon: SlidersHorizontal, title: "Your rules", text: "Thresholds in code pick the path" },
  { icon: Layers, title: "LLM, when needed", text: "Only what passed reaches it" },
];

const KEY_PROBLEMS: Record<KeyProblem, { title: string; text: string }> = {
  missing: { title: "Add your API key first", text: "The demos run on the hosted vllm-sr models and need a key. Paste yours in the API key field, or get a free one." },
  invalid: { title: "That API key did not work", text: "Check that you copied the whole key and try again, or get a new one." },
};

export function App() {
  const [theme, setTheme] = useTheme();
  const config = useConfig();
  const [apiKey, setApiKey] = useState(loadKey);
  const [problem, setProblem] = useState<KeyProblem | null>(null);
  const [lastProblem, setLastProblem] = useState<KeyProblem>("missing");
  const keyInput = useRef<HTMLInputElement>(null);
  const keyUrl = config?.apiKeyUrl ?? DEFAULTS.apiKeyUrl;

  /** A demo opens only with a key that passes; otherwise the link is held back and the dialog says why. */
  const onOpenDemo = (e: MouseEvent<HTMLAnchorElement>) => {
    const p = checkKey(apiKey);
    if (!p) return;
    e.preventDefault();
    setProblem(p);
    setLastProblem(p);
  };

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
          <h1 id="title">Decision models in front of your LLMs</h1>
          <p className={styles.lead}>
            vLLM Semantic Router reads every request before an LLM does. Its decision models, D3 and Vela, answer typed
            questions about the request as probabilities, from one forward pass and no generated text. Your code sets the
            thresholds, so bad inputs and attacks stop early and only the work that needs a large model reaches one.
          </p>
          <div className={styles.flow}>
            <ol className={styles.flowList} aria-label="How a request flows">
            {FLOW.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className={styles.step}>
                <span className={styles.node}><Icon size={18} strokeWidth={1.75} aria-hidden="true" /></span>
                <span className={styles.stepTitle}>{title}</span>
                <span className={styles.stepText}>{text}</span>
                {i < FLOW.length - 1 && (
                  <span className={styles.arrows} aria-hidden="true">
                    {[0, 1, 2].map((k) => <ChevronRight key={k} size={18} strokeWidth={2} style={{ "--k": i * 3 + k } as CSSProperties} />)}
                  </span>
                )}
              </li>
            ))}
            </ol>
          </div>
        </section>

        {/* API KEY: checked before a demo opens (apiKey.ts) and kept for this tab. Not sent to the demos yet. */}
        <section className={styles.keySection} aria-label="API key">
          <form className={styles.key} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.keyField}>
              <PasswordField ref={keyInput} label="Your API key" name="api-key" placeholder="Paste a vllm-sr API key" autoComplete="off" spellCheck={false}
                value={apiKey} aria-invalid={problem ? true : undefined}
                onChange={(e) => { setApiKey(e.target.value); saveKey(e.target.value.trim()); setProblem(null); }}
                messages={{ showPassword: "Show key", hidePassword: "Hide key" }} />
            </div>
            <a className={styles.keyLink} href={keyUrl} target="_top">
              <KeyRound size={16} strokeWidth={1.75} aria-hidden="true" />Get API key<ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </form>
          <p className={styles.keyNote}>The demos need a key. One free key works for both the Decision API and MoM.</p>
        </section>

        <section className={styles.section} aria-labelledby="demos-title">
          <div className={styles.sectionHead}>
            <h2 id="demos-title">Live demos</h2>
            <p className={styles.sub}>Each demo shows every decision as it happens, with the model, time and probabilities.</p>
          </div>
          <div className={styles.grid}>
            {DEMOS.map((d) => {
              const url = config?.urls[d.id];
              return <DemoCard key={d.id} demo={d} href={url ? withTheme(url, theme) : null} image={config?.images[d.id] ?? ""} onOpen={onOpenDemo} />;
            })}
            {DEMOS.length % 3 !== 0 && <div className={cardStyles.soon}><Plus size={18} strokeWidth={1.75} aria-hidden="true" />More demos soon</div>}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="explore-title">
          <div className={styles.sectionHead}>
            <h2 id="explore-title">Explore more</h2>
            <p className={styles.sub}>Other vllm-sr demos on Hugging Face, the models behind them and the docs.</p>
          </div>
          {EXPLORE.map((g) => (
            <div key={g.label} className={styles.exploreGroup}>
              <h3 className={styles.groupTitle}>{g.label}</h3>
              <ul className={styles.tiles}>
                {g.links.map(({ icon: Icon, title, text, href }) => (
                  <li key={title}>
                    <a className={styles.tile} href={href} target="_top">
                      <span className={styles.tileIcon}><Icon size={18} strokeWidth={1.75} aria-hidden="true" /></span>
                      <span className={styles.tileTitle}>{title}<ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" className={styles.tileArrow} /></span>
                      <span className={styles.tileText}>{text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </main>

      <footer className={styles.footer}>
        <span>vLLM Semantic Router demos</span>
        <span>The hosted APIs are free for research and evaluation.</span>
      </footer>

      <Dialog open={problem !== null} onOpenChange={(open) => { if (!open) setProblem(null); }}>
        <DialogContent title={KEY_PROBLEMS[problem ?? lastProblem].title} description={KEY_PROBLEMS[problem ?? lastProblem].text}
          onCloseAutoFocus={(e) => { e.preventDefault(); keyInput.current?.focus(); }}>
          <div className={styles.dialogActions}>
            <a className={styles.keyLink} href={keyUrl} target="_top">
              <KeyRound size={16} strokeWidth={1.75} aria-hidden="true" />Get API key<ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
            </a>
            <DialogClose className={styles.dialogPrimary}>Enter key</DialogClose>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
