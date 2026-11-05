---
title: vLLM Semantic Router demos
emoji: 🧭
colorFrom: blue
colorTo: gray
sdk: static
app_file: index.html
pinned: false
short_description: Two live demos of vLLM Semantic Router and its decision models
---

# vLLM Semantic Router demos

The landing page for two live demos of vLLM Semantic Router and its decision models: a receipt validator and a product
returns validator. Each demo is its own Space; this one links to them.

## Publish

The Space repo holds the built page and this README:

```bash
git clone https://huggingface.co/spaces/<owner>/<this-space> space
cp -r web/* space/                    # index.html, config.json, assets/
cp deploy/space/README.md space/README.md
# edit space/config.json (below), then commit and push the Space repo
```

## Set the demo URLs

Edit `config.json` in the Space repo (Files tab, or a commit). No rebuild is needed; the page reads it on load:

```json
{
  "receiptUrl": "https://<owner>-<receipt-space>.hf.space",
  "returnsUrl": "https://<owner>-<returns-space>.hf.space",
  "receiptImage": "",
  "returnsImage": "",
  "keyCheckUrl": "https://<owner>-<receipt-space>.hf.space/api/key/check"
}
```

Use the `https://<owner>-<space>.hf.space` form (the app alone): the visitor's key is handed over in the URL fragment
(`#key=...`), and the Space page form (`https://huggingface.co/spaces/<owner>/<space>`) does not pass it on to the
app inside its frame. `keyCheckUrl` is the receipt demo's key check (either demo's works); the demos must list this
Space's URL in `LANDING_URL` so the check is allowed across origins. The buttons open the demo in the same browser tab,
leaving this Space's frame.

To show screenshots on the demo cards, add the images to the Space repo (for example `images/receipt.png`) and set
`receiptImage` / `returnsImage` to those paths.
