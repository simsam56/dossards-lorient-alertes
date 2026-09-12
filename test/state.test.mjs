import test from "node:test";
import assert from "node:assert/strict";
import { emptyState, planCheck } from "../src/state.mjs";

const race = {
  id: "animaux-lumiere",
  name: "Trail des Animaux de Lumière",
  city: "Pont-Scorff",
  url: "https://macadam-running.bzh/le-trail-des-animaux-de-lumiere/",
  startsOn: "2026-11-13",
  distances: ["11 km"],
};

test("la première lecture ouverte est une baseline silencieuse", () => {
  const planned = planCheck({
    state: emptyState(),
    readings: [{ ...race, status: "open" }],
    now: new Date("2026-09-12T10:00:00.000Z"),
  });
  assert.deepEqual(planned.alerts, []);
  assert.equal(planned.state.races[race.id].notifiedStatus, "open");
});

test("une course qui passe de upcoming à open produit une alerte", () => {
  const baseline = planCheck({
    state: emptyState(),
    readings: [{ ...race, status: "upcoming" }],
    now: new Date("2026-09-12T10:00:00.000Z"),
  });
  const planned = planCheck({
    state: baseline.state,
    readings: [{ ...race, status: "open" }],
    now: new Date("2026-09-12T18:00:00.000Z"),
  });
  assert.equal(planned.alerts.length, 1);
  assert.equal(planned.alerts[0].id, race.id);
});

test("une course déjà notifiée ouverte ne reproduit pas d'alerte", () => {
  const first = planCheck({
    state: emptyState(),
    readings: [{ ...race, status: "upcoming" }],
    now: new Date("2026-09-12T10:00:00.000Z"),
  });
  const opened = planCheck({
    state: first.state,
    readings: [{ ...race, status: "open" }],
    now: new Date("2026-09-12T18:00:00.000Z"),
  });
  const again = planCheck({
    state: opened.state,
    readings: [{ ...race, status: "open" }],
    now: new Date("2026-09-13T08:00:00.000Z"),
  });
  assert.equal(opened.alerts.length, 1);
  assert.deepEqual(again.alerts, []);
});
