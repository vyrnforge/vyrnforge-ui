# Accessibility

Accessibility is part of the VyrnForge component contract, not an optional application add-on.

VyrnForge targets WCAG AA as the reusable-component baseline.

## Baseline expectations

Interactive components should provide:

- keyboard access;
- visible focus;
- meaningful labels and semantics;
- understandable disabled states;
- no color-only state communication;
- reduced-motion behavior where motion exists.

## Common component behavior

| Component type    | Expected behavior                                                                 |
| ----------------- | --------------------------------------------------------------------------------- |
| Icon-only control | Accessible name such as `aria-label`                                               |
| Menu              | Arrow-key navigation, Enter/Space activation, Escape dismissal                      |
| Dialog / Drawer   | Dialog semantics, modal state where applicable, focus management, Escape dismissal |
| Tooltip           | Keyboard-focus and pointer access                                                   |
| Data grid         | Keyboard navigation, labeled controls, visible focus, accessible selection/grouping |

The generated **Components** reference contains component-specific accessibility and keyboard details.

## What applications still own

Using an accessible component does not make an application accessible by itself. Applications still own:

- page landmarks and heading structure;
- meaningful copy and labels;
- logical focus order between application regions;
- contrast of application-specific colors;
- responsive zoom and reflow;
- error messaging and form instructions;
- testing real user workflows with keyboard and assistive technology.

## Verification

VyrnForge uses automated DOM accessibility checks, browser interaction tests, and targeted manual assistive-technology evidence. Automated checks catch many semantic and ARIA problems, but they do not prove complete WCAG conformance.

When extending a VyrnForge component, preserve its keyboard, focus, labeling, and semantic contract across every supported framework surface.
