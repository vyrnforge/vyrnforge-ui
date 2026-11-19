import { Flow } from '@vyrnforge/react/layout';

export function FlowWrapExample() {
  return (
    <Flow dir="rtl" direction="inline" wrap="wrap" gap="sm" align="center"
      style={{ maxInlineSize: '16rem' }}>
      {['التصميم', 'المحتوى', 'الواجهة', 'التفاعل'].map((tag) => (
        <span key={tag} lang="ar"
          style={{ padding: 'var(--vf-space-xs)', border: '1px solid var(--vf-color-border)', borderRadius: 'var(--vf-radius-sm)' }}>
          {tag}
        </span>
      ))}
    </Flow>
  );
}
