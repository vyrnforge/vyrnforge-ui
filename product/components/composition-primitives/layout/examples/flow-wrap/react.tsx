import { Flow } from '@vyrnforge/react/layout';

export function FlowWrapExample() {
  return (
    <Flow dir="rtl" direction="inline" wrap="wrap" align="center">
      {['التصميم', 'المحتوى', 'الواجهة', 'التفاعل'].map((tag) => (
        <span key={tag} lang="ar">
          {tag}
        </span>
      ))}
    </Flow>
  );
}
