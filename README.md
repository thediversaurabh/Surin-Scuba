# Surin Scuba

Marketing website for **Surin Scuba**, a PADI professional dive centre in the Andaman Islands.
The single goal of the site is to inspire visitors to **book a dive or a PADI course**.

Design direction: **"The Descent"** — the visitor descends from sunlit shallows into the deep blue
as they scroll, tracked by a dive-computer-style depth gauge. Depth-in-metres markers structure the
content; a warm coral accent marks every call to action.

## Tech

Plain **static HTML, CSS, and vanilla JavaScript** — no build step, no dependencies to install.
Host it on any static host (GitHub Pages, Netlify, Cloudflare Pages, S3, nginx, …).

- Google Fonts: Fraunces (display), Manrope (body), Space Mono (data) — loaded via `<link>`.
- No other external requests. All imagery is local SVG (see below).

## Run locally

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works (`npx serve`, `php -S localhost:8000`, VS Code Live Server, etc.).

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — immersive hero + conversion funnel |
| `dive-sites.html` | The 26 named Andaman reef/dive sites |
| `courses.html` | PADI course ladder + specialties (Book CTAs deep-link into the form) |
| `gallery.html` | Reef & marine-life gallery with an accessible lightbox |
| `about.html` | Story, safety (`#safety`), and conservation (`#conservation`) |
| `book.html` | Guided 3-step booking-request form + contact panel |

Shared assets:

- `assets/css/styles.css` — all styles + design tokens (edit colours/type here).
- `assets/js/main.js` — nav, depth gauge, scroll reveals, gallery lightbox, booking form.
- `assets/img/*.svg` — placeholder underwater illustrations (see below).

## Imagery — placeholders, and how to swap in real photos

All images are **local SVG illustrations** (`assets/img/scene-*.svg`, `avatar-*.svg`) so the site
renders instantly, offline, with zero broken images. They are on-brand stand-ins for real
photography.

**To use real photos**, replace the `src` (and matching `alt`) on the relevant `<img>` tags. For
best results keep these aspect ratios:

- Hero / page-hero backgrounds — wide landscape (≈16:9). Files: `scene-hero.svg`, `scene-blue.svg`.
- Cards — 4:3 landscape (the `.card__media` box crops to this).
- Split feature images — 4:5 portrait. Files like `scene-turtle.svg`, `scene-guide.svg`.
- Gallery — any ratio; the masonry columns adapt. Each `.gallery__item` also carries
  `data-full` (the large image the lightbox opens) and `data-caption`.
- Testimonial avatars — square. Files: `avatar-1.svg` … `avatar-3.svg`.

Drop real files into `assets/img/` and point the tags at them; no other change needed. A failed
remote image automatically fades to an ocean gradient (`img.img-failed` in `styles.css`), so the
layout never breaks.

## Booking form

`book.html` collects a booking **request** in three steps and validates on the client. On submit it
currently logs the payload to the browser console and shows a success confirmation — **no data
leaves the browser yet.**

To wire it to a real backend or form service, edit the submit handler in `assets/js/main.js`
(look for the `Submission hook` comment) and POST `data` to your endpoint, e.g.:

```js
fetch("https://your-endpoint.example/booking", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
```

Course and dive pages deep-link into the form with the offering pre-selected via query params,
e.g. `book.html?type=course&offer=PADI%20Open%20Water%20Diver`
(`type` = `discover` | `fun-dives` | `course`; `offer` = any offering label).

## Content to replace before launch

The phone (**+91 90468 84818**, also linked as WhatsApp via `wa.me`), email
(**surinscuba@gmail.com**), and address (**Beach No. 2, Havelock Islands / Swaraj Dweep, South
Andaman — 744211**) are the centre's real details. The copy, prices (₹), dive-site details, and
testimonials are still realistic **placeholders** — update them with the centre's real details.

## Accessibility & performance

- Responsive to mobile; fluid type via `clamp()`.
- Keyboard-navigable, visible focus states, semantic landmarks, labelled form controls.
- Lightbox traps focus and restores it on close; `Esc` / arrow keys supported.
- `prefers-reduced-motion` disables animations and reveals content immediately.
