import { createRoot } from 'react-dom/client';
import { TextField } from '@vyrnforge/react/text-field';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  return (
    <Flow gap="md">
      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        description="Use an address you can access."
        fullWidth
      />
      <TextField
        label="Biography"
        name="biography"
        multiline
        rows={3}
        maxLength={160}
        description="Up to 160 characters."
        fullWidth
      />
      <TextField
        label="Account name"
        defaultValue="Atlas"
        error="Choose a different account name."
        variant="filled"
        fullWidth
      />
    </Flow>
  );
}
const host = document.querySelector('#root');
if (host) createRoot(host).render(<Example />);
