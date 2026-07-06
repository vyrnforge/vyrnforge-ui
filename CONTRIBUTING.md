# Contributing

Thanks for helping improve the Universal Data Grid.

Before opening a pull request, run:

```bash
npm run build
npm run typecheck
npm run test
```

Contribution rules:

- Keep the grid native-first.
- Do not add MUI, TanStack, Redux, RTK Query, or other heavy dependencies without clear justification.
- Prefer small, focused changes.
- Keep public APIs generic and reusable across projects.
- Do not add domain-specific UI or assumptions to the package.
- Update docs when behavior, setup, or public APIs change.

