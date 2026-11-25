import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

const projects = [
  { name: 'Website redesign', archived: false },
  { name: 'Mobile onboarding', archived: false },
  { name: '2025 campaign', archived: true },
];

function App() {
  const [showArchived, setShowArchived] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleButton onPressedChange={setShowArchived}>Show archived</ToggleButton>
      </Flow>
      <Flow as="ul" gap="xs" aria-label="Projects" data-example-preview="projects"
        style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {projects.filter((project) => showArchived || !project.archived).map((project) => (
          <li key={project.name} style={{ border: '1px solid ' + tokens.color.border, padding: tokens.space.sm }}>
            <Text>{project.name}{project.archived ? ' (archived)' : ''}</Text>
          </li>
        ))}
      </Flow>
    </Flow>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
