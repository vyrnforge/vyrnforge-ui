import { Rating } from '@vyrnforge/react/rating';
import { heartIcon } from '@vyrnforge/icons/heart';
export function Example() {
  return <Rating icon={heartIcon} defaultValue={3} size="lg" aria-label="Preference" />;
}
