/* The landing page: what vllm-sr, D3 and Vela are, the two live demos, and the hosted APIs.
 * Facts here are checked against the Decision API / MoM docs and the vllm-sr Hugging Face model cards (see README.md). */
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Gauge, Layers, ListChecks, MessageSquareText, MessagesSquare, Receipt, Route, ScanLine, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { ThemeSwitch, type Theme } from "./components/arc/theme-switch/theme-switch";
import { DemoCard } from "./DemoCard";
import { DEFAULTS, loadConfig, type SiteConfig } from "./config";
import styles from "./App.module.css";

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

/** An outbound link with a small arrow; same tab, like every link on the page. */
function Ext({ href, children }: { href: string; children: ReactNode }) {
  return <a className={styles.link} href={href} target="_top">{children}<ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" /></a>;
}

const FLOW = [
  { icon: MessageSquareText, title: "Request", text: "Text, an image or a video" },
  { icon: ListChecks, title: "Decision models", text: "Typed questions, a probability for each answer" },
  { icon: SlidersHorizontal, title: "Your thresholds", text: "Rules in code pick the path" },
  { icon: Layers, title: "LLM, when needed", text: "Only what passed reaches it" },
];

const QUESTION_TYPES = [
  { name: "Choice", ask: "Which option fits?", answer: "The chosen option and a probability for every option." },
  { name: "Yes or no (noul)", ask: "Is it true?", answer: "The probability of yes." },
  { name: "Score", ask: "How much, on an ordered scale?", answer: "The expected level and a probability for each of 2 to 10 levels." },
  { name: "Box and track", ask: "Where is it?", answer: "On d3-turbo and d3-ultra: where something is in an image or a video moment, or its path through a clip." },
];

const SIZES = [
  { id: "d3-edge", size: "0.6B" },
  { id: "d3-lite", size: "0.8B" },
  { id: "d3-nano", size: "2B" },
  { id: "d3-mini", size: "4B" },
  { id: "d3-flash", size: "9B" },
  { id: "d3", size: "27B" },
  { id: "d3-turbo", size: "27B" },
  { id: "d3-ultra", size: "27B" },
];

const ENABLES = [
  { icon: Route, title: "Gates before expensive models", text: "A quick check decides whether a large model runs at all, so bad inputs and attacks stop early." },
  { icon: Gauge, title: "Tunable thresholds", text: "Each answer is a probability. The app sets the cut-off and can move it without new prompts or retraining." },
  { icon: ListChecks, title: "Structured decisions", text: "Answers come back as fields under your question IDs, not text to parse." },
];

const REQUEST = `{
  "model": "vllm-sr/d3-flash",
  "state": "Write a Python function that merges two sorted lists.",
  "questions": {
    "kind": {
      "type": "choice",
      "instructions": "What kind of work is this?",
      "criteria": {
        "code": "Writing or fixing code",
        "math": "Mathematics",
        "chat": "Anything else"
      }
    },
    "reasoning": {
      "type": "noul",
      "instructions": "Does answering this need multi-step reasoning?"
    }
  }
}`;

const RESPONSE = `{
  "answers": {
    "kind": {
      "type": "choice",
      "choice": "code",
      "probabilities": {"code": 0.9986, "math": 0.0004, "chat": 0.0010},
      "confidence": 0.9894
    },
    "reasoning": {"type": "noul", "noul": 0.4143}
  },
  "model": "vllm-sr/d3-flash",
  "usage": {"input_tokens": 213, "output_tokens": 0}
}`;

export function App() {
  const [theme, setTheme] = useTheme();
  const config = useConfig();

  return (
    <>
      <a className={styles.skip} href="#main">Skip to content</a>
      <header className={styles.header}>
        <div className={styles.headerIn}>
          <a className={styles.brand} href="#top">vLLM Semantic Router demos</a>
          <nav className={styles.nav} aria-label="Sections">
            <a href="#demos">Demos</a>
            <a href="#router">Router</a>
            <a href="#d3">D3</a>
            <a href="#vela">Vela</a>
            <a href="#apis">APIs</a>
          </nav>
          <ThemeSwitch theme={theme} iconOnly variant="rise" onThemeChange={(next) => setTheme(next)} />
        </div>
      </header>

      <main id="main" className={styles.page}>
        <section id="top" className={styles.hero} aria-labelledby="title">
          <h1 id="title">Decision models in front of your LLMs</h1>
          <p className={styles.lead}>
            vLLM Semantic Router puts small decision models in front of large language models. They answer typed questions about
            each request with probabilities, and your code decides what runs next. Two live demos show it on real tasks.
          </p>
          <ol className={styles.flow} aria-label="How a request flows">
            {FLOW.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className={styles.flowStep}>
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" className={styles.flowIcon} />
                <span className={styles.flowTitle}>{title}</span>
                <span className={styles.flowText}>{text}</span>
                {i < FLOW.length - 1 && <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" className={styles.flowArrow} />}
              </li>
            ))}
          </ol>
        </section>

        <section id="demos" className={styles.section} aria-labelledby="demos-title">
          <div className={styles.sectionHead}>
            <h2 id="demos-title">Two live demos</h2>
            <p className={styles.sub}>
              Both demos use d3-mini, the 4B member of Decision 3.0, for every D3 question. Each page shows its decisions as they
              happen, with the model, time and probabilities of every step.
            </p>
          </div>
          <div className={styles.demoGrid}>
            <DemoCard
              slot="receipt"
              title="Receipt validator"
              summary="Upload a photo of a receipt. D3 checks it once, and only a good receipt reaches the large model."
              steps={[
                "D3 (d3-mini) answers every check in one request: is it a receipt, is all of it visible, is it blurry, damaged or covered by glare, are there several receipts, and has someone added a note or tampered with it.",
                "A good receipt goes to a large Qwen model, which reads it into structured data (store, date, line items, totals). An arithmetic check follows.",
                "A bad upload never reaches the large model. A small model writes a short message on what is wrong and how to retake the photo.",
              ]}
              models="Decision model: d3-mini"
              href={config?.receiptUrl ?? null}
              image={config?.receiptImage ?? ""}
              action="Open receipt validator"
              placeholder={[Receipt, ScanLine, ListChecks]}
            />
            <DemoCard
              slot="returns"
              title="Product returns validator"
              summary="A customer chats with a returns assistant about a damaged delivery. The LLM only words the replies; decision models make every decision."
              steps={[
                "Vela screens each message for prompt attacks and personal data, and picks Qwen 9B or Qwen 27B for the turn. A prompt attack is blocked before any LLM runs.",
                "D3 (d3-mini) decides whether the message is in scope, which order it is about, whether the claim fits the return policy, and whether the damage photo shows the problem.",
                "Rules in code turn those answers into a verdict and Qwen words it. D3 checks the reply too, so it cannot promise what the rules did not give.",
              ]}
              models="Decision models: d3-mini and Vela"
              href={config?.returnsUrl ?? null}
              image={config?.returnsImage ?? ""}
              action="Open returns validator"
              placeholder={[MessagesSquare, ShieldCheck, MessageSquareText]}
            />
          </div>
        </section>

        <section id="router" className={styles.section} aria-labelledby="router-title">
          <div className={styles.split}>
            <div className={styles.sectionHead}>
              <h2 id="router-title">vLLM Semantic Router</h2>
              <p className={styles.sub}>
                An open-source router that sits in front of your LLMs. It reads each request and sends it to the model that fits,
                by what the request means rather than by fixed rules.
              </p>
            </div>
            <dl className={styles.facts}>
              <div><dt>Routing by meaning</dt><dd>Each request goes to the model, and the reasoning effort, it needs. It works with any model, open or closed.</dd></div>
              <div><dt>Decision models</dt><dd>D3 and Vela give the router its signals: what the task is, whether it is risky, which option fits.</dd></div>
              <div><dt>Guardrails</dt><dd>Prompt attacks and personal data are caught at the router, before a request reaches an LLM.</dd></div>
              <div><dt>OpenAI-compatible API</dt><dd>Apps call it like any OpenAI endpoint. Changing the base URL is enough.</dd></div>
            </dl>
          </div>
        </section>

        <section id="d3" className={styles.section} aria-labelledby="d3-title">
          <div className={styles.sectionHead}>
            <h2 id="d3-title">Decision 3.0 (D3)</h2>
            <p className={styles.sub}>
              A family of decision models for text, images and video. Send an input and the questions you need answered. Every
              answer comes back in one response as a probability, from a forward pass instead of generated text.
            </p>
          </div>

          <div className={styles.d3Grid}>
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Question types</h3>
              <dl className={styles.types}>
                {QUESTION_TYPES.map((q) => (
                  <div key={q.name} className={styles.typeRow}>
                    <dt><span className={styles.typeName}>{q.name}</span><span className={styles.typeAsk}>{q.ask}</span></dt>
                    <dd>{q.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Sizes, from edge to ultra</h3>
              <ul className={styles.sizes}>
                {SIZES.map((m) => (
                  <li key={m.id}>
                    <a href={`${HF}/${m.id}`} className={styles.sizeLink} target="_top">
                      <span>{m.id}</span><span className={styles.sizeVal}>{m.size}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className={styles.note}>Every size reads text or JSON, images and video. Model pages on Hugging Face.</p>
            </div>
          </div>

          <ul className={styles.enables}>
            {ENABLES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" className={styles.enableIcon} />
                <h3 className={styles.enableTitle}>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>

          <figure className={styles.code}>
            <div className={styles.codePane}>
              <span className={styles.codeLabel}>Request to POST /v1/systemone</span>
              <pre tabIndex={0} aria-label="Example request"><code>{REQUEST}</code></pre>
            </div>
            <div className={styles.codePane}>
              <span className={styles.codeLabel}>Response</span>
              <pre tabIndex={0} aria-label="Example response"><code>{RESPONSE}</code></pre>
            </div>
            <figcaption className={styles.note}>A real response from the Decision API docs. No text is generated, so output tokens are 0.</figcaption>
          </figure>
        </section>

        <section id="vela" className={styles.section} aria-labelledby="vela-title">
          <div className={styles.split}>
            <div className={styles.sectionHead}>
              <h2 id="vela-title">Vela</h2>
              <p className={styles.sub}>
                The router's decision model for guardrails and model choice. It answers the router's questions about each request,
                as probabilities, without generating text.
              </p>
            </div>
            <dl className={styles.facts}>
              <div><dt>Guardrails</dt><dd>Is this a prompt injection or jailbreak attempt? Does it carry personal data, and where?</dd></div>
              <div><dt>Model choice</dt><dd>Which model and how much reasoning a request needs, so easy turns go to a smaller model.</dd></div>
              <div><dt>Exact words</dt><dd>It can mark the spans that matter, such as names or email addresses, with character offsets and probabilities.</dd></div>
              <div className={styles.factLinks}>
                <dt>Model pages</dt>
                <dd><Ext href={`${HF}/Vela-2.0-0.8B`}>Vela 2.0 0.8B</Ext><Ext href={`${HF}/vela3-flash`}>vela3-flash</Ext><Ext href={`${HF}/vela3-turbo`}>vela3-turbo</Ext></dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="apis" className={styles.section} aria-labelledby="apis-title">
          <div className={styles.sectionHead}>
            <h2 id="apis-title">Hosted APIs</h2>
            <p className={styles.sub}>
              Try the models without running anything. One free key, made in the browser with no account, works for both APIs.
              They are for research and evaluation only.
            </p>
          </div>
          <div className={styles.apiGrid}>
            <article className={styles.apiCard}>
              <h3>Decision API</h3>
              <p>Ask D3 and Vela typed questions about text, images or video with <code>POST /v1/systemone</code>. Every answer is a probability.</p>
              <div className={styles.apiLinks}>
                <Ext href={DECISION}>Open the Decision API</Ext>
                <Ext href={`${DECISION}/docs`}>Read the Decision API docs</Ext>
              </div>
            </article>
            <article className={styles.apiCard}>
              <h3>MoM</h3>
              <p>
                One OpenAI-compatible endpoint, model <code>vllm-sr/auto</code>. The router picks the model and reasoning effort for
                each request, and response headers such as <code>x-vsr-selected-model</code> say what it chose.
              </p>
              <div className={styles.apiLinks}>
                <Ext href={MOM}>Open MoM</Ext>
                <Ext href={`${MOM}/docs`}>Read the MoM docs</Ext>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerIn}>
          <span>vLLM Semantic Router</span>
          <Ext href={HF}>Models on Hugging Face</Ext>
        </div>
      </footer>
    </>
  );
}
