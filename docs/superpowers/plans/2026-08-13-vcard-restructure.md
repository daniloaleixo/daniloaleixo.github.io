# vCard Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Bootstrap scroll site with the vCard template — sidebar, dark theme, five-tab navigation — populated with Danilo's content, as a zero-dependency static site.

**Architecture:** Copy vCard's three files verbatim to establish a known-good rendering baseline, then edit content in place tab by tab. The Node/gulp/Heroku layer is deleted outright; the contact form moves from a dead Heroku endpoint to Formspree, which needs no server and works on GitHub Pages.

**Tech Stack:** Static HTML/CSS/JS. Ionicons 5.5.2 and Google Fonts (Poppins) via CDN — the only external runtime dependencies, both already in vCard. No build step, no package manager.

**Spec:** `docs/superpowers/specs/2026-08-13-vcard-restructure-design.md`

## Global Constraints

- **Repo root:** `/home/danilo/Documents/danilo/daniloaleixo.github.io` (`$ROOT` below).
- **vCard source:** `/home/danilo/Documents/danilo/vcard-personal-portfolio` (`$VCARD` below). Read-only — never modify it.
- **No build step.** Do not create `package.json`, `node_modules`, or any compile stage. The repo must remain directly servable by GitHub Pages.
- **`assets/css/style.css` gets exactly one edit** — the `.service-icon-box ion-icon` rule in Task 5. No other CSS changes.
- **`assets/js/script.js` gets exactly one edit** — deleting the testimonials/modal block in Task 3. No other JS changes.
- **Five nav links and five articles, in identical order** (About, Resume, Portfolio, Blog, Contact). vCard's nav handler indexes `navigationLinks[i]` with the *pages* loop index, so unequal counts or mismatched order silently break tab highlighting.
- **Email displayed on the site:** `danilo_aleixo@hotmail.com`
- **Location:** Berlin, Germany
- **No phone number and no birthday anywhere in the markup.**
- `README.md` must credit vCard's author (codewithsadee) under MIT.
- Every task ends with a commit.

---

## Verification harness

There is no test framework — this is a static site. The equivalent red/green cycle is a verification script that fails while demo content or broken asset paths remain, and passes when they are gone. It is created in Task 1 and re-run at the end of every subsequent task.

It lives in the scratchpad, **not** in the repo, because the spec's approved file layout has no `scripts/` directory.

Script path: `/tmp/claude-1000/-home-danilo-Documents-danilo-daniloaleixo-github-io/a39ccb38-d6d5-4740-95b6-979844c177b8/scratchpad/verify.sh`

Referred to below as `$VERIFY`.

---

## File structure

| File | Responsibility |
| --- | --- |
| `index.html` | The entire page: sidebar + five article tabs. Single file by template design. |
| `assets/css/style.css` | vCard's stylesheet, vendored. One added rule. |
| `assets/js/script.js` | vCard's behaviour: sidebar toggle, tab nav, portfolio filter, form validation. One deleted block. |
| `assets/images/` | Avatar, 8 project images, 6 blog banners, favicons. |
| `assets/Resume.pdf` | Downloadable CV, linked from the Resume tab. |
| `README.md` | Project description + MIT attribution. |

---

### Task 1: Baseline — vendor vCard and strip the dead stack

**Files:**
- Create: `$ROOT/assets/css/style.css`, `$ROOT/assets/js/script.js`
- Overwrite: `$ROOT/index.html`
- Delete: `index.js`, `package.json`, `package-lock.json`, `gulpfile.js`, `test.js`, `Procfile`, `app.json`, `database.json`, `manifest.json`, `browserconfig.xml`, `scss/`, `public/libs/`, `public/css/`, `public/js/`
- Create: `$VERIFY`

**Interfaces:**
- Consumes: nothing.
- Produces: a rendering vCard demo page at `$ROOT/index.html`; `$VERIFY` runnable by all later tasks.

- [ ] **Step 1: Write the verification script**

Create `$VERIFY` with exactly this content:

```bash
#!/usr/bin/env bash
# Verification harness for the vCard restructure.
# Exit 0 = clean. Exit 1 = problems found.
set -uo pipefail

ROOT="/home/danilo/Documents/danilo/daniloaleixo.github.io"
cd "$ROOT" || exit 1
fail=0

echo "== 1. Local asset resolution =="
missing=$(grep -oE '(src|href)="\./[^"]+"' index.html \
  | sed -E 's/^(src|href)="\.\///; s/"$//' \
  | sort -u \
  | while read -r f; do [ -e "$f" ] || echo "  MISSING: $f"; done)
if [ -n "$missing" ]; then
  echo "$missing"
  fail=1
else
  echo "  all local assets resolve"
fi

echo "== 2. Demo content sweep =="
patterns='lorem|ipsum|Richard hank|richard@|Orizon|Brawlhalla|Design conferences'
patterns="$patterns"'|avatar-[0-9]|blog-[1-6]\.jpg|project-[1-9]\.(jpg|png)|logo-[1-6]-color'
patterns="$patterns"'|example\.com|Sacramento|my-avatar|icon-(design|dev|app|photo)\.svg'
if grep -inE "$patterns" index.html; then
  echo "  DEMO CONTENT PRESENT (above)"
  fail=1
else
  echo "  no demo content"
fi

echo "== 3. Forbidden content sweep =="
if grep -inE 'herokuapp|analytics\.js|ga\(|testimonial|clients-list|birthday|tel:' index.html; then
  echo "  FORBIDDEN CONTENT PRESENT (above)"
  fail=1
else
  echo "  no forbidden content"
fi

echo "== 4. Nav/article parity =="
navs=$(grep -c 'data-nav-link' index.html)
pages=$(grep -c 'data-page=' index.html)
echo "  nav links: $navs, articles: $pages"
if [ "$navs" -ne "$pages" ]; then
  echo "  PARITY BROKEN - nav highlighting will fail"
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS" || echo "FAIL"
exit "$fail"
```

Then: `chmod +x $VERIFY`

- [ ] **Step 2: Copy vCard's three files**

vCard's CSS references no images (`grep -c 'url(' assets/css/style.css` returns 0), so no template images are needed — only these three files.

```bash
ROOT=/home/danilo/Documents/danilo/daniloaleixo.github.io
VCARD=/home/danilo/Documents/danilo/vcard-personal-portfolio
mkdir -p "$ROOT/assets/css" "$ROOT/assets/js" "$ROOT/assets/images"
cp "$VCARD/index.html"           "$ROOT/index.html"
cp "$VCARD/assets/css/style.css" "$ROOT/assets/css/style.css"
cp "$VCARD/assets/js/script.js"  "$ROOT/assets/js/script.js"
```

- [ ] **Step 3: Run the verifier to confirm it fails**

Run: `$VERIFY`
Expected: **FAIL** — section 1 reports missing images (`assets/images/my-avatar.png`, `project-1.jpg`, `blog-1.jpg`, …), section 2 reports demo content. This proves the harness detects problems.

- [ ] **Step 4: Delete the dead stack**

```bash
cd /home/danilo/Documents/danilo/daniloaleixo.github.io
git rm -r --quiet index.js package.json package-lock.json gulpfile.js test.js \
  Procfile app.json database.json manifest.json browserconfig.xml \
  scss public/libs public/css public/js
```

`public/assets/` is deliberately left in place — Task 2 migrates files out of it.

- [ ] **Step 5: Confirm the page renders**

```bash
cd /home/danilo/Documents/danilo/daniloaleixo.github.io && python3 -m http.server 8000 &
```

Open `http://localhost:8000`. Expected: the vCard demo renders with its dark sidebar and five tabs; all five tabs switch on click. Images are broken (expected — none copied). Stop the server afterwards.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Vendor vCard template and remove dead build/server layer"
```

---

### Task 2: Migrate images

**Files:**
- Create: 8 project images, `profile.png`, favicon set in `$ROOT/assets/images/`; `$ROOT/assets/Resume.pdf`
- Delete: `$ROOT/public/`

**Interfaces:**
- Consumes: Task 1's `assets/` tree.
- Produces: the exact filenames Tasks 4–7 reference in `src` attributes.

- [ ] **Step 1: Copy the images that survive**

```bash
cd /home/danilo/Documents/danilo/daniloaleixo.github.io
A=public/assets
I=assets/images

cp "$A/profile.png"                      "$I/profile.png"
cp "$A/berlinkino.jpg"                   "$I/berlinkino.jpg"
cp "$A/aereozen.jpg"                     "$I/aereozen.jpg"
cp "$A/paisesvisitados.jpg"              "$I/paisesvisitados.jpg"
cp "$A/Untitled.png"                     "$I/neuroevolution.png"
cp "$A/finkids.png"                      "$I/finkids.png"
cp "$A/getup-project.png"                "$I/getup-project.png"
cp "$A/calendar-component.png"           "$I/calendar-component.png"
cp "$A/olha-por-onde-anda-project.png"   "$I/olha-por-onde-anda-project.png"

cp "$A/favicon.ico"           "$I/favicon.ico"
cp "$A/favicon-16x16.png"     "$I/favicon-16x16.png"
cp "$A/favicon-32x32.png"     "$I/favicon-32x32.png"
cp "$A/favicon-96x96.png"     "$I/favicon-96x96.png"
cp "$A/apple-icon-180x180.png" "$I/apple-icon-180x180.png"
cp "$A/android-icon-192x192.png" "$I/android-icon-192x192.png"

cp "$A/Resume.pdf" assets/Resume.pdf
```

- [ ] **Step 2: Verify every copy landed**

```bash
ls -1 assets/images/ | sort && ls -1 assets/Resume.pdf
```

Expected: 15 files in `assets/images/`, plus `assets/Resume.pdf`. If `Untitled.png` was missing, stop and report — it is the Neuro Evolution project image and has no substitute.

- [ ] **Step 3: Delete the old asset tree**

```bash
git rm -r --quiet public
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Migrate images and resume PDF to assets/, drop public/"
```

---

### Task 3: Cut Testimonials and Clients — HTML and JS

Deleting the Testimonials markup without also editing `script.js` produces a page where **every navigation tab is dead**: `modalCloseBtn` and `overlay` become `null`, and the unconditional `addEventListener` calls on them throw a `TypeError` that halts the script before the nav handler is registered. The two deletions must land in the same commit.

**Files:**
- Modify: `$ROOT/index.html` (remove the `<section class="testimonials">`, `<section class="testimonials-modal">`, and `<section class="clients">` blocks)
- Modify: `$ROOT/assets/js/script.js` (remove the testimonials/modal block)

**Interfaces:**
- Consumes: Task 1's vendored files.
- Produces: an About article containing only `about-text` and `service`; a `script.js` whose remaining globals are `sidebar`, `sidebarBtn`, `select`, `selectItems`, `selectValue`, `filterBtn`, `filterItems`, `filterFunc`, `form`, `formInputs`, `formBtn`, `navigationLinks`, `pages`.

- [ ] **Step 1: Delete the three HTML sections**

In `index.html`, delete from the `<!-- - testimonials -->` comment through the `</section>` that closes `<section class="clients">` — that single contiguous span covers the testimonials list, the testimonials modal, and the clients carousel. The `</article>` that follows must remain.

After deletion the About article ends:

```html
        </ul>

      </section>

      </article>
```

(the `</ul>`/`</section>` closing the service list, then the article close)

- [ ] **Step 2: Delete the testimonials block from `script.js`**

Remove everything from the `// testimonials variables` comment through the line `overlay.addEventListener("click", testimonialsModalFunc);` inclusive. That is these declarations and statements:

```js
const testimonialsItem = ...
const modalContainer = ...
const modalCloseBtn = ...
const overlay = ...
const modalImg = ...
const modalTitle = ...
const modalText = ...
const testimonialsModalFunc = function () { ... }
for (let i = 0; i < testimonialsItem.length; i++) { ... }
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);
```

The file must go directly from the sidebar block to `// custom select variables`. Leave `elementToggleFunc` — the sidebar and filter select both use it.

- [ ] **Step 3: Verify the script still binds**

Serve locally (`python3 -m http.server 8000`), open the page, and open the browser console.

Expected: **zero errors**, and clicking each of the five nav tabs switches the article. If tabs are dead, the JS deletion was incomplete — a `null` reference is still throwing.

- [ ] **Step 4: Run the verifier**

Run: `$VERIFY`
Expected: section 3 no longer reports `testimonial` or `clients-list`. Sections 1 and 2 still fail (demo content remains) — that is correct at this stage.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/js/script.js
git commit -m "Remove testimonials and clients sections and their dead JS"
```

---

### Task 4: Sidebar

**Files:**
- Modify: `$ROOT/index.html` — `<head>` and `<aside class="sidebar">`

**Interfaces:**
- Consumes: `assets/images/profile.png`, favicon set from Task 2.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Replace the `<head>` title and favicon**

```html
  <title>Danilo Aleixo — Tech Lead</title>

  <link rel="shortcut icon" href="./assets/images/favicon.ico" type="image/x-icon">
  <link rel="icon" type="image/png" sizes="32x32" href="./assets/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="./assets/images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="./assets/images/apple-icon-180x180.png">
```

- [ ] **Step 2: Replace the sidebar body**

Replace everything between `<aside class="sidebar" data-sidebar>` and its closing `</aside>` with:

```html
      <div class="sidebar-info">

        <figure class="avatar-box">
          <img src="./assets/images/profile.png" alt="Danilo Aleixo" width="80">
        </figure>

        <div class="info-content">
          <h1 class="name" title="Danilo Aleixo">Danilo Aleixo</h1>

          <p class="title">Tech Lead</p>
        </div>

        <button class="info_more-btn" data-sidebar-btn>
          <span>Show Contacts</span>

          <ion-icon name="chevron-down"></ion-icon>
        </button>

      </div>

      <div class="sidebar-info_more">

        <div class="separator"></div>

        <ul class="contacts-list">

          <li class="contact-item">

            <div class="icon-box">
              <ion-icon name="mail-outline"></ion-icon>
            </div>

            <div class="contact-info">
              <p class="contact-title">Email</p>

              <a href="mailto:danilo_aleixo@hotmail.com" class="contact-link">danilo_aleixo@hotmail.com</a>
            </div>

          </li>

          <li class="contact-item">

            <div class="icon-box">
              <ion-icon name="location-outline"></ion-icon>
            </div>

            <div class="contact-info">
              <p class="contact-title">Location</p>

              <address>Berlin, Germany</address>
            </div>

          </li>

        </ul>

        <div class="separator"></div>

        <ul class="social-list">

          <li class="social-item">
            <a href="https://github.com/daniloaleixo" class="social-link" target="_blank" rel="noopener">
              <ion-icon name="logo-github"></ion-icon>
            </a>
          </li>

          <li class="social-item">
            <a href="https://www.linkedin.com/in/danilo-aleixo/" class="social-link" target="_blank" rel="noopener">
              <ion-icon name="logo-linkedin"></ion-icon>
            </a>
          </li>

          <li class="social-item">
            <a href="https://medium.com/@daniloaleixo94" class="social-link" target="_blank" rel="noopener">
              <ion-icon name="logo-medium"></ion-icon>
            </a>
          </li>

          <li class="social-item">
            <a href="https://www.behance.net/DANILO_ALEIXO" class="social-link" target="_blank" rel="noopener">
              <ion-icon name="logo-behance"></ion-icon>
            </a>
          </li>

          <li class="social-item">
            <a href="https://www.facebook.com/daniloaleixo" class="social-link" target="_blank" rel="noopener">
              <ion-icon name="logo-facebook"></ion-icon>
            </a>
          </li>

        </ul>

      </div>
```

- [ ] **Step 3: Run the verifier**

Run: `$VERIFY`
Expected: section 2 no longer reports `my-avatar` or `richard@`; section 3 no longer reports `birthday` or `tel:`.

- [ ] **Step 4: Visual check**

Serve locally. Expected: avatar renders, name reads "Danilo Aleixo", "Show Contacts" expands to exactly two rows (Email, Location), five social icons all render as glyphs (no empty boxes).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Populate sidebar with Danilo's identity, contacts and socials"
```

---

### Task 5: About tab

**Files:**
- Modify: `$ROOT/index.html` — `<article class="about">`
- Modify: `$ROOT/assets/css/style.css` — one appended rule

**Interfaces:**
- Consumes: Task 3's trimmed About article.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Add the ion-icon sizing rule to `style.css`**

vCard's service cards use `<img>` with `.service-icon-box img { margin: auto; }` at line 545. Ionicons need an equivalent. Append immediately after that rule:

```css
.service-icon-box ion-icon {
  display: block;
  margin: auto;
  font-size: 40px;
  color: var(--orange-yellow-crayola);
}
```

`--orange-yellow-crayola` is defined at line 66 and is the template's accent colour.

- [ ] **Step 2: Replace the about-text paragraphs**

```html
        <section class="about-text">
          <p>
            I'm Danilo Aleixo, a Tech Lead with over 10 years of experience leading cross-functional teams and
            building scalable, high-impact pricing platforms. With a strong foundation in Computer Science and more
            than a decade of coding experience, I thrive at the intersection of complex algorithmic logic and
            real-world business challenges.
          </p>

          <p>
            At numa, I lead the development of pricing tools and systems that integrate advanced algorithms with
            robust cloud architecture — driving automation, precision, and performance at scale. My expertise spans
            full-stack development (Node.js, React), cloud-native applications (AWS, Kubernetes), and architectural
            design of distributed systems.
          </p>
        </section>
```

- [ ] **Step 3: Replace the four service cards**

Replace the contents of `<ul class="service-list">` with:

```html
            <li class="service-item">

              <div class="service-icon-box">
                <ion-icon name="pricetags-outline"></ion-icon>
              </div>

              <div class="service-content-box">
                <h4 class="h4 service-item-title">Pricing Platforms &amp; Algorithms</h4>

                <p class="service-item-text">
                  Designing and shipping algorithm-driven pricing systems that turn complex business logic into
                  automated, precise decisions at scale.
                </p>
              </div>

            </li>

            <li class="service-item">

              <div class="service-icon-box">
                <ion-icon name="code-slash-outline"></ion-icon>
              </div>

              <div class="service-content-box">
                <h4 class="h4 service-item-title">Full-Stack Development</h4>

                <p class="service-item-text">
                  End-to-end product work across Node.js, TypeScript, React and Angular — from data model to the
                  interface people actually use.
                </p>
              </div>

            </li>

            <li class="service-item">

              <div class="service-icon-box">
                <ion-icon name="cloud-outline"></ion-icon>
              </div>

              <div class="service-content-box">
                <h4 class="h4 service-item-title">Cloud Architecture</h4>

                <p class="service-item-text">
                  Scalable microservices on AWS and Kubernetes, built for the failure modes distributed systems
                  actually hit in production.
                </p>
              </div>

            </li>

            <li class="service-item">

              <div class="service-icon-box">
                <ion-icon name="people-outline"></ion-icon>
              </div>

              <div class="service-content-box">
                <h4 class="h4 service-item-title">Technical Leadership</h4>

                <p class="service-item-text">
                  Mentoring engineers, growing ownership across teams, and keeping technical decisions aligned with
                  what the product actually needs.
                </p>
              </div>

            </li>
```

Also change the section heading from `What i'm doing` to `What I'm doing` (the template's lowercase "i" is a typo).

- [ ] **Step 4: Run the verifier**

Run: `$VERIFY`
Expected: section 2 no longer reports `icon-design.svg`, `icon-dev.svg`, `icon-app.svg`, `icon-photo.svg`, `lorem`, or `ipsum`.

- [ ] **Step 5: Visual check**

Serve locally, open the About tab. Expected: two bio paragraphs, four cards in a 2×2 grid on desktop, each with a gold Ionicon at 40px. If icons render as blank space, the CSS rule in Step 1 did not apply.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "Populate About tab with bio and service cards"
```

---

### Task 6: Resume tab

**Files:**
- Modify: `$ROOT/index.html` — `<article class="resume">`

**Interfaces:**
- Consumes: `assets/Resume.pdf` from Task 2.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Add the PDF download link under the article header**

Replace the resume article's `<header>` with:

```html
        <header>
          <h2 class="h2 article-title">Resume</h2>

          <p class="service-item-text" style="margin-bottom: 20px;">
            <a href="./assets/Resume.pdf" target="_blank" rel="noopener"
               style="color: var(--orange-yellow-crayola);">Download as PDF</a>
          </p>
        </header>
```

This is the one deliberate addition to the template. Inline styles are used rather than a new CSS class to keep the "one CSS edit" constraint intact.

- [ ] **Step 2: Replace the Education timeline items**

Replace the contents of the first `<ol class="timeline-list">`:

```html
            <li class="timeline-item">

              <h4 class="h4 timeline-item-title">deeplearning.ai — Deep Learning Specialization</h4>

              <span>Jul 2019 — Nov 2019</span>

              <p class="timeline-text">
                Specialization covering a broad spectrum of algorithms and deep learning architectures.
              </p>

            </li>

            <li class="timeline-item">

              <h4 class="h4 timeline-item-title">University of São Paulo — BSc Computer Science</h4>

              <span>Jan 2012 — Dec 2017</span>

              <p class="timeline-text">
                Held a CNPq Scientific Initiation scholarship for one year, leading to the publication of the
                research "Event Simulator for Spacial Systems".
              </p>

            </li>
```

- [ ] **Step 3: Replace the Experience timeline items**

Replace the contents of the second `<ol class="timeline-list">`:

```html
            <li class="timeline-item">

              <h4 class="h4 timeline-item-title">Lead Engineer — numa (formerly COSI)</h4>

              <span>Mar 2021 — Present</span>

              <p class="timeline-text">
                Leading the architecture and development of pricing tools and algorithm-driven systems across numa's
                tech stack. Driving innovation through scalable microservices and cloud infrastructure (AWS,
                Kubernetes). Working closely with product and data teams to integrate complex logic into
                customer-facing solutions, and mentoring engineers toward technical excellence and ownership.
              </p>

            </li>

            <li class="timeline-item">

              <h4 class="h4 timeline-item-title">Software Architect — Learn To Fly</h4>

              <span>Feb 2018 — Feb 2021</span>

              <p class="timeline-text">
                Responsible for turning the idea into reality. Architected and helped develop the whole system from
                the ground up, managing a team of developers and designers across a full spectrum of services using
                Node, Angular, React, AWS and Kubernetes.
              </p>

            </li>

            <li class="timeline-item">

              <h4 class="h4 timeline-item-title">Tech Lead / Full-Stack Developer — Colmeia</h4>

              <span>Apr 2017 — Feb 2018</span>

              <p class="timeline-text">
                Managed a small team of developers and designers delivering the full client application in Angular.
                Architected a fully scalable client application using design patterns and object-oriented approaches,
                and helped architect a Node.js backend on GCP built for scalable growth and performance.
              </p>

            </li>

            <li class="timeline-item">

              <h4 class="h4 timeline-item-title">Founder — EduCaqui</h4>

              <span>Mar 2016 — Feb 2017</span>

              <p class="timeline-text">
                Founded with friends as a peer-to-peer tutoring platform. Took it from ideation to implementation and
                raised angel investment, but the company folded during the test phase.
              </p>

            </li>

            <li class="timeline-item">

              <h4 class="h4 timeline-item-title">Intern — Itaú BBA</h4>

              <span>Aug 2014 — Aug 2016</span>

              <p class="timeline-text">
                Worked in software development and business analysis for several of the bank's foreign units,
                including New York, Nassau/Cayman and London.
              </p>

            </li>
```

- [ ] **Step 4: Replace the skills list**

Replace the contents of `<ul class="skills-list content-card">`:

```html
            <li class="skills-item">

              <div class="title-wrapper">
                <h5 class="h5">Backend &amp; Distributed Systems</h5>
                <data value="90">90%</data>
              </div>

              <div class="skill-progress-bg">
                <div class="skill-progress-fill" style="width: 90%;"></div>
              </div>

            </li>

            <li class="skills-item">

              <div class="title-wrapper">
                <h5 class="h5">Technical Leadership &amp; Mentoring</h5>
                <data value="90">90%</data>
              </div>

              <div class="skill-progress-bg">
                <div class="skill-progress-fill" style="width: 90%;"></div>
              </div>

            </li>

            <li class="skills-item">

              <div class="title-wrapper">
                <h5 class="h5">Cloud &amp; Infrastructure (AWS, Kubernetes)</h5>
                <data value="85">85%</data>
              </div>

              <div class="skill-progress-bg">
                <div class="skill-progress-fill" style="width: 85%;"></div>
              </div>

            </li>

            <li class="skills-item">

              <div class="title-wrapper">
                <h5 class="h5">Algorithms &amp; Pricing Systems</h5>
                <data value="85">85%</data>
              </div>

              <div class="skill-progress-bg">
                <div class="skill-progress-fill" style="width: 85%;"></div>
              </div>

            </li>

            <li class="skills-item">

              <div class="title-wrapper">
                <h5 class="h5">Frontend (React, Angular, TypeScript)</h5>
                <data value="80">80%</data>
              </div>

              <div class="skill-progress-bg">
                <div class="skill-progress-fill" style="width: 80%;"></div>
              </div>

            </li>
```

Also change the `My skills` heading to `Skills`.

- [ ] **Step 5: Run the verifier and check visually**

Run: `$VERIFY` — expect no new failures.
Serve locally, open the Resume tab. Expected: "Download as PDF" link opens the CV; two timelines with 2 and 5 entries; five progress bars filled to their stated widths.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Populate Resume tab with timelines, skills and PDF link"
```

---

### Task 7: Portfolio tab

`script.js` matches `button.innerText.toLowerCase()` against `data-category`, so the attribute values must be exactly `web apps`, `ai & ml`, and `games`. The label `AI &amp; ML` has `innerText` of `AI & ML`, which lowercases to `ai & ml` — matching. Any deviation silently breaks filtering.

**Files:**
- Modify: `$ROOT/index.html` — `<article class="portfolio">`

**Interfaces:**
- Consumes: the 8 project images from Task 2.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Replace the filter button list**

```html
          <ul class="filter-list">

            <li class="filter-item">
              <button class="active" data-filter-btn>All</button>
            </li>

            <li class="filter-item">
              <button data-filter-btn>Web apps</button>
            </li>

            <li class="filter-item">
              <button data-filter-btn>AI &amp; ML</button>
            </li>

            <li class="filter-item">
              <button data-filter-btn>Games</button>
            </li>

          </ul>
```

- [ ] **Step 2: Replace the mobile select list**

The `<ul class="select-list">` must carry the same four labels in the same order:

```html
            <ul class="select-list">

              <li class="select-item">
                <button data-select-item>All</button>
              </li>

              <li class="select-item">
                <button data-select-item>Web apps</button>
              </li>

              <li class="select-item">
                <button data-select-item>AI &amp; ML</button>
              </li>

              <li class="select-item">
                <button data-select-item>Games</button>
              </li>

            </ul>
```

- [ ] **Step 3: Replace the project list**

Replace the contents of `<ul class="project-list">` with all eight tiles:

```html
            <li class="project-item  active" data-filter-item data-category="web apps">
              <a href="https://berlinkino.aereozen.com/" target="_blank" rel="noopener">

                <figure class="project-img">
                  <div class="project-item-icon-box">
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>

                  <img src="./assets/images/berlinkino.jpg" alt="Berlin Cinema Guide" loading="lazy">
                </figure>

                <h3 class="project-title">Berlin Cinema Guide</h3>

                <p class="project-category">Web apps</p>

              </a>
            </li>

            <li class="project-item  active" data-filter-item data-category="web apps">
              <a href="https://paisesvisitados.aereozen.com/" target="_blank" rel="noopener">

                <figure class="project-img">
                  <div class="project-item-icon-box">
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>

                  <img src="./assets/images/paisesvisitados.jpg" alt="Paises Visitados" loading="lazy">
                </figure>

                <h3 class="project-title">Paises Visitados</h3>

                <p class="project-category">Web apps</p>

              </a>
            </li>

            <li class="project-item  active" data-filter-item data-category="web apps">
              <a href="https://daniloaleixo.github.io/financial-education-landing/" target="_blank" rel="noopener">

                <figure class="project-img">
                  <div class="project-item-icon-box">
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>

                  <img src="./assets/images/finkids.png" alt="Financial Education App" loading="lazy">
                </figure>

                <h3 class="project-title">Financial Education App</h3>

                <p class="project-category">Web apps</p>

              </a>
            </li>

            <li class="project-item  active" data-filter-item data-category="web apps">
              <a href="https://daniloaleixo.github.io/calendar-component/" target="_blank" rel="noopener">

                <figure class="project-img">
                  <div class="project-item-icon-box">
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>

                  <img src="./assets/images/calendar-component.png" alt="Calendar Component" loading="lazy">
                </figure>

                <h3 class="project-title">Calendar Component</h3>

                <p class="project-category">Web apps</p>

              </a>
            </li>

            <li class="project-item  active" data-filter-item data-category="ai &amp; ml">
              <a href="https://ai.aereozen.com/" target="_blank" rel="noopener">

                <figure class="project-img">
                  <div class="project-item-icon-box">
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>

                  <img src="./assets/images/aereozen.jpg" alt="Aereozen" loading="lazy">
                </figure>

                <h3 class="project-title">Aereozen</h3>

                <p class="project-category">AI &amp; ML</p>

              </a>
            </li>

            <li class="project-item  active" data-filter-item data-category="ai &amp; ml">
              <a href="https://github.com/daniloaleixo/NeuroEvolutionMarketTrader" target="_blank" rel="noopener">

                <figure class="project-img">
                  <div class="project-item-icon-box">
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>

                  <img src="./assets/images/neuroevolution.png" alt="Neuro Evolution Market Trading" loading="lazy">
                </figure>

                <h3 class="project-title">Neuro Evolution Market Trading</h3>

                <p class="project-category">AI &amp; ML</p>

              </a>
            </li>

            <li class="project-item  active" data-filter-item data-category="games">
              <a href="https://daniloaleixo.github.io/jogo_olhe_por_onde_anda/app/index.html" target="_blank" rel="noopener">

                <figure class="project-img">
                  <div class="project-item-icon-box">
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>

                  <img src="./assets/images/olha-por-onde-anda-project.png" alt="Olha por Onde Anda" loading="lazy">
                </figure>

                <h3 class="project-title">Olha por Onde Anda</h3>

                <p class="project-category">Games</p>

              </a>
            </li>

            <li class="project-item  active" data-filter-item data-category="games">
              <a href="https://daretokill-79f8f.firebaseapp.com/" target="_blank" rel="noopener">

                <figure class="project-img">
                  <div class="project-item-icon-box">
                    <ion-icon name="eye-outline"></ion-icon>
                  </div>

                  <img src="./assets/images/getup-project.png" alt="I Dare You To Kill My App" loading="lazy">
                </figure>

                <h3 class="project-title">I Dare You To Kill My App</h3>

                <p class="project-category">Games</p>

              </a>
            </li>
```

- [ ] **Step 4: Test the filter**

Serve locally, open the Portfolio tab. Click each filter button in turn.

Expected: All → 8 tiles; Web apps → 4; AI & ML → 2; Games → 2. Narrow the window below 580px and repeat via the dropdown — same counts. If a filter shows zero tiles, the `data-category` value does not match the button's lowercased text.

- [ ] **Step 5: Run the verifier**

Run: `$VERIFY`
Expected: section 2 no longer reports `project-[1-9]` or `Orizon`/`Brawlhalla`.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Populate Portfolio tab with 8 projects and category filters"
```

---

### Task 8: Blog tab

**Files:**
- Create: 6 banner images in `$ROOT/assets/images/`
- Modify: `$ROOT/index.html` — `<article class="blog">`

**Interfaces:**
- Consumes: nothing from earlier tasks beyond the `assets/images/` directory.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Download the six banner images**

Medium's CDN blocks cross-origin requests, so these must be committed locally rather than hotlinked.

```bash
cd /home/danilo/Documents/danilo/daniloaleixo.github.io/assets/images
curl -sL -o blog-jira.jpg          "https://cdn-images-1.medium.com/max/1024/1*u0zwdswHPi7wZ8X_iKnfOw.jpeg"
curl -sL -o blog-claude-devin.jpg  "https://cdn-images-1.medium.com/max/1024/1*3bS16fdXgv25Hs5wSDKgJQ.jpeg"
curl -sL -o blog-berlin.jpg        "https://cdn-images-1.medium.com/max/1000/1*-sJYOCuJErMnlEilIwXa3w.jpeg"
curl -sL -o blog-ia-esconder.jpg   "https://cdn-images-1.medium.com/max/900/1*1xXWVOj3O8ntKoqsN6Og-Q.jpeg"
curl -sL -o blog-prompt.jpg        "https://cdn-images-1.medium.com/max/1024/0*WZjSmVecJrhl8ciL"
curl -sL -o blog-cinema.jpg        "https://cdn-images-1.medium.com/max/780/1*qq_RVd3nDHVosV2dgl86Vw.jpeg"
file blog-*.jpg
```

Expected: `file` reports JPEG image data for all six. If any reports HTML or an empty file, that URL 404'd — report it rather than committing a broken image.

- [ ] **Step 2: Replace the blog post list**

Replace the contents of `<ul class="blog-posts-list">`:

```html
            <li class="blog-post-item">
              <a href="https://medium.com/@daniloaleixo94/jira-me-ensinou-a-tolerar-o-que-n%C3%A3o-devia-00dcc6c98356" target="_blank" rel="noopener">

                <figure class="blog-banner-box">
                  <img src="./assets/images/blog-jira.jpg" alt="Jira me ensinou a tolerar o que não devia" loading="lazy">
                </figure>

                <div class="blog-content">

                  <div class="blog-meta">
                    <p class="blog-category">Engineering</p>

                    <span class="dot"></span>

                    <time datetime="2026-05-18">May 18, 2026</time>
                  </div>

                  <h3 class="h3 blog-item-title">Jira me ensinou a tolerar o que não devia</h3>

                  <p class="blog-text">
                    Passei anos trabalhando com Jira. Aprendi a conviver com ele da mesma forma que se aprende a
                    conviver com um escritório barulhento.
                  </p>

                </div>

              </a>
            </li>

            <li class="blog-post-item">
              <a href="https://medium.com/@daniloaleixo94/por-que-usamos-claude-e-devin-ao-mesmo-tempo-e6fb5420d9cd" target="_blank" rel="noopener">

                <figure class="blog-banner-box">
                  <img src="./assets/images/blog-claude-devin.jpg" alt="Por que usamos Claude e Devin ao mesmo tempo?" loading="lazy">
                </figure>

                <div class="blog-content">

                  <div class="blog-meta">
                    <p class="blog-category">AI</p>

                    <span class="dot"></span>

                    <time datetime="2026-05-15">May 15, 2026</time>
                  </div>

                  <h3 class="h3 blog-item-title">Por que usamos Claude e Devin ao mesmo tempo?</h3>

                  <p class="blog-text">
                    Há alguns meses, adotamos o Claude como nosso principal agente de código. Funciona bem: ele
                    entende contexto e raciocina sobre arquitetura.
                  </p>

                </div>

              </a>
            </li>

            <li class="blog-post-item">
              <a href="https://medium.com/@daniloaleixo94/todo-mundo-envelhece-berlin-n%C3%A3o-dad120827fba" target="_blank" rel="noopener">

                <figure class="blog-banner-box">
                  <img src="./assets/images/blog-berlin.jpg" alt="Todo mundo envelhece, Berlin não" loading="lazy">
                </figure>

                <div class="blog-content">

                  <div class="blog-meta">
                    <p class="blog-category">Berlin</p>

                    <span class="dot"></span>

                    <time datetime="2026-04-27">Apr 27, 2026</time>
                  </div>

                  <h3 class="h3 blog-item-title">Todo mundo envelhece, Berlin não</h3>

                  <p class="blog-text">
                    Ontem eu vi ele de novo. Estava na plataforma do metrô, cantando para ninguém em particular — ou
                    talvez para todo mundo.
                  </p>

                </div>

              </a>
            </li>

            <li class="blog-post-item">
              <a href="https://medium.com/@daniloaleixo94/quando-a-ia-precisa-se-esconder-c9190fca25a1" target="_blank" rel="noopener">

                <figure class="blog-banner-box">
                  <img src="./assets/images/blog-ia-esconder.jpg" alt="Quando a IA Precisa se Esconder" loading="lazy">
                </figure>

                <div class="blog-content">

                  <div class="blog-meta">
                    <p class="blog-category">AI</p>

                    <span class="dot"></span>

                    <time datetime="2026-04-01">Apr 1, 2026</time>
                  </div>

                  <h3 class="h3 blog-item-title">Quando a IA Precisa se Esconder</h3>

                  <p class="blog-text">
                    Há alguns dias, a Anthropic acidentalmente publicou no npm algo que não deveria estar lá: source
                    maps do Claude Code.
                  </p>

                </div>

              </a>
            </li>

            <li class="blog-post-item">
              <a href="https://medium.com/@daniloaleixo94/prompt-bom-n%C3%A3o-escala-c10b8d73fdae" target="_blank" rel="noopener">

                <figure class="blog-banner-box">
                  <img src="./assets/images/blog-prompt.jpg" alt="Prompt bom não escala" loading="lazy">
                </figure>

                <div class="blog-content">

                  <div class="blog-meta">
                    <p class="blog-category">AI</p>

                    <span class="dot"></span>

                    <time datetime="2026-02-12">Feb 12, 2026</time>
                  </div>

                  <h3 class="h3 blog-item-title">Prompt bom não escala</h3>

                  <p class="blog-text">
                    Outro dia assisti a um vídeo do John Lindquist — cofundador do egghead.io — onde ele mostrava
                    como usa o Claude Code no dia a dia.
                  </p>

                </div>

              </a>
            </li>

            <li class="blog-post-item">
              <a href="https://medium.com/@daniloaleixo94/i-built-a-website-because-i-was-annoyed-76e08653c4f5" target="_blank" rel="noopener">

                <figure class="blog-banner-box">
                  <img src="./assets/images/blog-cinema.jpg" alt="I built a website because I was annoyed" loading="lazy">
                </figure>

                <div class="blog-content">

                  <div class="blog-meta">
                    <p class="blog-category">Side projects</p>

                    <span class="dot"></span>

                    <time datetime="2026-02-09">Feb 9, 2026</time>
                  </div>

                  <h3 class="h3 blog-item-title">I built a website because I was annoyed</h3>

                  <p class="blog-text">
                    I love going to the cinema in Berlin. The city has an incredible scene — small independent
                    theaters showing films in original language.
                  </p>

                </div>

              </a>
            </li>
```

- [ ] **Step 3: Run the verifier and check visually**

Run: `$VERIFY`
Expected: section 2 no longer reports `blog-[1-6].jpg` or `Design conferences`.

Serve locally, open the Blog tab. Expected: six cards, each with a rendered banner, opening the right Medium post in a new tab.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/images/blog-*.jpg
git commit -m "Populate Blog tab with six Medium posts"
```

---

### Task 9: Contact tab

**Files:**
- Modify: `$ROOT/index.html` — `<article class="contact">`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: nothing later tasks depend on.

**Blocking input:** this task needs Danilo's Formspree form ID (the `xdoqnvpk`-style token from `https://formspree.io/f/<id>` after signing up at formspree.io and verifying `danilo_aleixo@hotmail.com`). **Do not invent or guess this value.** If it is not available, complete Step 1, stop, and report that Step 2 is blocked on the ID — every other task in this plan is unaffected.

- [ ] **Step 1: Re-centre the map on Berlin**

Replace the mapbox iframe `src`. This query-based embed form needs no API key:

```html
        <section class="mapbox" data-mapbox>
          <figure>
            <iframe
              src="https://maps.google.com/maps?q=Berlin,Germany&amp;t=&amp;z=11&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
              width="400" height="300" loading="lazy" title="Berlin, Germany"></iframe>
          </figure>
        </section>
```

- [ ] **Step 2: Point the form at Formspree**

Change only the `<form>` opening tag, substituting the real ID for `FORMSPREE_FORM_ID`:

```html
          <form action="https://formspree.io/f/FORMSPREE_FORM_ID" method="POST" class="form" data-form>
```

Leave the inputs, textarea, and button untouched — `script.js` depends on their `data-form-input` and `data-form-btn` attributes for the submit-button enabling logic.

- [ ] **Step 3: Test a real submission**

Serve locally, open the Contact tab, fill all three fields, and submit.

Expected: the Send button stays disabled until the form is valid, then enables; submitting redirects to a Formspree confirmation page and an email arrives at `danilo_aleixo@hotmail.com`. The first submission may require confirming the form in Formspree's UI.

- [ ] **Step 4: Run the verifier**

Run: `$VERIFY`
Expected: **PASS** — this is the first task at which all four sections should be clean.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Point contact form at Formspree and re-centre map on Berlin"
```

---

### Task 10: README, attribution, and final sweep

**Files:**
- Overwrite: `$ROOT/README.md`

**Interfaces:**
- Consumes: the finished site.
- Produces: the shippable repository.

- [ ] **Step 1: Rewrite the README**

````markdown
# daniloaleixo.github.io

Personal portfolio site for Danilo Aleixo — Tech Lead, Berlin.

Live at [daniloaleixo.github.io](https://daniloaleixo.github.io).

## Structure

Static site, no build step. Open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
```

- `index.html` — the whole page: sidebar plus five tabs (About, Resume, Portfolio, Blog, Contact)
- `assets/css/style.css` — stylesheet
- `assets/js/script.js` — tab navigation, portfolio filtering, form validation
- `assets/images/` — avatar, project and blog images, favicons
- `assets/Resume.pdf` — downloadable CV

External runtime dependencies: [Ionicons](https://ionic.io/ionicons) and Google Fonts
(Poppins), both via CDN. The contact form posts to [Formspree](https://formspree.io).

## Updating the blog

The Blog tab is hand-maintained. After publishing on
[Medium](https://medium.com/@daniloaleixo94), add a card to `<ul class="blog-posts-list">`
in `index.html`, drop its banner image into `assets/images/`, and remove the oldest card.

## Credits

Built on the [vCard personal portfolio](https://github.com/codewithsadee/vcard-personal-portfolio)
template by [codewithsadee](https://github.com/codewithsadee), used under the MIT License.

## License

MIT — see [LICENSE](./LICENSE).
````

- [ ] **Step 2: Final verification sweep**

```bash
$VERIFY
```

Expected: **PASS**, with nav/article parity reporting 5 and 5.

- [ ] **Step 3: Cross-viewport check**

Serve locally and exercise all five tabs at three widths: 375px (mobile), 768px (tablet), 1440px (desktop).

Expected at every width: sidebar renders and its "Show Contacts" toggle works on mobile; all five tabs switch; portfolio filters work (buttons on desktop, dropdown on mobile); no horizontal page scroll; browser console free of errors.

- [ ] **Step 4: Confirm no stale files remain**

```bash
cd /home/danilo/Documents/danilo/daniloaleixo.github.io
git status --porcelain
ls -1
```

Expected top level: `assets/`, `docs/`, `Layout Design/`, `index.html`, `LICENSE`, `README.md`, and nothing else tracked. `Layout Design/` must still be present and unmodified.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Rewrite README with vCard attribution and update instructions"
```

---

## Self-review notes

**Spec coverage:** every spec section maps to a task — target file structure and deletions (Tasks 1–2), cut vCard components (Task 3), sidebar (Task 4), About (Task 5), Resume including skills and PDF (Task 6), Portfolio with filter mechanics (Task 7), Blog (Task 8), Contact with map and Formspree (Task 9), attribution and verification (Task 10). The dead-JS hazard and the nav-parity constraint are enforced in Task 3 and by the verifier's section 4.

**Known open item:** the five skill percentages in Task 6 are drafted, not measured. The spec records that they ship as written unless Danilo corrects them.

**Known blocker:** Task 9 Step 2 requires the Formspree form ID. Every other step is independent of it.
