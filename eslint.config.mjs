import js from "@eslint/js";
import babelParser from "@babel/eslint-parser";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const sourceFiles = ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"];
const reactFiles = ["**/*.{jsx,tsx}"];

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/{dist,build,lib,coverage,test-results,playwright-report,blob-report}/**",
      "**/{generated,docs-generated}/**",
      "**/{.cache,.vite,.vitest,.turbo,.parcel-cache}/**",
      "**/{.tmp,.temp,tmp,temp}/**",
      "**/.eslintcache",
      "**/*.tsbuildinfo",
      "**/*.{tmp,temp,bak,orig}",
      "tests/package-consumer/.tmp-*/**",
    ],
  },
  js.configs.recommended,
  {
    files: sourceFiles,
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: {
            plugins: ["typescript", "jsx"],
          },
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      sourceType: "module",
    },
  },
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    rules: {
      // TypeScript resolves these names and imports; the base JS rules cannot.
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
  {
    ...react.configs.flat.recommended,
    files: reactFiles,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      "react/prop-types": "off",
    },
  },
  {
    ...react.configs.flat["jsx-runtime"],
    files: reactFiles,
  },
  {
    files: reactFiles,
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: [
      "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    languageOptions: {
      globals: globals.vitest,
    },
  },
];
