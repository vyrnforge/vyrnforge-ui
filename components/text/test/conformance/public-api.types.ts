import type { TextVariant as WebVariant } from '@vyrnforge/web/text';
import type { TextVariant as ReactVariant } from '@vyrnforge/react/text';
import type { TextVariant as AngularVariant } from '@vyrnforge/angular/text';
import type { TextVariant as VueVariant } from '@vyrnforge/vue/text';

const variants: [WebVariant, ReactVariant, AngularVariant, VueVariant] = ['body', 'heading', 'label', 'title'];

const reactFromWeb: ReactVariant = variants[0];
const angularFromReact: AngularVariant = variants[1];
const vueFromAngular: VueVariant = variants[2];
const webFromVue: WebVariant = variants[3];

void [variants, reactFromWeb, angularFromReact, vueFromAngular, webFromVue];
