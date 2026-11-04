/* The visitor's API key: checked before a demo opens, and kept for this tab only so it survives a trip to a demo and back.
 * TEMPORARY: only "1234" passes until the hosted key check is wired; then checkKey asks the API instead. */
const STORE = "vllm-sr-api-key";

export type KeyProblem = "missing" | "invalid";

export function checkKey(key: string): KeyProblem | null {
  const k = key.trim();
  if (!k) return "missing";
  return k === "1234" ? null : "invalid";
}

export function loadKey(): string {
  try { return sessionStorage.getItem(STORE) ?? ""; } catch { return ""; }
}

export function saveKey(key: string) {
  try { if (key) sessionStorage.setItem(STORE, key); else sessionStorage.removeItem(STORE); } catch { /* private window */ }
}
