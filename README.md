# TheBrand

## Team profiles

Edit the `team` array in `dist/team-data.mjs` to add or remove team members. Each object accepts `name`, `role`, `video` (a local MP4 path or HTTPS URL), optional `poster`, `credit`, `bio`, and `placeholder`. Replace the sample entries with real names and videos, then set `placeholder: false`. Run `node prepare-site.mjs` or deploy to Vercel to refresh the static team cards and SEO. The page also renders the same array in the browser. Sample real-human footage is from Pexels, with source links on the page; the people shown are not represented as actual team members.

The team hero is also a real-human video. All five videos have native playback controls, muted looping, inline mobile playback, and visible-area loading. Automatic playback respects reduced-motion and data-saving settings, stops offscreen, and preserves a visitor's manual pause. Browser autoplay policies may require pressing Play. Clips currently stream from Pexels and need an internet connection.

A responsive, five-page creative studio website built with plain HTML, CSS, and JavaScript. Pages are separate files in `dist/`.

Open `dist/index.html` directly, or serve `dist/` with any static web server. No dependencies or build step are required.

## Deploy to Vercel

Import your Git repository into Vercel. If the repository contains the outer `thebrand/` folder, set Root Directory to `thebrand`; if this folder is itself the repository root, leave Root Directory as `.`.

The included `vercel.json` selects the Other framework preset, skips installation, runs the dependency-free `node prepare-site.mjs` branding and SEO preparation, and serves `dist/`. Click Deploy.

## Brand and SEO

The site uses black, white, and yellow (`#ffd600`, approximated from the supplied logo reference). The header and footer use a text wordmark with a yellow round dot. An exact original vector logo can replace this when supplied as a local asset. The favicon and social sharing image use the same identity.

Every page has its own title, description, Open Graph and Twitter metadata, and Organization/WebSite/page JSON-LD. Navigation, concepts, and game listings are included in the static HTML. `robots.txt` allows crawling.

For your custom domain, set `SITE_URL` in Vercel to the full origin (for example, your actual `https://` domain, without a path), then redeploy. Without `SITE_URL`, the build uses Vercel's `VERCEL_PROJECT_PRODUCTION_URL` when available. Canonical links, social image URLs, and `sitemap.xml` are generated from this origin. A local run without either variable intentionally omits absolute URLs rather than inventing a domain.

After deployment, verify ownership in Google Search Console and submit `/sitemap.xml`. Search ranking, indexing, and rich result display are controlled by search engines. No fake reviews, contact details, business addresses, or client results are included in structured data.

Alternatively, run `npx vercel --prod` from this folder and follow the login and project prompts.

Features: CSS 3D sculpture, reduced-motion support, responsive navigation, project category filters, project dialogs, video playback, scroll reveals, pointer tilt, and downloadable project briefs.

The Games page includes Build the Studio, Spot the Difference, a 20-piece Picture Puzzle, Reel Runner, Guess the Brand, Design Quiz, and Creative Challenge. Each opens with instructions and runs in a modal. Games support touch and keyboard controls. Quiz and runner best scores are stored locally in the browser when storage is available. There is no account or server leaderboard.

Run `node games-check.mjs` for game logic and local asset checks. Preview through a static HTTP server to run the JavaScript module-based games; opening Games directly as a `file://` page is not supported by browser module security rules. Vercel serves the games normally.

Photos are loaded from Unsplash. The inspiration film is hosted by Pexels. These external resources require internet access. Concepts are clearly identified as illustrative; they are not claims of completed client work.

Before launch for a real business: replace concept work with commissioned projects, provide verified contact details, and connect the brief form to your chosen delivery service if needed. Currently the form creates a local text download and never submits personal information.
