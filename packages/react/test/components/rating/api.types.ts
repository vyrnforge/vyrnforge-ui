import { Rating, RatingRoot, RatingItem, type RatingProps } from '@vyrnforge/react/rating';
const props: RatingProps = { precision: 0.5, size: 'lg', value: 3.5, clearable: true, 'aria-label': 'Score' };
void [Rating, RatingRoot, RatingItem, props];
