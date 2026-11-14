import {
  CarouselNext,
  CarouselPrevious,
  CarouselRoot,
  CarouselSlide,
  CarouselViewport,
} from '@vyrnforge/react/carousel';
export function Example() {
  return (
    <CarouselRoot aria-label="Featured items">
      <CarouselViewport>
        <CarouselSlide aria-label="1 of 2">First slide</CarouselSlide>
        <CarouselSlide aria-label="2 of 2">Second slide</CarouselSlide>
      </CarouselViewport>
      <CarouselPrevious>Previous</CarouselPrevious>
      <CarouselNext>Next</CarouselNext>
    </CarouselRoot>
  );
}
