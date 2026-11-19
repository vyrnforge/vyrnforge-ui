export function FlowWrapExample() {
  return (
    <div dir="rtl" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap"
      data-vf-flow-gap="sm" data-vf-flow-align="center" style={{ maxInlineSize: '16rem' }}>
      {['التصميم', 'المحتوى', 'الواجهة', 'التفاعل'].map((tag) => (
        <span key={tag} lang="ar" style={{ padding: 'var(--vf-space-xs)', border: '1px solid var(--vf-color-border)', borderRadius: 'var(--vf-radius-sm)' }}>{tag}</span>
      ))}
    </div>
  );
}
