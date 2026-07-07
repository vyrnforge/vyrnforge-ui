# Contributing

Thanks for helping improve Dravyn UI.

Before opening a pull request, run:

```bash
npm run build
npm run typecheck
npm run test
npm run build:playground
```

Contribution rules:

- Keep Dravyn UI native-first.
- Do not add MUI, TanStack, Redux, RTK Query, Tailwind, Radix, Headless UI, Emotion, styled-components, icon libraries, CSS frameworks, or other heavy dependencies without clear justification.
- Prefer small, focused changes.
- Keep public APIs generic and reusable across projects.
- Do not add domain-specific UI or assumptions to the package.
- Update docs when behavior, setup, or public APIs change.
