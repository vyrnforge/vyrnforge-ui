import type { IconDefinition } from '@vyrnforge/web/icon';

export const bookmarkIcon: IconDefinition = {
  name: 'bookmark',
  viewBox: '0 0 24 24',
  variants: {
    outlined: {
      rounded: {
        paths: [{
          d: 'M7.5 3.5h9A1.5 1.5 0 0 1 18 5v15l-6-3.75L6 20V5a1.5 1.5 0 0 1 1.5-1.5Z',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.75,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }]
      },
      sharp: {
        paths: [{
          d: 'M6.5 3.5h11v16.6L12 16.65 6.5 20.1V3.5Z',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.75,
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter'
        }]
      }
    },
    filled: {
      rounded: {
        paths: [{
          d: 'M7.5 2.75h9A2.25 2.25 0 0 1 18.75 5v15a1.5 1.5 0 0 1-2.295 1.272L12 18.488l-4.455 2.784A1.5 1.5 0 0 1 5.25 20V5A2.25 2.25 0 0 1 7.5 2.75Z',
          fill: 'currentColor'
        }]
      },
      sharp: {
        paths: [{
          d: 'M5.75 2.75h12.5v18.7L12 17.55l-6.25 3.9V2.75Z',
          fill: 'currentColor'
        }]
      }
    }
  }
};
