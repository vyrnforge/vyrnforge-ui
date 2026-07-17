# AI-Readable Docs

## Purpose

AI agents should be able to use VyrnForge UI correctly without guessing package boundaries, imports, or state rules.

## Required AI files

```txt
.ai/
  AI_CONTEXT.md
  REPO_MAP.md
  CODING_RULES.md
  DOC_USAGE_GUIDE.md
  COMPONENT_MAP.json
  PACKAGE_EXPORTS.json
```

## AI-readable component metadata

Each stable component should eventually have metadata like:

```json
{
  "name": "Button",
  "package": "@vyrnforge/ui-components",
  "css": [
    "@vyrnforge/ui-core/styles/index.css",
    "@vyrnforge/ui-components/styles/index.css"
  ],
  "props": {
    "variant": ["default", "primary", "danger", "ghost", "subtle"],
    "size": ["sm", "md", "lg"]
  },
  "accessibility": ["Use text label or aria-label when icon-only."],
  "doNot": ["Do not use for navigation when a link is semantically correct."]
}
```

## AI docs rule

AI docs should be concise, explicit, and implementation-oriented.

They should say:

- what to import
- what CSS is required
- what state belongs to the app
- what not to do
- where to place new code
