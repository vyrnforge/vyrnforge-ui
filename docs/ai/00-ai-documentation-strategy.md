# AI Documentation Strategy

## Goal

Make VyrnForge UI easy for AI agents to use, extend, and maintain without violating package boundaries.

## AI needs

AI agents need:

- project positioning
- package map
- allowed dependencies
- styling rules
- state ownership rules
- component inventory
- public API examples
- code placement rules
- do-not-build list

## Required AI entrypoints

| File | Purpose |
| --- | --- |
| `AGENTS.md` | root agent instructions |
| `.ai/AI_CONTEXT.md` | project overview and hard rules |
| `.ai/REPO_MAP.md` | repository navigation |
| `.ai/CODING_RULES.md` | coding/styling/state rules |
| `.ai/DOC_USAGE_GUIDE.md` | how to read/update docs |

## AI output expectations

AI-generated changes should:

- preserve native-first direction
- avoid forbidden dependencies
- keep styles in CSS
- keep state store-agnostic
- update docs when changing public API
- update playground examples when adding components
- run build/typecheck/test/playground validation
