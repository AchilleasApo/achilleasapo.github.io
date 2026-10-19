# Achilleas Apostolou — Portfolio

Personal portfolio website of **Achilleas Apostolou**, a 3D TD & Media Technologist working with real-time CG, VR, digital lighting and virtual production.

**Live site:** [achilleasapostolou.gr](https://achilleasapostolou.gr)

## About the site

A single-page portfolio presenting selected projects (each opening as a pop-up with details and a gallery), background, experience, education and contact information.

- Hand-written HTML, CSS and vanilla JavaScript: no framework and no build step
- Content kept in plain JSON files and rendered in the browser
- Interactive, cursor-reactive background and project cards (honours the "reduce motion" setting)
- Responsive layout, with light and dark themes following the system preference
- Self-hosted fonts and optimized WebP images; the only third-party request is [GoatCounter](https://www.goatcounter.com), a privacy-friendly, cookie-free visit counter
- Hosted on GitHub Pages with a custom domain

## Structure

```
index.html     page skeleton
css/           styles and self-hosted fonts
js/app.js      rendering and interactions
data/          site and project content (JSON)
assets/        images, flags, favicon and CV
tools/         small helper scripts (image optimization, perf test)
```

## Run locally

The page loads its content with `fetch`, so serve the folder instead of opening the file directly:

```
npx serve .
```

## Rights

The text, photographs and project material on this site belong to Achilleas Apostolou. No open-source license is attached to this repository.
