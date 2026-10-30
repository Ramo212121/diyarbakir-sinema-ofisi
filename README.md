# Diyarbakır Sinema Ofisi — Film Office Website & Casting Platform

A website and an actor/cast registration system for **Diyarbakır Sinema Ofisi** (Diyarbakır Film Office), an organisation that has supported film, TV, documentary and commercial productions in south-eastern Turkey since 2017.

It is a static site with no framework and no paid backend. Applicants fill in an 8-step form. A small Cloudflare Worker checks each submission and writes the data and photos to Airtable, and a scheduled Google Apps Script emails the agency a print-ready PDF of every application.

> **Live site:** [diyarbakirsinemaofisi.com](https://diyarbakirsinemaofisi.com) · **Status:** client project, live since October 2026
> The site is in Turkish; the code comments are in Turkish as well.

![Homepage](docs/screenshots/hero.jpg)

---

## Highlights

| | |
|---|---|
| ![Registration form](docs/screenshots/form.jpg) | ![Film awards dialog](docs/screenshots/film-modal.jpg) |
| **8-step registration form**: progress sidebar, conditional steps, inline validation | **Project archive**: 12 films with festival and award history in an accessible dialog |
| ![Mobile](docs/screenshots/mobile.jpg) | ![Generated PDF](docs/screenshots/pdf-sample.jpg) |
| **Responsive**: phone and tablet layouts, mobile menu, touch-friendly controls | **Automatic PDF**: every application arrives as a printable A4 sheet by email (sample data) |

![Footer film strip](docs/screenshots/footer.jpg)

### More screenshots

| | |
|---|---|
| ![Projects](docs/screenshots/projects.jpg) | ![Services](docs/screenshots/services.jpg) |
| **Projects**: poster grid with hover details | **Services**: six service areas, with one wide card listing logistics |
| ![Gallery](docs/screenshots/gallery.jpg) | ![Lightbox](docs/screenshots/lightbox.jpg) |
| **Gallery**: masonry layout of set photos | **Lightbox**: keyboard arrows, swipe, image counter |
| ![Review step](docs/screenshots/form-summary.jpg) | ![404 page](docs/screenshots/404.jpg) |
| **Review step**: every answer grouped by step, with "Edit" links and a portrait preview (sample data) | **404 page**: on-brand error page |

---

## The brief

The office collected casting applications through Google Forms. Three things were wrong with it:

- it sent applicants away from the website,
- it couldn't take photo uploads in a usable way,
- it left the agency with a spreadsheet instead of something they could print and file.

The client wanted three things:

1. a site that presents the office and its film work with a strong cinematic identity;
2. a registration form that stays on the site, accepts photos and works well on phones;
3. each application delivered as a **printable document**, with no manual copying.

## My role

I handled design and development end to end, from the first layout to the live site:

- visual identity on the web: type, colour, motion,
- front-end development,
- the data model in Airtable,
- the PDF and email automation,
- SEO,
- security hardening.

---

## Features

**Website**
- Cinematic visual language:
  - condensed display type paired with a typewriter label font,
  - a "projector light" background,
  - a looping strip of film posters above the footer.
- Project archive. Each film opens a native `<dialog>` that splits awards from festival selections automatically.
- Photo gallery with a lightbox: keyboard arrows, swipe on touch screens, focus handling.
- Accessible by default:
  - semantic landmarks and real buttons,
  - `prefers-reduced-motion` is respected,
  - visible focus states,
  - meaningful images have alt text; decorative ones are hidden from screen readers.

**Registration form**
- 8 steps rendered from a single schema (`SECTIONS` in `script.js`), with step-level validation and a review/summary step.
- Conditional logic:
  - the guardian step appears only for applicants under 18,
  - the photo uploads appear only for applicants who already have their own material.
- Input helpers:
  - Turkish phone formatting that keeps the cursor in place (`0532 123 45 67`),
  - an email field split into a local part and a domain picker,
  - drag-and-drop photo upload with a preview.
- **Photos are compressed in the browser before upload.** An 11.5 MB phone photo becomes a 502 KB, 1600 px JPEG in about 0.2 s.

**Back office**
- Records are written to Airtable, and attachments go through Airtable's upload API.
- A Google Apps Script runs every 5 minutes. It turns each new record into a branded, one-page A4 **PDF**, emails it to the agency and sends the applicant a confirmation.

**SEO**
- Descriptive title and meta description, plus Open Graph and Twitter cards with a custom 1200×630 share image.
- **schema.org** graph: the `Organization` plus 12 `Movie` entries with directors, durations and awards.
- Award lists live in the HTML rather than only in JavaScript, so search engines can index them.
- `robots.txt` and a branded `404.html`.

---

## Architecture

```mermaid
flowchart LR
    A["Applicant's browser<br/>(static site)"] -- "1 · answers + Turnstile token" --> W["Cloudflare Worker<br/>verify · rate-limit"]
    A -- "2 · photos + signed ticket" --> W
    W -- "secret token" --> B[("Airtable<br/>Basvurular")]
    C["Google Apps Script<br/>time trigger · 5 min"] -- "new records since last run" --> B
    C -- "PDF attachment" --> D["Agency inbox"]
    C -- "confirmation" --> E["Applicant's inbox"]
```

- **No server to maintain.** The site is plain HTML, CSS and JavaScript. The only server-side code is one Worker file on Cloudflare's free plan.
- **Hosting:** the site is served as static assets on Cloudflare Workers and redeploys automatically on every push to `main`.
- **Airtable** is the database the office actually works in day to day.
- **Apps Script** runs under the office's own Google account: no third-party automation service, no monthly operation limits.

## Tech stack

`HTML5` · `CSS3` (custom properties, grid, animations) · `Vanilla JavaScript (ES2020)` · `Cloudflare Workers & KV` · `Cloudflare Turnstile` · `Airtable REST & Content API` · `Google Apps Script` · `schema.org JSON-LD` · `Git`

---

## Problems I solved

**1. Keeping a secret on a site with no server**
Anything shipped to a browser is public, so the Airtable token can't live in the site. The first version kept a write-only token in a git-ignored `config.js`. Before launch I moved it behind a **Cloudflare Worker** (`worker/src/index.js`):

1. The token is a Worker secret. The browser only knows the Worker's URL.
2. Requests are accepted only from the site's own origin.
3. Field values must be plain text or lists of text. Objects are rejected, so nobody can make Airtable fetch an arbitrary attachment URL.
4. Photos go through a separate endpoint. Creating a record returns an **HMAC-signed ticket** that lets the browser upload to that record only, for 15 minutes, once per photo column.
5. The token itself is still scoped to **write-only on one base**, and the PDF script uses a separate **read-only** token that never leaves Google.

I checked the git history to confirm no token was ever pushed.

**2. Spam protection that costs nothing to run**
In the browser:

- a hidden honeypot field; bots that fill it are shown a fake success message,
- a minimum fill time, measured from the first interaction rather than page load,
- a per-device limit on repeat submissions, stored in `localStorage` and guarded with try/catch.

On the server, which bots can't skip:

- **Cloudflare Turnstile**, verified by the Worker. Most people never see a challenge. The script loads only when someone reaches the last step.
- a per-IP limit of 10 applications an hour, stored in Workers KV. It is deliberately generous because Turkish mobile carriers put many users behind one IP.

I wrote a test script that sends each kind of bad request (wrong origin, missing token, forged ticket, wrong column, repeated upload, rate limit) to the Worker, then ran the real form end to end in headless Chrome.

**3. Staying inside free-tier storage**
Airtable's free plan has 1 GB of attachments, and raw phone photos would fill that in roughly 150 applications. Compressing in the browser with `createImageBitmap` and a canvas cuts each photo by about 95%. If the browser can't decode a file (some HEIC images), the original is sent, but only after a size check. That check runs **before** the record is created, so a failed photo never leaves a half-saved application.

**4. A long form that doesn't feel long**
Every field is defined in one schema: label/column name, type, required, `showIf`, `minor`, `half`. The same schema drives rendering, validation, conditional visibility, the summary step and the Airtable payload. Step 6 is skipped automatically for adults, and a vertical step list shows where the applicant is and what's left.

**5. A PDF people can actually print**
Apps Script converts HTML to PDF with a limited rendering engine, so the layout uses tables rather than flexbox and fits on one A4 page.

Two details needed extra care:

- **Turkish capitals.** CSS `text-transform: uppercase` turns Turkish `i` into `I` instead of `İ`. Headings are therefore uppercased with a small locale-aware function.
- **Photos.** Portrait, face and body photos are embedded from Airtable's thumbnails, which also converts HEIC files to JPEG.

**6. Keeping form and database in sync**
Column names in Airtable must match the form exactly, down to the punctuation. I wrote small scripts that compare the form schema with the live table schema. They caught a column that was missing, link columns that had the wrong type, and a filter formula that used a function name Airtable doesn't support (`DATETIME_ADD` instead of `DATEADD`).

---

## Project structure

```
├── index.html               # single-page site: hero, form, about, services, projects, gallery
├── style.css                # design tokens, components, responsive rules
├── script.js                # menu, dialogs, gallery, registration form & Airtable client
├── worker/
│   ├── src/index.js         # Cloudflare Worker: Turnstile check, rate limit, Airtable proxy
│   └── wrangler.toml        # Worker settings (secrets are set with `wrangler secret put`)
├── apps-script/
│   └── basvuru-pdf.example.gs   # Google Apps Script: Airtable → PDF → email (token removed)
├── 404.html · robots.txt · sitemap.xml · og.jpg
├── wrangler.jsonc · .assetsignore   # the site itself is served as static assets on Cloudflare Workers
├── logo/ · movie-img/ · galeri/ · img/hero.jpg
└── docs/screenshots/        # images used in this README
```

## Running locally

```bash
git clone https://github.com/Ramo212121/diyarbakir-sinema-ofisi.git
cd diyarbakir-sinema-ofisi
python3 -m http.server 8000        # open http://localhost:8000

# in a second terminal: the form's Worker
cd worker && npm install
printf 'AIRTABLE_TOKEN=pat...\nTURNSTILE_SECRET=1x0000000000000000000000000000000AA\nTICKET_SECRET=any-long-random-string\n' > .dev.vars
npm run dev                        # http://localhost:8787
```

On `localhost` the site talks to the local Worker and uses Turnstile's test keys automatically. To set up the PDF emails, paste `apps-script/basvuru-pdf.example.gs` into a new project at [script.google.com](https://script.google.com), add a read-only token, then run `kurulum` once.

## Roadmap

- [ ] Self-hosted fonts, so no visitor data goes to third parties.

---

Built by **Ramazan Karahan** · [GitHub](https://github.com/Ramo212121)

The code is shared as a portfolio piece and is not open source: all rights reserved (see [LICENSE](LICENSE)). The logo, photographs, film posters and texts belong to Diyarbakır Sinema Ofisi and may not be reused.
