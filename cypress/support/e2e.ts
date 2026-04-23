/**
 * Fichier de support E2E
 * -----------------------
 * Ce fichier est exécuté AVANT chaque fichier de test E2E.
 * On y importe les commandes personnalisées et on configure le comportement global.
 */
import "./commands";

// Empêche Cypress d'échouer sur les exceptions non capturées
// (utile car React/Supabase peuvent émettre des warnings non bloquants)
Cypress.on("uncaught:exception", (err) => {
  // Ignore les erreurs de ResizeObserver (fréquentes avec Radix UI)
  if (err.message.includes("ResizeObserver")) return false;
  // Ignore les erreurs réseau Supabase quand on teste sans backend
  if (err.message.includes("Failed to fetch")) return false;
  return true;
});