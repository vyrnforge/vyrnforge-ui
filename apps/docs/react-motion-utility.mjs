import { createElement as h, useState } from 'react';
import { Button } from '@vyrnforge/react/button';
import { Switch } from '@vyrnforge/react/switch';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { ThemeScope } from '@vyrnforge/react';
import { UtilitySections, renderUtilityInline } from './react-utility-content.mjs';

const durations = [['default', 'Default · 120ms'], ['fast', 'Custom · 80ms'], ['none', 'Custom · 0ms']];
const easings = [['standard', 'Standard'], ['linear', 'Linear override']];
const themes = [['light', 'Light'], ['dark', 'Dark']];

function Setting({ id, label, value, options, onChange }) {
  return h(Flow, { gap: 'xs' },
    h('label', { htmlFor: id }, label),
    h(NativeSelect, { id, value, onChange: (event) => onChange(event.currentTarget.value) },
      ...options.map(([key, title]) => h('option', { key, value: key }, title))));
}

function Source({ duration, easing }) {
  const override = duration === 'fast' ? '80ms' : duration === 'none' ? '0ms' : null;
  const custom = [override ? '  --vf-control-motion-duration: ' + override + ';' : '',
    easing === 'linear' ? '  --vf-motion-easing-standard: linear;' : ''].filter(Boolean);
  const css = custom.length ? '.my-controls {\n' + custom.join('\n') + '\n}\n\n' : '';
  const snippet = "/* Use canonical Web component styles and tokens. */\n" +
    css +
    '@media (prefers-reduced-motion: reduce) {\n' +
    '  .my-controls { --vf-control-motion-duration: 0ms; }\n' +
    '}\n\n' +
    '/* Components own state, focus, and interaction independently of CSS. */';
  return h('details', { className: 'vf-docs-source-disclosure' },
    h('summary', null, 'View consumer CSS customization'),
    h('pre', { 'data-vf-code-block': '', tabIndex: 0 },
      h('code', null, snippet)));
}

export function MotionUtility({ guide, links }) {
  const [duration, setDuration] = useState('default');
  const [easing, setEasing] = useState('standard');
  const [theme, setTheme] = useState('light');
  const [checked, setChecked] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const variables = {
    ...(duration === 'fast' ? { '--vf-control-motion-duration': '80ms' } : {}),
    ...(duration === 'none' ? { '--vf-control-motion-duration': '0ms' } : {}),
    ...(easing === 'linear' ? { '--vf-motion-easing-standard': 'linear' } : {}),
  };
  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout',
    'data-vf-docs-react-motion-utility': '' },
    h(Flow, { as: 'article', gap: '3xl', className: 'vf-docs-article' },
      h('header', { className: 'vf-docs-component-header' },
        h(Text, { as: 'p', variant: 'overline', className: 'vf-docs-eyebrow' }, 'Utilities'),
        h(Text, { as: 'h1', variant: 'heading-lg' }, guide.title),
        h(Text, { as: 'p', variant: 'body-lg' },
          'Shared CSS-first transitions, timing and reduced-motion behavior across components.'),
        ...guide.intro.map((block, i) => h(Text, { as: 'p', key: i }, ...renderUtilityInline(block.text)))),
      h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'motion-playground-title' },
        h(Text, { as: 'h2', variant: 'heading-md', id: 'motion-playground-title' },
          'Interactive motion playground'),
        h(Text, { as: 'p' }, 'Adjust inherited tokens and interact with actual VyrnForge Button, Switch and loading states. The preview is not a separate Motion component.'),
        h(AutoGrid, { minItemSize: '11rem', gap: 'md', className: 'vf-docs-motion-controls' },
          h(Setting, { id: 'motion-duration', label: 'Control transition duration',
            value: duration, options: durations, onChange: setDuration }),
          h(Setting, { id: 'motion-easing', label: 'Easing',
            value: easing, options: easings, onChange: setEasing }),
          h(Setting, { id: 'motion-theme', label: 'Theme',
            value: theme, options: themes, onChange: setTheme })),
        h(ThemeScope, { as: 'section', theme, className: 'vf-docs-customization-preview',
          'data-vf-docs-motion-stage': '', style: variables, 'aria-label': 'Motion preview' },
          h(Flow, { gap: 'lg' },
            h(Flow, { gap: 'xs' },
              h(Text, { as: 'h3', variant: 'heading-sm' }, 'Control transitions'),
              h(Text, { as: 'p', variant: 'body-sm' },
                'Hover and focus Button; toggle Switch. They consume the same timing and easing tokens.')),
            h(Flow, { direction: 'inline', gap: 'lg', align: 'center', wrap: 'wrap' },
              h(Button, { type: 'button', variant: 'secondary',
                onClick: () => setCount(value => value + 1) }, 'Activate'),
              h(Flow, { direction: 'inline', align: 'center', gap: 'sm' },
                h(Switch, { id: 'motion-preview-switch', checked,
                  onChange: (event) => setChecked(event.currentTarget.checked) }),
                h('label', { htmlFor: 'motion-preview-switch' }, 'Enable option'))),
            h('p', { role: 'status', 'aria-live': 'polite',
              'data-vf-docs-motion-feedback': '' },
              'Actions: ' + count + '. Switch: ' + (checked ? 'on' : 'off') + '.'),
            h(Flow, { gap: 'xs' },
              h(Text, { as: 'h3', variant: 'heading-sm' }, 'Loading is separate'),
              h(Text, { as: 'p', variant: 'body-sm' },
                'A busy indicator uses loading cadence, not the control transition duration.'),
              h(Flow, { direction: 'inline', wrap: 'wrap', align: 'center', gap: 'sm' },
                h(Button, { type: 'button', variant: 'secondary', onClick: () => setBusy(value => !value) },
                  busy ? 'Stop preview' : 'Show busy state'),
                h(Button, { type: 'button', variant: 'primary', loading: busy, disabled: busy },
                  busy ? 'Busy' : 'Ready'))))),
        h(Text, { as: 'p', variant: 'body-sm' },
          'The browser’s reduced-motion preference always takes priority in canonical component CSS. The custom 0ms option is a consumer-scoped demonstration, not a replacement for that preference.'),
        h(Source, { duration, easing })),
      ...UtilitySections({ guide, prefix: 'motion-' }),
      h(Flow, { as: 'section', gap: 'sm', 'aria-labelledby': 'motion-related-links' },
        h(Text, { as: 'h2', variant: 'heading-md', id: 'motion-related-links' }, 'Related guidance'),
        h(Flow, { as: 'ul', gap: 'xs' },
          h('li', null, h('a', { href: links.tokens, 'data-vf-link': '' }, 'Design tokens')),
          h('li', null, h('a', { href: links.styling, 'data-vf-link': '' }, 'Styling and CSS')),
          h('li', null, h('a', { href: links.overlay, 'data-vf-link': '' }, 'Overlay utility')),
          h('li', null, h('a', { href: links.motionButton, 'data-vf-link': '' }, 'Button component'))))),
    h('aside', { className: 'vf-docs-toc-region' },
      h('nav', { className: 'vf-docs-toc', 'aria-label': 'On this page' },
        h('p', null, 'On this page'),
        h('ol', null,
          h('li', null, h('a', { href: '#motion-playground-title' }, 'Live playground')),
          ...guide.sections.map((section) => h('li', { key: section.heading },
            h('a', { href: '#motion-' + section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
              section.heading))),
          h('li', null, h('a', { href: '#motion-related-links' }, 'Related guidance'))))));
}
