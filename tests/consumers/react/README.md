# React packed Custom Element consumer fixture

CF-7002 verifies React 19 consuming `@vyrnforge/ui-elements` directly from
clean package tarballs. The application keeps its JSX declaration adapter
local, so the framework-neutral native package does not depend on React.

The fixture proves typed refs, non-scalar property assignment, explicit
registration, canonical DOM events, production Vite output, and Chromium
interaction evidence. `@vyrnforge/ui-components` remains the recommended
first-class React renderer; this fixture validates the supported direct
Custom Element path.
