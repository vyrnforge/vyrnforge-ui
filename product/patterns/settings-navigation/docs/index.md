# Settings navigation

Compose persistent destinations and local settings controls using AppShell, SideNav, Drawer, Tabs, Button and Input. This is task guidance, not a new runtime or public API. The existing React example demonstrates local application state; the Native Web guide does not claim an executable Native Web example.

## Compose the shell and destinations

Use a meaningful main heading, native destination links with real hrefs, and one current page per navigation set. A persistent rail may become a labelled narrow-screen Drawer. Local Tabs switch sections without pretending to be route navigation. Use shared component semantics and CSS instead of duplicating them.

## Responsive and keyboard behavior

Keep focus on surviving controls. When a focused rail disappears, transfer to the visible navigation trigger. When an open Drawer crosses to wide layout, dismiss it and return focus to the current destination, first available link, or main. Escape dismisses the Drawer and restores focus to a visible trigger. Preserve native modifier and middle-click navigation. Do not trap focus in a hidden region.

## Application-owned route and state

The consumer owns route parsing, history, document title, deep links and route-change focus. Update the title and meaningful main focus after a destination change. Local Tabs retain their local selection; invalid destinations offer a recovery link. Preserve unsaved draft values across navigation when policy permits. Save and cancel must have explicit outcomes; the example saves only local demo state.

## Accessibility and recovery

Use labels and native links, visible focus, meaningful status announcements, and an accessible Drawer with Escape and return focus. Preserve the same settings task at narrow widths, zoom and long labels. Authorization, validation policy, persistence and real account changes belong to the consuming application. The React fixture is the existing evidence target; additional responsive and human evidence is required before claiming full task parity.
