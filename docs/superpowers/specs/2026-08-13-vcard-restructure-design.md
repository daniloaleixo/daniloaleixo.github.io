# Restructuring daniloaleixo.github.io onto the vCard template

**Date:** 2026-08-13
**Status:** Approved design, pending implementation plan

## Goal

Replace the current single-page Bootstrap scroll site with the
[vCard personal portfolio](https://github.com/codewithsadee/vcard-personal-portfolio)
template, adopted wholesale: its sidebar, dark theme, five-tab navigation, and card
components, populated with Danilo's content.

## Current state

The site is a 2017-era Bootstrap "Dev Portfolio" template: a single scrolling page with
sections for hero, About, Experience, Education, Projects, Awards, Languages, Skills,
Hobbies, and Contact.

Around it sits a build and server layer that production does not use. GitHub Pages serves
the repository statically, so `index.js` (Express + SendGrid), `gulpfile.js` (SCSS
compilation), `Procfile`, and `app.json` are inert in deployment. The contact form posts to
`https://daniloaleixo.herokuapp.com/email`, a free Heroku dyno retired in November 2022 —
**the contact form is currently broken and silently discards submissions.**

The page also loads a Universal Analytics (`analytics.js`) snippet. Google shut that
product down in July 2023, so it collects nothing.

## Target state

A zero-dependency static site matching vCard's shape:

```
index.html
assets/
  css/style.css      # vCard, verbatim
  js/script.js       # vCard, one documented deletion (see "Dead JS")
  images/            # Danilo's images
README.md            # rewritten, with MIT attribution to codewithsadee
LICENSE
Layout Design/       # untouched; unreferenced .pxd design sources
docs/                # this spec
```

**Deleted:** `index.js`, `package.json`, `package-lock.json`, `gulpfile.js`, `test.js`,
`Procfile`, `app.json`, `database.json`, `manifest.json`, `browserconfig.xml`, `scss/`,
`public/` (its ~15 useful assets migrate to `assets/images/` first), and the dead analytics
snippet.

**Kept on disk untouched:** `Layout Design/` — seven Pixelmator `.pxd` sources and two
JPEGs, unreferenced by the site and not recoverable elsewhere.

## Approach

Copy vCard verbatim first, then edit it down in place.

The alternative — authoring `index.html` fresh in vCard's class vocabulary — was considered
and rejected. Copying verbatim yields a working, rendering page immediately, so every
subsequent edit is verifiable against a known-good baseline.

Its failure mode is leftover demo content, mitigated by a mandatory grep sweep before ship
(see Verification).

## Section decisions

vCard ships components with no matching content, and the current site holds content with no
matching component. Both directions were resolved by cutting.

### Cut from vCard

| Component | Reason |
| --- | --- |
| Testimonials (4 quote cards + modal) | No real testimonials; placeholder quotes from strangers would ship to production |
| Clients (6-logo carousel) | No client logos Danilo can claim |

### Cut from the current site

| Content | Reason |
| --- | --- |
| Awards | Tightest professional read; vCard's demo carries no equivalent |
| Languages (3) | Same |
| Hobbies (10 clip-art icons) | Same; the icons also clash with vCard's dark aesthetic |
| Project descriptions | vCard tiles are image + category + title only; the tile itself becomes the outbound link |
| Google Analytics | Deprecated product, collecting nothing |

## Content map

### Sidebar

- **Avatar:** `profile.png`
- **Name:** Danilo Aleixo — **Title:** Tech Lead
- **Contacts:** Email (`danilo_aleixo@hotmail.com`) and Location (Berlin, Germany) only.
  vCard's Phone and Birthday rows are **removed** — a public phone number and birthdate on
  a static site are social-engineering material.
- **Socials:** GitHub, LinkedIn, Medium, Behance, Facebook — all native Ionicons.
  Goodreads is cut (Ionicons has no Goodreads glyph, and one hand-styled PNG among five
  icons reads as a mistake). Twitter and Instagram placeholders are removed.

### About tab

Danilo's two bio paragraphs. The current markup duplicates them as `.large-text` and
`.small-text` for responsive behaviour; vCard handles this in CSS, so they collapse to a
single copy.

The "What i'm doing" grid becomes four cards:

| Card | Ionicon |
| --- | --- |
| Pricing Platforms & Algorithms | `pricetags-outline` |
| Full-Stack Development | `code-slash-outline` |
| Cloud Architecture | `cloud-outline` |
| Technical Leadership | `people-outline` |

vCard's service cards use `<img src="./assets/images/icon-*.svg">`, whose four stock icons
(design, dev, app, photo) do not fit. These become `<ion-icon>` elements, requiring one
small CSS rule in `style.css` to size them to the 40px the `<img>` rule provided. This is
the only styling addition to the template.

### Resume tab

**Education timeline:** deeplearning.ai — Deep Learning Specialization (Jul–Nov 2019);
University of São Paulo — BSc Computer Science (Jan 2012–Dec 2017).

**Experience timeline:** numa (Lead Engineer, Mar 2021–present); Learn To Fly (Software
Architect, Feb 2018–Feb 2021); Colmeia (Tech Lead / Full-Stack, Apr 2017–Feb 2018);
EduCaqui (Founder, Mar 2016–Feb 2017); Itaú BBA (Intern, Aug 2014–Aug 2016). Dates and
descriptions carry over verbatim, deduplicated from the `.large-text`/`.small-text` pairs.

**Skills:** the current flat list of 32 items — mixing TypeScript and Kubernetes with
InDesign, Excel, and VBA — is replaced by five progress bars. The percentages below are a
draft for Danilo to correct at spec review; absent corrections, they ship as written:

| Skill | % |
| --- | --- |
| Backend & Distributed Systems | 90 |
| Technical Leadership & Mentoring | 90 |
| Cloud & Infrastructure (AWS, Kubernetes) | 85 |
| Algorithms & Pricing Systems | 85 |
| Frontend (React, Angular, TypeScript) | 80 |

**Resume PDF:** the current hero has a "Download Resume" button that vCard has no slot for.
`Resume.pdf` migrates to `assets/`, linked as a small text link beneath the Resume tab
heading. This is a deliberate one-line addition to the template.

### Portfolio tab

All eight projects, each tile linking directly to its live URL. Filter categories:

| Project | Category | Image | URL |
| --- | --- | --- | --- |
| Berlin Cinema Guide | Web apps | `berlinkino.jpg` | https://berlinkino.aereozen.com/ |
| Paises Visitados | Web apps | `paisesvisitados.jpg` | https://paisesvisitados.aereozen.com/ |
| Financial Education App | Web apps | `finkids.png` | https://daniloaleixo.github.io/financial-education-landing/ |
| Calendar Component | Web apps | `calendar-component.png` | https://daniloaleixo.github.io/calendar-component/ |
| Aereozen | AI & ML | `aereozen.jpg` | https://ai.aereozen.com/ |
| Neuro Evolution Market Trading | AI & ML | `neuroevolution.png` | https://github.com/daniloaleixo/NeuroEvolutionMarketTrader |
| Olha por Onde Anda | Games | `olha-por-onde-anda-project.png` | https://daniloaleixo.github.io/jogo_olhe_por_onde_anda/app/index.html |
| I Dare You To Kill My App | Games | `getup-project.png` | https://daretokill-79f8f.firebaseapp.com/ |

`Untitled.png` is renamed to `neuroevolution.png`.

Filter mechanics: `script.js` matches `button.innerText.toLowerCase()` against
`data-category`, so the attributes must be exactly `web apps`, `ai & ml`, and `games`, plus
the stock `all`. The button label uses `AI &amp; ML`, whose `innerText` lowercases to
`ai & ml`.

### Blog tab

Six static cards, hardcoded — no runtime RSS fetch, so nothing breaks if a CORS proxy dies.
Each links to Medium. Note these posts are mostly in Portuguese while the rest of the site
is English; this is accepted.

1. Jira me ensinou a tolerar o que não devia — 18 May 2026
2. Por que usamos Claude e Devin ao mesmo tempo? — 15 May 2026
3. Todo mundo envelhece, Berlin não — 27 Apr 2026
4. Quando a IA Precisa se Esconder — 1 Apr 2026
5. Prompt bom não escala — 12 Feb 2026
6. I built a website because I was annoyed — 9 Feb 2026

Card banner images are downloaded from each post and committed to `assets/images/`. They
are **not** hotlinked — Medium's CDN blocks cross-origin requests, which would leave six
broken frames.

Refreshing this tab after publishing a new post is a manual edit, accepted as the cost of
having no build step.

### Contact tab

- Google Maps iframe re-centred on Berlin.
- Form posts to **Formspree**. This replaces the dead Heroku/SendGrid endpoint and requires
  no server, so it works on GitHub Pages.

## Dead JS

`script.js` binds these at top level, unconditionally:

```js
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);
```

Deleting the Testimonials markup makes both `null`, throwing a `TypeError` that **halts the
entire script**. Everything registered after that line — the portfolio filter, form
validation, and the tab navigation — would never bind. The site would render correctly and
every nav tab would be dead.

Cutting Testimonials therefore requires deleting the testimonials and modal block from
`script.js`, not only from the HTML. This is the one intentional edit to the vendored JS.

**Related constraint:** vCard's nav handler contains a latent bug — inside its loop over
pages it indexes `navigationLinks[i]` with the *pages* index. It works only because the
links and articles have equal count and identical order. The design keeps five of each in
matching order. Any future change to tab count or order breaks nav highlighting.

## Implementation sequence

Each step is one commit.

1. Copy vCard's `index.html`, `assets/css/style.css`, `assets/js/script.js`, and required
   images verbatim. Delete the Node/gulp/Heroku layer, `scss/`, and `public/libs|css|js`.
   Baseline: the site renders as the vCard demo.
2. Migrate images to `assets/images/`: `profile.png`, the eight project images (renaming
   `Untitled.png`), the favicon set, and `Resume.pdf`. Then delete `public/` entirely.
3. Cut Testimonials and Clients from `index.html`, **and** the testimonials/modal block
   from `script.js`.
4. Populate sidebar, About (bio + four service cards), and Resume (two timelines + five
   skill bars + PDF link).
5. Populate Portfolio: eight tiles, three filters plus All.
6. Populate Blog: six cards with downloaded banner images.
7. Contact: re-centre the map on Berlin, wire the form to Formspree.
8. Rewrite `README.md` with MIT attribution to codewithsadee.

The analytics snippet needs no removal step: step 1 replaces `index.html` wholesale, which
drops it along with the rest of the old markup.

## Prerequisite

The Formspree form ID requires Danilo to sign up and verify an email address. It is wired
in step 7, so every other step proceeds without it.

## Verification

No test framework applies to a static site. Before shipping:

1. **Demo-content grep sweep** — the file must contain no match for `lorem`, `ipsum`,
   `Richard hank`, `Orizon`, `Brawlhalla`, `Design conferences`, `avatar-`, `blog-1`
   through `blog-6`, `logo-*-color`, `codewithsadee` (outside the README attribution), or
   `example.com`.
2. **Asset resolution** — extract every local `src` and `href` and confirm each file
   exists. Zero 404s.
3. **Tab click-through** — serve locally and exercise all five tabs at mobile, tablet, and
   desktop widths.
4. **Console clean** — no errors, confirming the `script.js` edit is correct.
5. **Formspree round trip** — one real submission lands in Danilo's inbox.

## Licence

vCard is MIT licensed by codewithsadee. `README.md` must carry attribution.
