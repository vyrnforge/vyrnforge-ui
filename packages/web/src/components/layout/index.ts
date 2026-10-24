export const layoutSpaces = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
export type LayoutSpace = (typeof layoutSpaces)[number];

export const stackAlignments = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
export type StackAlign = (typeof stackAlignments)[number];

export const stackJustifications = ['start', 'center', 'end', 'space-between'] as const;
export type StackJustify = (typeof stackJustifications)[number];

export const clusterAlignments = stackAlignments;
export type ClusterAlign = (typeof clusterAlignments)[number];

export const clusterJustifications = stackJustifications;
export type ClusterJustify = (typeof clusterJustifications)[number];

export const inlineAlignments = stackAlignments;
export type InlineAlign = (typeof inlineAlignments)[number];

export const inlineJustifications = stackJustifications;
export type InlineJustify = (typeof inlineJustifications)[number];

export const containerSizes = ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
export type ContainerSize = (typeof containerSizes)[number];

export const aspectRatios = ['square', 'video', 'landscape', 'portrait'] as const;
export type AspectRatio = (typeof aspectRatios)[number];

export const radioGroupOrientations = ['vertical', 'horizontal'] as const;
export type RadioGroupOrientation = (typeof radioGroupOrientations)[number];
