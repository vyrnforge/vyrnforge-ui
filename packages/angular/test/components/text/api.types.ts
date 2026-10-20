import { VfTextDirective, type TextVariant } from '@vyrnforge/angular/text';

const directive: typeof VfTextDirective = VfTextDirective;
const variants: TextVariant[] = ['body', 'body-sm', 'label', 'title', 'heading'];
void [directive, variants];
