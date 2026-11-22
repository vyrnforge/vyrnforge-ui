import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

export function FlowWrapExample() {
  return (
    <Flow dir="rtl" direction="inline" wrap="wrap" align="center">
      {['التصميم', 'المحتوى', 'الواجهة', 'التفاعل'].map((tag) => (
        <Text as="span" key={tag} lang="ar">
          {tag}
        </Text>
      ))}
    </Flow>
  );
}
