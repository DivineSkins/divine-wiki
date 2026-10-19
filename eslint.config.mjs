import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    // OpenNext's Cloudflare build output: a multi-MB bundle that runs ESLint
    // out of memory after `npm run cf:build`.
    ".open-next/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    ".source/**",
    "Reference/**",
    "workers/**/dist/**",
  ]),
]);

export default eslintConfig;
