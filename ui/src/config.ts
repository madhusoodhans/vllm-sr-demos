/** Runtime config: config.json next to index.html, read on load, so the demo URLs change without a rebuild.
 *  receiptImage / returnsImage: optional screenshot paths (relative to index.html, or absolute URLs) for the demo cards. */
export interface SiteConfig { receiptUrl: string; returnsUrl: string; receiptImage: string; returnsImage: string }

export const DEFAULTS: SiteConfig = {
  receiptUrl: "http://localhost:8631",
  returnsUrl: "http://localhost:8632",
  receiptImage: "",
  returnsImage: "",
};

const str = (v: unknown, fallback: string) => (typeof v === "string" ? v.trim() : fallback);

export async function loadConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch("./config.json", { cache: "no-store" });
    if (!res.ok) return DEFAULTS;
    const raw = (await res.json()) as Record<string, unknown>;
    return {
      receiptUrl: str(raw.receiptUrl, DEFAULTS.receiptUrl) || DEFAULTS.receiptUrl,
      returnsUrl: str(raw.returnsUrl, DEFAULTS.returnsUrl) || DEFAULTS.returnsUrl,
      receiptImage: str(raw.receiptImage, ""),
      returnsImage: str(raw.returnsImage, ""),
    };
  } catch {
    return DEFAULTS;
  }
}
