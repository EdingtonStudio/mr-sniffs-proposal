# Mr. Sniffs — Partnership Proposal

An interactive proposal site for the Mr. Sniffs partnership (Edington Studio x Giard &amp; Co.).
The brand is co-run until it clears $500K/year in revenue, then the LLC forms.
Static site, no backend, no build step. All deal math runs client-side in `js/app.js`.

## Run it locally

Option 1: just open the file.

```
open index.html
```

Option 2: serve it (avoids any local-file font quirks).

```
npx serve .
# then open http://localhost:3000
```

## Deploy

### GitHub Pages (zero config)

1. Push this folder to a GitHub repo (it should be the repo root).
2. Repo Settings → Pages → Source: `Deploy from a branch`.
3. Branch: `main`, folder: `/ (root)`. Save.
4. Site goes live at `https://<user>.github.io/<repo>/`.

### Vercel (zero config)

```
npx vercel
```

Vercel detects a static site automatically. No framework preset needed.

## Structure

```
index.html        the whole proposal, 11 sections + the calculator
css/styles.css    Mr. Sniffs design tokens + layout
js/app.js         calculator math (transparent, commented)
assets/           wordmark, seal, photography, webfonts
```

## Editing the numbers

Defaults for the calculator live at the top of `js/app.js`.
Retainer tiers are editable directly on the page (they are inputs, nothing persists).

This is a working proposal, not legal advice. The lawyers paper the final agreement.
