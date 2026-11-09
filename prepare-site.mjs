import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { team } from './dist/team-data.mjs';
import { renderTeam } from './dist/team-cards.mjs';
const root = new URL("./dist/", import.meta.url);
// Yellow is an approximation from the supplied reference, pending an official hex code.
const palette = {
  "#d9fb68": "#ffd600",
  "#f4f3ed": "#ffffff",
  "#191b17": "#101010",
  "#eaffb5": "#fff3a3",
  "#edffb0": "#fff4ad",
  "#e7ff9a": "#fff1a0",
  "#d7ed97": "#f0da80",
  "#c4df82": "#e9cc60",
  "#c2dc7c": "#e6ca63",
  "#b1cd65": "#d8b941",
  "#a4c44c": "#c5a125",
  "#a5c64e": "#caaa2e",
  "#8faa43": "#af8d24",
  "#a5bf62": "#c5a856",
  "#92ad4c": "#ac8e32",
  "#263d2c": "#242424",
  "#314b2e": "#292929",
  "#314e35": "#303030",
  "#365331": "#333333",
  "#293e28": "#242424",
  "#2d462b": "#292929",
  "#d9fb6838": "#ffd60038",
  "#d9fb6860": "#ffd60060",
  "#dce3ca": "#e8e4d8",
  "#e3ead8": "#eeeae0",
  "#c3d2ae": "#d9d3c0",
  "#c5d2b3": "#d8d4c7",
  "#e2e8d5": "#ece9df",
  "#e7eadc": "#efede5",
  "#e3ead6": "#eeeadf",
  "#e4ead8": "#eeeadf",
  "#e3e8d8": "#eeeadf",
  "#d9fb68": "#ffd600",
};
for (const file of readdirSync(root)) {
  if (!/\.(html|css|js|svg)$/.test(file)) continue;
  const path = new URL(file, root);
  let text = readFileSync(path, "utf8");
  text = text.replace(
    /#[0-9a-f]{8}|#[0-9a-f]{6}\b/gi,
    (colour) => palette[colour.toLowerCase()] || colour,
  );
  if (file === "styles.css" && !text.includes("/* Official brand identity */"))
    text += `\n/* Official brand identity */\n:root{--accent:#ffd600;--lime:var(--accent);--paper:#fff;--ink:#101010}\n.logo{font-weight:700;letter-spacing:-1.8px}.logo b{width:9px;height:9px;background:var(--accent);border-radius:50%;margin-left:2px}\n.footer{background:#080808;color:#fff;padding:40px 30px 24px;margin-top:35px;border-radius:5px}.footer-bottom{border-color:#333;color:#bdbdbd}.footer .logo{color:#fff}\n.green-dot{background:#b48e00;box-shadow:0 0 0 4px #ffd60022}\na:focus-visible,button:focus-visible{outline-color:#947700}\n@media(max-width:700px){.footer{padding:30px 20px 22px}.logo b{width:8px;height:8px}}\n`;
  writeFileSync(path, text);
}
const pages = [
  ['team.html', 'Meet the Team | TheBrand', 'Meet the people behind TheBrand’s creative direction, content creation, brand strategy, and social campaigns.', 'AboutPage'],
  [
    "index.html",
    "Content Creation & Marketing Studio | TheBrand",
    "TheBrand brings brand strategy, photography, film, and social campaigns together to help ambitious businesses tell clearer stories and connect with their audiences.",
    "WebPage",
  ],
  [
    "work.html",
    "Creative Concepts & Campaign Ideas | TheBrand",
    "Explore TheBrand’s concept collection across content creation, brand strategy, and social campaigns. Discover the creative direction behind each idea.",
    "CollectionPage",
  ],
  [
    "studio.html",
    "About Our Creative & Marketing Studio | TheBrand",
    "Meet the thinking behind TheBrand: brand strategy, content creation, and campaigns shaped by clarity, character, and meaningful audience connections.",
    "AboutPage",
  ],
  [
    "contact.html",
    "Start Your Creative Project | TheBrand",
    "Plan your next brand, content, or marketing project with TheBrand. Create a downloadable brief covering your goals, services, budget, and creative ideas.",
    "ContactPage",
  ],
  [
    "games.html",
    "Creative Games & Design Challenges | TheBrand",
    "Play eight free creative games: Build the Studio, Spot the Difference, Picture Puzzle, Reel Runner, Stack It, Guess the Brand, Design Quiz, and Creative Challenge.",
    "CollectionPage",
  ],
  [
    "software.html",
    "Software Development & App Studio | TheBrand",
    "TheBrand builds websites, portals, and mobile apps for businesses ready to scale. From landing pages to full SaaS platforms — digital products that perform.",
    "WebPage",
  ],
];
let supplied =
  process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "";
if (supplied && !/^https?:\/\//.test(supplied))
  supplied = "https://" + supplied;
let origin = "";
if (supplied) {
  const url = new URL(supplied);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw Error(
      "SITE_URL must be a public site origin without a path or credentials.",
    );
  origin = url.origin;
}
const esc = (value) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
for (const [file, title, description, type] of pages) {
  const path = new URL(file, root);
  let html = readFileSync(path, "utf8");
  html = html
    .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/g, "")
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta name="(?:description|theme-color)"[^>]*>/g, "");
  const route = file === "index.html" ? "/" : "/" + file;
  const pageUrl = origin + route;
  const graph = [
    {
      "@type": "Organization",
      "@id": origin ? origin + "/#organization" : "#organization",
      name: "TheBrand",
      description: "Independent content creation and marketing studio.",
      ...(origin ? { url: origin + "/" } : {}),
    },
    {
      "@type": "WebSite",
      "@id": origin ? origin + "/#website" : "#website",
      name: "TheBrand",
      inLanguage: "en",
      publisher: {
        "@id": origin ? origin + "/#organization" : "#organization",
      },
      ...(origin ? { url: origin + "/" } : {}),
    },
    {
      "@type": type,
      name: title,
      description,
      inLanguage: "en",
      isPartOf: { "@id": origin ? origin + "/#website" : "#website" },
      ...(origin ? { url: pageUrl } : {}),
    },
  ];
  const socialImage = origin ? origin + "/social-preview.png" : "";
  const block = `<!-- seo:start -->\n<title>${esc(title)}</title>\n<meta name="description" content="${esc(description)}">\n<meta name="theme-color" content="#080808">\n<meta name="robots" content="index,follow,max-image-preview:large">\n<link rel="icon" type="image/svg+xml" href="favicon.svg">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="TheBrand">\n<meta property="og:locale" content="en_US">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(description)}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${esc(title)}">\n<meta name="twitter:description" content="${esc(description)}">\n${origin ? `<link rel="canonical" href="${pageUrl}">\n<meta property="og:url" content="${pageUrl}">\n${existsSync(new URL("social-preview.png", root)) ? `<meta property="og:image" content="${socialImage}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="TheBrand wordmark in white with a yellow dot on black. Content creation and marketing studio.">\n<meta name="twitter:image" content="${socialImage}">` : ""}` : ""}\n<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>\n<style>.reveal{opacity:1;transform:none}</style>\n<!-- seo:end -->`;
  html = html.replace(
    "</head>",
    block.replace(
      "<style>.reveal{opacity:1;transform:none}</style>",
      "<noscript><style>.reveal{opacity:1;transform:none}</style></noscript>",
    ) + "</head>",
  );
  // Crawlable navigation is available even before JavaScript runs.
  html = html.replace(
    /<header>[\s\S]*?<\/header>/,
    `<header><a class="logo" href="index.html" aria-label="TheBrand home">TheBrand<b></b></a><nav aria-label="Main navigation" class="nav">${[
      ["Home", "index.html"],
      ["Work", "work.html"],
      ["Software", "software.html"],
      ["Studio", "studio.html"],
      ["Meet the Team", "team.html"],
      ["Games", "games.html"],
      ["Let’s talk", "contact.html"],
    ]
      .map(
        ([label, target]) =>
          `<a href="${target}"${target === file ? ' aria-current="page"' : ""}>${label}</a>`,
      )
      .join("")}</nav></header>`,
  );
  if (file === "index.html" || file === "work.html") {
    const source = readFileSync(new URL("app.js", root), "utf8");
    const projects = [
      ...source.matchAll(
        /\{title:'([^']+)',category:'([^']+)',type:'[^']+',image:'([^']+)'/g,
      ),
    ].slice(0, file === "index.html" ? 2 : 4);
    if (projects.length)
      html = html.replace(
        /<div class="projects">[\s\S]*?<\/div>(?=<p class="image-credit">)/,
        `<div class="projects">${projects.map(([, name, category, image]) => `<article class="project"><a href="contact.html"><div class="project-image"><img src="https://images.unsplash.com/${image}?auto=format&amp;fit=crop&amp;w=1000&amp;q=80" alt="${esc(name)} — ${esc(category)} concept" loading="lazy" width="1000" height="800"></div><div class="project-info"><div><h3>${esc(name)}</h3><p>${esc(category)}</p></div><span>Illustrative concept</span></div></a></article>`).join("")}</div>`,
      );
  }
  if (file === "games.html") {
    const source = readFileSync(new URL("games.js", root), "utf8");
    const games = [
      ...source.matchAll(
        /\{id:'([^']+)',name:'([^']+)',type:'[^']+',time:'[^']+',description:'([^']+)'/g,
      ),
    ];
    html = html.replace(
      /<div id="game-list" class="game-list">[\s\S]*?<\/div>(?=<\/section>)/,
      `<div id="game-list" class="game-list">${games.map(([, id, name, description]) => `<article class="game-card"><h3>${esc(name)}</h3><p>${esc(description)}</p><button class="pill dark" type="button" data-play="${id}">Play ${esc(name)} ↗</button></article>`).join("")}</div>`,
    );
  }
  if(file==='team.html') {
    html=html.replace(/<!-- team:start -->[\s\S]*?<!-- team:end -->/,`<!-- team:start --><div id="team-grid" class="team-grid">${renderTeam(team)}</div><!-- team:end -->`);
    if(!team.some(member=>member.placeholder))html=html.replace(/<p class="team-note">[\s\S]*?<\/p>/,'');
  }
  writeFileSync(path, html);
}
writeFileSync(
  new URL("robots.txt", root),
  `User-agent: *\nAllow: /\n${origin ? "\nSitemap: " + origin + "/sitemap.xml\n" : ""}`,
);
if (origin)
  writeFileSync(
    new URL("sitemap.xml", root),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([file]) => `<url><loc>${origin}/${file === "index.html" ? "" : file}</loc></url>`).join("")}</urlset>\n`,
  );
console.log(
  `Brand identity and SEO prepared for ${pages.length} pages.${origin ? " Canonical origin: " + origin : " Set SITE_URL or deploy on Vercel to generate canonical URLs and sitemap."}`,
);
