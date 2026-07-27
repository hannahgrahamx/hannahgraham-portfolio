# CLAUDE.md — hannahgraham-portfolio

@STYLE.md

## What this project is
Personal portfolio website for job search. Static, front-end-only, deployed via GitHub Pages. Full requirements live in `portfolio-website-PRD-v2.md` — read it at the start of any new task, but treat @STYLE.md (imported above) as the always-on reference for visual constants.

## Hard constraints — do not violate
- Plain HTML, CSS, JavaScript only. **No frameworks, no build step, no npm dependencies.**
- If a JS library is genuinely needed (e.g. an animation lib), load it via CDN `<script>` tag — never npm.
- If a task seems to require a framework, bundler, or preprocessor: **stop and ask, don't add one.**
- No backend, no form handling, no database. Contact = copy-to-clipboard button + social links only.

## Working style for this project
- **Visual/styling work is never "done" from a written spec alone.** Before implementing a visual element, open the actual reference image(s) directly (paths are in the PRD's Design Reference section) — don't infer appearance from prose description.
- **After implementing a visual element, verify it.** Use Playwright MCP to screenshot the live localhost render and compare directly against the matching reference image. State what differs before making further changes.
- **One component at a time.** Don't build a full page in one pass — get one section (e.g. hero gradient, header, one card) matching the reference before moving to the next.
- If a value isn't specified anywhere (PRD text, @STYLE.md, or a reference image), say so explicitly rather than inventing a number.

## Site structure
Multi-page site (separate HTML files, not single-scroll). Project pages share a common template (header/nav, layout, footer) so new projects are copy-and-fill, not rebuilt from scratch.

```
/
├── index.html
├── /pages
│   └── about.html
│   └── [project-name].html
│   └── 404.html
├── css/style.css
├── js/main.js
└── assets/
    ├── global/
    └── [project-name]/
```

## Build order
1. Static HTML structure for all pages — semantic markup, no styling
2. CSS — layout, typography, responsive breakpoints
3. Content — drop in final copy and assets from the PRD's Copy section
4. JS — interactivity/animations
5. Cross-browser/responsive QA
6. Deploy to GitHub Pages, verify on the live URL (not just localhost)

## Definition of done (per component/page)
- Matches the reference image at desktop and mobile breakpoints
- No console errors
- Alt text on all images, visible focus states, sufficient color contrast
- No frameworks/dependencies introduced beyond what's listed above
