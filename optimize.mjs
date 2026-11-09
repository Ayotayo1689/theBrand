import { build } from "esbuild";
import sharp from "sharp";
import { readdir, readFile, writeFile, copyFile, stat } from "fs/promises";
import { join, extname, basename } from "path";

const DIST = new URL("dist/", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

// ── 1. Minify JS ─────────────────────────────────────────────────────────────
const jsFiles = ["app.js", "games.js", "scene-motion.js", "games-core.js",
                 "team-cards.mjs", "team-data.mjs"];

console.log("⚡ Minifying JS…");
for (const file of jsFiles) {
  const path = join(DIST, file);
  try {
    await build({
      entryPoints: [path],
      outfile: path,
      allowOverwrite: true,
      minify: true,
      format: (file.endsWith(".mjs") || file === "team.js" || file === "games.js") ? "esm" : "iife",
      bundle: false,
      logLevel: "silent",
    });
    const { size } = await stat(path);
    console.log(`  ✓ ${file} → ${(size / 1024).toFixed(1)} KB`);
  } catch { console.log(`  ✗ ${file} skipped`); }
}

// ── 2. Minify CSS ────────────────────────────────────────────────────────────
const cssFiles = ["styles.css", "scenes.css", "games.css", "software.css", "team.css"];

console.log("\n⚡ Minifying CSS…");
for (const file of cssFiles) {
  const path = join(DIST, file);
  try {
    await build({
      stdin: { contents: await readFile(path, "utf8"), loader: "css", resolveDir: DIST },
      outfile: path,
      allowOverwrite: true,
      minify: true,
      logLevel: "silent",
    });
    const { size } = await stat(path);
    console.log(`  ✓ ${file} → ${(size / 1024).toFixed(1)} KB`);
  } catch { console.log(`  ✗ ${file} skipped`); }
}

// ── 3. Compress images → WebP ────────────────────────────────────────────────
const imageExts = new Set([".jpg", ".jpeg", ".png"]);
// skip tiny files and social previews
const skipImages = new Set(["social-preview.png", "favicon.svg"]);

console.log("\n⚡ Compressing images to WebP…");
const files = await readdir(DIST);
const imageFiles = files.filter(f => imageExts.has(extname(f).toLowerCase()) && !skipImages.has(f));

const renames = {}; // old filename → new webp filename
for (const file of imageFiles) {
  const src = join(DIST, file);
  const webpName = basename(file, extname(file)) + ".webp";
  const dst = join(DIST, webpName);
  const before = (await stat(src)).size;
  try {
    await sharp(src).webp({ quality: 82, effort: 4 }).toFile(dst);
    const after = (await stat(dst)).size;
    const saving = Math.round((1 - after / before) * 100);
    console.log(`  ✓ ${file} → ${webpName}  (${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB, -${saving}%)`);
    renames[file] = webpName;
  } catch (e) { console.log(`  ✗ ${file} skipped: ${e.message}`); }
}

// ── 4. Update HTML src references ───────────────────────────────────────────
if (Object.keys(renames).length) {
  console.log("\n⚡ Updating HTML image references…");
  const htmlFiles = files.filter(f => f.endsWith(".html"));
  for (const html of htmlFiles) {
    const path = join(DIST, html);
    let content = await readFile(path, "utf8");
    let changed = false;
    for (const [old, next] of Object.entries(renames)) {
      if (content.includes(old)) { content = content.replaceAll(old, next); changed = true; }
    }
    if (changed) { await writeFile(path, content, "utf8"); console.log(`  ✓ ${html}`); }
  }
  // Also update app.js for any image refs
  const appPath = join(DIST, "app.js");
  let appContent = await readFile(appPath, "utf8");
  let appChanged = false;
  for (const [old, next] of Object.entries(renames)) {
    if (appContent.includes(old)) { appContent = appContent.replaceAll(old, next); appChanged = true; }
  }
  if (appChanged) { await writeFile(appPath, appContent, "utf8"); console.log("  ✓ app.js"); }
}

// ── 5. Fix font loading (remove render-blocking @import) ────────────────────
console.log("\n⚡ Fixing font loading…");
const stylesPath = join(DIST, "styles.css");
let styles = await readFile(stylesPath, "utf8");
const fontImport = /@import url\("https:\/\/fonts\.googleapis\.com[^"]+"\);?/;
if (fontImport.test(styles)) {
  styles = styles.replace(fontImport, "");
  await writeFile(stylesPath, styles, "utf8");
  console.log("  ✓ Removed @import from styles.css");
} else {
  console.log("  ✓ Font @import already removed");
}

// Inject non-blocking font link into every HTML file via <head>
const FONT_LINK = `<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@400;500;700&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@400;500;700&display=swap"></noscript>`;
const htmlFiles2 = (await readdir(DIST)).filter(f => f.endsWith(".html"));
for (const html of htmlFiles2) {
  const path = join(DIST, html);
  let content = await readFile(path, "utf8");
  if (!content.includes("fonts.googleapis.com/css2")) {
    content = content.replace("</head>", `${FONT_LINK}</head>`);
    await writeFile(path, content, "utf8");
    console.log(`  ✓ ${html} — non-blocking font link added`);
  }
}

// ── 6. Add service worker ────────────────────────────────────────────────────
console.log("\n⚡ Writing service worker…");
const allDistFiles = await readdir(DIST);
const cacheable = allDistFiles.filter(f =>
  /\.(html|css|js|mjs|webp|png|jpg|jpeg|svg|woff2|ico)$/.test(f)
);

const SW = `const V = "tb-v1";
const PRE = ${JSON.stringify(cacheable.map(f => `./${f}`))};
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(PRE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // let CDN/external requests pass
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(V).then(cache => cache.put(e.request, c)); }
    return res;
  })));
});`;

await writeFile(join(DIST, "sw.js"), SW, "utf8");
console.log("  ✓ sw.js written");

// Register SW in every HTML file
for (const html of htmlFiles2) {
  const path = join(DIST, html);
  let content = await readFile(path, "utf8");
  if (!content.includes("sw.js")) {
    content = content.replace("</body>", `<script>if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js")</script></body>`);
    await writeFile(path, content, "utf8");
  }
}
console.log("  ✓ SW registered in all HTML files");

console.log("\n✅ Done — site is optimised.\n");
