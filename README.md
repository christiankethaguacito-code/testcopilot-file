Simple Portfolio — quick start

Files:

- `index.html` — Single-file static portfolio built with Tailwind (CDN), htmx (CDN) and vanilla JavaScript.

How to run:

1. Open `index.html` in your browser (double-click or right-click -> Open with).
2. Everything is client-side; no build step required. For best results, serve the folder with a static server (optional):

   # Using Python (if installed)
   python -m http.server 8000

   Then open http://localhost:8000 in your browser.

Notes:

- htmx is included to demonstrate progressive enhancement. The demo fetches quotes from `https://api.quotable.io/random` using fetch; you can replace that with an htmx `hx-get` endpoint if you host fragments or an API that returns HTML.
- To add your projects: edit `index.html` and modify the project cards in the `#projectsGrid` element.

Next steps you might want me to do:

- Add separate HTML fragments and a tiny dev server so htmx can fetch content dynamically.
- Wire the contact form to a real backend (Formspree, Netlify Forms, or your own API).
- Convert to a multi-page site or add animations.
