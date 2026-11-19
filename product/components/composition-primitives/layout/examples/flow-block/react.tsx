import { Flow } from '@vyrnforge/react/layout';

export function FlowBlockExample() {
  return (
    <Flow gap="sm" style={{ inlineSize: 'min(100%, 24rem)' }}>
      <label htmlFor="layout-react-email">Contact email</label>
      <input id="layout-react-email" type="email" aria-describedby="layout-react-email-help" placeholder="name@example.com" />
      <p id="layout-react-email-help" style={{ margin: 0 }}>Used for account notifications.</p>
    </Flow>
  );
}
