import type { TextareaProps as ReactTextareaProps } from '@vyrnforge/react/textarea';

type ReactTextarea = typeof import('@vyrnforge/react/textarea').Textarea;
type AngularTextarea = typeof import('@vyrnforge/angular/textarea').VfTextareaDirective;
type VueTextarea = typeof import('@vyrnforge/vue/textarea').Textarea;

const reactProps: ReactTextareaProps = { name: 'notes', rows: 4, cols: 30, wrap: 'soft', required: true, readOnly: true };
const reactTextarea: ReactTextarea | undefined = undefined;
const angularTextarea: AngularTextarea | undefined = undefined;
const vueTextarea: VueTextarea | undefined = undefined;
// @ts-expect-error textarea has no native type attribute.
const invalidReact: ReactTextareaProps = { type: 'text' };
void [reactProps, reactTextarea, angularTextarea, vueTextarea, invalidReact];
