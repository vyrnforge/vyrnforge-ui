import { Surface, type SurfaceElement, type SurfaceProps } from '@vyrnforge/react/surface';

const element: SurfaceElement = 'article';
const props: SurfaceProps = { as: element, id: 'summary', 'aria-label': 'Summary' };
const surface: typeof Surface = Surface;
// @ts-expect-error Surface does not expose presentation variants.
const invalidProps: SurfaceProps = { variant: 'raised' };
void [element, props, surface, invalidProps];
