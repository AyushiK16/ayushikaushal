# Adding a project

Each project on the site is one JSON file in this folder. To add a new one, you never need to touch `index.html`, `script.js`, or `style.css` — just:

1. **Copy an existing file** in this folder (e.g. `marionette.json`) and rename it, e.g. `my-new-thing.json`. The filename becomes the project's `id`, so keep it lowercase with hyphens instead of spaces.
2. **Fill in the fields** (see below).
3. **Add the filename (no `.json`) to `manifest.json`**, in the array, in whatever order you want it to appear. This is the one list that tells the site which project files exist.
4. Save, commit, push. Vercel redeploys automatically.

That's it — the site fetches `manifest.json`, then fetches each project file listed in it, and builds the cards and case-study pages from that.

## Fields

| field | required? | what it is |
|---|---|---|
| `id` | yes | must exactly match the filename (without `.json`) |
| `title` | yes | shows on the card and at the top of the case study |
| `subtitle` | no | short italic line under the title — a tagline |
| `status` | yes | the little badge on the card. Keep it to one of the existing categories so the colours stay consistent: `"shipped"` (done — covers "live"/"built"/"shipped", they're all the same thing), `"in development"`, `"under submission"`, `"research"`. Any other text works too but falls back to the default green. |
| `overview` | yes | the short blurb shown on the card itself (a sentence or two) |
| `stack` | yes | array of tech tags, e.g. `["python", "react"]` — shown as small chips |
| `body` | one of `body` **or** `problem`/`built`/`learned` | array of paragraphs (plain text, no HTML needed) for the full case-study page. Each string becomes one paragraph. |
| `problem` / `built` / `learned` | see above | the older three-block format ("the problem" / "what i built" / "what i learned"), used for projects you haven't written a full case study for yet. Use this OR `body`, not both. |
| `credit` | no | optional footnote at the end of the case study — co-authors, publications, submissions, etc. |

## Example (full write-up)

```json
{
  "id": "my-new-thing",
  "title": "My New Thing",
  "subtitle": "A one-line description of what it does",
  "status": "shipped",
  "overview": "The sentence that shows up on the card preview.",
  "stack": ["python", "react"],
  "body": [
    "First paragraph of the case study.",
    "Second paragraph.",
    "As many paragraphs as you want — each array item is one paragraph."
  ]
}
```

## Example (placeholder, no full write-up yet)

```json
{
  "id": "my-new-thing",
  "title": "My New Thing",
  "status": "shipped",
  "overview": "The sentence that shows up on the card preview.",
  "stack": ["python", "react"],
  "problem": "What problem this solves.",
  "built": "What you actually built.",
  "learned": "What you learned building it."
}
```

## Note on local previews

Because the site now fetches these JSON files instead of having them baked into `script.js`, opening `index.html` by double-clicking it won't load the projects (browsers block `fetch()` on local files for security reasons). To preview changes locally, run a tiny local server from the project folder, e.g.:

```bash
python3 -m http.server 8080
```

then open `http://localhost:8080` in your browser. This isn't needed for the live Vercel site — it serves everything over HTTPS, so `fetch()` works there without any extra steps.
