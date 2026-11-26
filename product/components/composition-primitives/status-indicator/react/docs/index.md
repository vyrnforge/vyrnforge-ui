# React Status Indicator

A native span, using the shared Web styles and semantic color roles.

## React setup

```tsx
import { StatusIndicator } from '@vyrnforge/react/status-indicator';
import '@vyrnforge/web/styles/status-indicator.css';

<StatusIndicator severity="success">Connected</StatusIndicator>
<StatusIndicator severity="warning">Degraded</StatusIndicator>
<StatusIndicator>Idle</StatusIndicator>
```

The ref points at the native span. A visible string is required; no action, automatic status announcement or operation state is owned by this component.
