# Portfolio — Suvanwit Mandal

A static, single-page portfolio site. No build step — just HTML, CSS, and vanilla JS.

## Structure
```
index.html          main page
assets/style.css     styles (dark terminal theme)
assets/script.js     typing effect, nav, scroll reveal
```

## Run locally
```bash
cd portfolio
python3 -m http.server 8000
```
Then open http://localhost:8000

## Deploy with GitHub Pages
1. Create a new GitHub repo (e.g. `portfolio` or `<username>.github.io` for a root domain).
2. Push this folder's contents to it:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → Deploy from branch → main / (root)**.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`
   (or `https://<your-username>.github.io/` if the repo is named `<username>.github.io`).

## Editing content
All content lives directly in `index.html` — update text, project links, or add new project
cards by copying an existing `<article class="card project-card">` block. Skills, education, and
experience are plain lists/cards in the same file.

To add a resume download link, drop a PDF at `assets/resume.pdf` and link to it from the hero
section (`<a href="assets/resume.pdf">`).
