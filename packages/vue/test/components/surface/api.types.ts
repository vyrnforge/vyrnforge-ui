import { Surface, type SurfaceElement } from '@vyrnforge/vue/surface';

const element: SurfaceElement = 'article';
const surface: typeof Surface = Surface;
// @ts-expect-error Surface is a block visual boundary, not an inline wrapper.
const invalidElement: SurfaceElement = 'span';
void [element, surface, invalidElement];
