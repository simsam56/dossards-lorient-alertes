import test from "node:test";
import assert from "node:assert/strict";
import { RACES, getRace } from "../src/races.mjs";

test("chaque course a une URL HTTPS et une date", () => {
  assert.ok(RACES.length >= 5);
  for (const race of RACES) {
    assert.equal(new URL(race.url).protocol, "https:");
    assert.match(race.startsOn, /^20\d{2}-\d{2}-\d{2}$/u);
    assert.ok(race.distances.length > 0);
  }
});

test("getRace refuse un identifiant inconnu", () => {
  assert.throws(() => getRace("inconnue"), /Course inconnue/);
});
