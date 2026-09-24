# Alertes dossards Lorient

Surveillance des **ouvertures d’inscription** pour quelques courses et trails autour de Lorient. Notification ntfy dès qu’une page officielle passe de « bientôt / fermé » à « inscriptions ouvertes ».

Repo séparé de [`sorties-lorient-alertes`](https://github.com/simsam56/sorties-lorient-alertes) : autre rythme, autres pages, autre sujet ntfy.

Ce n’est pas un calendrier exhaustif du Morbihan. Liste actuelle dans [`src/races.mjs`](src/races.mjs) :

| Course | Date | Source surveillée |
| --- | --- | --- |
| La Lorientaise | 4 oct. | site OEPS |
| Kewenn Trail / Val Quéven | 4 oct. | Miles Republic |
| Trail Relais des Chapelles | 24 oct. | trailrelaischapelles56.fr |
| Trail des Animaux de Lumière (Pont-Scorff) | 20 nov. | macadam-running.bzh |
| 24h / 12h / 6h de Ploeren | 5–6 déc. | ploeren-endurance.fr |

Hors liste volontairement : les salles / Festival Interceltique (autre repo), et les courses du calendrier Morbihan sans page officielle stable (Haras d’Hennebont 2026, Foulées de la Petite Mer, etc.).

## Cadence

Deux contrôles par jour (06:30 et 16:30 UTC, soit 08:30 / 18:30 heure d’été). Suffisant pour la plupart des ouvertures. Une course qui part en 2 h (Animaux de Lumière) peut encore nous échapper si l’ouverture n’est pas annoncée.

La première lecture réussie d’une course déjà ouverte est **silencieuse** (baseline). On n’alerte que le passage à ouvert.

## Secret ntfy

Sans le secret GitHub `NTFY_TOPIC`, le contrôle continue de lire les pages et d’écrire l’état, mais les ouvertures restent en attente (pas de mail d’échec Actions). Créer un sujet dédié, distinct des sorties :

```bash
gh secret set NTFY_TOPIC --repo simsam56/dossards-lorient-alertes
```

Puis lancer manuellement `test-notification` depuis Actions. L’ouverture en attente (ex. Trail des Animaux de Lumière 2026) partira au contrôle suivant.

## État

Branche `state`, fichier `state.json`.

## Commandes

```bash
npm test
node scripts/run-monitor.mjs inspect
NTFY_TOPIC=... node scripts/run-monitor.mjs check --state .monitor-state/state.json
```
