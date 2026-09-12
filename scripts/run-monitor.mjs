import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import { fetchPage, sendNtfy } from "../src/network.mjs";
import { RACES } from "../src/races.mjs";
import { planCheck, validateState } from "../src/state.mjs";
import { classifyRegistration } from "../src/status.mjs";

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function statePath(args) {
  const index = args.indexOf("--state");
  return index === -1 ? undefined : args[index + 1];
}

async function loadState(path) {
  try {
    return validateState(JSON.parse(await readFile(path, "utf8")));
  } catch (error) {
    if (error?.code === "ENOENT") return validateState(undefined);
    throw error;
  }
}

async function saveState(path, state) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
}

async function readRaces(fetchImpl) {
  const readings = [];
  for (const race of RACES) {
    try {
      const html = await fetchPage(race.url, fetchImpl);
      readings.push({
        ...race,
        status: classifyRegistration(html),
      });
    } catch (error) {
      readings.push({
        ...race,
        status: "unknown",
        error: errorMessage(error),
      });
    }
  }
  return readings;
}

function printInspection(readings) {
  for (const reading of readings) {
    const detail = reading.error ? `ERREUR ${reading.error}` : reading.status;
    console.log(`${reading.name} — ${detail} — ${reading.url}`);
  }
}

async function inspect(environment) {
  const readings = await readRaces(environment.fetchImpl ?? fetch);
  printInspection(readings);
  return readings.some((reading) => reading.error) ? 1 : 0;
}

async function check(args, environment) {
  const path = statePath(args);
  if (!path) throw new Error("Option --state obligatoire");
  const state = await loadState(path);
  const readings = await readRaces(environment.fetchImpl ?? fetch);
  const planned = planCheck({ state, readings, now: new Date() });

  for (const alert of planned.alerts) {
    await sendNtfy({
      topic: environment.NTFY_TOPIC,
      title: `Dossards ouverts : ${alert.name}`,
      message: `${alert.city} — ${alert.startsOn} — ${alert.distances.join(" / ")}`,
      clickUrl: alert.url,
      fetchImpl: environment.fetchImpl ?? fetch,
    });
  }

  await saveState(path, planned.state);
  printInspection(readings);
  console.log(`${planned.alerts.length} alerte(s)`);
  return readings.every((reading) => reading.error) ? 1 : 0;
}

async function testNotification(environment) {
  await sendNtfy({
    topic: environment.NTFY_TOPIC,
    title: "Alertes dossards Lorient",
    message: "Surveillance des inscriptions opérationnelle",
    clickUrl: RACES[0].homeUrl,
    fetchImpl: environment.fetchImpl ?? fetch,
  });
  console.log("Notification de contrôle envoyée");
  return 0;
}

async function main(argv = process.argv.slice(2), environment = process.env) {
  const [mode = "check", ...args] = argv;
  if (mode === "inspect") return inspect(environment);
  if (mode === "check") return check(args, environment);
  if (mode === "test-notification") return testNotification(environment);
  throw new Error(`Mode inconnu: ${mode}`);
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
