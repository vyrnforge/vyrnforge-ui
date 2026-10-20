export const textVariants = ['body', 'body-sm', 'label', 'title', 'heading'] as const;

export type TextVariant = (typeof textVariants)[number];
