import assert from "node:assert/strict";
import { mkdtempSync, cpSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
const temporary = mkdtempSync(join(tmpdir(), "thebrand-seo-"));
try {
  cpSync(
    new URL("./prepare-site.mjs", import.meta.url),
    join(temporary, "prepare-site.mjs"),
  );
  cpSync(new URL("./dist/", import.meta.url), join(temporary, "dist"), {
    recursive: true,
  });
  for (let run = 0; run < 2; run++) {
    const result = spawnSync(process.execPath, ["prepare-site.mjs"], {
      cwd: temporary,
      env: { ...process.env, SITE_URL: "https://seo-test.example" },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
  }
  const titles = new Set();
  for (const file of ["index", "work", "studio", "contact", "games", "team"]) {
    const html = readFileSync(join(temporary, "dist", file + ".html"), "utf8");
    assert.equal((html.match(/<title>/g) || []).length, 1);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.equal((html.match(/name="description"/g) || []).length, 1);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    titles.add(html.match(/<title>(.*?)<\/title>/)[1]);
    const url =
      "https://seo-test.example/" + (file === "index" ? "" : file + ".html");
    assert(html.includes(`rel="canonical" href="${url}"`));
    assert(html.includes("https://seo-test.example/social-preview.png"));
    const data = JSON.parse(
      html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
    );
    assert.equal(data["@graph"][2].url, url);
    assert(html.includes('<nav aria-label="Main navigation"'));
  }
  assert.equal(titles.size, 6);
  for (const [file, count] of [
    ["index", 2],
    ["work", 4],
    ["games", 7],
    ["team", 4],
  ])
    assert.equal(
      (
        readFileSync(join(temporary, "dist", file + ".html"), "utf8").match(
          /<article/g,
        ) || []
      ).length,
      count,
    );
  const sitemap = readFileSync(join(temporary, "dist/sitemap.xml"), "utf8");
  assert.equal((sitemap.match(/<loc>/g) || []).length, 6);
  assert(
    readFileSync(join(temporary, "dist/robots.txt"), "utf8").includes(
      "Sitemap: https://seo-test.example/sitemap.xml",
    ),
  );
  console.log(
    "PASS: repeatable SEO build, six unique titles, canonical/social URL consistency, JSON-LD, static content, sitemap, and robots.",
  );
} finally {
  const base = resolve(tmpdir()) + sep;
  if (
    !resolve(temporary).startsWith(base) ||
    !temporary.includes("thebrand-seo-")
  )
    throw Error("Unsafe temporary cleanup target");
  rmSync(temporary, { recursive: true, force: true });
}
