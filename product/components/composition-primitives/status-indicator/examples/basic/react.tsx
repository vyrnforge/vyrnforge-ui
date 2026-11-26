import { createRoot } from 'react-dom/client';
import { StatusIndicator } from '@vyrnforge/react/status-indicator';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/status-indicator.css';
import '@vyrnforge/web/styles/layout.css';

function Example() {
  return <Flow gap="sm">
    <StatusIndicator severity="informational">Syncing</StatusIndicator>
    <StatusIndicator severity="success">Connected</StatusIndicator>
    <StatusIndicator severity="warning">Degraded</StatusIndicator>
    <StatusIndicator severity="error">Disconnected</StatusIndicator>
    <StatusIndicator severity="critical">Service unavailable</StatusIndicator>
    <StatusIndicator>Idle</StatusIndicator>
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<Example />);
