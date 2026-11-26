import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';
import { Chip, type ChipProps, type ChipSize, type ChipTone, type ChipVariant } from '@vyrnforge/react/chip';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { Radio } from '@vyrnforge/react/radio';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Textarea } from '@vyrnforge/react/textarea';
import { Icon } from '@vyrnforge/react/icon';
import { Avatar } from '@vyrnforge/react/avatar';
import { tagIcon } from '@vyrnforge/icons/tag';
import { trashIcon } from '@vyrnforge/icons/trash';
import { chevronRightIcon } from '@vyrnforge/icons/chevron-right';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/input.css';
import '@vyrnforge/web/styles/radio.css';
import '@vyrnforge/web/styles/checkbox.css';
import '@vyrnforge/web/styles/textarea.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/avatar.css';

type Mode = 'static' | 'action' | 'selectable' | 'link';
type Artwork = 'none' | 'icon' | 'avatar' | 'trailing';
const defaults = { label: 'Engineering', variant: 'filled' as ChipVariant, size: 'md' as ChipSize,
  tone: 'neutral' as ChipTone, mode: 'static' as Mode, artwork: 'none' as Artwork,
  removable: false, customRemove: false, disabled: false, wrap: false };
const options = {
  variant: ['filled', 'outlined'], size: ['sm', 'md', 'lg'], tone: ['neutral', 'accent', 'danger'],
  mode: ['static', 'action', 'selectable', 'link'], artwork: ['none', 'icon', 'avatar', 'trailing'],
} as const;

function App() {
  const [config, setConfig] = useState(defaults);
  const [selected, setSelected] = useState(false);
  const [visible, setVisible] = useState(true);
  const [clicks, setClicks] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');
  const restoreRef = useRef<HTMLButtonElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const label = config.label.trim() || 'Engineering';
  useEffect(() => { if (!visible) restoreRef.current?.focus(); }, [visible]);
  function update<K extends keyof typeof defaults>(key: K, value: (typeof defaults)[K]) {
    setConfig(current => ({ ...current, [key]: value }));
    setCopyStatus('');
  }
  const leading = config.artwork === 'icon' ? <Icon icon={tagIcon} size="sm" />
    : config.artwork === 'avatar' ? <Avatar name="Engineering" decorative size="sm" /> : undefined;
  const trailing = config.artwork === 'trailing' ? <Icon icon={chevronRightIcon} size="sm" /> : undefined;
  const modeProps = config.mode === 'link' ? { href: '#chip-playground-destination' }
    : config.mode === 'action' ? { onClick: () => setClicks(n => n + 1) }
    : config.mode === 'selectable' ? { selectable: true as const, selected, onSelectedChange: setSelected } : {};
  const removeProps = config.removable ? {
    onRemove: () => setVisible(false),
    removeLabel: 'Remove ' + label,
    ...(config.customRemove ? { removeIcon: <Icon icon={trashIcon} size="sm" /> } : {}),
  } : {};
  const chipProps: ChipProps = { children: label, variant: config.variant, size: config.size,
    tone: config.tone, disabled: config.disabled, wrap: config.wrap,
    ...(leading ? { leading } : {}), ...(trailing ? { trailing } : {}), ...modeProps, ...removeProps };
  // This usage snippet and the live preview share one configuration.
  const props = [
    ...(config.variant !== 'filled' ? ['variant=' + JSON.stringify(config.variant)] : []),
    ...(config.size !== 'md' ? ['size=' + JSON.stringify(config.size)] : []),
    ...(config.tone !== 'neutral' ? ['tone=' + JSON.stringify(config.tone)] : []),
    ...(config.mode === 'link' ? ['href="#chip-playground-destination"'] : []),
    ...(config.mode === 'action' ? ['onClick={handleClick}'] : []),
    ...(config.mode === 'selectable' ? ['selectable', 'selected={selected}', 'onSelectedChange={setSelected}'] : []),
    ...(config.artwork === 'icon' ? ['leading={<Icon icon={tagIcon} size="sm" />}'] : []),
    ...(config.artwork === 'avatar' ? ['leading={<Avatar name="Engineering" decorative size="sm" />}'] : []),
    ...(config.artwork === 'trailing' ? ['trailing={<Icon icon={chevronRightIcon} size="sm" />}'] : []),
    ...(config.removable ? ['onRemove={handleRemove}', 'removeLabel={' + JSON.stringify('Remove ' + label) + '}'] : []),
    ...(config.removable && config.customRemove ? ['removeIcon={<Icon icon={trashIcon} size="sm" />}'] : []),
    ...(config.disabled ? ['disabled'] : []), ...(config.wrap ? ['wrap'] : []),
  ];
  const usesIcon = config.artwork === 'icon' || config.artwork === 'trailing' || (config.removable && config.customRemove);
  const source = [
    "import { Chip } from '@vyrnforge/react/chip';", "import '@vyrnforge/web/styles/chip.css';",
    ...(usesIcon ? ["import { Icon } from '@vyrnforge/react/icon';", "import '@vyrnforge/web/styles/icon.css';"] : []),
    ...(config.artwork === 'icon' ? ["import { tagIcon } from '@vyrnforge/icons/tag';"] : []),
    ...(config.artwork === 'trailing' ? ["import { chevronRightIcon } from '@vyrnforge/icons/chevron-right';"] : []),
    ...(config.removable && config.customRemove ? ["import { trashIcon } from '@vyrnforge/icons/trash';"] : []),
    ...(config.artwork === 'avatar' ? ["import { Avatar } from '@vyrnforge/react/avatar';", "import '@vyrnforge/web/styles/avatar.css';"] : []),
    '', '// In your React component; supply application-owned handlers/state as needed.',
    ...(config.mode === 'selectable' ? ['// selected / setSelected: useState(' + selected + ')'] : []),
    ...(config.removable ? ['// handleRemove commits removal and restores collection focus.'] : []),
    ...(config.mode === 'action' ? ['// handleClick performs the primary action.'] : []),
    ...(config.mode === 'link' ? ['// Supply your own destination.'] : []),
    props.length
      ? '<Chip\n' + props.map(prop => '  ' + prop).join('\n') + '\n>{' + JSON.stringify(label) + '}</Chip>'
      : '<Chip>{' + JSON.stringify(label) + '}</Chip>',
  ].join('\n');

  function reset() {
    setConfig(defaults); setSelected(false); setVisible(true); setClicks(0); setCopyStatus('');
  }
  async function copySource() {
    try {
      await navigator.clipboard.writeText(source);
      setCopyStatus('Copied React usage.');
    } catch {
      sourceRef.current?.focus(); sourceRef.current?.select();
      setCopyStatus('Source selected. Use your device copy command.');
    }
  }
  return <Flow gap="md">
    <Flow as="section" aria-label="Chip preview" align="center" justify="center" gap="sm"
      style={{ minBlockSize: '7rem' }}>
      {visible ? <Chip {...chipProps} /> : <Text variant="body-sm">Chip removed</Text>}
      {!visible && <Button ref={restoreRef} variant="secondary" type="button" onClick={() => setVisible(true)}>Restore</Button>}
      <Text role="status" variant="body-sm">{config.mode === 'selectable' ? (selected ? 'Selected' : 'Not selected')
        : config.mode === 'action' ? 'Activations: ' + clicks : visible ? 'Live preview' : 'Chip removed'}</Text>
    </Flow>
    <Flow as="label" gap="xs"><Text as="span">Label</Text><Input value={config.label} onChange={event => update('label', event.currentTarget.value)} /></Flow>
    <AutoGrid minItemSize="14rem" gap="md">
      {(Object.keys(options) as Array<keyof typeof options>).map(key => <Flow as="fieldset" key={key} gap="xs"
        style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0 }}>
        <legend><Text as="span" variant="body-sm">{key[0]!.toUpperCase() + key.slice(1)}</Text></legend>
        <Flow direction="inline" wrap="wrap" align="center" gap="sm">
          {options[key].map(value => <Flow as="label" key={value} direction="inline" align="center" gap="xs">
            <Radio name={'chip-' + key} value={value} checked={config[key] === value} onChange={() => {
              update(key, value as (typeof defaults)[typeof key]);
              if (key === 'mode') setSelected(false);
            }} />
            <Text as="span" variant="body-sm">{value}</Text>
          </Flow>)}
        </Flow>
      </Flow>)}
    </AutoGrid>
    <Flow direction="inline" wrap="wrap" gap="md">
      {(['removable', 'customRemove', 'disabled', 'wrap'] as const).map(key => <Flow as="label" key={key} direction="inline" align="center" gap="xs">
        <Checkbox checked={config[key]} disabled={key === 'customRemove' && !config.removable}
          onChange={event => update(key, event.currentTarget.checked)} />
        <Text as="span">{{ removable: 'Deletable', customRemove: 'Custom delete icon', disabled: 'Disabled', wrap: 'Multiline' }[key]}</Text>
      </Flow>)}
      <Flow as="label" direction="inline" align="center" gap="xs">
        <Checkbox checked={selected} disabled={config.mode !== 'selectable'} onChange={event => setSelected(event.currentTarget.checked)} />
        <Text as="span">Selected</Text>
      </Flow>
    </Flow>
    <Flow direction="inline" wrap="wrap" gap="sm">
      <Button type="button" variant="ghost" onClick={reset}>Reset configuration</Button>
      <Button type="button" variant="secondary" onClick={copySource}>Copy React usage</Button>
    </Flow>
    <Text role="status">{copyStatus}</Text>
    <Flow as="label" gap="xs">
      <Text as="span">Generated React usage</Text>
      <Textarea ref={sourceRef} readOnly value={source} rows={Math.min(10, source.split('\n').length + 1)} style={{ fontFamily: 'var(--vf-font-family-mono)', fontSize: 'var(--vf-font-size-sm)' }} />
    </Flow>
    <Text id="chip-playground-destination" variant="body-sm">Link example destination</Text>
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<App />);
