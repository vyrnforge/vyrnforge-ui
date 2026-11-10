import { defineIcon, type IconDefinition, type IconGlyphDefinition } from '@vyrnforge/web/icon';

function outlined(paths: readonly string[], sharp = false): IconGlyphDefinition {
  return {
    paths: paths.map((d) => ({
      d,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.75,
      strokeLinecap: sharp ? 'butt' : 'round',
      strokeLinejoin: sharp ? 'miter' : 'round',
    })),
  };
}

function filled(paths: readonly string[]): IconGlyphDefinition {
  return { paths: paths.map((d) => ({ d, fill: 'currentColor' })) };
}

export function catalogIcon(
  name: string,
  outlinePaths: readonly string[],
  filledPaths: readonly string[],
  sharpOutlinePaths: readonly string[] = outlinePaths,
  sharpFilledPaths: readonly string[] = filledPaths,
): IconDefinition {
  return defineIcon({
    name,
    outlined: outlined(outlinePaths),
    filled: filled(filledPaths),
    sharp: {
      outlined: outlined(sharpOutlinePaths, true),
      filled: filled(sharpFilledPaths),
    },
  });
}
