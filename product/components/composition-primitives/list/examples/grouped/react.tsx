import { createRoot } from 'react-dom/client';
import { List, ListItem } from '@vyrnforge/react/list';
import '@vyrnforge/web/styles/list.css';

const groups = [
  { id: 'list-today', title: 'Today', entries: ['Build passed', 'Code reviewed', 'Preview updated', 'Docs generated', 'Packages checked'] },
  { id: 'list-yesterday', title: 'Yesterday', entries: ['Tests passed', 'Change accepted', 'Release prepared', 'Design reviewed', 'Notes updated'] },
];

function App() {
  return (
    <div role="region" aria-label="Activity history" tabIndex={0}
      style={{ maxBlockSize: '16rem', overflowY: 'auto' }}>
      {groups.map(group => (
        <section key={group.id}>
          <h3 id={group.id} data-vf-list-subheader=""
            data-vf-list-subheader-sticky="">
            {group.title}
          </h3>
          <List aria-labelledby={group.id} variant="divided" size="sm"
            dividerInset="gutter">
            {group.entries.map(item => <ListItem key={item}>{item}</ListItem>)}
          </List>
        </section>
      ))}
    </div>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
