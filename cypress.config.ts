import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // URL de base utilisée par cy.visit("/...")
    baseUrl: "http://localhost:8080",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    retries: { runMode: 2, openMode: 0 },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    supportFile: "cypress/support/component.ts",
    specPattern: "cypress/component/**/*.cy.{ts,tsx}",
    indexHtmlFile: "cypress/support/component-index.html",
  },
});