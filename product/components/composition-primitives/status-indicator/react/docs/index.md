# React Status Indicator

A native span, using the shared Web styles and semantic color roles.

## React setup

Supported CSS-aware browser bundlers load the component styles automatically.

```tsx
import { StatusIndicator } from '@vyrnforge/react/status-indicator';

<StatusIndicator severity="success">Connected</StatusIndicator>
```

The ref points at the native span. A visible string is required; no action, automatic status announcement or operation state is owned by this component.
