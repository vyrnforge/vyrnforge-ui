import type { SurfaceElement as ReactSurfaceElement, SurfaceProps as ReactSurfaceProps } from '@vyrnforge/react/surface';
import type { SurfaceElement as VueSurfaceElement } from '@vyrnforge/vue/surface';
import { VfSurfaceDirective } from '@vyrnforge/angular/surface';
import { VfSurfaceElement, defineSurfaceElement } from '@vyrnforge/elements/surface';

const reactElement: ReactSurfaceElement = 'article';
const vueElement: VueSurfaceElement = reactElement;
const props: ReactSurfaceProps = { as: 'section', id: 'summary', 'aria-label': 'Summary' };
const angularDirective: typeof VfSurfaceDirective = VfSurfaceDirective;
const elementsCtor: typeof VfSurfaceElement = VfSurfaceElement;
const defineElement: typeof defineSurfaceElement = defineSurfaceElement;

// @ts-expect-error Surface is a block visual boundary, not an inline wrapper.
const invalidReactElement: ReactSurfaceElement = 'span';
// @ts-expect-error Surface has no variant API.
const invalidProps: ReactSurfaceProps = { variant: 'raised' };

void [reactElement, vueElement, props, angularDirective, elementsCtor, defineElement, invalidReactElement, invalidProps];
