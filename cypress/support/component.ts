/**
 * Fichier de support pour les tests de composants
 * ------------------------------------------------
 * Permet de monter des composants React isolés dans Cypress avec cy.mount(<Component />).
 */
import { mount } from "cypress/react";
import "./commands";
import "../../src/index.css";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);

export {};