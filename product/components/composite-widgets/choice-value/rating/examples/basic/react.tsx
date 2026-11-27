import { Rating } from '@vyrnforge/react/rating';
export function Example() {
  return <Rating defaultValue={4} aria-label="Product rating" name="product-rating"
    getItemLabel={value => `${value} out of 5`} />;
}
