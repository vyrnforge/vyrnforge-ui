import { Input } from '@vyrnforge/react/input';
import { Textarea } from '@vyrnforge/react/textarea';
import { TextField } from '@vyrnforge/react/text-field';
import { createElement as h, useId, useState, useEffect, useRef } from 'react';
import { Button } from '@vyrnforge/react/button';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Radio } from '@vyrnforge/react/radio';
import { Avatar } from '@vyrnforge/react/avatar';
import { Badge } from '@vyrnforge/react/badge';
import { Chip } from '@vyrnforge/react/chip';
import { Backdrop } from '@vyrnforge/react/backdrop';
import { StatusIndicator } from '@vyrnforge/react/status-indicator';
import { Alert } from '@vyrnforge/react/alert';
import { DialogHeader, DialogBody, DialogFooter, DialogRoot, DialogTitle, DialogDescription, DialogClose } from '@vyrnforge/react/dialog';
import { AlertDialogHeader, AlertDialogBody, AlertDialogFooter, AlertDialogRoot, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@vyrnforge/react/alert-dialog';
import { DrawerHeader, DrawerBody, DrawerFooter, DrawerRoot, DrawerTitle, DrawerDescription, DrawerClose } from '@vyrnforge/react/drawer';
import { ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastClose } from '@vyrnforge/react/toast';

import { Loading, LoadingIndicator, LoadingPlaceholder, LoadingProgress, LoadingCustom } from '@vyrnforge/react/loading';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Divider } from '@vyrnforge/react/divider';
import { List, ListItem } from '@vyrnforge/react/list';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
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
const label = (config, fallback) => config.label.trim() || fallback;
// Author concise JSX, with expression escaping only when needed for literal strings.
const flag = (name, enabled) => enabled ? name : '';
const quoted = value => typeof value === 'string' && !/["&<>{}\r\n]/.test(value)
  ? '"' + value + '"' : jsxText(value);
const attribute = (name, value, defaultValue) => value === defaultValue ? '' : name + '=' + quoted(value);
const content = value => /^[^&<>{}\r\n]+$/.test(value) && value === value.trim() ? value : jsxText(value);
const indent = (value, spaces) => value.split('\n').map(line => ' '.repeat(spaces) + line).join('\n');
function markup(name, attributes, children) {
  const props = attributes.filter(Boolean);
  const opening = '<' + name + (props.length ? ' ' + props.join(' ') : '');
  const multiline = props.length > 1 && opening.length > 72;
  const start = multiline ? '<' + name + '\n' + props.map(prop => '  ' + prop).join('\n') + '\n' : opening;
  if (children === undefined) return start + (multiline ? '/>' : ' />');
  const end = '</' + name + '>';
  if (!children.includes('\n') && !children.startsWith('<') && !multiline && start.length + children.length + end.length < 88) {
    return start + '>' + children + end;
  }
  return start + '>\n' + indent(children, 2) + '\n' + end;
}
// Pure snippets are JSX to paste inside an existing React component. Only examples
// whose selected behavior needs state/callbacks include a minimal component function.
function snippet(imports, jsx, { setup = [], signature } = {}) {
  const body = signature || setup.length
    ? ['export function Example(' + (signature ?? '') + ') {',
      ...setup.map(line => '  ' + line), '  return (', indent(jsx, 4), '  );', '}'].join('\n')
    : jsx;
  return [...new Set(imports), '', body].join('\n');
}
const iconImports = (symbol, path) => [
  importLine('Icon', 'icon'), "import { " + symbol + " } from '@vyrnforge/icons/" + path + "';",
];

function buttonProps(config) {
  return { type: 'button', variant: config.variant, size: config.size, disabled: config.disabled, loading: config.loading,
    ...(config.artwork === 'icon only' ? { iconOnly: true, 'aria-label': label(config, 'Save changes') } : {}) };
}
function ButtonPreview({ config }) {
  const [count, setCount] = useState(0);
  return h(Flow, { align: 'center', gap: 'sm' },
    h(Button, { ...buttonProps(config), onClick: () => setCount(n => n + 1) },
      config.artwork !== 'none' ? h(Icon, { icon: bookmarkIcon }) : null,
      config.artwork !== 'icon only' ? label(config, 'Save changes') : null),
    h(Text, { role: 'status', variant: 'body-sm', className: 'vf-docs-playground-feedback' }, count ? 'Activations: ' + count : ''));
}
export const buttonPlayground = {
  fields: [text('label', 'Label', 'Save changes'),
    choice('variant', 'Variant', 'primary', ['primary', 'secondary', 'ghost']),
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    bool('disabled', 'Disabled'), bool('loading', 'Loading'),
    choice('artwork', 'Artwork', 'none', ['none', 'icon', 'icon only'])],
  presets: [{ label: 'Busy and disabled', values: { loading: true, disabled: true } }],
  Preview: ButtonPreview,
  source(config) {
    const props = buttonProps(config);
    return snippet([importLine('Button', 'button'),
      ...(config.artwork !== 'none' ? iconImports('bookmarkIcon', 'bookmark') : [])],
    markup('Button', ['type="button"', attribute('variant', props.variant, 'primary'),
      attribute('size', props.size, 'md'), flag('disabled', props.disabled), flag('loading', props.loading),
      flag('iconOnly', props.iconOnly), props.iconOnly ? attribute('aria-label', props['aria-label']) : ''],
    [config.artwork !== 'none' ? '<Icon icon={bookmarkIcon} />' : '',
      props.iconOnly ? '' : content(label(config, 'Save changes'))].filter(Boolean).join('\n')));
  },
};

function CheckboxPreview({ config, update }) {
  const labelId = useId();
  const descriptionId = labelId + '-description';
  const name = label(config, 'Include a gift receipt');
  const rich = config.presentation === 'label and description';
  const control = h(Checkbox, { checked: config.selection === 'checked', indeterminate: config.selection === 'mixed',
    size: config.size, disabled: config.disabled, required: config.required,
    ...(config.presentation === 'standalone' ? { 'aria-label': name } : {}),
    ...(rich ? { 'aria-labelledby': labelId, 'aria-describedby': descriptionId } : {}),
    onChange: e => update('selection', e.currentTarget.checked ? 'checked' : 'unchecked') });
  if (config.presentation === 'standalone') return control;
  return h(Flow, { as: 'label', direction: 'inline', align: 'center', gap: 'sm' }, control,
    config.presentation === 'icon label' ? h(Icon, { icon: tagIcon }) : null,
    rich ? h('span', { 'data-vf-flow': '', 'data-vf-flow-direction': 'block', 'data-vf-flow-gap': 'xs' },
      h(Text, { as: 'span', id: labelId }, name),
      h(Text, { as: 'span', variant: 'body-sm', id: descriptionId }, 'A separate receipt without prices.'))
      : h(Text, { as: 'span' }, name));
}
export const checkboxPlayground = {
  fields: [text('label', 'Label', 'Include a gift receipt'),
    choice('presentation', 'Presentation', 'label', ['standalone', 'label', 'icon label', 'label and description']),
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    choice('selection', 'State', 'unchecked', ['unchecked', 'checked', 'mixed']),
    bool('disabled', 'Disabled'), bool('required', 'Required')],
  Preview: CheckboxPreview,
  source(config) {
    const mixed = config.selection === 'mixed';
    const rich = config.presentation === 'label and description';
    const icon = config.presentation === 'icon label';
    const standalone = config.presentation === 'standalone';
    const name = label(config, 'Include a gift receipt');
    const checkbox = markup('Checkbox', [
      attribute('size', config.size, 'md'),
      mixed ? 'checked={selection === "checked"}' : flag('defaultChecked', config.selection === 'checked'),
      mixed ? 'indeterminate={selection === "mixed"}' : '', flag('disabled', config.disabled),
      flag('required', config.required),
      standalone ? attribute('aria-label', name) : '',
      rich ? 'aria-labelledby={labelId}' : '', rich ? 'aria-describedby={descriptionId}' : '',
      mixed ? 'onChange={event => setSelection(event.currentTarget.checked ? "checked" : "unchecked")}' : '',
    ]);
    const imports = [importLine('Checkbox', 'checkbox')];
    const hooks = [mixed ? 'useState' : '', rich ? 'useId' : ''].filter(Boolean);
    if (hooks.length) imports.unshift("import { " + hooks.join(', ') + " } from 'react';");
    const setup = [
      ...(mixed ? ['const [selection, setSelection] = useState<"unchecked" | "checked" | "mixed">("mixed");'] : []),
      ...(rich ? ['const labelId = useId();', 'const descriptionId = labelId + "-description";'] : []),
    ];
    if (standalone) return snippet(imports, checkbox, { setup });
    if (icon || rich) {
      imports.push(importLine('Flow', 'layout'));
      if (icon) imports.push(...iconImports('tagIcon', 'tag'));
      imports.push(importLine('Text', 'text'));
      const labelContent = rich
        ? markup('span', ['data-vf-flow=""', 'data-vf-flow-direction="block"', 'data-vf-flow-gap="xs"'], markup('Text', ['as="span"', 'id={labelId}'], content(name)) + '\n' +
          markup('Text', ['as="span"', 'variant="body-sm"', 'id={descriptionId}'], 'A separate receipt without prices.'))
        : '<Icon icon={tagIcon} />\n' + markup('Text', [], content(name));
      return snippet(imports, markup('Flow', ['as="label"', 'direction="inline"', 'align="center"', 'gap="sm"'], checkbox + '\n' + labelContent), { setup });
    }
    return snippet(imports, markup('label', [], checkbox + '\n' + content(name)), { setup });
  },
};

function RadioPreview({ config, update }) {
  const name = useId();
  return h(Flow, { as: 'fieldset', gap: 'sm', style: { minInlineSize: 0 } },
    h('legend', null, h(Text, { as: 'strong' }, 'Delivery')),
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
    // A same-name native group and its labels are semantic requirements, not demo chrome.
    return snippet([importLine('Radio', 'radio'), importLine('Flow', 'layout'), importLine('Text', 'text')],
      markup('Flow', ['as="fieldset"', 'gap="sm"'], '<legend><Text as="strong">Delivery</Text></legend>\n' + ['standard', 'express'].map(value =>
        markup('Flow', ['as="label"', 'direction="inline"', 'align="center"', 'gap="sm"'], markup('Radio', ['name="delivery"', attribute('value', value),
          flag('defaultChecked', config.selection === value), flag('disabled', config.disabled), flag('required', config.required)]) +
          '\n' + markup('Text', [], value === 'standard' ? 'Standard' : 'Express'))).join('\n')));
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
    const avatar = markup('Avatar', [attribute('name', props.name), attribute('size', props.size, 'md'),
      attribute('shape', props.shape, 'rounded'), flag('decorative', props.decorative),
      icon ? 'appearance="icon"' : '', icon ? 'icon={<Icon icon={userIcon} />}' : attribute('initials', props.initials, undefined)]);
    return snippet([importLine('Avatar', 'avatar'), ...(icon ? iconImports('userIcon', 'user') : [])],
      props.decorative ? '<>\n' + indent(avatar + '\n<span>' + content(props.name) + '</span>', 2) + '\n</>' : avatar);
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
    return snippet([importLine('Badge', 'badge'), importLine('Button', 'button')],
      markup('Badge', [attribute('variant', props.variant, 'standard'),
        props.variant === 'standard' ? attribute('badgeContent', props.badgeContent) : '',
        props.variant === 'standard' ? attribute('max', props.max, 99) : '',
        flag('showZero', props.showZero), attribute('tone', props.tone, 'neutral'),
        attribute('size', props.size, 'md'), flag('invisible', props.invisible),
        config.vertical !== 'top' || config.horizontal !== 'end'
          ? 'anchorOrigin={{ vertical: ' + JSON.stringify(config.vertical) + ', horizontal: ' + JSON.stringify(config.horizontal) + ' }}' : ''],
      markup('Button', ['type="button"', 'variant="secondary"', attribute('aria-label', badgeName(config))], 'Inbox')));
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
    h(Text, { role: 'status', variant: 'body-sm', className: 'vf-docs-playground-feedback' }, !visible ? 'Chip removed' :
      config.mode === 'action' && clicks ? 'Activations: ' + clicks : ''),
    config.mode === 'link' ? h(Text, { as: 'p', id: destination, tabIndex: -1, variant: 'body-sm' }, 'Link example destination') : null);
}
export const chipPlayground = {
  fields: [text('label', 'Label', 'Engineering'),
    choice('variant', 'Variant', 'filled', ['filled', 'outlined']),
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    choice('tone', 'Tone', 'neutral', ['neutral', 'accent', 'danger', 'success', 'warning', 'info']),
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
    const callbacks = [
      ...(config.mode === 'action' ? ['onClick'] : []), ...(config.removable ? ['onRemove'] : []),
    ];
    return snippet([importLine('Chip', 'chip'),
      ...(config.artwork === 'icon' ? iconImports('tagIcon', 'tag') : []),
      ...(config.artwork === 'trailing' ? iconImports('chevronRightIcon', 'chevron-right') : []),
      ...(config.removable && config.customRemove ? iconImports('trashIcon', 'trash') : []),
      ...(config.artwork === 'avatar' ? [importLine('Avatar', 'avatar')] : [])],
    markup('Chip', [attribute('variant', props.variant, 'filled'), attribute('size', props.size, 'md'),
      attribute('tone', props.tone, 'neutral'), flag('disabled', props.disabled), flag('wrap', props.wrap),
      config.mode === 'link' ? attribute('href', props.href) : '',
      config.mode === 'action' ? 'onClick={onClick}' : '',
      flag('selectable', config.mode === 'selectable'), flag('defaultSelected', config.mode === 'selectable' && config.selected),
      config.artwork === 'icon' ? 'leading={<Icon icon={tagIcon} size="sm" />}' : '',
      config.artwork === 'avatar' ? 'leading={<Avatar name="Engineering" decorative size="sm" />}' : '',
      config.artwork === 'trailing' ? 'trailing={<Icon icon={chevronRightIcon} size="sm" />}' : '',
      config.removable ? 'onRemove={onRemove}' : '', config.removable ? attribute('removeLabel', props.removeLabel) : '',
      config.removable && config.customRemove ? 'removeIcon={<Icon icon={trashIcon} size="sm" />}' : ''], content(props.children)),
    callbacks.length ? {
      signature: '{ ' + callbacks.join(', ') + ' }: { ' + callbacks.map(name => name + ': () => void').join('; ') + ' }',
    } : {});
  },
};

const toggleLabel = config => label(config, 'Bookmark article');
function TogglePreview({ config, update }) {
  return h(ToggleButton, { pressed: config.pressed, size: config.size, disabled: config.disabled,
    onPressedChange: pressed => update('pressed', pressed),
    ...(config.iconOnly ? { iconOnly: true, 'aria-label': toggleLabel(config) } : {}) },
    config.iconOnly ? h(Icon, { icon: bookmarkIcon, variant: config.pressed ? 'filled' : 'outlined' }) : toggleLabel(config));
}
export const togglePlayground = {
  fields: [text('label', 'Label', 'Bookmark article'), choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    bool('pressed', 'Pressed'), bool('disabled', 'Disabled'), bool('iconOnly', 'Icon only')],
  Preview: TogglePreview,
  source(config) {
    const controlled = config.iconOnly;
    return snippet([...(controlled ? ["import { useState } from 'react';"] : []),
      importLine('ToggleButton', 'toggle-button'),
      ...(controlled ? iconImports('bookmarkIcon', 'bookmark') : [])],
    markup('ToggleButton', [controlled ? 'pressed={pressed}' : flag('defaultPressed', config.pressed),
      controlled ? 'onPressedChange={setPressed}' : '', attribute('size', config.size, 'md'),
      flag('disabled', config.disabled), flag('iconOnly', config.iconOnly),
      config.iconOnly ? attribute('aria-label', toggleLabel(config)) : ''],
    controlled ? '<Icon icon={bookmarkIcon} variant={pressed ? "filled" : "outlined"} />' : content(toggleLabel(config))),
    controlled ? { setup: ['const [pressed, setPressed] = useState(' + config.pressed + ');'] } : {});
  },
};
function dividerProps(config) {
  return { orientation: config.orientation, textAlign: config.textAlign,
    ...(config.orientation === 'vertical' && config.label.trim() ? { textDirection: config.textDirection } : {}),
    children: config.label };
}
function DividerPreview({ config }) {
  return h(Flow, { direction: config.orientation === 'vertical' ? 'inline' : 'block',
    gap: 'md', style: { inlineSize: '100%', maxInlineSize: '20rem' } },
    h(Text, null, 'Draft'), h(Divider, dividerProps(config)), h(Text, null, 'Published'));
}
export const dividerPlayground = {
  fields: [text('label', 'Label', 'OR'), choice('orientation', 'Orientation', 'horizontal', ['horizontal', 'vertical']),
    { ...choice('textAlign', 'Label alignment', 'center', ['start', 'center', 'end']), available: config => Boolean(config.label.trim()) },
    { ...choice('textDirection', 'Label direction', 'top-to-bottom', ['top-to-bottom', 'bottom-to-top', 'horizontal']),
      available: config => config.orientation === 'vertical' && Boolean(config.label.trim()) }],
  Preview: DividerPreview,
  source(config) {
    const props = dividerProps(config);
    return snippet([importLine('Divider', 'divider')],
      markup('Divider', [attribute('orientation', props.orientation, 'horizontal'),
        config.label.trim() ? attribute('textAlign', props.textAlign, 'center') : '',
        props.textDirection ? attribute('textDirection', props.textDirection, 'top-to-bottom') : ''],
      config.label.trim() ? content(config.label) : undefined));
  },
};
const listItems = ['Design tokens', 'Components', 'Documentation'];
function listProps(config) {
  return { as: config.as, variant: config.variant, size: config.size, spacing: config.spacing,
    marker: config.marker, gutter: config.gutter, dividerInset: config.dividerInset };
}
function ListPreview({ config }) {
  return h(List, { ...listProps(config), 'aria-label': 'Project areas', style: { inlineSize: '100%', maxInlineSize: '20rem' } },
    ...listItems.map(item => h(ListItem, { key: item }, item)));
}
export const listPlayground = {
  fields: [choice('as', 'List type', 'ul', ['ul', 'ol']),
    choice('variant', 'Variant', 'plain', ['plain', 'divided', 'bordered']),
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    choice('spacing', 'Spacing', 'none', ['none', 'sm', 'md', 'lg']),
    choice('marker', 'Markers', 'none', ['none', 'auto']),
    choice('gutter', 'Gutter', 'auto', ['auto', 'none', 'sm', 'md', 'lg']),
    { ...choice('dividerInset', 'Divider inset', 'none', ['none', 'gutter']), available: config => config.variant !== 'plain' }],
  Preview: ListPreview,
  source(config) {
    const props = listProps(config);
    return snippet(["import { List, ListItem } from '@vyrnforge/react/list';"],
      markup('List', [attribute('as', props.as, 'ul'), attribute('variant', props.variant, 'plain'),
        attribute('size', props.size, 'md'), attribute('spacing', props.spacing, 'none'),
        attribute('marker', props.marker, 'none'), attribute('gutter', props.gutter, 'auto'),
        attribute('dividerInset', props.dividerInset, 'none'), 'aria-label="Project areas"'],
      listItems.map(item => markup('ListItem', [], item)).join('\n')));
  },
};

const loadingParts = {
  indicator: 'LoadingIndicator', placeholder: 'LoadingPlaceholder', progress: 'LoadingProgress', custom: 'LoadingCustom',
};
function LoadingPreview({ config }) {
  const body = config.presentation === 'indicator' ? h(LoadingIndicator, { variant: config.variant })
    : config.presentation === 'placeholder' ? h(LoadingPlaceholder, { shape: config.shape,
      style: { inlineSize: config.shape === 'circle' ? '3rem' : '100%', minBlockSize: '3rem' } })
    : config.presentation === 'progress' ? h(LoadingProgress, { 'aria-label': config.label || 'Loading',
      value: config.indeterminate ? undefined : config.value, max: 100 })
    : h(LoadingCustom, { 'aria-hidden': true }, h('svg', { width: 32, height: 32, viewBox: '0 0 32 32' },
      h('circle', { cx: 16, cy: 16, r: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2 })));
  return h(Flow, { gap: 'sm', style: { inlineSize: 'min(100%, 24rem)' } },
    h(Loading, { size: config.size }, body),
    h(Text, { as: 'p', variant: 'body-sm' }, config.label || 'Loading'));
}
export const loadingPlayground = {
  fields: [choice('presentation', 'Presentation', 'indicator', ['indicator', 'placeholder', 'progress', 'custom']),
    choice('size', 'Size', 'md', ['sm', 'md', 'lg']),
    {...choice('variant', 'Indicator', 'spinner', ['spinner', 'dots', 'bars', 'pulse']), available: c => c.presentation === 'indicator'},
    {...choice('shape', 'Placeholder shape', 'block', ['block', 'line', 'circle']), available: c => c.presentation === 'placeholder'},
    {...bool('indeterminate', 'Indeterminate'), available: c => c.presentation === 'progress'},
    {kind: 'number', key: 'value', label: 'Progress', default: 48, min: 0, max: 100, step: 1,
      available: c => c.presentation === 'progress' && !c.indeterminate},
    text('label', 'Status text', 'Loading account summary')],
  presets: [{ label: 'Upload progress', values: { presentation: 'progress', label: 'Uploading file', value: 48 } },
    { label: 'Structured placeholder', values: { presentation: 'placeholder', shape: 'line' } }],
  Preview: LoadingPreview,
  source(config) {
    const part = loadingParts[config.presentation];
    const body = config.presentation === 'indicator'
      ? markup(part, [attribute('variant', config.variant, 'spinner')])
      : config.presentation === 'placeholder'
        ? markup(part, [attribute('shape', config.shape, 'block'),
          'style={{ inlineSize: ' + JSON.stringify(config.shape === 'circle' ? '3rem' : '100%') + ', minBlockSize: "3rem" }}'])
        : config.presentation === 'progress'
          ? markup(part, [attribute('aria-label', config.label || 'Loading'),
            config.indeterminate ? '' : attribute('value', config.value), 'max={100}'])
          : markup(part, ['aria-hidden={true}'], '<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth={2} /></svg>');
    return snippet([importLine('Loading, ' + part, 'loading')], '<>\n' +
      indent(markup('Loading', [attribute('size', config.size, 'md')], body) + '\n<p>' +
        content(config.label || 'Loading') + '</p>', 2) + '\n</>');
  },
};

function BackdropPreview({ config }) {
  return h(Flow, { gap: 'sm', style: { inlineSize: 'min(100%, 24rem)' } },
    h('div', { style: { position: 'relative', isolation: 'isolate', padding: 'var(--vf-space-md)',
      border: '1px solid var(--vf-color-border-required)', borderRadius: 'var(--vf-radius-surface)' } },
      h(Text, { as: 'p' }, 'Account summary'),
      h(Button, { type: 'button', variant: 'secondary' }, 'View statement'),
      h(Backdrop, { hidden: config.hidden, style: { opacity: config.opacity } })),
    h(Text, { as: 'p', variant: 'body-sm' }, 'The scrim is visual-only; the underlying action is not disabled.'));
}
export const backdropPlayground = {
  fields: [bool('hidden', 'Hidden'), {kind: 'number', key: 'opacity', label: 'Opacity', min: 0, max: 1, step: 0.1, default: 1}],
  Preview: BackdropPreview,
  source(config) {
    // A positioned containing block is necessary to demonstrate the local scrim.
    return snippet([importLine('Backdrop', 'backdrop'), importLine('Button', 'button')],
      markup('div', ['style={{ position: "relative", isolation: "isolate" }}'],
        '<Button type="button" variant="secondary">View statement</Button>\n' +
        markup('Backdrop', [flag('hidden', config.hidden), config.opacity !== 1 ? 'style={{ opacity: ' + config.opacity + ' }}' : ''])));
  },
};

const severities = ['informational', 'success', 'warning', 'error', 'critical'];
function StatusIndicatorPreview({ config }) {
  return h(StatusIndicator, { severity: config.severity === 'neutral' ? undefined : config.severity }, label(config, 'Connected'));
}
export const statusIndicatorPlayground = {
  fields: [text('label', 'Label', 'Connected'), choice('severity', 'Severity', 'success', ['neutral', ...severities])],
  Preview: StatusIndicatorPreview,
  source(config) {
    return snippet([importLine('StatusIndicator', 'status-indicator')],
      markup('StatusIndicator', [attribute('severity', config.severity, 'neutral')], content(label(config, 'Connected'))));
  },
};
function AlertPreview({ config }) {
  const [visible, setVisible] = useState(true);
  const restore = useRef(null);
  return h(Flow, { gap: 'sm', style: { inlineSize: '100%' } },
    config.dismissible ? h(Button, { ref: restore, type: 'button', variant: 'secondary', onClick: () => setVisible(true) }, 'Restore message') : null,
    visible || !config.dismissible ? h(Alert, { severity: config.severity, variant: config.variant, announcement: config.announcement,
      heading: config.heading || undefined,
      dismiss: config.dismissible ? { label: 'Dismiss feedback', onDismiss: () => { setVisible(false); restore.current?.focus(); } } : undefined },
      config.message || 'Your changes remain available.') : null);
}
export const alertPlayground = {
  fields: [text('heading', 'Heading', 'Connection interrupted'), text('message', 'Message', 'Your changes remain available.'),
    choice('severity', 'Severity', 'warning', severities), choice('variant', 'Variant', 'subtle', ['subtle', 'outlined']),
    choice('announcement', 'Announcement', 'none', ['none', 'polite', 'assertive']), bool('dismissible', 'Dismissible')],
  Preview: AlertPreview,
  source(config) {
    const jsx = markup('Alert', [attribute('severity', config.severity, 'informational'), attribute('variant', config.variant, 'subtle'),
      attribute('announcement', config.announcement, 'none'), config.heading ? attribute('heading', config.heading) : '',
      config.dismissible ? 'dismiss={{ label: "Dismiss feedback", onDismiss }}' : ''], content(config.message || 'Your changes remain available.'));
    return snippet([importLine('Alert', 'alert')], jsx, config.dismissible ? { signature: '{ onDismiss }: { onDismiss: () => void }' } : {});
  },
};

const modalParts = {
  dialog: [DialogRoot, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogDescription, DialogClose],
  'alert-dialog': [AlertDialogRoot, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction],
  drawer: [DrawerRoot, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose],
};
const modalNames = {
  dialog: ['DialogRoot', 'DialogHeader', 'DialogBody', 'DialogFooter', 'DialogTitle', 'DialogDescription', 'DialogClose'],
  'alert-dialog': ['AlertDialogRoot', 'AlertDialogHeader', 'AlertDialogBody', 'AlertDialogFooter', 'AlertDialogTitle', 'AlertDialogDescription', 'AlertDialogCancel', 'AlertDialogAction'],
  drawer: ['DrawerRoot', 'DrawerHeader', 'DrawerBody', 'DrawerFooter', 'DrawerTitle', 'DrawerDescription', 'DrawerClose'],
};
function modalAdapter(id) {
  const required = id === 'alert-dialog';
  const edge = id === 'drawer';
  const [Root, Header, Body, Footer, Title, Description, Close, Action] = modalParts[id];
  const [rootName, headerName, bodyName, footerName, titleName, descriptionName, closeName, actionName] = modalNames[id];
  function Preview({ config }) {
    const [open, setOpen] = useState(false);
    const descriptionId = useId();
    const props = { open, onOpenChange: setOpen, descriptionId,
      ...(!required ? { backdropDismiss: config.backdropDismiss } : {}),
      ...(edge ? { placement: config.placement } : {}) };
    const title = h(Title, null, config.title || 'Details');
    const description = h(Description, { id: descriptionId }, config.message || 'Review this information.');
    const close = h(Close, { autoFocus: required || undefined, 'data-vf-button': '', 'data-vf-variant': 'secondary' }, required ? 'Cancel' : 'Close');
    const action = required ? h(Action, { 'data-vf-button': '' }, 'Confirm example') : null;
    return h(Flow, { gap: 'sm' },
      h(Button, { type: 'button', onClick: () => setOpen(true) }, 'Open ' + id.replace('-', ' ')),
      h(Root, props,
        config.header ? h(Header, { divider: config.dividers }, title, description) : title,
        config.header ? null : description,
        h(Body, config.longContent ? { tabIndex: 0, role: 'region', 'aria-label': 'Details' } : null, config.longContent ? Array.from({ length: 24 }, (_, index) =>
          h(Text, { as: 'p', key: index }, 'Additional details ' + (index + 1))) : 'Task content'),
        config.footer ? h(Footer, { divider: config.dividers }, close, action) : close,
        config.footer ? null : action));
  }
  return {
    fields: [text('title', 'Title', required ? 'Review this decision' : 'Details'),
      text('message', 'Description', 'Review this information before continuing.'),
      { ...bool('header', 'Header'), default: true }, { ...bool('footer', 'Footer'), default: true },
      bool('dividers', 'Section dividers'), bool('longContent', 'Long content'),
      ...(!required ? [bool('backdropDismiss', 'Backdrop dismissal')] : []),
      ...(edge ? [choice('placement', 'Placement', 'end', ['start', 'end', 'top', 'bottom'])] : [])],
    Preview,
    source(config) {
      return ["import { useId, useState } from 'react';", importLine(modalNames[id].filter(name => (config.header || name !== headerName) && (config.footer || name !== footerName)).join(', '), id),
        importLine('Button', 'button'), importLine('Flow', 'layout'), '',
        'export default function Example() {', '  const [open, setOpen] = useState(false);', '  const descriptionId = useId();',
        '  return (', '    <Flow gap="sm">', '      <Button type="button" onClick={() => setOpen(true)}>Open ' + id.replace('-', ' ') + '</Button>',
        '      <' + rootName + ' open={open} onOpenChange={setOpen} descriptionId={descriptionId}' +
          (!required && config.backdropDismiss ? ' backdropDismiss' : '') + (edge && config.placement !== 'end' ? ' placement=' + quoted(config.placement) : '') + '>',
        ...(config.header ? ['        <' + headerName + (config.dividers ? ' divider' : '') + '>'] : []),
        (config.header ? '          <' : '        <') + titleName + '>' + content(config.title || 'Details') + '</' + titleName + '>',
        (config.header ? '          <' : '        <') + descriptionName + ' id={descriptionId}>' + content(config.message || 'Review this information.') + '</' + descriptionName + '>',
        ...(config.header ? ['        </' + headerName + '>'] : []),
        '        <' + bodyName + (config.longContent ? ' tabIndex={0} role="region" aria-label="Details"' : '') + '>',
        config.longContent ? '          {Array.from({ length: 24 }, (_, index) => <p key={index}>Additional details {index + 1}</p>)}' : '          Task content',
        '        </' + bodyName + '>',
        ...(config.footer ? ['        <' + footerName + (config.dividers ? ' divider' : '') + '>'] : []),
        (config.footer ? '          <' : '        <') + closeName + (required ? ' autoFocus' : '') + ' data-vf-button="" data-vf-variant="secondary">' + (required ? 'Cancel' : 'Close') + '</' + closeName + '>',
        ...(required ? [(config.footer ? '          <' : '        <') + actionName + ' data-vf-button="">Confirm example</' + actionName + '>'] : []),
        ...(config.footer ? ['        </' + footerName + '>'] : []), '      </' + rootName + '>', '    </Flow>', '  );', '}'].join('\n');
    },
  };
}
export const dialogPlayground = modalAdapter('dialog');
export const alertDialogPlayground = modalAdapter('alert-dialog');
export const drawerPlayground = modalAdapter('drawer');
function ToastPreview({config}) {
  const [open,setOpen] = useState(false);
  return h(Flow,{gap:'sm'},
    h(Button,{type:'button',onClick:()=>setOpen(true)},'Show notification'),
    h(ToastViewport,{style:{position:'static',inlineSize:'100%'}},
      h(ToastRoot,{open,onOpenChange:setOpen,duration:config.persistent ? 0 : config.duration},
        h(ToastTitle,null,config.title || 'Saved'),
        h(ToastDescription,null,config.message || 'Preferences are up to date.'),
        h(ToastClose,{'aria-label':'Dismiss notification'},'×'))));
}
export const toastPlayground = {
  fields:[text('title','Title','Saved'),text('message','Message','Preferences are up to date.'),bool('persistent','Persistent'),
    {kind:'number',key:'duration',label:'Duration (ms)',default:5000,min:1000,max:15000,step:500,available:c=>!c.persistent}],
  Preview:ToastPreview,
  source(config) {
    return ["import { useState } from 'react';",importLine('ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastClose','toast'),
      importLine('Button','button'),importLine('Flow','layout'),'','export default function Example() {',
      '  const [open,setOpen] = useState(false);','  return <Flow gap="sm">',
      '    <Button type="button" onClick={() => setOpen(true)}>Show notification</Button>',
      '    <ToastViewport style={{ position: "static", inlineSize: "100%" }}>',
      '      <ToastRoot open={open} onOpenChange={setOpen} duration={' + (config.persistent ? 0 : config.duration) + '}>',
      '        <ToastTitle>' + content(config.title || 'Saved') + '</ToastTitle>',
      '        <ToastDescription>' + content(config.message || 'Preferences are up to date.') + '</ToastDescription>',
      '        <ToastClose aria-label="Dismiss notification">×</ToastClose>','      </ToastRoot>','    </ToastViewport>','  </Flow>;','}'].join('\n');
  },
};

const fieldModes = ['text', 'email', 'url', 'tel', 'search', 'password', 'number'];
function nativeFieldAdapter(multiline) {
  const name = multiline ? 'Textarea' : 'Input';
  const Component = multiline ? Textarea : Input;
  const fieldProps = config => ({
    placeholder: config.placeholder, disabled: config.disabled, readOnly: config.readOnly, required: config.required,
    defaultValue: config.initial, 'aria-invalid': config.invalid || undefined,
    variant: config.variant, fieldSize: config.fieldSize === 'inherit' ? undefined : config.fieldSize,
    fullWidth: config.fullWidth, textAlign: config.textAlign,
    ...(multiline ? { rows: Number(config.rows), autosize: config.autosize, resize: config.resize === 'native' ? undefined : config.resize,
      minRows: config.autosize ? Number(config.minRows) : undefined, maxRows: config.autosize ? Number(config.maxRows) : undefined } : { type: config.type }),
  });
  return {
    fields: [text('label', 'Label', multiline ? 'Notes' : 'Email address'),
      text('placeholder', 'Placeholder', multiline ? 'Add a note' : 'name@example.com'),
      text('initial', 'Initial value', ''), ...(multiline ? [choice('rows', 'Rows', '3', ['2','3','5'])] : [choice('type', 'Type', 'text', fieldModes)]),
      choice('variant', 'Appearance', 'outlined', ['outlined', 'filled', 'underlined', 'unstyled']),
      choice('fieldSize', 'Field size', 'inherit', ['inherit', 'sm', 'md', 'lg']),
      choice('textAlign', 'Text alignment', 'start', ['start', 'center', 'end']), bool('fullWidth', 'Full width'),
      ...(multiline ? [bool('autosize', 'Autosize'), choice('minRows', 'Minimum rows', '2', ['1','2','3']), choice('maxRows', 'Maximum rows', '8', ['4','6','8']), choice('resize', 'Resize', 'native', ['native','none','vertical','horizontal','both'])] : []),
      bool('disabled', 'Disabled'), bool('readOnly', 'Read-only'), bool('required', 'Required'), bool('invalid', 'Invalid')],
    Preview({ config }) {
      const id = useId();
      return h(Flow, { gap: 'xs' },
        h('label', { htmlFor: id }, label(config, name)),
        h(Component, { ...fieldProps(config), id, key: JSON.stringify([config.type, config.initial]) }));
    },
    source(config) {
      const control = markup(name, ['id="field"', attribute('placeholder', config.placeholder, ''), attribute('defaultValue', config.initial, ''),
        multiline ? 'rows={' + Number(config.rows) + '}' : attribute('type', config.type, 'text'),
        attribute('variant', config.variant, 'outlined'), attribute('fieldSize', config.fieldSize, 'inherit'), attribute('textAlign', config.textAlign, 'start'), flag('fullWidth', config.fullWidth),
        multiline ? flag('autosize', config.autosize) : '', multiline && config.autosize ? 'minRows={' + Number(config.minRows) + '}' : '', multiline && config.autosize ? 'maxRows={' + Number(config.maxRows) + '}' : '', multiline ? attribute('resize', config.resize, 'native') : '',
        flag('disabled', config.disabled), flag('readOnly', config.readOnly), flag('required', config.required),
        config.invalid ? 'aria-invalid="true"' : '']);
      return snippet([importLine(name, name.toLowerCase())],
        '<>\n  <label htmlFor="field">' + content(label(config, name)) + '</label>\n' + indent(control, 2) + '\n</>');
    },
  };
}
export const inputPlayground = nativeFieldAdapter(false);
export const textareaPlayground = nativeFieldAdapter(true);
function textFieldProps(config) {
  return {
    label: label(config, 'Text field'), placeholder: config.placeholder, description: config.description || undefined,
    error: config.error || undefined, variant: config.variant, labelPlacement: config.labelPlacement,
    fieldSize: config.fieldSize === 'inherit' ? undefined : config.fieldSize, fullWidth: config.fullWidth,
    textAlign: config.textAlign, disabled: config.disabled, readOnly: config.readOnly, required: config.required,
    prefix: config.prefix || undefined, suffix: config.suffix || undefined,
    status: config.status === 'none' ? undefined : config.status,
    ...(config.multiline ? { multiline: true, rows: 3, autosize: config.autosize } : { type: config.type }),
    ...(config.leadingIcon ? { leading: h(Icon, { icon: userIcon }) } : {}),
  };
}
export const textFieldPlayground = {
  fields: [
    text('label', 'Label', 'Display name'), text('placeholder', 'Placeholder', ''),
    text('description', 'Helper text', 'Shown to your teammates.'), text('error', 'Error message', ''),
    choice('variant', 'Variant', 'outlined', ['outlined', 'filled', 'underlined']),
    choice('labelPlacement', 'Label placement', 'floating', ['outside', 'floating']),
    choice('fieldSize', 'Field size', 'inherit', ['inherit', 'sm', 'md', 'lg']),
    choice('type', 'Type', 'text', fieldModes), choice('textAlign', 'Text alignment', 'start', ['start', 'center', 'end']),
    choice('status', 'Feedback', 'none', ['none', 'warning', 'success']),
    text('prefix', 'Prefix', ''), text('suffix', 'Suffix', ''),
    bool('leadingIcon', 'Leading icon'), bool('fullWidth', 'Full width'),
    bool('multiline', 'Multiline'), bool('autosize', 'Autosize'), bool('required', 'Required'),
    bool('disabled', 'Disabled'), bool('readOnly', 'Read-only'),
  ],
  presets: [
    { label: 'Underlined', values: { variant: 'underlined', labelPlacement: 'floating' } },
    { label: 'Amount', values: { label: 'Amount in USD', prefix: '$', textAlign: 'end', description: 'Enter a decimal amount.' } },
    { label: 'Invalid', values: { error: 'Choose a different display name.', variant: 'filled' } },
  ],
  Preview({ config }) {
    return h(TextField, { ...textFieldProps(config), key: config.multiline ? 'multi' : config.type });
  },
  source(config) {
    const p = textFieldProps(config);
    return snippet([importLine('TextField', 'text-field'), ...(config.leadingIcon ? iconImports('userIcon', 'user') : [])],
      markup('TextField', [attribute('label', p.label, ''), attribute('placeholder', config.placeholder, ''),
        attribute('description', config.description, ''), attribute('error', config.error, ''),
        attribute('variant', config.variant, 'outlined'), attribute('labelPlacement', config.labelPlacement, 'outside'), attribute('fieldSize', config.fieldSize, 'inherit'),
        config.multiline ? 'multiline' : attribute('type', config.type, 'text'), config.multiline ? 'rows={3}' : '',
        flag('autosize', config.multiline && config.autosize), attribute('textAlign', config.textAlign, 'start'),
        attribute('status', config.status, 'none'), attribute('prefix', config.prefix, ''), attribute('suffix', config.suffix, ''),
        config.leadingIcon ? 'leading={<Icon icon={userIcon} />}' : '',
        flag('fullWidth', config.fullWidth), flag('required', config.required), flag('disabled', config.disabled), flag('readOnly', config.readOnly)]));
  },
};
