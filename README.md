# vLLM Semantic Router demos: landing page

The page that opens first and leads to two live demos built on vLLM Semantic Router (vllm-sr) and its decision models:
the receipt validator and the product returns validator. It explains vllm-sr, Decision 3.0 (D3), Vela and the hosted
APIs in short sections, then links to each demo.

It is a static site: `web/` holds the built page (committed), `ui/` the source (React 19, Vite, Arc components,
Geist and Inter bundled from @fontsource).

## Run it

```bash
./start.sh            # serves web/ on http://127.0.0.1:8630 (python3 -m http.server)
./start.sh 9000       # another port
```

The demos are expected on http://localhost:8631 (receipt validator) and http://localhost:8632 (product returns
validator).

## Configure the demo links and screenshots

`web/config.json` sits next to `index.html` and is read when the page loads, so edits take effect on reload, with no
rebuild:

```json
{
  "receiptUrl": "http://localhost:8631",
  "returnsUrl": "http://localhost:8632",
  "receiptImage": "",
  "returnsImage": ""
}
```

- `receiptUrl`, `returnsUrl`: where each card's button goes (same tab; `target="_top"` so it also leaves a Hugging
  Face Space's iframe). A missing or empty value falls back to the localhost defaults above.
- `receiptImage`, `returnsImage`: a screenshot for each card's image slot, as a path relative to `index.html` (for
  example `images/receipt.png`, with the file put in `web/images/`) or a full URL. Empty shows the placeholder
  illustration. The slot is 16:9 and crops from the top left. Use screenshots without hardware stats or vendor
  branding.

The defaults live in `ui/public/config.json` (copied into `web/` on every build) and in `ui/src/config.ts`.

## Change the page

```bash
cd ui
npm install          # or symlink node_modules from a sister demo with the same package.json deps
npm run dev          # http://127.0.0.1:5190
npm run build        # type check, then build into ../web
```

Content is in `ui/src/App.tsx` (sections) and `ui/src/DemoCard.tsx` (demo cards). Arc components copied from the
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
