/** Runtime config: config.json next to index.html, read on load, so demo URLs change without a rebuild.
 *  Each demo in demos.ts reads "<id>Url" (where its card opens) and an optional "<id>Image" (a card screenshot, relative to
 *  index.html or an absolute URL). apiKeyUrl is where "Get API key" goes; keyCheckUrl is the demo backend endpoint that
 *  checks a key (POST {key}). */
export interface SiteConfig { urls: Record<string, string>; images: Record<string, string>; apiKeyUrl: string; keyCheckUrl: string }

const DEFAULT_URLS: Record<string, string> = { receipt: "http://localhost:8631", returns: "http://localhost:8632" };
export const DEFAULTS: SiteConfig = { urls: DEFAULT_URLS, images: {}, apiKeyUrl: "https://app.vllm-sr.ai/#key", keyCheckUrl: "http://localhost:8631/api/key/check" };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function loadConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch("./config.json", { cache: "no-store" });
    if (!res.ok) return DEFAULTS;
    const raw = (await res.json()) as Record<string, unknown>;
    const urls: Record<string, string> = { ...DEFAULT_URLS };
    const images: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      const m = /^(.+)(Url|Image)$/.exec(k);
      if (!m || m[1] === "apiKey" || m[1] === "keyCheck" || !str(v)) continue;
      (m[2] === "Url" ? urls : images)[m[1]] = str(v);
    }
    return { urls, images, apiKeyUrl: str(raw.apiKeyUrl) || DEFAULTS.apiKeyUrl, keyCheckUrl: str(raw.keyCheckUrl) || DEFAULTS.keyCheckUrl };
  } catch {
    return DEFAULTS;
  }
}

/** The demo's address with the current theme, so the demo (another origin) opens in the same theme. */
export function withTheme(url: string, theme: string): string {
  try {
    const u = new URL(url, location.href);
    u.searchParams.set("theme", theme);
    return u.toString();
  } catch {
    return url;
  }
}
