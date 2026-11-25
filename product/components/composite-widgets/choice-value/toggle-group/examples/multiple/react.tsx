import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

const tasks = [
  { name: 'Review wireframes', team: 'design' },
  { name: 'Fix keyboard navigation', team: 'engineering' },
  { name: 'Interview customers', team: 'research' },
];

function App() {
  const [teams, setTeams] = useState(['design']);
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleGroupRoot
          type="multiple"
          value={teams}
          aria-label="Filter by team"
          onValueChange={(next) => {
            if (Array.isArray(next)) setTeams(next);
          }}
        >
          <ToggleGroupItem value="design">Design</ToggleGroupItem>
          <ToggleGroupItem value="engineering">Engineering</ToggleGroupItem>
          <ToggleGroupItem value="research">Research</ToggleGroupItem>
        </ToggleGroupRoot>
      </Flow>
      <Flow as="ul" gap="xs" aria-label="Tasks" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks
          .filter((task) => teams.length === 0 || teams.includes(task.team))
          .map((task) => (
            <li key={task.name} style={{ border: '1px solid ' + tokens.color.border, padding: tokens.space.sm }}>
              <Text>{task.name}</Text>
            </li>
          ))}
      </Flow>
      <Text as="p" role="status" tone="secondary">
        {teams.length ? teams.length + ' teams selected' : 'All teams'}
      </Text>
    </Flow>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
