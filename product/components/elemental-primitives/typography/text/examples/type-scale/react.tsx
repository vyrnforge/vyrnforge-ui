import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import type { BuiltInTextVariant } from '@vyrnforge/web/text';

type Specimen = { variant: BuiltInTextVariant; sample: string };
const groups: { label: string; specimens: Specimen[] }[] = [
  { label: 'Display', specimens: [
    { variant: 'display-lg', sample: 'Design with clarity' },
    { variant: 'display-md', sample: 'Design with clarity' },
    { variant: 'display-sm', sample: 'Design with clarity' },
  ] },
  { label: 'Headings', specimens: [
    { variant: 'heading-lg', sample: 'A clear page heading' },
    { variant: 'heading-md', sample: 'A clear page heading' },
    { variant: 'heading-sm', sample: 'A clear page heading' },
    { variant: 'heading-xs', sample: 'A clear page heading' },
  ] },
  { label: 'Titles', specimens: [
    { variant: 'title-lg', sample: 'Workspace overview' },
    { variant: 'title-md', sample: 'Workspace overview' },
    { variant: 'title-sm', sample: 'Workspace overview' },
  ] },
  { label: 'Body', specimens: [
    { variant: 'body-lg', sample: 'Readable content supports better decisions.' },
    { variant: 'body-md', sample: 'Readable content supports better decisions.' },
    { variant: 'body-sm', sample: 'Readable content supports better decisions.' },
  ] },
  { label: 'Labels', specimens: [
    { variant: 'label-lg', sample: 'Account status' },
    { variant: 'label-md', sample: 'Account status' },
    { variant: 'label-sm', sample: 'Account status' },
  ] },
  { label: 'Supporting text', specimens: [
    { variant: 'caption', sample: 'Updated this morning' },
    { variant: 'overline', sample: 'Release notes' },
  ] },
];

export function TypeScaleExample() {
  return (
    <Flow gap="lg">
      {groups.map((group) => (
        <Flow key={group.label} gap="sm">
          <Text as="h2" variant="heading-xs">{group.label}</Text>
          {group.specimens.map(({ variant, sample }) => (
            <Flow key={variant} gap="none" data-vf-docs-specimen={variant}>
              <Text as="small" variant="caption">{variant}</Text>
              <Text as="p" variant={variant}>{sample}</Text>
            </Flow>
          ))}
        </Flow>
      ))}
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<TypeScaleExample />);
