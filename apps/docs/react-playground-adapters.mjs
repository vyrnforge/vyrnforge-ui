import { createElement as h, useId, useState, useEffect, useRef } from 'react';
import { Button } from '@vyrnforge/react/button';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Radio } from '@vyrnforge/react/radio';
import { Avatar } from '@vyrnforge/react/avatar';
import { Badge } from '@vyrnforge/react/badge';
import { Chip } from '@vyrnforge/react/chip';
import { tagIcon } from '@vyrnforge/icons/tag';
import { trashIcon } from '@vyrnforge/icons/trash';
import { chevronRightIcon } from '@vyrnforge/icons/chevron-right';
import { Icon } from '@vyrnforge/react/icon';
import { userIcon } from '@vyrnforge/icons/user';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { jsxText } from './playground-config.mjs';

const text = (key, label, value) => ({ kind: 'text', key, label, default: value });
const bool = (key, label) => ({ kind: 'boolean', key, label, default: false });
const choice = (key, label, value, options) => ({ kind: 'choice', key, label, default: value,
  options: options.map(option => ({ value: option, label: option })) });
const importLine = (component, path) => "import { " + component + " } from '@vyrnforge/react/" + path + "';";
const styleLine = path => "import '@vyrnforge/web/styles/" + path + ".css';";
const compositionImports = [importLine('Flow', 'layout'), importLine('Text', 'text'), styleLine('layout'), styleLine('text')];
const label = (config, fallback) => config.label.trim() || fallback;
const flag = (name, enabled) => enabled ? ' ' + name : '';
const attribute = (name, value, defaultValue) => value === defaultValue ? '' : ' ' + name + '=' + jsxText(value);

function buttonProps(config) {
  return { type: 'button', variant: config.variant, size: config.size, disabled: config.disabled, loading: config.loading };
}
function ButtonPreview({ config }) {
  const [count, setCount] = useState(0);
  return h(Flow, { align: 'center', gap: 'sm' },
    h(Button, { ...buttonProps(config), onClick: () => setCount(n => n + 1) }, label(config, 'Save changes')),
    h(Text, { role: 'status', variant: 'body-sm' }, 'Activations: ' + count));
}
export const buttonPlayground = {
  fields: [text('label', 'Label', 'Save changes'),
    choice('variant', 'Variant', 'primary', ['primary', 'secondary', 'ghost']),
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    bool('disabled', 'Disabled'), bool('loading', 'Loading')],
  presets: [{ label: 'Busy and disabled', values: { loading: true, disabled: true } }],
  Preview: ButtonPreview,
  source(config) {
    const props = buttonProps(config);
    return [
      "import { useState } from 'react';", importLine('Button', 'button'), styleLine('button'), ...compositionImports,
      '', 'export function Example() {', '  const [count, setCount] = useState(0);', '  return (',
      '    <Flow align="center" gap="sm">',
      '      <Button type="button"' + attribute('variant', props.variant, 'primary') + attribute('size', props.size, 'md') +
        flag('disabled', props.disabled) + flag('loading', props.loading) + ' onClick={() => setCount(n => n + 1)}>' +
        jsxText(label(config, 'Save changes')) + '</Button>',
      '      <Text role="status" variant="body-sm">Activations: {count}</Text>',
      '    </Flow>', '  );', '}',
    ].join('\n');
  },
};

function CheckboxPreview({ config, update }) {
  return h(Flow, { as: 'label', direction: 'inline', align: 'center', gap: 'sm' },
    h(Checkbox, { checked: config.selection === 'checked', indeterminate: config.selection === 'mixed',
      disabled: config.disabled, required: config.required,
      onChange: e => update('selection', e.currentTarget.checked ? 'checked' : 'unchecked') }),
    h(Text, { as: 'span' }, label(config, 'Include a gift receipt')));
}
export const checkboxPlayground = {
  fields: [text('label', 'Label', 'Include a gift receipt'),
    choice('selection', 'State', 'unchecked', ['unchecked', 'checked', 'mixed']),
    bool('disabled', 'Disabled'), bool('required', 'Required')],
  Preview: CheckboxPreview,
  source(config) {
    return [
      "import { useState } from 'react';", importLine('Checkbox', 'checkbox'), styleLine('checkbox'), ...compositionImports,
      '', 'export function Example() {', '  const [selection, setSelection] = useState<' +
        "'unchecked' | 'checked' | 'mixed'>(" + JSON.stringify(config.selection) + ');',
      '  return (', '    <Flow as="label" direction="inline" align="center" gap="sm">',
      '      <Checkbox checked={selection === "checked"} indeterminate={selection === "mixed"}' +
        flag('disabled', config.disabled) + flag('required', config.required) +
        ' onChange={event => setSelection(event.currentTarget.checked ? "checked" : "unchecked")} />',
      '      <Text as="span">' + jsxText(label(config, 'Include a gift receipt')) + '</Text>',
      '    </Flow>', '  );', '}',
    ].join('\n');
  },
};

function RadioPreview({ config, update }) {
  const name = useId();
  return h(Flow, { as: 'fieldset', gap: 'sm', style: { minInlineSize: 0 } },
    h('legend', null, 'Delivery'),
    ...['standard', 'express'].map(value => h(Flow, { as: 'label', direction: 'inline', align: 'center', gap: 'sm', key: value },
      h(Radio, { name, value, checked: config.selection === value, disabled: config.disabled,
        required: config.required, onChange: () => update('selection', value) }),
      h(Text, { as: 'span' }, value === 'standard' ? 'Standard' : 'Express'))));
}
export const radioPlayground = {
  fields: [choice('selection', 'Selected option', 'standard', ['standard', 'express']),
    bool('disabled', 'Disabled'), bool('required', 'Required')],
  Preview: RadioPreview,
  source(config) {
    return [
      "import { useId, useState } from 'react';", importLine('Radio', 'radio'), styleLine('radio'), ...compositionImports,
      '', 'export function Example() {', '  const name = useId();',
      '  const [selection, setSelection] = useState(' + JSON.stringify(config.selection) + ');',
      '  return (', '    <Flow as="fieldset" gap="sm" style={{ minInlineSize: 0 }}>', '      <legend>Delivery</legend>',
      ...['standard', 'express'].flatMap(value => [
        '      <Flow as="label" direction="inline" align="center" gap="sm">',
        '        <Radio name={name} value="' + value + '" checked={selection === "' + value + '"}' +
          flag('disabled', config.disabled) + flag('required', config.required) +
          ' onChange={() => setSelection("' + value + '")} />',
        '        <Text as="span">' + (value === 'standard' ? 'Standard' : 'Express') + '</Text>', '      </Flow>',
      ]), '    </Flow>', '  );', '}',
    ].join('\n');
  },
};

function avatarProps(config) {
  return { name: label(config, 'Ada Lovelace'), size: config.size, shape: config.shape,
    decorative: config.decorative, appearance: config.appearance,
    ...(config.appearance === 'icon' ? { icon: h(Icon, { icon: userIcon }) } :
      config.initials.trim() ? { initials: config.initials } : {}) };
}
function AvatarPreview({ config }) {
  const props = avatarProps(config);
  return h(Flow, { align: 'center', gap: 'sm' }, h(Avatar, props),
    config.decorative ? h(Text, null, props.name) : null);
}
export const avatarPlayground = {
  fields: [text('label', 'Name', 'Ada Lovelace'),
    choice('appearance', 'Appearance', 'letter', ['letter', 'icon']),
    { ...text('initials', 'Custom initials', ''), available: config => config.appearance === 'letter' },
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    choice('shape', 'Shape', 'rounded', ['rounded', 'square']), bool('decorative', 'Decorative (name shown nearby)')],
  Preview: AvatarPreview,
  source(config) {
    const props = avatarProps(config);
    const icon = config.appearance === 'icon';
    return [
      importLine('Avatar', 'avatar'), styleLine('avatar'),
      ...(icon ? [importLine('Icon', 'icon'), "import { userIcon } from '@vyrnforge/icons/user';", styleLine('icon')] : []),
      ...(props.decorative ? compositionImports : []),
      '', 'export function Example() {', '  return (',
      ...(props.decorative ? ['    <Flow align="center" gap="sm">'] : []),
      (props.decorative ? '      ' : '    ') + '<Avatar name=' + jsxText(props.name) +
        attribute('size', props.size, 'md') + attribute('shape', props.shape, 'rounded') +
        flag('decorative', props.decorative) + (icon ? ' appearance="icon" icon={<Icon icon={userIcon} />}' :
          props.initials ? ' initials=' + jsxText(props.initials) : '') + ' />',
      ...(props.decorative ? ['      <Text>' + jsxText(props.name) + '</Text>', '    </Flow>'] : []),
      '  );', '}',
    ].join('\n');
  },
};

const number = (key, label, value, min, max) => ({ kind: 'number', key, label, default: value, min, max, step: 1 });
function badgeProps(config) {
  return { variant: config.variant, tone: config.tone, size: config.size,
    ...(config.variant === 'standard' ? { badgeContent: config.count, max: config.max, showZero: config.showZero } : {}),
    invisible: config.invisible,
    anchorOrigin: { vertical: config.vertical, horizontal: config.horizontal } };
}
function badgeName(config) {
  if (config.invisible || (config.variant === 'standard' && config.count === 0 && !config.showZero)) return 'Inbox';
  return config.variant === 'dot' ? 'Inbox, unread messages' : 'Inbox, ' + config.count + ' unread messages';
}
function BadgePreview({ config }) {
  return h(Badge, badgeProps(config),
    h(Button, { type: 'button', 'aria-label': badgeName(config), variant: 'secondary' }, 'Inbox'));
}
export const badgePlayground = {
  fields: [choice('variant', 'Variant', 'standard', ['standard', 'dot']),
    choice('tone', 'Tone', 'neutral', ['neutral', 'accent', 'danger']),
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    { ...number('count', 'Count', 4, 0, 999), available: config => config.variant === 'standard' },
    { ...number('max', 'Maximum display count', 99, 1, 999), available: config => config.variant === 'standard' },
    { ...bool('showZero', 'Show zero'), available: config => config.variant === 'standard' },
    bool('invisible', 'Invisible'),
    choice('vertical', 'Vertical position', 'top', ['top', 'bottom']),
    choice('horizontal', 'Horizontal position', 'end', ['start', 'end'])],
  Preview: BadgePreview,
  source(config) {
    const props = badgeProps(config);
    return [
      importLine('Badge', 'badge'), styleLine('badge'), importLine('Button', 'button'), styleLine('button'),
      '', 'export function Example() {', '  return (',
      '    <Badge' + attribute('variant', props.variant, 'standard') +
        (props.variant === 'standard' ? ' badgeContent={' + props.badgeContent + '}' +
          attribute('max', props.max, 99) + flag('showZero', props.showZero) : '') +
        attribute('tone', props.tone, 'neutral') + attribute('size', props.size, 'md') +
        flag('invisible', props.invisible) +
        (config.vertical !== 'top' || config.horizontal !== 'end'
          ? ' anchorOrigin={{ vertical: ' + JSON.stringify(config.vertical) + ', horizontal: ' + JSON.stringify(config.horizontal) + ' }}' : '') + '>',
      '      <Button type="button" variant="secondary" aria-label=' + jsxText(badgeName(config)) + '>Inbox</Button>',
      '    </Badge>', '  );', '}',
    ].join('\n');
  },
};

function chipProps(config, destination) {
  return { children: label(config, 'Engineering'), variant: config.variant, size: config.size,
    tone: config.tone, disabled: config.disabled, wrap: config.wrap,
    ...(config.mode === 'link' ? { href: destination } : {}),
    ...(config.mode === 'selectable' ? { selectable: true, selected: config.selected } : {}),
    ...(config.artwork === 'icon' ? { leading: h(Icon, { icon: tagIcon, size: 'sm' }) } : {}),
    ...(config.artwork === 'avatar' ? { leading: h(Avatar, { name: 'Engineering', decorative: true, size: 'sm' }) } : {}),
    ...(config.artwork === 'trailing' ? { trailing: h(Icon, { icon: chevronRightIcon, size: 'sm' }) } : {}),
    ...(config.removable ? { removeLabel: 'Remove ' + label(config, 'Engineering'),
      ...(config.customRemove ? { removeIcon: h(Icon, { icon: trashIcon, size: 'sm' }) } : {}) } : {}) };
}
function ChipPreview({ config, update }) {
  const destination = useId();
  const restore = useRef(null);
  const root = useRef(null);
  const shouldFocus = useRef(false);
  const [visible, setVisible] = useState(true);
  const [clicks, setClicks] = useState(0);
  useEffect(() => {
    if (!visible) restore.current?.focus();
    else if (shouldFocus.current) {
      shouldFocus.current = false;
      root.current?.querySelector('button:not(:disabled), a[href]')?.focus();
    }
  }, [visible]);
  return h(Flow, { align: 'center', gap: 'sm' },
    visible ? h(Chip, { ...chipProps(config, '#' + destination), ref: root,
      ...(config.mode === 'action' ? { onClick: () => setClicks(n => n + 1) } : {}),
      ...(config.mode === 'selectable' ? { onSelectedChange: value => update('selected', value) } : {}),
      ...(config.removable ? { onRemove: () => setVisible(false) } : {}) })
      : h(Button, { ref: restore, type: 'button', variant: 'secondary', onClick: () => {
        shouldFocus.current = true; setVisible(true);
      } }, 'Restore'),
    h(Text, { role: 'status', variant: 'body-sm' }, !visible ? 'Chip removed' :
      config.mode === 'action' ? 'Activations: ' + clicks :
      config.mode === 'selectable' ? (config.selected ? 'Selected' : 'Not selected') : 'Live preview'),
    config.mode === 'link' ? h(Text, { as: 'p', id: destination, tabIndex: -1, variant: 'body-sm' }, 'Link example destination') : null);
}
export const chipPlayground = {
  fields: [text('label', 'Label', 'Engineering'),
    choice('variant', 'Variant', 'filled', ['filled', 'outlined']),
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    choice('tone', 'Tone', 'neutral', ['neutral', 'accent', 'danger']),
    choice('mode', 'Mode', 'static', ['static', 'action', 'selectable', 'link']),
    choice('artwork', 'Artwork', 'none', ['none', 'icon', 'avatar', 'trailing']),
    bool('removable', 'Deletable'),
    { ...bool('customRemove', 'Custom delete icon'), available: config => config.removable },
    { ...bool('selected', 'Selected'), available: config => config.mode === 'selectable' },
    { ...bool('disabled', 'Disabled'), available: config => config.mode !== 'static' || config.removable },
    bool('wrap', 'Multiline')],
  Preview: ChipPreview,
  source(config) {
    const props = chipProps(config, '#chip-destination');
    const hasIcon = ['icon', 'trailing'].includes(config.artwork) || (config.removable && config.customRemove);
    const stateful = config.mode === 'action' || config.mode === 'selectable' || config.removable;
    const tag = '<Chip' + attribute('variant', props.variant, 'filled') + attribute('size', props.size, 'md') +
      attribute('tone', props.tone, 'neutral') + flag('disabled', props.disabled) + flag('wrap', props.wrap) +
      (config.mode === 'link' ? ' href="#chip-destination"' : config.mode === 'action' ? ' onClick={() => setClicks(n => n + 1)}' :
        config.mode === 'selectable' ? ' selectable selected={selected} onSelectedChange={setSelected}' : '') +
      (config.artwork === 'icon' ? ' leading={<Icon icon={tagIcon} size="sm" />}' :
        config.artwork === 'avatar' ? ' leading={<Avatar name="Engineering" decorative size="sm" />}' :
        config.artwork === 'trailing' ? ' trailing={<Icon icon={chevronRightIcon} size="sm" />}' : '') +
      (config.removable ? ' onRemove={() => setVisible(false)} removeLabel=' + jsxText(props.removeLabel) +
        (config.customRemove ? ' removeIcon={<Icon icon={trashIcon} size="sm" />}' : '') : '') +
      '>' + jsxText(props.children) + '</Chip>';
    return [
      ...(stateful ? ["import { useState" + (config.removable ? ', useEffect, useRef' : '') + " } from 'react';"] : []),
      importLine('Chip', 'chip'), styleLine('chip'), ...compositionImports,
      ...(config.mode === 'selectable' ? [styleLine('toggle-button')] : []),
      ...(config.removable || config.mode === 'action' ? [styleLine('button')] : []),
      ...(config.mode === 'link' ? [styleLine('link')] : []),
      ...(hasIcon ? [importLine('Icon', 'icon'), styleLine('icon')] : []),
      ...(config.artwork === 'icon' ? ["import { tagIcon } from '@vyrnforge/icons/tag';"] : []),
      ...(config.artwork === 'trailing' ? ["import { chevronRightIcon } from '@vyrnforge/icons/chevron-right';"] : []),
      ...(config.removable && config.customRemove ? ["import { trashIcon } from '@vyrnforge/icons/trash';"] : []),
      ...(config.artwork === 'avatar' ? [importLine('Avatar', 'avatar'), styleLine('avatar')] : []),
      ...(config.removable ? [importLine('Button', 'button')] : []),
      '', 'export function Example() {',
      ...(config.mode === 'action' ? ['  const [clicks, setClicks] = useState(0);'] : []),
      ...(config.mode === 'selectable' ? ['  const [selected, setSelected] = useState(' + config.selected + ');'] : []),
      ...(config.removable ? ['  const [visible, setVisible] = useState(true);',
        '  const restore = useRef<HTMLButtonElement>(null);',
        '  const root = useRef<HTMLSpanElement>(null);',
        '  const shouldFocus = useRef(false);',
        '  useEffect(() => {',
        '    if (!visible) restore.current?.focus();',
        '    else if (shouldFocus.current) {',
        '      shouldFocus.current = false;',
        '      root.current?.querySelector<HTMLElement>("button:not(:disabled), a[href]")?.focus();',
        '    }',
        '  }, [visible]);'] : []),
      '  return (', '    <Flow align="center" gap="sm">',
      ...(config.removable ? ['      {visible ? ' + tag.replace('<Chip', '<Chip ref={root}') + ' :',
        '        <Button ref={restore} type="button" variant="secondary" onClick={() => {',
        '          shouldFocus.current = true; setVisible(true);',
        '        }}>Restore</Button>}'] : ['      ' + tag]),
      '      <Text role="status" variant="body-sm">' +
        (config.removable ? '{!visible ? "Chip removed" : ' : '{') +
        (config.mode === 'action' ? '"Activations: " + clicks' : config.mode === 'selectable' ? 'selected ? "Selected" : "Not selected"' : '"Live preview"') +
        '}</Text>',
      ...(config.mode === 'link' ? ['      <Text as="p" id="chip-destination" tabIndex={-1} variant="body-sm">Link example destination</Text>'] : []),
      '    </Flow>', '  );', '}',
    ].join('\n');
  },
};
