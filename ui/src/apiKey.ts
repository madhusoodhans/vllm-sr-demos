/* The visitor's API key: a format check here, then a live check through a demo backend (the hosted API sends no CORS
 * headers, so the browser cannot ask it directly). The key is kept for this tab only (sessionStorage) and handed to a
 * demo in the URL fragment, which is never sent to a server. */
const STORE = "vllm-sr-api-key";
const OK_STORE = "vllm-sr-api-key-ok";

export type KeyCode = "missing" | "format" | "wrong_kind" | "invalid" | "disabled" | "quota" | "rate_limited" | "unreachable" | "error" | "check_down";

export interface KeyProblem { code: KeyCode; message: string }

/** Plain messages for each code; the check service's own message wins when it sends one. */
export const KEY_MESSAGES: Record<KeyCode, string> = {
  missing: "Paste your API key first.",
  format: "That does not look like a vllm-sr API key. Keys from app.vllm-sr.ai start with sk-vsr- and have no spaces.",
  wrong_kind: "This demo needs a key from app.vllm-sr.ai: sk-pt keys only work for chat.",
  invalid: "That API key was not accepted. Check that you copied the whole key, or get a new one.",
  disabled: "That API key is disabled or does not have access to these models.",
  quota: "That API key has used its daily quota. It resets at 00:00 UTC.",
  rate_limited: "Too many requests right now. Wait a moment and try again.",
  unreachable: "The hosted API could not be reached. Try again in a minute.",
  error: "The key could not be checked. Try again in a minute.",
  check_down: "The key check service is not reachable, so the key could not be checked. Make sure the demos are running and try again.",
};

/** The same format rules as the demo backends: trimmed, no spaces, sk-vsr- prefix, sane length. */
export function formatProblem(raw: string): KeyProblem | null {
  const k = raw.trim();
  if (!k) return { code: "missing", message: KEY_MESSAGES.missing };
  if (k.startsWith("sk-pt-")) return { code: "wrong_kind", message: KEY_MESSAGES.wrong_kind };
  if (/\s/.test(k) || !k.startsWith("sk-vsr-") || k.length < 16 || k.length > 200) return { code: "format", message: KEY_MESSAGES.format };
  return null;
}

const CODES = new Set<string>(Object.keys(KEY_MESSAGES));

/** Format first, then POST {key} to the check endpoint: 200 {ok: true} or 4xx {ok: false, code, message}. */
export async function checkKey(raw: string, checkUrl: string, signal?: AbortSignal): Promise<KeyProblem | null> {
  const local = formatProblem(raw);
  if (local) return local;
  let res: Response;
  try {
    res = await fetch(checkUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: raw.trim() }), signal, cache: "no-store", credentials: "omit" });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    return { code: "check_down", message: KEY_MESSAGES.check_down };
  }
  let body: { ok?: boolean; code?: string; message?: string } = {};
  try { body = await res.json(); } catch { /* not JSON */ }
  if (res.ok && body.ok === true) return null;
  if (!body.code && (res.status === 404 || res.status === 405 || res.status >= 502)) return { code: "check_down", message: KEY_MESSAGES.check_down };
  const code = (body.code && CODES.has(body.code) ? body.code : "error") as KeyCode;
  return { code, message: typeof body.message === "string" && body.message.trim() ? body.message.trim() : KEY_MESSAGES[code] };
}

export function loadKey(): string {
  try { return sessionStorage.getItem(STORE) ?? ""; } catch { return ""; }
}

/** Whether the stored key already passed the live check in this tab. */
export function loadKeyOk(): boolean {
  try { return sessionStorage.getItem(OK_STORE) === "1" && !!sessionStorage.getItem(STORE); } catch { return false; }
}

export function saveKey(key: string, ok = false) {
  try {
    if (key) sessionStorage.setItem(STORE, key); else sessionStorage.removeItem(STORE);
    if (key && ok) sessionStorage.setItem(OK_STORE, "1"); else sessionStorage.removeItem(OK_STORE);
  } catch { /* private window */ }
}

export function forgetKey() { saveKey(""); }

/** The demo's address with the key in the fragment (never the query), so it reaches the demo page but no server. */
export function withKey(url: string, key: string): string {
  try {
    const u = new URL(url, location.href);
    u.hash = `key=${encodeURIComponent(key)}`;
    return u.toString();
  } catch {
    return url;
  }
}
