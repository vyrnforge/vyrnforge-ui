import { Text, type TextElement, type TextVariant } from '@vyrnforge/vue/text';

const component: typeof Text = Text;
const element: TextElement = 'h3';
const variants: TextVariant[] = ['body', 'body-sm', 'label', 'title', 'heading'];
void [component, element, variants];
