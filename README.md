# Personal Website Starter

This is a VitePress personal website prepared for GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## Edit the site

- `.vitepress/config.mts`: site title, navigation, sidebar, social links, search, footer.
- `.vitepress/theme/style.css`: colors, typography, cards, homepage style.
- `.vitepress/theme/components/CustomHome.vue`: homepage structure.
- `src/index.md`: homepage placeholder text and feature cards.
- `src/about.md`: about page.
- `src/projects/index.md`: project list.
- `src/posts/`: blog posts or notes.

## Build check

```bash
npm run build
npm run preview
```

## Publish with GitHub Pages

1. Create a GitHub repository named `YOUR_GITHUB_USERNAME.github.io`.
2. Upload or push these files to the `main` branch.
3. Go to `Settings → Pages → Build and deployment`.
4. Set `Source` to `GitHub Actions`.
5. Push a commit and wait for the workflow to finish.
6. Visit `https://YOUR_GITHUB_USERNAME.github.io`.
