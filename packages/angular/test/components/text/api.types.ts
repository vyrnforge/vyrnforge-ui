import { VfTextDirective, type TextVariant } from '@vyrnforge/angular/text';

const directive: typeof VfTextDirective = VfTextDirective;
const variants: TextVariant[] = ['body-md', 'body-sm', 'label-md', 'title-md', 'heading-md', 'caption'];
// @ts-expect-error unsized legacy aliases are not canonical variants
const legacy: TextVariant = 'body';

void [directive, variants, legacy];
