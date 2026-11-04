# vLLM Semantic Router demos: landing page

The page that opens first and leads to two live demos built on vLLM Semantic Router (vllm-sr) and its decision models:
the receipt validator and the product returns validator. One screen: a dark top bar like the demos', a short summary
of vllm-sr with the request flow, an API key field (a placeholder, not wired yet) with "Get API key", and one card per
demo. Each card's "Show more" opens its steps over the card, so the page does not scroll on a desktop screen.

Theme: the cards link to each demo with `?theme=light|dark`, and each demo's "All demos" link comes back the same way,
so the theme follows the visitor across origins. Each page reads the parameter before first paint, stores it and
drops it from the address bar.

It is a static site: `web/` holds the built page (committed), `ui/` the source (React 19, Vite, Arc components,
Geist and Inter bundled from @fontsource).

## Run it

```bash
./start.sh            # serves web/ on http://127.0.0.1:8630 (python3 -m http.server)
./start.sh 9000       # another port
```

The demos are expected on http://localhost:8631 (receipt validator) and http://localhost:8632 (product returns
validator).

## Configure the demo links, screenshots and key link

`web/config.json` sits next to `index.html` and is read when the page loads, so edits take effect on reload, with no
rebuild:

```json
{
  "receiptUrl": "http://localhost:8631",
  "returnsUrl": "http://localhost:8632",
  "receiptImage": "",
  "returnsImage": "",
  "apiKeyUrl": "https://app.vllm-sr.ai/#key"
}
```

- `<id>Url` (`receiptUrl`, `returnsUrl`): where each card's button goes (same tab; `target="_top"` so it also leaves a Hugging
  Face Space's iframe). A missing or empty value falls back to the localhost defaults above.
- `<id>Image`: a screenshot for each card's preview area, as a path relative to `index.html` (for
  example `images/receipt.png`, with the file put in `web/images/`) or a full URL. Empty shows the drawn preview.
  The area is wide and short (about 340 by 128 px) and crops from the top left. Use screenshots without hardware stats or vendor
  branding.

- `apiKeyUrl`: where "Get API key" goes.

A new demo is one entry in `ui/src/demos.ts` (title, summary, steps, models, tone) plus `<id>Url` here; it gets its own
card, and a drawn preview if one is added in `ui/src/Previews.tsx`.

The defaults live in `ui/public/config.json` (copied into `web/` on every build) and in `ui/src/config.ts`.

## Change the page

```bash
cd ui
npm install          # or symlink node_modules from a sister demo with the same package.json deps
npm run dev          # http://127.0.0.1:5190
npm run build        # type check, then build into ../web
```

Content is in `ui/src/App.tsx` (bar, summary, flow, key field), `ui/src/demos.ts` (the demo cards' text),
`ui/src/DemoCard.tsx` and `ui/src/Previews.tsx`. Arc components copied from the
demos are in `ui/src/components/arc/`.

## Sources for the facts on the page

- Decision API and MoM: https://decision.vllm-sr.ai/docs and https://mom.vllm-sr.ai/docs (both now redirect to the
  combined docs at app.vllm-sr.ai/docs): question types, the `/v1/systemone` request and the example response,
  `vllm-sr/auto`, routing headers, one key for both APIs, research and evaluation use only.
- D3 sizes and question types: the model cards at https://huggingface.co/vllm-sr (d3-edge, d3-lite, d3-nano,
  d3-mini, d3-flash, d3, d3-turbo, d3-ultra).
- Vela: the Vela 2.0 0.8B and vela3-flash model cards, and the router signals in the docs.
- The demos: their own READMEs.

## Hugging Face Space

See `deploy/space/README.md`.
