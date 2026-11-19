import { AutoGrid } from '@vyrnforge/react/layout';

export function AutoGridExample() {
  return (
    <AutoGrid as="ul" minItemSize="10rem" gap="sm"
      style={{ inlineSize: '100%', listStyle: 'none', padding: 0, margin: 0 }}>
      {['Workspace', 'Team access', 'Notifications', 'Audit history'].map((item) => (
        <li key={item}
          style={{ border: '1px solid var(--vf-color-border)', borderRadius: 'var(--vf-radius-sm)', padding: 'var(--vf-space-md)' }}>
          {item}
        </li>
      ))}
    </AutoGrid>
  );
}
