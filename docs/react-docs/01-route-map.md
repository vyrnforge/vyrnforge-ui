# React Docs Route Map

## Implemented docs app routes

The current `apps/docs` implementation uses hash routes backed by `docsRegistry.ts`.

```txt
#overview
#source-of-truth
#ai-usage-guide
#component-reference
#package-reference
#system-overview
#package-boundaries
#state-and-adapters
#theming-and-styling
#clean-code-boundaries
#accessibility-standards
#master-roadmap
#component-inventory
#gap-analysis
#do-not-build-yet
#ui-core
#ui-components
#ui-data-grid
#metadata-packages
#metadata-components
#metadata-css-imports
#metadata-state-contracts
#metadata-ai-usage-rules
#docs-app-spec
#route-map
#example-standards
#ai-readable-docs
#ai-documentation-strategy
#agent-rules
#repo-map
#coding-rules
#component-map
#ai-context
```

Markdown files remain the source of truth. The React docs app is only a viewer and navigation layer.

## Future route map

```txt
/
/overview
/core/tokens
/core/themes
/core/density
/core/css-overrides
/components/actions
/components/typography
/components/forms
/components/feedback
/components/overlays
/components/layout
/components/navigation
/components/data-display
/data-grid/basic
/data-grid/columns
/data-grid/filtering
/data-grid/selection
/data-grid/grouping
/data-grid/server-mode
/data-grid/export-request
/data-grid/saved-views
/patterns/admin-shell
/patterns/resource-detail
/patterns/settings
/patterns/form-page
/patterns/data-management-page
/metadata/packages
/metadata/components
/metadata/css-imports
/metadata/state-contracts
/metadata/ai-usage-rules
/ai/context
/ai/component-map
/ai/prompts
```

## Route rules

- Component docs should not be mixed into grid docs.
- Grid docs should focus only on grid behavior.
- Pattern pages should demonstrate real product composition.
- AI pages should provide machine-readable guidance and examples.
