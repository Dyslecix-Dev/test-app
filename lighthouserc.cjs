/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm start",
      startServerReadyPattern: "Ready in",
      url: ["http://localhost:3000"],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
