export function emptyState() {
  return { version: 1, updatedAt: null, races: {} };
}

export function validateState(value) {
  if (value === undefined) return emptyState();
  if (!value || value.version !== 1 || typeof value.races !== "object" || Array.isArray(value.races)) {
    throw new Error("État invalide");
  }
  return value;
}

export function planCheck({ state, readings, now }) {
  const next = {
    version: 1,
    updatedAt: now.toISOString(),
    races: { ...state.races },
  };
  const alerts = [];

  for (const reading of readings) {
    const previous = state.races[reading.id];
    next.races[reading.id] = {
      status: reading.status,
      url: reading.url,
      lastCheckedAt: now.toISOString(),
      lastError: reading.error ?? null,
      notifiedStatus: previous?.notifiedStatus ?? null,
    };

    if (reading.error || reading.status !== "open") continue;

    const firstSeen = previous === undefined;
    if (firstSeen) {
      next.races[reading.id].notifiedStatus = reading.status;
      continue;
    }

    if (previous.notifiedStatus !== "open") alerts.push(reading);
  }

  return { state: next, alerts };
}

export function acknowledgeAlert(state, raceId) {
  const current = state.races[raceId];
  if (!current) return state;
  return {
    ...state,
    races: {
      ...state.races,
      [raceId]: { ...current, notifiedStatus: "open" },
    },
  };
}
