import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

export function SemanticCompositionExample() {
  return (
    <Flow as="article" gap="md" aria-labelledby="text-article-title">
      <Flow as="header" gap="xs">
        <Text as="p" variant="overline">Design foundations</Text>
        <Text as="h2" id="text-article-title" variant="title-lg">
          Meaning before appearance
        </Text>
        <Text as="p" variant="body-lg">
          Choose the native element for what the content means.
        </Text>
      </Flow>
      <Text as="p" variant="body-md">
        A visual heading role does not create a heading. Use
        {' '}<Text as="strong" variant="body-md">real emphasis</Text>{' '}
        when the meaning calls for it.
      </Text>
      <Text as="blockquote" variant="body-lg">
        Typography can change presentation without changing the document outline.
      </Text>
      <Text as="p" variant="caption">
        Published <Text as="time" variant="caption" dateTime="2026-11-20">
          20 November 2026
        </Text>
      </Text>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<SemanticCompositionExample />);
