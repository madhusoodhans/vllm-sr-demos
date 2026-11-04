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
  "returnsImage": ""
}
```

Either form of a Space URL works: `https://<owner>-<space>.hf.space` (the app alone) or
`https://huggingface.co/spaces/<owner>/<space>` (the Space page). The buttons open the demo in the same browser tab,
leaving this Space's frame.

To show screenshots on the demo cards, add the images to the Space repo (for example `images/receipt.png`) and set
`receiptImage` / `returnsImage` to those paths.
