import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": ["error", { patterns: ["../*"] }],
    },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "drizzle/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
    "public/sw*.js",
    "public/swe-worker*.js",
    "public/workbox-*.js",
  ]),
]);

export default eslintConfig;
