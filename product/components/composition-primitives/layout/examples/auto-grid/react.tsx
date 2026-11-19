export function AutoGridExample() {
  return (
    <ul data-vf-auto-grid data-vf-auto-grid-gap="sm"
      style={{ '--vf-auto-grid-min-item-size': '10rem', inlineSize: '100%', listStyle: 'none', padding: 0, margin: 0 }}>
      {['Workspace', 'Team access', 'Notifications', 'Audit history'].map((item) => (
        <li key={item} style={{ border: '1px solid var(--vf-color-border)', borderRadius: 'var(--vf-radius-sm)', padding: 'var(--vf-space-md)' }}>{item}</li>
      ))}
    </ul>
  );
}
