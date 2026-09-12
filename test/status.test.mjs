import test from "node:test";
import assert from "node:assert/strict";
import { classifyRegistration } from "../src/status.mjs";

test("détecte une page d'inscriptions ouvertes", () => {
  assert.equal(
    classifyRegistration("<p>Les inscriptions sont ouvertes. Paiement par carte possible.</p>"),
    "open",
  );
});

test("détecte une page déjà close", () => {
  assert.equal(
    classifyRegistration("<p>Les inscriptions sont closes depuis samedi.</p>"),
    "closed",
  );
});

test("détecte une ouverture annoncée mais pas encore active", () => {
  assert.equal(
    classifyRegistration(
      "<p>Ouverture des inscriptions le mardi 30 juin 2027.</p>",
      new Date("2026-09-12T10:00:00Z"),
    ),
    "upcoming",
  );
});

test("une date d'ouverture déjà passée plus un lien d'inscription vaut ouvert", () => {
  const html = `
    <p>Ouverture des inscriptions le mardi 30 juin 2026 à 12:00.</p>
    <a href="https://sportinnovation.fr/Evenements/Inscriptions/Epreuve/7907">Lien des inscriptions</a>
  `;
  assert.equal(classifyRegistration(html, new Date("2026-09-12T10:00:00Z")), "open");
});

test("une page close l'emporte sur un vieux lien Klikego", () => {
  assert.equal(
    classifyRegistration('<p>L’édition 2025 est terminée.</p><a href="https://www.klikego.com/inscription/x">lien</a>'),
    "closed",
  );
});

test("Miles Republic sans date confirme upcoming", () => {
  assert.equal(classifyRegistration("<p>Date à confirmer. Octobre 2026.</p>"), "upcoming");
});

test("Lorientaise terminée depuis un jour est close", () => {
  assert.equal(classifyRegistration("<p>Inscription en ligne. Terminé depuis 1 jour.</p>"), "closed");
});
