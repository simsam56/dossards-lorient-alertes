export const RACES = Object.freeze([
  {
    id: "lorientaise",
    name: "La Lorientaise",
    city: "Lorient",
    kind: "route",
    startsOn: "2026-10-04",
    distances: ["6 km"],
    url: "https://lalorientaise.oepslorient.org/inscription-en-ligne/",
    homeUrl: "https://lalorientaise.oepslorient.org/",
    notes: "Course féminine Octobre Rose. Jauge ~9000, se ferme tôt.",
  },
  {
    id: "kewenn-queven",
    name: "Kewenn Trail / Trail du Val Quéven",
    city: "Quéven",
    kind: "trail",
    startsOn: "2026-10-04",
    distances: ["8 km", "16 km", "28 km"],
    url: "https://fr.milesrepublic.com/event/trail-du-val-queven-6011",
    homeUrl: "https://fr.milesrepublic.com/event/trail-du-val-queven-6011",
    notes: "Quéven Athlétisme 56. Page club 2026 absente ; inscriptions habituelles sur Klikego.",
  },
  {
    id: "relais-chapelles",
    name: "Trail Relais des Chapelles",
    city: "Larmor-Plage",
    kind: "trail",
    startsOn: "2026-10-24",
    distances: ["23 km", "70 km"],
    url: "https://www.trailrelaischapelles56.fr/",
    homeUrl: "https://www.trailrelaischapelles56.fr/",
    notes: "Ouverture annoncée le 5 avril 2026. Inscriptions Klikego.",
  },
  {
    id: "animaux-lumiere",
    name: "Trail des Animaux de Lumière",
    city: "Pont-Scorff",
    kind: "trail",
    startsOn: "2026-11-20",
    distances: ["11 km"],
    url: "https://macadam-running.bzh/le-trail-des-animaux-de-lumiere/",
    homeUrl: "https://macadam-running.bzh/le-trail-des-animaux-de-lumiere/",
    notes: "500 dossards partis en ~2 h en 2025. Édition 2026 le 20 novembre ; lien Klikego 2026 en ligne.",
  },
  {
    id: "ploeren-24h",
    name: "24h / 12h / 6h de Ploeren",
    city: "Ploeren",
    kind: "route",
    startsOn: "2026-12-05",
    distances: ["6 h", "12 h", "24 h"],
    url: "https://www.ploeren-endurance.fr/24h/",
    homeUrl: "https://www.ploeren-endurance.fr/24h/",
    notes: "Inscriptions SportInnovation. Ouverture affichée au 30 juin 2026.",
  },
]);

export function getRace(id) {
  const race = RACES.find((candidate) => candidate.id === id);
  if (!race) throw new Error(`Course inconnue: ${id}`);
  return race;
}
