import { createElement as h, useState } from 'react';
import { Button } from '@vyrnforge/react/button';
import { Switch } from '@vyrnforge/react/switch';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { Motion, ThemeScope } from '@vyrnforge/react';
import { UtilitySections, renderUtilityInline } from './react-utility-content.mjs';

const durations = [['default', 'Default · 120ms'], ['fast', 'Custom · 80ms'], ['none', 'Custom · 0ms']];
const easings = [['standard', 'Standard'], ['linear', 'Linear override']];
const themes = [['light', 'Light'], ['dark', 'Dark']];

const entranceDurations = [['default', 'Default · 320ms'], ['fast', 'Fast · 200ms'], ['slow', 'Slow · 480ms']];

const effects = [
  ['fade', 'Fade'], ['grow', 'Grow'], ['slide', 'Slide'],
  ['zoom', 'Zoom'], ['fade-slide', 'Fade + slide'], ['pop', 'Pop'],
];
const origins = [
  ['block-end', 'From bottom'], ['block-start', 'From top'],
  ['inline-start', 'From inline start'], ['inline-end', 'From inline end'],
];
const targets = [['button', 'Button'], ['switch', 'Switch'], ['group', 'Composition']];
const directions = [['ltr', 'Left to right'], ['rtl', 'Right to left']];

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

function MotionEffectsPlayground({ theme, variables }) {
  const [effect, setEffect] = useState('fade');
  const [entranceDuration, setEntranceDuration] = useState('default');
  const [origin, setOrigin] = useState('block-end');
  const [direction, setDirection] = useState('ltr');
  const [target, setTarget] = useState('group');
  const [replay, setReplay] = useState(0);
  const [checked, setChecked] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const sampleButton = () => h(Button, { type: 'button', size: 'sm', variant: 'secondary',
    onClick: () => setActionCount(value => value + 1), 'aria-label': 'Sample action' }, 'Action');
  const sampleSwitch = () => h(Flow, { direction: 'inline', gap: 'sm', align: 'center' },
    h(Switch, { id: 'motion-effect-switch', checked,
      onChange: (event) => setChecked(event.currentTarget.checked) }),
    h('label', { htmlFor: 'motion-effect-switch' }, 'Option'));
  const selectedDuration = entranceDuration === 'slow' ? 480 : entranceDuration === 'fast' ? 200 : undefined;
  const code = "import { Motion, Button } from '@vyrnforge/react';\n" +
    "import '@vyrnforge/web/styles/foundation.css';\n\n" +
    '<Motion effect="' + effect + '"' +
    (['slide', 'fade-slide'].includes(effect) ? ' direction="' + origin + '"' : '') +
    (selectedDuration === undefined ? '' : ' duration={' + selectedDuration + '}') +
    '>\n  <Button>Continue</Button>\n</Motion>\n' +
    '// The application owns presence and exit; Motion decorates entrance.';
  return h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'motion-effects-title',
    'data-vf-docs-motion-effects': '' },
    h(Text, { as: 'h2', variant: 'heading-md', id: 'motion-effects-title' }, 'Reusable entrance effects'),
    h(Text, { as: 'p' }, 'The public React Motion component wraps real components with shared Web CSS effects. Entrance timing defaults to 320ms; Button and Switch feedback remains at 120ms.'),
    h(AutoGrid, { minItemSize: '9rem', gap: 'md' },
      h(Setting, { id: 'motion-effect', label: 'Effect', value: effect, options: effects,
        onChange: (next) => { setEffect(next); setReplay(value => value + 1); } }),
      h(Setting, { id: 'motion-entrance-duration', label: 'Entrance duration', value: entranceDuration,
        options: entranceDurations, onChange: (next) => { setEntranceDuration(next); setReplay(value => value + 1); } }),
      h(Setting, { id: 'motion-target', label: 'Target', value: target, options: targets,
        onChange: (next) => { setTarget(next); setReplay(value => value + 1); } }),
      h(Setting, { id: 'motion-origin', label: 'Slide origin', value: origin, options: origins,
        onChange: (next) => { setOrigin(next); setReplay(value => value + 1); } }),
      h(Setting, { id: 'motion-direction', label: 'Writing direction', value: direction, options: directions,
        onChange: (next) => { setDirection(next); setReplay(value => value + 1); } })),
    h(Button, { type: 'button', variant: 'secondary', onClick: () => setReplay(value => value + 1) },
      'Replay effect'),
    h(ThemeScope, { as: 'div', theme, dir: direction, style: variables,
      className: 'vf-docs-motion-demo-stage', 'data-vf-docs-motion-demo-stage': '' },
      h(Motion, { key: [effect, origin, direction, target, entranceDuration, replay].join(':'),
        effect, direction: origin, duration: selectedDuration,
        'data-vf-docs-motion-preview': '', 'data-vf-motion-sample': target },
        h(Flow, { gap: 'sm', align: 'center' },
          target === 'button' ? sampleButton() :
          target === 'switch' ? sampleSwitch() :
          h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'md', align: 'center' },
            sampleButton(), sampleSwitch()),
          h(Text, { as: 'p', variant: 'body-sm' }, effect + ' · ' + target)))),
    h('p', { role: 'status', 'aria-live': 'polite', 'data-vf-docs-motion-sample-status': '' },
      'Sample actions: ' + actionCount + '. Switch: ' + (checked ? 'on' : 'off') + '.'),
    h('details', { className: 'vf-docs-source-disclosure' },
      h('summary', null, 'View reusable CSS effect usage'),
      h('pre', { tabIndex: 0, 'data-vf-code-block': '' }, h('code', null, code))),
    h(Text, { as: 'p', variant: 'body-sm' },
      'Entrance only. React Motion renders a native wrapper and accepts effect, direction and duration props. For exit, presence, dismissal and focus, follow the individual component contract; reduced motion suppresses these effects automatically.'));
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
        h(Text, { as: 'p' }, 'Adjust inherited tokens and interact with actual VyrnForge Button, Switch and loading states. The effects preview uses the public React Motion wrapper, with shared Web CSS and no animation runtime.'),
        h(AutoGrid, { minItemSize: '11rem', gap: 'md', className: 'vf-docs-motion-controls' },
          h(Setting, { id: 'motion-duration', label: 'Control transition duration',
            value: duration, options: durations, onChange: setDuration }),
          h(Setting, { id: 'motion-easing', label: 'Easing',
            value: easing, options: easings, onChange: setEasing }),
          h(Setting, { id: 'motion-theme', label: 'Theme',
            value: theme, options: themes, onChange: setTheme })),
        h(ThemeScope, { as: 'section', theme, className: 'vf-docs-customization-preview vf-docs-motion-stage',
          'data-vf-docs-motion-stage': '', style: variables, 'aria-label': 'Motion preview' },
          h(Flow, { gap: 'lg' },
            h(Flow, { gap: 'xs' },
              h(Text, { as: 'h3', variant: 'heading-sm' }, 'Control transitions'),
              h(Text, { as: 'p', variant: 'body-sm' },
                'Hover and focus Button; toggle Switch. They consume the same timing and easing tokens.')),
            h(Flow, { direction: 'inline', gap: 'lg', align: 'center', wrap: 'wrap' },
              h(Button, { type: 'button', variant: 'secondary', 'aria-label': 'Run action',
                onClick: () => setCount(value => value + 1) }, 'Run'),
              h(Flow, { direction: 'inline', align: 'center', gap: 'sm' },
                h(Switch, { id: 'motion-preview-switch', checked,
                  onChange: (event) => setChecked(event.currentTarget.checked) }),
                h('label', { htmlFor: 'motion-preview-switch' }, 'Option'))),
            h('p', { role: 'status', 'aria-live': 'polite',
              'data-vf-docs-motion-feedback': '' },
              'Actions: ' + count + '. Switch: ' + (checked ? 'on' : 'off') + '.'),
            h(Flow, { gap: 'xs' },
              h(Text, { as: 'h3', variant: 'heading-sm' }, 'Loading is separate'),
              h(Text, { as: 'p', variant: 'body-sm' },
                'A busy indicator uses loading cadence, not the control transition duration.'),
              h(Flow, { direction: 'inline', wrap: 'wrap', align: 'center', gap: 'sm' },
                h(Button, { type: 'button', variant: 'secondary', onClick: () => setBusy(value => !value) },
                  busy ? 'Stop busy' : 'Start busy'),
                h(Button, { type: 'button', variant: 'primary', loading: busy, disabled: busy },
                  busy ? 'Busy' : 'Ready'))))),
        h(Text, { as: 'p', variant: 'body-sm' },
          'The browser’s reduced-motion preference always takes priority in canonical component CSS. The custom 0ms option is a consumer-scoped demonstration, not a replacement for that preference.'),
        h(Source, { duration, easing })),
      h(MotionEffectsPlayground, { theme, variables }),
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
