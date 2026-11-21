# Divider — visible line, optionally with text

Divider is a token-driven, noninteractive visual composition primitive, distinct from a semantic thematic break or the retired generic Separator. The canonical Web CSS provides 1px horizontal/vertical lines; the React component forwards a native span ref and maps authoring props onto the same hooks.

```tsx
import { Divider } from '@vyrnforge/react/divider';
import '@vyrnforge/web/styles/divider.css';

<Divider />                             // decorative horizontal rule
<Divider orientation="vertical" />      // decorative vertical rule
<Divider>OR</Divider>                    // centered text, accessible by default
<Divider textAlign="start">Before</Divider>
<Divider orientation="vertical" textAlign="end">Then</Divider>
<Divider orientation="vertical" textDirection="horizontal">OR</Divider>
<Divider orientation="vertical" textDirection="bottom-to-top">Previous</Divider>
```

Native Web is the same CSS recipe: an unlabeled span has `data-vf-divider`, orientation and `aria-hidden="true"`; a labeled host has `data-vf-divider-labeled` and a `data-vf-divider-label` child span. Without a label, original full-width/thickness rules remain unchanged. A labeled line is two CSS-painted segments separated by readable native text, with `start | center | end` logical alignment. Vertical text defaults to native `writing-mode: vertical-rl`, with optional horizontal or reversed bottom-to-top text direction via the same Web CSS hooks. The segments extend above and below in every variant. The parent must supply usable cross-axis height for a vertical divider.

Text remains visible to assistive technology; decorative unlabeled lines are hidden. Divider never creates `role="separator"`, an ARIA orientation, focus, or interaction. For meaningful thematic breaks use native `hr`; context-owned Menu/Toolbar separator and resizer contracts are unchanged. No additional JS runtime, token registry, framework dependency, or application-specific layout policy is introduced. See #1458 and #1461.
