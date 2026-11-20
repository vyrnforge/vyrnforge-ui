import { AutoGrid } from '@vyrnforge/react/layout';

export function AutoGridExample() {
  return (
    <AutoGrid as="ul">
      {['Workspace', 'Team access', 'Notifications', 'Audit history'].map((item) => (
        <li key={item}>{item}</li>
      ))}
    </AutoGrid>
  );
}
