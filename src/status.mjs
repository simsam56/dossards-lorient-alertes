const MONTHS = {
  janvier: 0,
  fevrier: 1,
  février: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  aout: 7,
  août: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  decembre: 11,
  décembre: 11,
};

const OPEN = [
  /inscriptions?\s+(?:sont\s+)?ouvertes/iu,
  /inscriptions?\s+en\s+ligne/iu,
  /paiement\s+par\s+carte/iu,
  /inscrivez[- ]vous/iu,
  /\binscrire\b/iu,
  /\bregister\b/iu,
  /href=["'][^"']*klikego\.com\/inscription/iu,
  /lien des inscriptions/iu,
  /sportinnovation\.fr\/evenements\/inscriptions/iu,
];

const CLOSED = [
  /inscriptions?\s+(?:sont\s+)?(?:closes|cl[oô]tur(?:é|e)es?)/iu,
  /\bcl[oô]tur(?:é|e)\b/iu,
  /termin(?:é|ée)\s+depuis/iu,
  /plus\s+possible\s+de\s+s['’]inscrire/iu,
  /l['’]édition\s+20\d{2}\s+est\s+termin/iu,
  /inscriptions?\s+termin/iu,
  /cet[te]?\s+év[eé]nement\s+est\s+annul/iu,
];

const UPCOMING = [
  /ouverture des inscriptions/iu,
  /inscriptions?\s+ouvrir/iu,
  /rendez-vous en \w+ 20\d{2}/iu,
  /date to be confirmed/iu,
  /date à confirmer/iu,
  /dates? d['’]inscriptions?\s+pas encore/iu,
];

export function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/\s+/gu, " ");
}

function openingDates(text) {
  const dates = [];
  const monthPattern = Object.keys(MONTHS).join("|");
  const regex = new RegExp(
    String.raw`ouverture des inscriptions[^.]{0,80}?(\d{1,2})\s+(${monthPattern})\s+(20\d{2})`,
    "giu",
  );
  for (const match of text.matchAll(regex)) {
    dates.push(new Date(Date.UTC(Number(match[3]), MONTHS[match[2].toLowerCase()], Number(match[1]))));
  }
  return dates;
}

export function classifyRegistration(html, now = new Date()) {
  const raw = typeof html === "string" ? html : "";
  const text = visibleText(raw);
  const closed = CLOSED.some((pattern) => pattern.test(raw) || pattern.test(text));
  const openHint = OPEN.some((pattern) => pattern.test(raw) || pattern.test(text));
  const upcomingHint = UPCOMING.some((pattern) => pattern.test(raw) || pattern.test(text));
  const openings = openingDates(text);
  const futureOpening = openings.some((date) => date.getTime() > now.getTime());
  const pastOpening = openings.some((date) => date.getTime() <= now.getTime());

  if (closed) return "closed";
  if (futureOpening) return "upcoming";
  if (openHint) return "open";
  if (upcomingHint && !pastOpening) return "upcoming";
  if (pastOpening) return "open";
  return "unknown";
}

export function isActionable(status) {
  return status === "open";
}
