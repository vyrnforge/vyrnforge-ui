import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TextField } from '@vyrnforge/react/text-field';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  const [amount, setAmount] = useState('');
  const parsed = amount.trim() && /^\d+(?:\.\d{1,2})?$/.test(amount) ? Number(amount) : null;
  return (
    <Flow gap="sm">
      <TextField
        label="Amount in USD"
        name="amount"
        inputMode="decimal"
        prefix="$"
        value={amount}
        onChange={(event) => setAmount(event.currentTarget.value)}
        description="Use a decimal point for cents."
        textAlign="end"
        fullWidth
      />
      <output>
        {parsed !== null && Number.isFinite(parsed)
          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parsed)
          : 'Enter an amount to preview.'}
      </output>
    </Flow>
  );
}
const host = document.querySelector('#root');
if (host) createRoot(host).render(<Example />);
