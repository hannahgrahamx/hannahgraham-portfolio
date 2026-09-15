# hannahgraham-portfolio

Hannah Graham's design portfolio — a static, multi-page site built with plain HTML, CSS and vanilla JavaScript (no framework, no build step, no npm dependencies), deployed via GitHub Pages at [hannahgraham.ca](https://hannahgraham.ca).

## Tech stack

- HTML5 / CSS3
- JavaScript (vanilla — no framework or bundler)
- Google Fonts (Bricolage Grotesque, Space Grotesk), loaded via CDN `<link>`
- GitHub Pages, custom domain via `CNAME`

## Repository structure

```
/
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── pages/
│   ├── about.html
│   └── [project-name].html      (one per case study)
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   ├── global/                  (logo, favicons, shared icons)
│   └── [project-name]/          (per-project images/video)
└── portfolio-website-PRD/       (design spec + reference screenshots)
```

Full requirements live in `portfolio-website-PRD/portfolio-website-PRD-v2.md`. `CLAUDE.md` and `STYLE.md` at the repo root document the working conventions and design-system constants (fonts, type scale, spacing, color tokens, breakpoints) used throughout `style.css`.

## Development

No build step — open `index.html` directly, or serve the repo root with any static file server (e.g. `python3 -m http.server`) so root-relative asset paths (`/css/style.css`, `/assets/...`) resolve correctly.

## Deployment

Pushes to `main` publish to GitHub Pages at the domain in `CNAME`.
