import { Text, type TextElement, type TextVariant } from '@vyrnforge/vue/text';

const component: typeof Text = Text;
const elements: TextElement[] = ['h3', 'blockquote', 'mark', 'time', 'figcaption'];
const variants: TextVariant[] = ['body-md', 'body-sm', 'label-md', 'title-md', 'heading-md', 'caption'];
// @ts-expect-error interactive hosts are not owned by Text
const interactive: TextElement = 'a';
// @ts-expect-error unsized legacy aliases are not canonical variants
const legacy: TextVariant = 'body';

void [component, elements, variants, interactive, legacy];
