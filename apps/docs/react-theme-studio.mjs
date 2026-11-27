import { createElement as h, useId, useState } from 'react';
import { Radio } from '@vyrnforge/react/radio';
import { Alert } from '@vyrnforge/react/alert';
import { Progress } from '@vyrnforge/react/progress';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@vyrnforge/react/tooltip';
import { ThemeScope } from '@vyrnforge/react';
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
import { Rating } from '@vyrnforge/react/rating';
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
export function PreviewScene({ theme, view, direction = 'ltr', density = 'comfortable', viewport = 'auto' }) {
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
    view === 'dashboard'
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
          h(Rating, { defaultValue: 3.5, precision: 0.5, 'aria-label': 'Product rating' }),
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


// Documentation-only CSS preview. Canonical theme layer preserves later
// foundation reduced-motion overrides; no inline token declarations or runtime provider.
export function DraftPreviewScope({ theme, children, ...props }) {
  const id = useId();
  const name = 'vf-preview-' + id.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  if (!theme) return h(Flow, props, children);
  return h(ThemeScope, { ...props, theme: name },
    h('style', null, previewCss(theme, name)), children);
}
