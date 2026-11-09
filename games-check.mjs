import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { shuffle, isSolved, overlaps, placedCount } from "./dist/games-core.js";
const original = Array.from({ length: 20 }, (_, i) => i);
for (const random of [() => 0, () => 0.5, () => 0.999999]) {
  const mixed = shuffle(original, random);
  assert.deepEqual(
    [...mixed].sort((a, b) => a - b),
    original,
    "Shuffle must preserve all 20 unique pieces",
  );
  assert(!isSolved(mixed), "Starting puzzle must not be solved");
}
assert.deepEqual(
  original,
  Array.from({ length: 20 }, (_, i) => i),
  "Shuffle must not mutate the reference",
);
assert(isSolved(original));
assert(!isSolved(original.slice(1)));
const swapped = [...original];
[swapped[0], swapped[1]] = [swapped[1], swapped[0]];
assert(!isSolved(swapped));
assert(overlaps({ x: 0, y: 0, w: 20, h: 20 }, { x: 19, y: 10, w: 5, h: 5 }));
assert(!overlaps({ x: 0, y: 0, w: 20, h: 20 }, { x: 20, y: 10, w: 5, h: 5 }));
assert(
  !overlaps({ x: 88, y: 100, w: 44, h: 46 }, { x: 90, y: 214, w: 34, h: 36 }),
  "A jumping reel should clear a crate",
);
const targets = ["backdrop", null, "light", "desk", "camera", "mic"];
assert.equal(placedCount(Array(6).fill(null), targets), 0);
assert.equal(placedCount(targets, targets), 5);
assert.equal(placedCount(["desk", null, null, null, null, null], targets), 0);
const root = new URL("./dist/", import.meta.url);
for (const file of [
  "index.html",
  "work.html",
  "studio.html",
  "contact.html",
  "games.html",
]) {
  const html = readFileSync(new URL(file, root), "utf8");
  for (const [, target] of html.matchAll(/(?:src|href)="([^"#?]+)"/g)) {
    if (!/^https?:/.test(target))
      assert(existsSync(new URL(target, root)), `${file}: missing ${target}`);
  }
}
const games = readFileSync(new URL("games.js", root), "utf8");
for (const id of [
  "studio",
  "spot",
  "puzzle",
  "runner",
  "brand",
  "quiz",
  "challenge",
])
  assert(new RegExp(`id:\\s*["']${id}["']`).test(games));
assert(
  /\[["']Games["'],\s*["']games\.html["'],\s*["']games["']\]/.test(readFileSync(new URL("app.js", root), "utf8")),
);
console.log(
  "PASS: 20-piece shuffle and solved-state checks, runner collision checks, studio placement checks, seven game entries, navigation, and local page assets.",
);
