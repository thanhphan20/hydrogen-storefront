import {
  Carousel as ShadcnCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel';

interface CarouselProps<T> {
  slides: T[];
  renderSlide: (slide: T, index: number) => JSX.Element;
  getKey: (slide: T, index: number) => string | number;
}

export function Carousel<T>({slides, renderSlide, getKey}: CarouselProps<T>) {
  return (
    <div className="mx-auto w-full max-w-5xl px-12">
      <ShadcnCarousel className="w-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={getKey(slide, index)}>
              <div className="flex h-[24rem] items-center justify-center rounded-lg border border-border bg-card">
                {renderSlide(slide, index)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </ShadcnCarousel>
    </div>
  );
}
