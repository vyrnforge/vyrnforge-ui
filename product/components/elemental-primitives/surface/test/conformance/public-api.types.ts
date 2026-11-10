import type { SurfaceElement as ReactSurfaceElement, SurfaceProps as ReactSurfaceProps } from '@vyrnforge/react/surface';
import type { SurfaceElement as VueSurfaceElement } from '@vyrnforge/vue/surface';

type AngularDirectiveConstructor = typeof import('@vyrnforge/angular/surface').VfSurfaceDirective;
type ElementsConstructor = typeof import('@vyrnforge/elements/surface').VfSurfaceElement;
type DefineSurfaceElement = typeof import('@vyrnforge/elements/surface').defineSurfaceElement;

const reactElement: ReactSurfaceElement = 'article';
const vueElement: VueSurfaceElement = reactElement;
const props: ReactSurfaceProps = { as: 'section', id: 'summary', 'aria-label': 'Summary' };

// These aliases intentionally stay type-only: this cross-port conformance fixture verifies
// public export shape without introducing runtime ESM imports into the root NodeNext fixture.
type SurfaceRuntimeExports = [AngularDirectiveConstructor, ElementsConstructor, DefineSurfaceElement];

// @ts-expect-error Surface is a block visual boundary, not an inline wrapper.
const invalidReactElement: ReactSurfaceElement = 'span';
// @ts-expect-error Surface has no variant API.
const invalidProps: ReactSurfaceProps = { variant: 'raised' };

void [reactElement, vueElement, props, invalidReactElement, invalidProps];
void (null as unknown as SurfaceRuntimeExports);
