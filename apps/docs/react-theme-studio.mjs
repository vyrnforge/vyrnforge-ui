import { createElement as h, useId, useState } from 'react';
import { Radio } from '@vyrnforge/react/radio';
import { Alert } from '@vyrnforge/react/alert';
import { Progress } from '@vyrnforge/react/progress';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@vyrnforge/react/tooltip';
import { ThemeScope, tokens } from '@vyrnforge/react';
import { Input } from '@vyrnforge/react/input';
import { Textarea } from '@vyrnforge/react/textarea';
import { Loading, LoadingIndicator } from '@vyrnforge/react/loading';
import { previewCss } from './react-theme-authoring.mjs';
import { Flow } from '@vyrnforge/react/layout';
import { NumberField } from '@vyrnforge/react/number-field';
import { TextField } from '@vyrnforge/react/text-field';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Skeleton } from '@vyrnforge/react/skeleton';
import { Button } from '@vyrnforge/react/button';
import { ColorPickerRoot, ColorPickerInput, ColorPickerTextInput, ColorPickerSwatch } from '@vyrnforge/react/color-picker';
import { SegmentedControlRoot, SegmentedControlItem } from '@vyrnforge/react/segmented-control';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Slider } from '@vyrnforge/react/slider';
import { Text } from '@vyrnforge/react/text';

export function Segment({ label, value, onChange, items, testId }) {
  return h(SegmentedControlRoot, { 'aria-label': label, value, onValueChange: onChange,
    'data-vf-docs-studio-segment': testId },
    ...items.map(([id, title]) => h(SegmentedControlItem, { key: id, value: id }, title)));
}
export function Picker({ value, onValueChange, label, testId }) {
  return h(ColorPickerRoot, { value, onValueChange, className: 'vf-docs-studio-picker',
    'data-vf-docs-studio-picker': testId },
    h(ColorPickerInput, { 'aria-label': 'Choose ' + label }),
    h(ColorPickerTextInput, { 'aria-label': label, spellCheck: false }),
    h(ColorPickerSwatch, null));
}
export function PreviewScene({ theme, view, component = 'Button', direction = 'ltr', density = 'comfortable', viewport = 'auto' }) {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('hello@example.com');
  const [optedIn, setOptedIn] = useState(true);
  const [amount, setAmount] = useState(72);
  const radioGroup = useId();
  const [selectedArea, setSelectedArea] = useState('Overview');
  const [delivery, setDelivery] = useState('email');
  return h(DraftPreviewScope, { as: 'section', theme, style: viewport === 'mobile' ? { maxInlineSize: '320px', inlineSize: '100%', justifySelf: 'center' } : undefined,
    dir: direction, 'data-vf-density': density,
    className: 'vf-docs-studio-scene', 'aria-label': theme.appearance + ' theme preview',
    'data-vf-docs-theme-preview': theme.appearance },
    h('div', { className: 'vf-docs-studio-scene-header' },
      h('span', { className: 'vf-docs-studio-scene-mark', 'aria-hidden': 'true' }, 'V'),
      h(Text, { as: 'strong', variant: 'label-md' }, 'VyrnForge'),
      h(Text, { as: 'span', className: 'vf-docs-studio-scene-meta' }, theme.appearance + ' appearance')),
    ['colors','typography','spacing','sizing','shape','elevation','motion','components'].includes(view)
      ? h(ContextPreview, { view, component })
      : view === 'dashboard'
      ? h('div', { className: 'vf-docs-studio-scene-body' },
          h(Flow, { as: 'nav', direction: 'inline', wrap: 'wrap', gap: 'xs', 'aria-label': 'Workspace sections' }, ...['Overview','Projects','Settings'].map(area => h(ToggleButton, { key: area, type: 'button', size: 'sm', pressed: selectedArea === area, onClick: () => setSelectedArea(area) }, area))),
          h(Text, { as: 'p', variant: 'body-sm', tone: 'secondary' }, selectedArea + ' / This month'),
          h(Text, { as: 'h3', variant: 'heading-md' }, 'Design with confidence'),
          h(Text, { as: 'p', tone: 'secondary' },
            'The same tokens style actions, surfaces, text and focus states.'),
          h('div', { className: 'vf-docs-studio-stats' },
            h('div', { className: 'vf-docs-studio-stat' },
              h(Text, { as: 'span', variant: 'body-sm', tone: 'secondary' }, 'Projects'),
              h(Text, { as: 'strong', variant: 'heading-md' }, '24'),
              h(Text, { as: 'span', className: 'vf-docs-studio-stat-accent' }, '+12.8% this month')),
            h('div', { className: 'vf-docs-studio-stat' },
              h(Text, { as: 'span', variant: 'body-sm', tone: 'secondary' }, 'Completed'),
              h(Text, { as: 'strong', variant: 'heading-md' }, '86%'),
              h(Text, { as: 'span', variant: 'body-sm', tone: 'secondary' }, 'On schedule'))),
          h('div', { className: 'vf-docs-studio-inline-actions' },
            h(Button, { type: 'button', variant: 'primary',
              onClick: () => setFeedback('Primary preview action activated') }, 'Save changes'),
            h(Button, { type: 'button', variant: 'secondary',
              onClick: () => setFeedback('Secondary preview action activated') }, 'Secondary action'),
            h(Button, { type: 'button', variant: 'ghost',
              onClick: () => setFeedback('Ghost preview action activated') }, 'More')))
      : view === 'feedback' ? h('div', { className: 'vf-docs-studio-scene-body' },
          h(Text, { as: 'h3', variant: 'heading-md' }, 'Activity and status'),
          h(Alert, { severity: 'success', heading: 'Changes saved' }, 'Your workspace is up to date.'),
          h(Alert, { severity: 'error', heading: 'Could not save' }, 'Check your connection and try again.'),
          h(Progress, { 'aria-label': 'Upload progress', value: amount, max: 100 }),
          h(Skeleton, { 'aria-hidden': true, style: { blockSize: '1rem', inlineSize: '60%' } }),
          h(TooltipRoot, { placement: 'bottom' }, h(TooltipTrigger, null, h(Button, { type: 'button', variant: 'secondary' }, 'More information')), h(TooltipContent, null, 'A themed overlay.')),
          h(Button, { type: 'button', disabled: true }, 'Unavailable action'))
      : h('div', { className: 'vf-docs-studio-scene-body' },
          h(Text, { as: 'h3', variant: 'heading-md' }, 'Account preferences'),
          h(Text, { as: 'p', tone: 'secondary' },
            'A real input, checkbox and slider in the current theme.'),
          h(TextField, { label: 'Contact email', type: 'email', value: email, onChange: e => setEmail(e.target.value), description: 'Used for notifications', fullWidth: true }),
          h(NumberField, { label: 'Quantity', defaultValue: 2, min: 0, max: 100, stepControls: 'horizontal', incrementLabel: 'Increase quantity', decrementLabel: 'Decrease quantity', fullWidth: true }),
          h('label', { className: 'vf-docs-studio-check' },
            h(Checkbox, { checked: optedIn, onChange: (e) => setOptedIn(e.target.checked) }),
            h(Text, { as: 'span' }, 'Send product updates')),
          h('fieldset', null, h('legend', null, 'Delivery method'), ...['email','sms'].map(method => h('label', { key: method, className: 'vf-docs-studio-check' }, h(Radio, { name: radioGroup, value: method, checked: delivery === method, onChange: () => setDelivery(method) }), method === 'email' ? 'Email' : 'SMS'))),
          h('label', { className: 'vf-docs-studio-field' },
            h(Text, { as: 'span' }, 'Preview amount: ' + amount + '%'),
            h(Slider, { min: 0, max: 100, step: 1, value: amount,
              onChange: (e) => setAmount(Number(e.target.value)) })),
          h('div', { className: 'vf-docs-studio-inline-actions' },
            h(Button, { type: 'button', variant: 'primary',
              onClick: () => setFeedback('Preferences saved in preview') }, 'Save changes'),
            h(Button, { type: 'button', variant: 'secondary',
              onClick: () => { setEmail('hello@example.com'); setOptedIn(true); setAmount(72); setDelivery('email');
                setFeedback('Preview fields reset'); } }, 'Reset fields'))),
    h(Text, { as: 'p', role: 'status', 'aria-live': 'polite',
      'data-vf-docs-preview-feedback': '', className: 'vf-docs-studio-scene-status' }, feedback));
}



function SampleButtons() {
  return h(Flow, { direction: 'inline', gap: 'sm', wrap: 'wrap' },
    ...['primary','secondary','ghost'].map(variant => h(Button, { key: variant, type: 'button', variant }, variant)),
    h(Button, { type: 'button', disabled: true }, 'Disabled'));
}
function SampleSizes() {
  const rows = ['sm','md','lg'].map((size, i) => h(Flow, { key: size, gap: 'xs' },
    h(Text, { as: 'p', variant: 'label-md' }, ['Small','Medium','Large'][i]),
    h(Flow, { direction: 'inline', gap: 'sm', wrap: 'wrap' }, h(Button, { type: 'button', size }, 'Action'), h(Button, { type: 'button', variant: 'secondary', size }, 'Cancel')),
    h(TextField, { label: 'Example field', fieldSize: size, placeholder: 'Type here', fullWidth: true })));
  return h(Flow, { gap: 'sm' }, ...rows);
}
function SampleSurface({ children, large = false }) {
  return h(Flow, { gap: 'md', className: 'vf-docs-studio-sample-surface',
    style: { padding: tokens.space.md, boxShadow: large ? tokens.shadow.lg : tokens.shadow.md, borderRadius: tokens.radius.surface } }, children);
}
function SampleTooltip() {
  return h(TooltipRoot, { placement: 'bottom', openDelay: 0, arrow: true },
    h(TooltipTrigger, null, h(Button, { type: 'button', variant: 'secondary' }, 'Focus or hover for help')),
    h(TooltipContent, null, 'Live themed tooltip'));
}
function ComponentSamples({ component }) {
  const id = useId();
  const variants = ['outlined','filled','underlined'];
  if (component === 'Button') return h(Flow, { gap: 'md' }, h(SampleButtons),
    h(Flow, { direction: 'inline', wrap: 'wrap', align: 'center', gap: 'sm' }, ...['sm','md','lg'].map(size => h(Button, { key: size, type: 'button', size }, size))));
  if (component === 'Input' || component === 'Textarea') {
    const Field = component === 'Input' ? Input : Textarea;
    return h(Flow, { gap: 'sm' }, ...variants.map(variant => h(Flow, { key: variant, gap: 'xs' },
      h(Text, { as: 'p', variant: 'label-md' }, variant),
      h(Field, { 'aria-label': variant + ' ' + component, variant, placeholder: 'Enter text', ...(component === 'Textarea' ? { rows: 2 } : {}) }))));
  }
  if (component === 'TextField' || component === 'NumberField') {
    const Field = component === 'TextField' ? TextField : NumberField;
    return h(Flow, { gap: 'md' }, ...variants.map(variant =>
      h(Field, { key: variant, label: variant + ' field', variant, description: 'Supporting text', fullWidth: true,
        ...(component === 'NumberField' ? { defaultValue: 2, min: 0, max: 100 } : { placeholder: 'Enter text' }) })),
      h(Field, { label: 'Invalid field', error: 'Check this value', fullWidth: true }), h(Field, { label: 'Disabled field', disabled: true, fullWidth: true }));
  }
  if (component === 'Checkbox' || component === 'Radio') {
    const Control = component === 'Checkbox' ? Checkbox : Radio;
    const states = ['Selected','Unselected','Disabled'].map((label, i) => h('label', { key: label, className: 'vf-docs-studio-check' },
      h(Control, { ...(component === 'Radio' ? { name: id, value: label } : {}), defaultChecked: i === 0, disabled: i === 2 }), label));
    return h(Flow, { as: 'fieldset', gap: 'sm' }, h('legend', null, 'Selection states'), ...states);
  }
  if (component === 'Slider') return h(Flow, { gap: 'md' }, ...['sm','md','lg'].map(size => h('label', { key: size, className: 'vf-docs-studio-field' },
    h(Text, { as: 'span' }, size + ' slider'), h(Slider, { size, min: 0, max: 100, defaultValue: 45 }))));
  if (component === 'Tooltip') return h(Flow, { gap: 'sm' }, h(SampleTooltip), h(Text, { as: 'p', variant: 'body-sm' }, 'Use the pointer or keyboard to show the overlay.'));
  if (component === 'Progress') return h(Flow, { gap: 'md' }, ...[25,60,100].map(value => h(Progress, { key: value, 'aria-label': 'Progress ' + value + '%', value, max: 100 })));
  if (component === 'Skeleton') return h(Flow, { gap: 'sm' }, ...[100,75,45].map(width => h(Skeleton, { key: width, 'aria-hidden': true, style: { inlineSize: width + '%', blockSize: '1rem' } })));
  return h(Flow, { direction: 'inline', wrap: 'wrap', gap: 'md' }, ...['spinner','dots','bars','pulse'].map(variant => h(Loading, { key: variant, 'aria-label': variant + ' loading' }, h(LoadingIndicator, { variant }))));
}
function ContextPreview({ view, component }) {
  let content;
  if (view === 'components') content = h(ComponentSamples, { key: component, component });
  else if (view === 'typography') content = h(Flow, { gap: 'sm' },
    h(Text, { as: 'h4', variant: 'heading-lg' }, 'Workspace heading'),
    h(Text, { as: 'h5', variant: 'heading-md' }, 'Section heading'),
    h(Text, { as: 'p', variant: 'body-md' }, 'The quick brown fox jumps over the lazy dog.'),
    h(Text, { as: 'p', variant: 'body-sm', tone: 'secondary' }, 'Supporting text and descriptions'),
    h(TextField, { label: 'Display name', placeholder: 'Alex Morgan', description: 'Visible to teammates', fullWidth: true }), h(SampleButtons));
  else if (view === 'sizing') content = h(SampleSizes);
  else if (view === 'spacing') content = h(SampleSurface, null,
    h(Flow, { gap: 'sm' }, h(Text, { as: 'h4', variant: 'heading-sm' }, 'Account details'),
      h(TextField, { label: 'Name', placeholder: 'Alex Morgan', fullWidth: true }), h(TextField, { label: 'Email', placeholder: 'hello@example.com', fullWidth: true })),
    h(Flow, { gap: 'lg' }, h(Text, { as: 'p' }, 'Preferences'), h(SampleButtons)));
  else if (view === 'shape') content = h(SampleSurface, null, h(TextField, { label: 'Profile name', placeholder: 'Alex Morgan', fullWidth: true }), h(SampleButtons));
  else if (view === 'elevation') content = h(Flow, { gap: 'lg' },
    h(SampleSurface, null, h(Text, { as: 'h4', variant: 'heading-sm' }, 'Medium surface'), h(Text, { as: 'p' }, 'Settings card')),
    h(SampleSurface, { large: true }, h(Text, { as: 'h4', variant: 'heading-sm' }, 'Large surface'), h(SampleTooltip)));
  else if (view === 'motion') content = h(Flow, { gap: 'md' }, h(Text, { as: 'p', variant: 'body-sm' }, 'Hover, focus or press controls. Loading respects motion preferences.'),
    h(SampleButtons), h(SampleTooltip), h(ComponentSamples, { component: 'Loading' }));
  else content = h(Flow, { gap: 'md' }, h(SampleButtons),
    ...['success','warning','info','error'].map(severity => h(Alert, { key: severity, severity, heading: severity }, 'Semantic feedback')),
    h(ComponentSamples, { component: 'Checkbox' }), h(ComponentSamples, { component: 'Slider' }));
  const label = view === 'components' ? component + ' showcase' : ({
    colors: 'Semantic colors', typography: 'Type hierarchy', spacing: 'Form and surface spacing',
    sizing: 'Control sizes', shape: 'Surface and control shape', elevation: 'Surface elevation', motion: 'Interactive motion',
  })[view];
  return h(Flow, { gap: 'md', 'data-vf-docs-context-preview': view }, h(Text, { as: 'h3', variant: 'heading-md' }, label), content);
}

// Documentation-only CSS preview. Canonical theme layer preserves later
// foundation reduced-motion overrides; no inline token declarations or runtime provider.
export function DraftPreviewScope({ theme, children, ...props }) {
  const id = useId();
  const name = 'vf-preview-' + id.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  if (!theme) return h(Flow, props, children);
  return h(ThemeScope, { ...props, theme: name },
    h('style', null, previewCss(theme, name)), children);
}
