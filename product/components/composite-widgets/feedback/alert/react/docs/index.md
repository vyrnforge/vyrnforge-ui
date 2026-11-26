# React Alert

Compose persistent native-backed feedback with existing Button and Icon. The React adapter uses the canonical shared Web stylesheet.

## React setup

Supported CSS-aware browser bundlers load the component styles automatically.

```tsx
import { Alert } from '@vyrnforge/react/alert';
import { Button } from '@vyrnforge/react/button';

<Alert
  severity="warning"
  heading="Connection interrupted"
  actions={
    <Button type="button" variant="secondary" onClick={retry}>
      Retry
    </Button>
  }
>
  Your changes remain on this device.
</Alert>;
```

Use announcement="polite" or announcement="assertive" only when justified. Supply dismiss={{ label: 'Dismiss message', onDismiss: close }} for an authored dismissal request. The application controls removal and focus restoration. The forwarded ref points at the native root.
