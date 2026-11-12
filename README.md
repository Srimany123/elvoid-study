# Gate to GPT · study atlas

A weighted study atlas from hardware to frontier AI: 169 topics with routes, prerequisites, points and recommendations. It's a static site, so it runs entirely on GitHub Pages.

## Progress and devices

Progress, notes and goals save automatically in the browser (localStorage). To move between devices:

1. Click **Save & load** (top right), then **Download save file**.
2. On the other device, click **Save & load**, then **Load save file…** (or drop the file anywhere on the page).
3. Choose **Merge** or **Replace**:
   - **Merge** keeps the newest change to each topic from either copy, so a topic you un-ticked on purpose stays un-ticked. It keeps every note (the newer one wins), combo roll and log entry. Goals and preferences come from whichever copy changed last.
   - **Replace** overwrites this browser with the file.

   Both can be undone right after from the toast.

Save files from the Raspberry Pi build (exports and server backups) load here too.

## Build

```sh
./build.sh          # assembles public/ from src/ and syntax-checks every script
cd public && python3 -m http.server 8000
```

Pushing to `main` builds and deploys to GitHub Pages through `.github/workflows/pages.yml`. In the repo, set **Settings → Pages → Source** to **GitHub Actions**.
