import { RatingRoot } from '@vyrnforge/react/rating';
export function Example() {
  return <RatingRoot defaultValue={4} aria-label="Product rating" name="product-rating" getItemLabel={(value) => `${value} out of 5`} />;
}
