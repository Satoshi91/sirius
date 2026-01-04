import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "src/app/**/*.{js,ts,jsx,tsx}",
    "src/pages/**/*.{js,ts,jsx,tsx}",
    "middleware.ts",
    "next.config.ts",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "tailwind.config.*",
    "scripts/**/*.ts",
  ],
  project: [
    "src/**/*.{js,ts,jsx,tsx}",
    "lib/**/*.{js,ts,jsx,tsx}",
    "scripts/**/*.{js,ts}",
    "*.{js,ts,mjs}",
    "!**/*.test.{js,ts,jsx,tsx}",
    "!**/*.spec.{js,ts,jsx,tsx}",
  ],
  ignore: [
    "**/*.d.ts",
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    ".vercel/**",
    "coverage/**",
  ],
  ignoreDependencies: [
    // Next.js internal dependencies
    "@next/swc-darwin-arm64",
    "@next/swc-darwin-x64",
    "@next/swc-linux-arm64-gnu",
    "@next/swc-linux-arm64-musl",
    "@next/swc-linux-x64-gnu",
    "@next/swc-linux-x64-musl",
    "@next/swc-win32-arm64-msvc",
    "@next/swc-win32-ia32-msvc",
    "@next/swc-win32-x64-msvc",
  ],
  ignoreExportsUsedInFile: true,
  workspaces: {
    ".": {
      entry: [
        "src/app/**/*.{js,ts,jsx,tsx}",
        "src/pages/**/*.{js,ts,jsx,tsx}",
        "middleware.ts",
        "next.config.ts",
        "postcss.config.mjs",
        "eslint.config.mjs",
        "tailwind.config.*",
        "scripts/**/*.ts",
      ],
    },
  },
};

export default config;
