import { createElement as h, useState } from 'react';
import { Button } from '@vyrnforge/react/button';
import { Text } from '@vyrnforge/react/text';
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { ThemeScope, tokens } from '@vyrnforge/react';
import { CodeBlock } from '@vyrnforge/react/code';
import { Link } from '@vyrnforge/react/link';
import { UtilitySections, renderUtilityInline } from './react-utility-content.mjs';
import { reactConsumerSections } from './react-content-policy.mjs';
import { PopoverRoot, PopoverTrigger, PopoverContent } from '@vyrnforge/react/popover';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@vyrnforge/react/tooltip';
import { PreviewCardRoot, PreviewCardTrigger, PreviewCardContent } from '@vyrnforge/react/preview-card';
import { DialogRoot, DialogTitle, DialogBody, DialogClose } from '@vyrnforge/react/dialog';
import { DrawerRoot, DrawerTitle, DrawerBody, DrawerClose } from '@vyrnforge/react/drawer';

const surfaces = [
  ['popover', 'Popover · anchored interactive'],
  ['tooltip', 'Tooltip · hover/focus'],
  ['preview-card', 'PreviewCard · preview'],
  ['dialog', 'Dialog · modal'],
  ['drawer', 'Drawer · modal edge'],
];
const placements = [
  'bottom-start', 'bottom', 'bottom-end',
  'top-start', 'top', 'top-end',
  'right-start', 'right', 'right-end',
  'left-start', 'left', 'left-end',
];
const componentNames = [
  ['popover', 'Popover'], ['tooltip', 'Tooltip'], ['preview-card', 'PreviewCard'],
  ['dialog', 'Dialog'], ['alert-dialog', 'AlertDialog'], ['drawer', 'Drawer'],
];

function Field({ id, label, value, onChange, options, disabled = false }) {
  return h(Flow, { gap: 'xs' },
    h('label', { htmlFor: id }, label),
    h(NativeSelect, { id, value, disabled, onChange: (event) => onChange(event.target.value) },
      ...options.map(([key, title]) => h('option', { key, value: key }, title))));
}

function Source({ kind, placement, theme, elevation, direction }) {
  const modal = kind === 'dialog' || kind === 'drawer';
  const elevationStyle = elevation === 'default' || modal ? '' :
    " style={{ '--vf-shadow-popover': tokens.shadow." +
      (elevation === 'subtle' ? 'sm' : 'lg') + " }}";
  const names = {
    popover: 'PopoverRoot, PopoverTrigger, PopoverContent',
    tooltip: 'TooltipRoot, TooltipTrigger, TooltipContent',
    'preview-card': 'PreviewCardRoot, PreviewCardTrigger, PreviewCardContent',
    dialog: 'DialogRoot, DialogTitle, DialogBody, DialogClose',
    drawer: 'DrawerRoot, DrawerTitle, DrawerBody, DrawerClose',
  };
  const example = {
    popover: '<PopoverRoot placement="' + placement + '">\n' +
      '  <PopoverTrigger aria-label="Open Popover" data-vf-button="" data-vf-variant="secondary">Open</PopoverTrigger>\n' +
      '  <PopoverContent aria-label="Details">Contextual content</PopoverContent>\n' +
      '</PopoverRoot>',
    tooltip: '<TooltipRoot placement="' + placement + '">\n' +
      '  <TooltipTrigger><Button type="button">Help</Button></TooltipTrigger>\n' +
      '  <TooltipContent>Short description</TooltipContent>\n' +
      '</TooltipRoot>',
    'preview-card': '<PreviewCardRoot placement="' + placement + '">\n' +
      '  <PreviewCardTrigger><Button type="button">Profile</Button></PreviewCardTrigger>\n' +
      '  <PreviewCardContent role="region" aria-label="Profile preview">Preview</PreviewCardContent>\n' +
      '</PreviewCardRoot>',
    dialog: '<Button type="button" onClick={() => setOpen(true)}>Open Dialog</Button>\n' +
      '<DialogRoot open={open} onOpenChange={setOpen}>\n' +
      '  <DialogTitle>Details</DialogTitle>\n' +
      '  <DialogBody>Modal content</DialogBody>\n' +
      '  <DialogClose>Close</DialogClose>\n' +
      '</DialogRoot>',
    drawer: '<Button type="button" onClick={() => setOpen(true)}>Open Drawer</Button>\n' +
      '<DrawerRoot open={open} onOpenChange={setOpen} placement="end">\n' +
      '  <DrawerTitle>Settings</DrawerTitle>\n' +
      '  <DrawerBody>Modal side panel</DrawerBody>\n' +
      '  <DrawerClose>Close</DrawerClose>\n' +
      '</DrawerRoot>',
  };
  const source = (modal ? "import { useState } from 'react';\n" : '') +
    "import { ThemeScope" + (elevationStyle ? ', tokens' : '') + " } from '@vyrnforge/react';\n" +
    (kind === 'popover' ? '' : "import { Button } from '@vyrnforge/react/button';\n") +
    'import { ' + names[kind] + " } from '@vyrnforge/react/" + kind + "';\n" +
    "import '@vyrnforge/web/styles/" + kind + ".css';\n" +
    "import '@vyrnforge/web/styles/button.css';\n\n" +
    'export default function Example() {\n' +
    (modal ? '  const [open, setOpen] = useState(false);\n' : '') +
    '  return (\n' +
    '    <ThemeScope theme="' + theme + '" dir="' + direction + '"' + elevationStyle + '>\n' +
    '      ' + example[kind].split('\n').join('\n      ') + '\n' +
    '    </ThemeScope>\n' +
    '  );\n}';
  return h('details', { className: 'vf-docs-source-disclosure' },
    h('summary', null, 'View public React usage'),
    h(CodeBlock, { tabIndex: 0 }, source));
}

export function OverlayUtility({ guide, links }) {
  const [kind, setKind] = useState('popover');
  const [placement, setPlacement] = useState('bottom-start');
  const [theme, setTheme] = useState('light');
  const [direction, setDirection] = useState('ltr');
  const [elevation, setElevation] = useState('default');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const anchored = ['popover', 'tooltip', 'preview-card'].includes(kind);
  const shadow = elevation === 'subtle' ? tokens.shadow.sm :
    elevation === 'strong' ? tokens.shadow.lg : undefined;

  let example;
  if (kind === 'popover') {
    example = h(PopoverRoot, { placement },
      h(PopoverTrigger, { 'aria-label': 'Open Popover', 'data-vf-button': '', 'data-vf-variant': 'secondary' }, 'Open'),
      h(PopoverContent, { 'aria-label': 'Overlay utility details' },
        h(Flow, { gap: 'sm' },
          h(Text, { as: 'strong' }, 'Details'),
          h(Text, { as: 'p' }, 'Escape or click outside to dismiss.'),
          h(Button, { type: 'button', size: 'sm', variant: 'secondary',
            onClick: () => setFeedback('Popover action activated') }, 'Test action'))));
  } else if (kind === 'tooltip') {
    example = h(TooltipRoot, { placement, openDelay: 0 },
      h(TooltipTrigger, null,
        h(Button, { type: 'button', variant: 'secondary', 'aria-label': 'Explain this control' }, 'Focus or hover')),
      h(TooltipContent, null, 'Short description; no interactive controls.'));
  } else if (kind === 'preview-card') {
    example = h(PreviewCardRoot, { placement, openDelay: 0 },
      h(PreviewCardTrigger, null,
        h(Button, { type: 'button', variant: 'secondary' }, 'Preview profile')),
      h(PreviewCardContent, { role: 'region', 'aria-label': 'Profile preview' },
        h(Flow, { gap: 'xs' },
          h(Text, { as: 'strong' }, 'Example profile'),
          h(Text, { as: 'p' }, 'A contextual preview on focus or hover.'))));
  } else if (kind === 'dialog') {
    example = h(Flow, { gap: 'sm', align: 'center' },
      h(Button, { type: 'button', variant: 'secondary',
        onClick: () => setDialogOpen(true) }, 'Open Dialog'),
      h(DialogRoot, { open: dialogOpen, onOpenChange: setDialogOpen },
        h(DialogTitle, null, 'Modal dialog'),
        h(DialogBody, null, h(Text, { as: 'p' }, 'This uses native dialog top-layer and focus behavior.')),
        h(DialogClose, { 'data-vf-button': '', 'data-vf-variant': 'secondary' }, 'Close Dialog')));
  } else {
    example = h(Flow, { gap: 'sm', align: 'center' },
      h(Button, { type: 'button', variant: 'secondary',
        onClick: () => setDrawerOpen(true) }, 'Open Drawer'),
      h(DrawerRoot, { open: drawerOpen, onOpenChange: setDrawerOpen, placement: 'end' },
        h(DrawerTitle, null, 'Modal drawer'),
        h(DrawerBody, null, h(Text, { as: 'p' }, 'A modal surface at the logical end edge.')),
        h(DrawerClose, { 'data-vf-button': '', 'data-vf-variant': 'secondary' }, 'Close Drawer')));
  }

  return h('div', { className: 'vf-docs-content-grid vf-docs-usage-guide-layout',
    'data-vf-docs-react-overlay-utility': '' },
  h(Flow, { as: 'article', gap: '3xl', className: 'vf-docs-article' },
    h('header', { className: 'vf-docs-component-header' },
      h(Text, { as: 'p', variant: 'overline', className: 'vf-docs-eyebrow' }, 'Utilities'),
      h(Text, { as: 'h1', variant: 'heading-lg' }, guide.title),
      h(Text, { as: 'p', variant: 'body-lg' },
        'Shared overlay usage and customization without a generic Overlay runtime.'),
      ...guide.intro.map((block, i) => h(Text, { as: 'p', key: i }, ...renderUtilityInline(block.text)))),
    h(Flow, { as: 'section', gap: 'md', 'aria-labelledby': 'overlay-playground-title' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'overlay-playground-title' }, 'Interactive overlay playground'),
      h(Text, { as: 'p' }, 'Select a public component, placement, theme, writing direction, and shadow override. The surface below uses VyrnForge React components with canonical Web CSS.'),
      h(AutoGrid, { as: 'div', minItemSize: '11rem', gap: 'md', className: 'vf-docs-overlay-controls' },
        h(Field, { id: 'overlay-kind', label: 'Surface', value: kind,
          onChange: (next) => { setKind(next); setFeedback(''); },
          options: surfaces }),
        h(Field, { id: 'overlay-placement', label: 'Anchored placement', value: placement,
          onChange: setPlacement, disabled: !anchored, options: placements.map((p) => [p, p]) }),
        h(Field, { id: 'overlay-theme', label: 'Preview theme', value: theme,
          onChange: setTheme, options: [['light', 'Light'], ['dark', 'Dark']] }),
        h(Field, { id: 'overlay-direction', label: 'Text direction', value: direction,
          onChange: setDirection, options: [['ltr', 'Left to right'], ['rtl', 'Right to left']] }),
        h(Field, { id: 'overlay-elevation', label: 'Popover elevation override', value: elevation,
          onChange: setElevation, disabled: !anchored,
          options: [['default', 'Default'], ['subtle', 'Subtle · shadow-sm'], ['strong', 'Strong · shadow-lg']] })),
      h(ThemeScope, { as: 'div', theme, dir: direction,
        className: 'vf-docs-overlay-stage',
        'data-vf-docs-overlay-stage': '',
        'data-vf-docs-overlay-kind': kind,
        style: shadow ? { '--vf-shadow-popover': shadow } : undefined },
        h(Flow, { gap: 'md', align: 'center' },
          h(Text, { as: 'p', variant: 'body-sm' }, anchored
            ? 'Use keyboard focus, hover, or click as appropriate; press Escape to dismiss.'
            : 'Open a native modal surface; press Escape or use its close button.'),
          example,
          h(Text, { as: 'p', variant: 'body-sm', tone: 'secondary', role: 'status', 'aria-live': 'polite', 'data-vf-docs-overlay-status': '' }, feedback))),
      h(Source, { kind, placement, theme, elevation, direction }),
      h(Text, { as: 'p', variant: 'body-sm' },
        'Trigger and close parts render their own native buttons. Their optional public Button styling hooks reuse VyrnForge’s shared Web presentation; do not nest a Button inside them. Modal backdrop, focus, and dismissal policies stay with the selected component.')),
    ...UtilitySections({ guide, prefix: 'overlay-' }),
    h(Flow, { as: 'section', gap: 'sm', 'aria-labelledby': 'overlay-component-links' },
      h(Text, { as: 'h2', variant: 'heading-md', id: 'overlay-component-links' }, 'React component sources'),
      h(Text, { as: 'p' },
        'Each surface has its own public React API, but dedicated React API guide pages are not yet available. These links open the real React implementation sources rather than silently switching to Native Web.'),
      h(Flow, { as: 'ul', gap: 'xs' },
        ...componentNames.map(([id, label]) => h('li', { key: id },
          h(Link, { href: links.overlayComponentSource[id] }, label + ' React source')))))),
  h('aside', { className: 'vf-docs-toc-region' },
    h('nav', { className: 'vf-docs-toc', 'aria-label': 'On this page' },
      h('p', null, 'On this page'),
      h('ol', null,
        h('li', null, h('a', { href: '#overlay-playground-title' }, 'Live playground')),
        ...reactConsumerSections(guide).map((section) => h('li', { key: section.heading },
          h('a', { href: '#overlay-' + section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
            section.heading))),
        h('li', null, h('a', { href: '#overlay-component-links' }, 'Component references'))))));
}
