import type { Ref } from 'react';
import type { CodeProps, CodeBlockProps } from '@vyrnforge/react/code';
import { Code, CodeBlock } from '@vyrnforge/react/code';

const inline: CodeProps = { id: 'install', title: 'Install command', variant: 'body-sm', dir: 'ltr' };
const block: CodeBlockProps = { id: 'example', 'aria-label': 'Example command', tabIndex: 0 };
const inlineRef: Ref<HTMLElement> | undefined = undefined;
const blockRef: Ref<HTMLPreElement> | undefined = undefined;
const render = [Code, CodeBlock];

// @ts-expect-error Code only accepts shared Text variants
const badVariant: CodeProps = { variant: 'colorful' };
// @ts-expect-error native code does not accept input type
const inputType: CodeProps = { type: 'email' };
// @ts-expect-error CodeBlock has no Code styling variant
const badBlock: CodeBlockProps = { variant: 'body-md' };
void [inline, block, inlineRef, blockRef, render, badVariant, inputType, badBlock];
