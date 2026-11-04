/* The demo cards, in order. A new demo is one more entry here plus "<id>Url" in config.json. */
export type Tone = "blue" | "green" | "amber" | "violet";

export interface Demo {
  id: string;
  title: string;
  summary: string;
  /** Shown under "Show more", over the preview; keep each to about two lines. */
  steps: string[];
  models: string[];
  action: string;
  /** Tints the card's preview area. */
  tone: Tone;
}

export const DEMOS: Demo[] = [
  {
    id: "receipt",
    title: "Receipt validator",
    summary: "Upload a receipt photo. D3 checks it once, and only a good receipt reaches the large model.",
    steps: [
      "D3 answers every check in one request: is it a receipt, readable, whole, and free of added notes or tampering.",
      "A good receipt goes to a large Qwen model, which reads it into store, date, line items and totals.",
      "A bad upload never reaches the large model. A small model says what is wrong and how to retake it.",
    ],
    models: ["D3"],
    action: "Open demo",
    tone: "blue",
  },
  {
    id: "returns",
    title: "Product returns validator",
    summary: "A customer chats about a damaged delivery. Decision models make every call; the LLM only words the replies.",
    steps: [
      "Vela screens each message for prompt attacks and personal data, and picks Qwen 9B or 27B for the turn.",
      "D3 decides if the message is in scope, which order it means, if the claim fits the policy and if the photo shows damage.",
      "Rules in code give the verdict, Qwen words it, and D3 checks the reply promises nothing more.",
    ],
    models: ["D3", "Vela"],
    action: "Open demo",
    tone: "green",
  },
];
