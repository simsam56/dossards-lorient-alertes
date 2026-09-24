import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { main } from "../scripts/run-monitor.mjs";
import { RACES } from "../src/races.mjs";

function htmlFor(status) {
  if (status === "open") return "<p>Les inscriptions sont ouvertes. Paiement par carte possible.</p>";
  if (status === "closed") return "<p>Les inscriptions sont closes depuis samedi.</p>";
  return "<p>Date à confirmer. Octobre 2026.</p>";
}

function pages(statusById) {
  const byUrl = Object.fromEntries(RACES.map((race) => [race.url, htmlFor(statusById[race.id] ?? "upcoming")]));
  return async (url) => ({
    ok: true,
    status: 200,
    text: async () => byUrl[url] ?? "<p>Date à confirmer.</p>",
  });
}

test("un check sans NTFY_TOPIC persiste l'état et ne plante pas", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dossards-"));
  const path = join(dir, "state.json");
  const fetchImpl = pages({
    lorientaise: "closed",
    "kewenn-queven": "upcoming",
    "relais-chapelles": "upcoming",
    "animaux-lumiere": "closed",
    "ploeren-24h": "upcoming",
  });

  const first = await main(["check", "--state", path], { fetchImpl });
  assert.equal(first, 0);
  const baseline = JSON.parse(await readFile(path, "utf8"));
  assert.equal(baseline.races["animaux-lumiere"].status, "closed");

  const second = await main(["check", "--state", path], {
    fetchImpl: pages({
      lorientaise: "closed",
      "kewenn-queven": "upcoming",
      "relais-chapelles": "upcoming",
      "animaux-lumiere": "open",
      "ploeren-24h": "upcoming",
    }),
  });
  assert.equal(second, 0);
  const pending = JSON.parse(await readFile(path, "utf8"));
  assert.equal(pending.races["animaux-lumiere"].status, "open");
  assert.equal(pending.races["animaux-lumiere"].notifiedStatus, null);
});

test("un check avec NTFY_TOPIC acquitte l'alerte après envoi", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dossards-"));
  const path = join(dir, "state.json");
  const posts = [];
  const fetchImpl = async (url, options = {}) => {
    if (options.method === "POST") {
      posts.push(JSON.parse(options.body));
      return { ok: true, status: 200, text: async () => "ok" };
    }
    return pages({
      lorientaise: "closed",
      "kewenn-queven": "upcoming",
      "relais-chapelles": "upcoming",
      "animaux-lumiere": "open",
      "ploeren-24h": "upcoming",
    })(url, options);
  };

  await main(["check", "--state", path], {
    fetchImpl: pages({
      lorientaise: "closed",
      "kewenn-queven": "upcoming",
      "relais-chapelles": "upcoming",
      "animaux-lumiere": "closed",
      "ploeren-24h": "upcoming",
    }),
  });
  const code = await main(["check", "--state", path], { fetchImpl, NTFY_TOPIC: "topic-test" });
  assert.equal(code, 0);
  assert.equal(posts.length, 1);
  assert.match(posts[0].title, /Animaux de Lumière/);
  const state = JSON.parse(await readFile(path, "utf8"));
  assert.equal(state.races["animaux-lumiere"].notifiedStatus, "open");
});
