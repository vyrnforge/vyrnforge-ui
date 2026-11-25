import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

const activity = [
  { label: 'Design review', range: 'day' },
  { label: 'Release planning', range: 'week' },
  { label: 'Quarterly planning', range: 'month' },
];

function App() {
  const [range, setRange] = useState('day');
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleGroupRoot
          type="single"
          defaultValue="day"
          aria-label="Activity range"
          onValueChange={(next) => {
            if (typeof next === 'string') setRange(next);
          }}
        >
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroupRoot>
      </Flow>
      <Flow
        as="ul"
        gap="xs"
        aria-label="Activity"
        data-example-preview="activity"
        style={{ listStyle: 'none', padding: 0, margin: 0 }}
      >
        {activity
          .filter((item) => !range || item.range === range)
          .map((item) => (
            <li key={item.label} style={{ border: '1px solid ' + tokens.color.border, padding: tokens.space.sm }}>
              <Text>{item.label}</Text>
            </li>
          ))}
      </Flow>
      <Text as="p" role="status" tone="secondary">
        {range ? 'Range: ' + range : 'All activity'}
      </Text>
    </Flow>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
