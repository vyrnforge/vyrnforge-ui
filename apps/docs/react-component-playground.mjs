import { createElement as h, useEffect, useId, useRef, useState } from 'react';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { Radio } from '@vyrnforge/react/radio';
import { SegmentedControlRoot, SegmentedControlItem } from '@vyrnforge/react/segmented-control';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { CodeBlock } from '@vyrnforge/react/code';
import { defaultsFor, changeConfiguration, normalizeConfiguration } from './playground-config.mjs';

function ConfigurationField({ field, config, update, disabled }) {
  const id = useId();
  const value = config[field.key];
  const locked = disabled || (field.available && !field.available(config));
  const description = field.description
    ? h(Text, { id: id + '-description', variant: 'body-sm' }, field.description) : null;
  const common = { id, disabled: locked, 'aria-describedby': description ? id + '-description' : undefined };
  if (field.kind === 'boolean') return h(Flow, { gap: 'xs' },
    h(Flow, { as: 'label', direction: 'inline', gap: 'xs', align: 'center' },
      h(Checkbox, { ...common, checked: value, onChange: e => update(field.key, e.currentTarget.checked) }),
      h(Text, { as: 'span' }, field.label)), description);
  // Use the public native-radio-backed segmented control for short, mutually exclusive choices.
  // Longer labels retain radios/selects instead of squeezing text into tiny segments.
  if (field.kind === 'choice' && field.options.length <= 3 && field.options.every(option => option.label.length <= 10)) {
    return h(Flow, { gap: 'xs', className: 'vf-docs-playground-field' },
      h(Text, { as: 'span', id: id + '-label', variant: 'body-sm' }, field.label),
      h(SegmentedControlRoot, { value, name: id, 'aria-labelledby': id + '-label',
        'aria-describedby': common['aria-describedby'], onValueChange: next => update(field.key, next) },
        ...field.options.map(option => h(SegmentedControlItem, { key: option.value, value: option.value, disabled: locked }, option.label))),
      description);
  }
  if (field.kind === 'choice' && field.options.length <= 4) return h(Flow, {
    as: 'fieldset', gap: 'xs', disabled: locked, className: 'vf-docs-playground-field',
    'aria-describedby': common['aria-describedby'],
    style: { border: 0, margin: 0, padding: 0, minInlineSize: 0 },
  }, h('legend', null, h(Text, { as: 'span', variant: 'body-sm' }, field.label)),
  h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'sm', align: 'center' },
    ...field.options.map(option => h(Flow, { as: 'label', key: option.value, direction: 'inline', gap: 'xs', align: 'center' },
      h(Radio, { name: id, value: option.value, checked: value === option.value,
        onChange: () => update(field.key, option.value) }),
      h(Text, { as: 'span', variant: 'body-sm' }, option.label)))), description);
  return h(Flow, { gap: 'xs', className: 'vf-docs-playground-field' },
    h('label', { htmlFor: id }, h(Text, { as: 'span', variant: 'body-sm' }, field.label)),
    field.kind === 'choice'
      ? h(NativeSelect, { ...common, value, onChange: e => update(field.key, e.currentTarget.value) },
          ...field.options.map(option => h('option', { key: option.value, value: option.value }, option.label)))
      : h(Input, { ...common, type: field.kind === 'number' ? 'number' : 'text', value,
          min: field.min, max: field.max, step: field.step,
          onChange: e => {
            const next = field.kind === 'number' ? e.currentTarget.valueAsNumber : e.currentTarget.value;
            if (field.kind !== 'number' || Number.isFinite(next)) update(field.key, next);
          } }), description);
}

/**
 * React presentation only. Adapters own real component props, behavior and usage source.
 * This is deliberately not a public component or a live code evaluator.
 * @typedef {import('./playground-config.mjs').Configuration} Configuration
 * @typedef {{fields: readonly import('./playground-config.mjs').Field[],
 *   presets?: readonly import('./playground-config.mjs').Preset[],
 *   Preview: import('react').ComponentType<{config: Configuration, update: (key: string, value: string | boolean | number) => void}>,
 *   source: (config: Configuration) => string}} Adapter
 * @param {{adapter: Adapter, title: string}} props
 */
export function ComponentPlayground({ adapter, title }) {
  const id = useId();
  const [config, setConfig] = useState(() => defaultsFor(adapter.fields));
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState('');
  const sourceRegion = useRef(null);
  const copyRequest = useRef(0);
  useEffect(() => { setReady(true); return () => { copyRequest.current++; }; }, []);
  const source = adapter.source(config);
  function update(key, value) {
    copyRequest.current++;
    setFeedback('');
    setConfig(current => changeConfiguration(adapter.fields, current, { [key]: value }));
  }
  function restore(values = {}) {
    copyRequest.current++;
    setFeedback('');
    setConfig(normalizeConfiguration(adapter.fields, { ...defaultsFor(adapter.fields), ...values }));
    setRevision(current => current + 1);
  }
  async function copy() {
    const request = ++copyRequest.current;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(source);
      if (request === copyRequest.current) setFeedback('React usage copied.');
    } catch {
      if (request !== copyRequest.current) return;
      const region = sourceRegion.current;
      region?.focus();
      const selection = window.getSelection();
      if (region && selection) {
        const range = document.createRange();
        range.selectNodeContents(region);
        selection.removeAllRanges();
        selection.addRange(range);
        setFeedback('Source selected. Use your device copy command.');
      } else setFeedback('Clipboard unavailable. Select and copy the source manually.');
    }
  }
  const properties = adapter.fields.filter(field => field.kind !== 'boolean');
  const options = adapter.fields.filter(field => field.kind === 'boolean');
  const field = definition => h(ConfigurationField, {
    key: definition.key, field: definition, config, update, disabled: !ready,
  });
  return h('div', { className: 'vf-docs-playground', 'data-vf-docs-component-playground': title },
    h('div', { className: 'vf-docs-playground-workbench' },
      h(Flow, { as: 'section', className: 'vf-docs-component-playground-preview',
        gap: 'sm', 'aria-label': title + ' preview' },
        h(Text, { as: 'h3', variant: 'body-sm', tone: 'secondary' }, 'Preview'),
        h(Flow, { className: 'vf-docs-playground-canvas', gap: 'sm', align: 'center', justify: 'center' },
          h(adapter.Preview, { key: revision, config, update }))),
      h(Flow, { as: 'section', className: 'vf-docs-playground-configuration', gap: 'md', 'aria-labelledby': id + '-config' },
        h(Flow, { direction: 'inline', align: 'center', justify: 'space-between', wrap: 'wrap', gap: 'xs' },
          h(Text, { as: 'h3', id: id + '-config', variant: 'heading-sm' }, 'Configuration'),
          h(Button, { type: 'button', size: 'sm', variant: 'ghost', disabled: !ready,
            onClick: () => restore(), 'aria-label': 'Reset playground' }, 'Reset')),
        h(AutoGrid, { minItemSize: '16rem', gap: 'md', className: 'vf-docs-playground-properties' },
          ...properties.map(field)),
        options.length ? h(Flow, { as: 'fieldset', gap: 'xs', className: 'vf-docs-playground-options' },
          h('legend', null, h(Text, { as: 'span', variant: 'body-sm', tone: 'secondary' }, 'Options')),
          h(AutoGrid, { minItemSize: '11rem', gap: 'sm' }, ...options.map(field))) : null,
        adapter.presets?.length ? h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'xs', align: 'center' },
          h(Text, { as: 'span', variant: 'body-sm', tone: 'secondary' }, 'Presets'),
          ...adapter.presets.map(preset => h(Button, { key: preset.label, type: 'button', variant: 'secondary', size: 'sm',
            disabled: !ready, onClick: () => restore(preset.values) }, preset.label))) : null)),
    h(Flow, { as: 'section', className: 'vf-docs-playground-source', gap: 'sm', 'aria-labelledby': id + '-source' },
      h(Flow, { direction: 'inline', wrap: 'wrap', align: 'center', justify: 'space-between', gap: 'xs' },
        h(Text, { as: 'h3', id: id + '-source', variant: 'heading-sm' }, 'React usage'),
        h(Button, { type: 'button', size: 'sm', variant: 'secondary', disabled: !ready, onClick: copy,
          'aria-label': 'Copy code' }, 'Copy code')),
      h('div', { role: 'region', 'aria-label': 'Generated React usage' },
        h(CodeBlock, { ref: sourceRegion, tabIndex: 0, dir: 'ltr', 'aria-label': 'React source code' }, source)),
      h(Text, { role: 'status', variant: 'body-sm', className: 'vf-docs-playground-feedback' }, feedback)));
}
