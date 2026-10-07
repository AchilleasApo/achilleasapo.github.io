# achilleasapostolou.gr

A hand-written one-page portfolio. No framework, no build step, no third-party
requests — just HTML, CSS and a little JavaScript. Hosted on GitHub Pages.

## Edit the content

| What | File |
| --- | --- |
| Name, email, status dot, intro, about, experience, education, activities, quote, contact, social links | `data/site.json` |
| Projects (the cards and their pop-ups) | `data/projects.json` |

Change a value, save, refresh. That's it.

**Experience / education** are timelines: each entry is an organisation (`org`, `when`) with one or more `roles` (`title`, optional `note`, optional `when`). Put several roles under one entry to merge them, as with ORamaVR. An entry whose `when` contains "Present" gets the glowing node.

**Flags** — you can type flag emoji (🇬🇷 🇩🇰 🇨🇭) anywhere in the JSON. Windows shows those as letters, so the site swaps them for small SVGs from `assets/flags/`. For another country add `assets/flags/<code>.svg` and its code to the `FLAGS` list in `js/app.js`.

**CV button** — it downloads `assets/Apostolou_CV.pdf`. To publish a new CV, replace that file (keep the name) and push; nothing else changes. If you ever want a different file name or an external link, edit `about.cv.url` in `data/site.json`.

**Status dot** — `"status"` in `site.json` is `online` (green), `away` (amber), `busy` (red) or `offline` (grey).

### Add a project

1. Put the original photos in a folder and shrink them:
   `python tools/optimize-images.py path/to/photos my-project`
   (writes `assets/img/my-project/*.webp`; needs `pip install pillow`)
2. Add an entry to `data/projects.json` (copy an existing one). Fields:
   `id` (used in the URL, `/#/my-project`), `title`, `label`, `subtitle`, `year`,
   `timeframe`, `tools`, `category`, `cover`, `gallery` (list of images) and
   `body`, a list of blocks: `lead`, `p`, `h` (small heading), `list` (`items`),
   `pubs` (publication list). Bare `https://…` links in text become clickable.
3. Cards appear in the order of the file. `"wide": true` makes a full-width text card
   (used for Publications); leave out `cover` for a text-only card.

Old Framer URLs (`/works/vp`, …) redirect to the matching pop-up.

## Run locally

The site fetches its JSON, so open it through a web server rather than as a file:

```
npx serve .
```

## Layout

- `index.html` — page skeleton
- `css/style.css` — design (colours are the original Framer tokens; light mode follows the OS)
- `js/app.js` — rendering from the JSON + the cursor effects (dot field, spotlight, parallax, card tilt, pop-up)
- `assets/` — images, fonts (self-hosted), favicon
- `tools/optimize-images.py` — image shrinker

The previous Framer export is preserved in git under the tag `framer-export`.
