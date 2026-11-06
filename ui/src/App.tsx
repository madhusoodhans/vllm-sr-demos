/* The landing page: a dark top bar like the demos', a centred summary of vllm-sr with the request flow, the API key
 * that a demo needs before it opens (see apiKey.ts), one card per demo from demos.ts, and tiles to explore further.
 * Facts here are checked against the Decision API / MoM docs and the vllm-sr Hugging Face model cards (see README.md). */
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowUpRight, BookOpen, Brain, ChevronRight, CircleAlert, CircleCheck, FlaskConical, Sailboat, Scan, ShieldCheck, Sparkles, Plus, KeyRound, Layers, MessageSquareText, Route, SlidersHorizontal } from "lucide-react";
import { ThemeSwitch, type Theme } from "./components/arc/theme-switch/theme-switch";
import { PasswordField } from "./components/arc/password-field/password-field";
import { Dialog, DialogClose, DialogContent } from "./components/arc/dialog/dialog";
import { Button } from "./components/arc/button/button";
import { checkKey, forgetKey, formatProblem, loadKey, loadKeyOk, saveKey, withKey, type KeyProblem } from "./apiKey";
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

/** The dialog shown when "Open demo" is held back. */
function problemDialog(p: KeyProblem): { title: string; text: string } {
  if (p.code === "missing") return { title: "Add your API key first", text: "The demos run on the hosted vllm-sr models and need a key. Paste yours in the API key field, or get a free one." };
  if (p.code === "check_down" || p.code === "unreachable" || p.code === "error" || p.code === "rate_limited") return { title: "Could not check your API key", text: p.message };
  return { title: "That API key did not work", text: p.message };
}

/** Idle (not checked yet), checking, ok, or a problem from apiKey.ts. */
type KeyStatus = { state: "idle" } | { state: "checking" } | { state: "ok" } | { state: "problem"; problem: KeyProblem };

/** Opens the demo. A demo on this origin (all three apps in one Space) opens in this frame, so a Hugging Face Space
 * page keeps its frame (and a private Space its sign-in); a demo on another origin leaves the frame, like target="_top". */
function go(url: string) {
  let sameOrigin = false;
  try { sameOrigin = new URL(url, location.href).origin === location.origin; } catch { /* not a URL: leave the frame */ }
  if (sameOrigin) { location.href = url; return; }
  try { (window.top ?? window).location.href = url; } catch { location.href = url; }
}

export function App() {
  const [theme, setTheme] = useTheme();
  const config = useConfig();
  const [apiKey, setApiKey] = useState(loadKey);
  const [status, setStatus] = useState<KeyStatus>(() => (loadKeyOk() ? { state: "ok" } : { state: "idle" }));
  const [problem, setProblem] = useState<KeyProblem | null>(null);
  const [lastProblem, setLastProblem] = useState<KeyProblem>({ code: "missing", message: "" });
  const keyInput = useRef<HTMLInputElement>(null);
  const pending = useRef<AbortController | null>(null);
  const keyUrl = config?.apiKeyUrl ?? DEFAULTS.apiKeyUrl;
  const checkUrl = config?.keyCheckUrl ?? DEFAULTS.keyCheckUrl;

  /** Format here, then the live check through a demo backend. Resolves true when the key works. */
  const runCheck = async (): Promise<KeyProblem | null> => {
    pending.current?.abort();
    const ctrl = new AbortController();
    pending.current = ctrl;
    const key = apiKey.trim();
    const local = formatProblem(key);
    if (local) { setStatus({ state: "problem", problem: local }); return local; }
    setStatus({ state: "checking" });
    try {
      const p = await checkKey(key, checkUrl, ctrl.signal);
      if (pending.current !== ctrl) return p;
      pending.current = null;
      saveKey(key, !p);
      setStatus(p ? { state: "problem", problem: p } : { state: "ok" });
      return p;
    } catch {
      return null; // aborted: a newer check or an edit took over
    }
  };

  const showProblem = (p: KeyProblem) => { setProblem(p); setLastProblem(p); };

  /** A demo opens only with a key that passed the live check. Checked: the key rides in the URL fragment (never the
   *  query) so it reaches the demo page but no server. Not checked yet: hold the link, check, then go. */
  const onOpenDemo = (e: MouseEvent<HTMLAnchorElement>) => {
    const link = e.currentTarget;
    const key = apiKey.trim();
    if (status.state === "ok" && key) {
      const plain = link.href;
      link.href = withKey(plain, key);
      setTimeout(() => { link.href = plain; }, 0); // the key does not stay in the page's links
      return;
    }
    e.preventDefault();
    if (!key) { showProblem(formatProblem("")!); return; }
    if (status.state === "checking") return;
    const target = link.href;
    runCheck().then((p) => {
      if (p) showProblem(p);
      else go(withKey(target, key));
    });
  };

  const onForget = () => {
    pending.current?.abort();
    pending.current = null;
    forgetKey();
    setApiKey("");
    setStatus({ state: "idle" });
    keyInput.current?.focus();
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

        {/* API KEY: checked here (format) and through a demo backend (live), kept for this tab, handed to a demo in the URL fragment. */}
        <section className={styles.keySection} aria-label="API key">
          <form className={styles.key} onSubmit={(e) => { e.preventDefault(); void runCheck(); }}>
            <div className={styles.keyField}>
              <PasswordField ref={keyInput} label="Your API key" name="api-key" placeholder="Paste a vllm-sr API key" autoComplete="off" spellCheck={false}
                value={apiKey} aria-invalid={status.state === "problem" ? true : undefined} aria-describedby="key-status"
                onChange={(e) => { pending.current?.abort(); pending.current = null; setApiKey(e.target.value); saveKey(e.target.value.trim()); setStatus({ state: "idle" }); setProblem(null); }}
                messages={{ showPassword: "Show key", hidePassword: "Hide key" }} />
            </div>
            <Button type="submit" variant="primary" loading={status.state === "checking"}>{status.state === "checking" ? "Checking" : "Check key"}</Button>
            <a className={styles.keyLink} href={keyUrl} target="_top">
              <KeyRound size={16} strokeWidth={1.75} aria-hidden="true" />Get API key<ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </form>
          <div className={styles.keyFoot}>
            <p id="key-status" className={styles.keyStatus} data-state={status.state} role="status" aria-live="polite">
              {status.state === "ok" && <><CircleCheck size={16} strokeWidth={1.75} aria-hidden="true" />Key works for decisions and chat</>}
              {status.state === "problem" && <><CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" />{status.problem.message}</>}
              {status.state === "checking" && "Checking your key with the hosted API"}
              {status.state === "idle" && "The demos need a key. One free key works for both the Decision API and MoM. It stays in this tab only."}
            </p>
            {apiKey && <Button type="button" variant="ghost" size="sm" onClick={onForget}>Forget key</Button>}
          </div>
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
        <DialogContent title={problemDialog(problem ?? lastProblem).title} description={problemDialog(problem ?? lastProblem).text}
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
