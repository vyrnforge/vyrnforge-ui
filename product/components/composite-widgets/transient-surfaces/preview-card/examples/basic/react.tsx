import { Link } from '@vyrnforge/react/link';
import { PreviewCardContent, PreviewCardRoot, PreviewCardTrigger } from '@vyrnforge/react/preview-card';
export default () => (
  <PreviewCardRoot>
    <PreviewCardTrigger>
      <Link href="#profile">Profile</Link>
    </PreviewCardTrigger>
    <PreviewCardContent>Profile preview</PreviewCardContent>
  </PreviewCardRoot>
);
